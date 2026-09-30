import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import crypto from 'crypto';

function assertSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('[Database Error] Live Supabase PostgreSQL database is required. In-memory fallback is disabled.');
  }
}

export const DocumentModel = {
  /**
   * List all documents attached to a checklist for a user.
   */
  async listByChecklist(checklistId, userId) {
    assertSupabase();

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('checklist_id', checklistId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[DocumentModel] Supabase query error:', error.message);
      throw new Error(`Database error fetching documents: ${error.message}`);
    }
    return data || [];
  },

  /**
   * Get a single document record by ID.
   */
  async getById(id, userId) {
    assertSupabase();

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error fetching document: ${error.message}`);
    }
    return data;
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
    assertSupabase();

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

    const { data, error } = await supabase
      .from('documents')
      .insert([newDoc])
      .select()
      .single();

    if (error) {
      console.error('[DocumentModel] Supabase insert failed:', error.message);
      throw new Error(`Database error creating document record: ${error.message}`);
    }

    return data;
  },

  /**
   * Delete a document record.
   */
  async delete(id, userId) {
    assertSupabase();

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[DocumentModel] Supabase delete failed:', error.message);
      throw new Error(`Database error deleting document: ${error.message}`);
    }

    return true;
  }
};
