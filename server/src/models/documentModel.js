import { supabase } from '../config/supabase.js';
import crypto from 'crypto';

// In-development in-memory mock store (strictly disallowed in production)
const mockDocuments = new Map();

export const DocumentModel = {
  /**
   * List all documents attached to a checklist for a user.
   */
  async listByChecklist(checklistId, userId) {
    if (supabase) {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('checklist_id', checklistId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error(`Database error fetching documents: ${error.message}`);
        }
        console.warn('[DocumentModel] Supabase query error, falling back to dev store:', error.message);
      } else {
        return data || [];
      }
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production environment requires active Supabase PostgreSQL connection.');
    }

    return Array.from(mockDocuments.values())
      .filter(d => d.checklist_id === checklistId && d.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  /**
   * Get a single document record by ID.
   */
  async getById(id, userId) {
    if (supabase) {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        if (process.env.NODE_ENV === 'production') {
          throw new Error(`Database error fetching document: ${error.message}`);
        }
      } else {
        return data;
      }
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production environment requires active Supabase PostgreSQL connection.');
    }

    const doc = mockDocuments.get(id);
    if (!doc || doc.user_id !== userId) return null;
    return doc;
  },

  /**
   * Create document metadata record.
   * Note: Original raw file is never stored in Supabase; only safe metadata and AI analysis.
   */
  async create({
    userId,
    checklistId,
    fileName,
    fileType,
    fileSize,
    storagePathOrUrl = null,
    aiClassificationJson,
    matchedChecklistItem,
    status = 'uploaded'
  }) {
    const newDoc = {
      id: crypto.randomUUID(),
      user_id: userId,
      checklist_id: checklistId,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      storage_path_or_url: storagePathOrUrl,
      ai_classification_json: aiClassificationJson,
      matched_checklist_item: matchedChecklistItem,
      status: status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('documents')
        .insert([newDoc])
        .select()
        .single();

      if (error) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error(`Database error creating document record: ${error.message}`);
        }
        console.warn('[DocumentModel] Supabase insert failed, saving to dev store:', error.message);
      } else {
        return data;
      }
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production environment requires active Supabase PostgreSQL connection.');
    }

    mockDocuments.set(newDoc.id, newDoc);
    return newDoc;
  },

  /**
   * Delete a document record.
   */
  async delete(id, userId) {
    if (supabase) {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error(`Database error deleting document: ${error.message}`);
        }
      } else {
        return true;
      }
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production environment requires active Supabase PostgreSQL connection.');
    }

    const doc = mockDocuments.get(id);
    if (!doc || doc.user_id !== userId) return false;
    mockDocuments.delete(id);
    return true;
  }
};
