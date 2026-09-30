import { TRUSTED_SERVICES } from '../data/trustedChecklists.js';
import { DOCUMENT_HELP_GUIDES } from '../data/documentHelpGuides.js';
import { ChecklistModel } from '../models/checklistModel.js';
import { DocumentModel } from '../models/documentModel.js';
import { ProfileModel } from '../models/profileModel.js';
import { 
  generateChecklistSchema, 
  saveChecklistSchema, 
  updateItemStatusSchema 
} from '../validators/checklistValidator.js';

export const ChecklistController = {
  /**
   * Return metadata and question definitions for all trusted services.
   */
  async getServices(req, res) {
    try {
      const servicesList = Object.values(TRUSTED_SERVICES).map(s => ({
        id: s.id,
        title: s.title,
        institution: s.institution,
        category: s.category,
        description: s.description,
        sourceUrl: s.sourceUrl,
        officialAuthority: s.officialAuthority,
        defaultInstitution: s.defaultInstitution,
        questions: s.questions
      }));

      return res.status(200).json({
        success: true,
        services: servicesList
      });
    } catch (err) {
      console.error('[ChecklistController.getServices] Error:', err);
      return res.status(500).json({
        error: 'Failed to retrieve services',
        message: err.message
      });
    }
  },

  /**
   * Return authoritative guide data for a specific document category.
   */
  async getHelpGuide(req, res) {
    try {
      const { guideId } = req.params;
      const guide = DOCUMENT_HELP_GUIDES[guideId];

      if (!guide) {
        return res.status(404).json({
          error: 'Guide Not Found',
          message: `Official document guide '${guideId}' was not found.`
        });
      }

      return res.status(200).json({
        success: true,
        guide
      });
    } catch (err) {
      console.error('[ChecklistController.getHelpGuide] Error:', err);
      return res.status(500).json({
        error: 'Failed to retrieve help guide',
        message: err.message
      });
    }
  },

  /**
   * Generate tailored checklist items without persisting.
   */
  async generateChecklist(req, res) {
    try {
      const parseResult = generateChecklistSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Validation Error',
          details: parseResult.error.errors.map(e => e.message)
        });
      }

      const { serviceType, profileId, answers } = parseResult.data;

      // Verify profile belongs to authenticated user
      const profile = await ProfileModel.getById(profileId, req.user.id);
      if (!profile) {
        return res.status(404).json({
          error: 'Profile Not Found',
          message: 'The selected profile does not exist or does not belong to your account.'
        });
      }

      const serviceDef = TRUSTED_SERVICES[serviceType];
      if (!serviceDef) {
        return res.status(400).json({
          error: 'Invalid Service',
          message: `Service type ${serviceType} is not supported.`
        });
      }

      // Determine dynamic institution name (e.g. user selected or typed custom bank/college)
      let customInstitutionName = serviceDef.institution;
      if (answers.bank_name && answers.bank_name !== 'other') {
        customInstitutionName = answers.bank_name;
      } else if (answers.custom_bank_name) {
        customInstitutionName = answers.custom_bank_name;
      } else if (answers.institution_name && answers.institution_name !== 'other') {
        customInstitutionName = answers.institution_name;
      } else if (answers.custom_institution_name) {
        customInstitutionName = answers.custom_institution_name;
      }

      // Generate items using trusted local rule engine
      const items = serviceDef.generateItems(answers);

      return res.status(200).json({
        success: true,
        service: {
          id: serviceDef.id,
          title: serviceDef.title,
          institution: customInstitutionName,
          sourceUrl: serviceDef.sourceUrl,
          officialAuthority: serviceDef.officialAuthority
        },
        profile: {
          id: profile.id,
          profile_name: profile.profile_name,
          full_name: profile.full_name
        },
        answers,
        items
      });
    } catch (err) {
      console.error('[ChecklistController.generateChecklist] Error:', err);
      return res.status(500).json({
        error: 'Generation Failed',
        message: err.message
      });
    }
  },

  /**
   * Save generated checklist into Supabase.
   */
  async saveChecklist(req, res) {
    try {
      const parseResult = saveChecklistSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Validation Error',
          details: parseResult.error.errors.map(e => e.message)
        });
      }

      const { serviceType, profileId, institutionName, sourceUrl, answers, items } = parseResult.data;

      // Verify profile belongs to user
      const profile = await ProfileModel.getById(profileId, req.user.id);
      if (!profile) {
        return res.status(404).json({
          error: 'Profile Not Found',
          message: 'The selected profile does not exist or does not belong to your account.'
        });
      }

      const serviceDef = TRUSTED_SERVICES[serviceType];

      // Format result_json with initial item status
      const checklistItemsWithStatus = items.map(item => ({
        ...item,
        status: item.status || 'missing', // initial status
        matchedDocumentId: null,
        notes: null
      }));

      const resultJson = {
        answers,
        items: checklistItemsWithStatus,
        serviceTitle: serviceDef ? serviceDef.title : institutionName,
        profileSnapshot: {
          profile_name: profile.profile_name,
          full_name: profile.full_name
        },
        totalRequired: items.filter(i => i.mandatory).length,
        totalMatched: 0
      };

      const saved = await ChecklistModel.create({
        userId: req.user.id,
        profileId,
        serviceType,
        institutionName,
        status: 'incomplete',
        resultJson,
        sourceUrl
      });

      return res.status(201).json({
        success: true,
        message: 'Checklist created successfully',
        checklist: saved
      });
    } catch (err) {
      console.error('[ChecklistController.saveChecklist] Error:', err);
      return res.status(500).json({
        error: 'Save Failed',
        message: err.message
      });
    }
  },

  /**
   * Securely update a single checklist item status (e.g. from Missing Document Help actions).
   * PATCH /api/checklists/:checklistId/items/:itemId/status
   */
  async updateItemStatus(req, res) {
    try {
      const { checklistId, itemId } = req.params;

      const parseResult = updateItemStatusSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Validation Error',
          details: parseResult.error.errors.map(e => e.message)
        });
      }

      const { status, notes } = parseResult.data;

      // Verify checklist ownership
      const checklist = await ChecklistModel.getById(checklistId, req.user.id);
      if (!checklist) {
        return res.status(404).json({
          error: 'Checklist Not Found',
          message: 'Checklist not found or does not belong to your account.'
        });
      }

      const items = checklist.result_json?.items || [];
      const itemIndex = items.findIndex(i => i.id === itemId);

      if (itemIndex === -1) {
        return res.status(404).json({
          error: 'Item Not Found',
          message: `Checklist requirement item '${itemId}' does not exist in this checklist.`
        });
      }

      // Update item
      items[itemIndex] = {
        ...items[itemIndex],
        status,
        userNotes: notes || items[itemIndex].userNotes || null,
        statusUpdatedAt: new Date().toISOString()
      };

      // Recalculate overall checklist readiness
      const mandatoryItems = items.filter(i => i.mandatory && i.status !== 'not_applicable');
      const allMandatoryMatched = mandatoryItems.length > 0 && mandatoryItems.every(i => i.status === 'matched');
      const hasInProgressOrReview = items.some(i => 
        i.status === 'needs_review' || 
        i.status === 'application_in_progress' || 
        i.status === 'ready_to_upload'
      );

      let newOverallStatus = 'incomplete';
      if (allMandatoryMatched && !hasInProgressOrReview) {
        newOverallStatus = 'ready';
      } else if (hasInProgressOrReview || items.some(i => i.status === 'matched')) {
        newOverallStatus = 'needs_attention';
      }

      const updatedResultJson = {
        ...checklist.result_json,
        items,
        totalMatched: items.filter(i => i.status === 'matched').length,
        lastUpdated: new Date().toISOString()
      };

      const updatedChecklist = await ChecklistModel.update(checklistId, req.user.id, {
        status: newOverallStatus,
        result_json: updatedResultJson
      });

      return res.status(200).json({
        success: true,
        message: `Item status updated to '${status}'`,
        updatedItem: items[itemIndex],
        checklist: updatedChecklist
      });
    } catch (err) {
      console.error('[ChecklistController.updateItemStatus] Error:', err);
      return res.status(500).json({
        error: 'Failed to update item status',
        message: err.message
      });
    }
  },

  /**
   * List all checklists for the authenticated user.
   */
  async listChecklists(req, res) {
    try {
      const { service_type, status, search } = req.query;

      const checklists = await ChecklistModel.listByUser(req.user.id, {
        serviceType: service_type,
        status,
        search
      });

      return res.status(200).json({
        success: true,
        count: checklists.length,
        checklists
      });
    } catch (err) {
      console.error('[ChecklistController.listChecklists] Error:', err);
      return res.status(500).json({
        error: 'Failed to retrieve checklists',
        message: err.message
      });
    }
  },

  /**
   * Get a single checklist with its associated uploaded documents.
   */
  async getChecklistById(req, res) {
    try {
      const { id } = req.params;

      const checklist = await ChecklistModel.getById(id, req.user.id);
      if (!checklist) {
        return res.status(404).json({
          error: 'Checklist Not Found',
          message: 'The requested checklist was not found or does not belong to your account.'
        });
      }

      // Fetch all documents attached to this checklist
      const documents = await DocumentModel.listByChecklist(id, req.user.id);

      return res.status(200).json({
        success: true,
        checklist,
        documents
      });
    } catch (err) {
      console.error('[ChecklistController.getChecklistById] Error:', err);
      return res.status(500).json({
        error: 'Failed to retrieve checklist',
        message: err.message
      });
    }
  },

  /**
   * Delete a checklist and attached document records.
   */
  async deleteChecklist(req, res) {
    try {
      const { id } = req.params;

      const checklist = await ChecklistModel.getById(id, req.user.id);
      if (!checklist) {
        return res.status(404).json({
          error: 'Checklist Not Found',
          message: 'Checklist not found.'
        });
      }

      await ChecklistModel.delete(id, req.user.id);

      return res.status(200).json({
        success: true,
        message: 'Checklist deleted successfully'
      });
    } catch (err) {
      console.error('[ChecklistController.deleteChecklist] Error:', err);
      return res.status(500).json({
        error: 'Failed to delete checklist',
        message: err.message
      });
    }
  }
};
