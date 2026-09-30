import { DocumentModel } from '../models/documentModel.js';
import { ChecklistModel } from '../models/checklistModel.js';
import { ProfileModel } from '../models/profileModel.js';
import { classifyDocumentWithGemini } from '../services/geminiService.js';

export const DocumentController = {
  /**
   * Upload a single document, run Gemini AI classification, match against checklist,
   * and store metadata in Supabase.
   */
  async uploadAndClassify(req, res) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          error: 'Missing File',
          message: 'Please provide a valid document file (PDF, JPG, JPEG, or PNG).'
        });
      }

      const { checklistId, targetItemId } = req.body;
      if (!checklistId) {
        return res.status(400).json({
          error: 'Missing Checklist ID',
          message: 'The checklist ID is required to associate this document.'
        });
      }

      // Verify checklist exists and belongs to authenticated user
      const checklist = await ChecklistModel.getById(checklistId, req.user.id);
      if (!checklist) {
        return res.status(404).json({
          error: 'Checklist Not Found',
          message: 'Checklist not found or does not belong to your account.'
        });
      }

      // Retrieve profile full name for cross-validation if available
      let profileHolderName = null;
      if (checklist.profile_id) {
        const profile = await ProfileModel.getById(checklist.profile_id, req.user.id);
        if (profile) {
          profileHolderName = profile.full_name;
        }
      }

      // Find target item definition if specified
      const items = checklist.result_json?.items || [];
      const targetItem = targetItemId ? items.find(i => i.id === targetItemId) : null;
      const targetItemTitle = targetItem ? targetItem.title : null;

      // Execute AI classification via Gemini (or safe deterministic local classifier)
      const classification = await classifyDocumentWithGemini({
        file,
        profileHolderName,
        targetItemTitle
      });

      // Match classified document against checklist items
      let matchedItem = null;
      let matchStatus = 'unsupported';

      if (targetItem) {
        // Specific target item requested
        if (targetItem.acceptedTypes.includes(classification.documentType)) {
          matchedItem = targetItem;
          matchStatus = classification.visualQuality === 'blurry' ? 'needs_review' : 'matched';
        } else {
          matchStatus = 'unsupported';
        }
      } else {
        // Auto-match against first compatible unfulfilled checklist item
        matchedItem = items.find(item => 
          item.acceptedTypes.includes(classification.documentType) &&
          (item.status === 'missing' || item.status === 'needs_review')
        );

        if (!matchedItem) {
          // If no missing item matches, check if any item matches the type
          matchedItem = items.find(item => item.acceptedTypes.includes(classification.documentType));
        }

        if (matchedItem) {
          matchStatus = classification.visualQuality === 'blurry' ? 'needs_review' : 'matched';
        } else {
          matchStatus = 'unsupported';
        }
      }

      // Save document metadata in database
      const documentRecord = await DocumentModel.create({
        userId: req.user.id,
        checklistId: checklist.id,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        storagePathOrUrl: null, // Zero-knowledge: raw file is not saved permanently
        aiClassificationJson: classification,
        matchedChecklistItem: matchedItem ? matchedItem.id : null,
        status: matchStatus
      });

      // Update checklist result_json with document match
      if (matchedItem) {
        const updatedItems = items.map(item => {
          if (item.id === matchedItem.id) {
            return {
              ...item,
              status: matchStatus,
              matchedDocumentId: documentRecord.id,
              matchedDocumentName: file.originalname,
              detectedType: classification.detectedDocumentName,
              summaryNotes: classification.summaryNotes
            };
          }
          return item;
        });

        // Recalculate overall checklist readiness
        const mandatoryItems = updatedItems.filter(i => i.mandatory);
        const allMandatoryMatched = mandatoryItems.every(i => i.status === 'matched');
        const hasNeedsReview = updatedItems.some(i => i.status === 'needs_review');

        let newOverallStatus = 'incomplete';
        if (allMandatoryMatched && !hasNeedsReview) {
          newOverallStatus = 'ready';
        } else if (hasNeedsReview || updatedItems.some(i => i.status === 'matched')) {
          newOverallStatus = 'needs_attention';
        }

        const updatedResultJson = {
          ...checklist.result_json,
          items: updatedItems,
          totalMatched: updatedItems.filter(i => i.status === 'matched').length,
          lastUpdated: new Date().toISOString()
        };

        const updatedChecklist = await ChecklistModel.update(checklist.id, req.user.id, {
          status: newOverallStatus,
          result_json: updatedResultJson
        });

        return res.status(201).json({
          success: true,
          message: `Document classified and ${matchStatus === 'matched' ? 'successfully matched' : 'marked as ' + matchStatus}.`,
          document: documentRecord,
          classification,
          matchedItem: {
            id: matchedItem.id,
            title: matchedItem.title,
            status: matchStatus
          },
          checklist: updatedChecklist
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Document classified, but did not match any required checklist item.',
        document: documentRecord,
        classification,
        matchedItem: null,
        checklist
      });
    } catch (err) {
      console.error('[DocumentController.uploadAndClassify] Error:', err);
      return res.status(500).json({
        error: 'Classification Failed',
        message: err.message
      });
    }
  },

  /**
   * Delete an uploaded document record and revert the checklist item back to missing.
   */
  async deleteDocument(req, res) {
    try {
      const { id } = req.params;

      const doc = await DocumentModel.getById(id, req.user.id);
      if (!doc) {
        return res.status(404).json({
          error: 'Document Not Found',
          message: 'The requested document does not exist or does not belong to your account.'
        });
      }

      await DocumentModel.delete(id, req.user.id);

      // Revert checklist item status
      if (doc.checklist_id && doc.matched_checklist_item) {
        const checklist = await ChecklistModel.getById(doc.checklist_id, req.user.id);
        if (checklist && checklist.result_json?.items) {
          const updatedItems = checklist.result_json.items.map(item => {
            if (item.id === doc.matched_checklist_item) {
              return {
                ...item,
                status: 'missing',
                matchedDocumentId: null,
                matchedDocumentName: null,
                detectedType: null,
                summaryNotes: null
              };
            }
            return item;
          });

          // Recalculate status
          const mandatoryItems = updatedItems.filter(i => i.mandatory);
          const allMandatoryMatched = mandatoryItems.length > 0 && mandatoryItems.every(i => i.status === 'matched');
          const hasMatchedOrReview = updatedItems.some(i => i.status === 'matched' || i.status === 'needs_review');

          let newStatus = 'incomplete';
          if (allMandatoryMatched) {
            newStatus = 'ready';
          } else if (hasMatchedOrReview) {
            newStatus = 'needs_attention';
          }

          await ChecklistModel.update(checklist.id, req.user.id, {
            status: newStatus,
            result_json: {
              ...checklist.result_json,
              items: updatedItems,
              totalMatched: updatedItems.filter(i => i.status === 'matched').length
            }
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Document deleted and checklist updated.'
      });
    } catch (err) {
      console.error('[DocumentController.deleteDocument] Error:', err);
      return res.status(500).json({
        error: 'Delete Failed',
        message: err.message
      });
    }
  }
};
