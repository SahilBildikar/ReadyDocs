import { supabase, isSupabaseConfigured } from '../config/supabase.js';
import crypto from 'crypto';

function assertSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('[Database Error] Live Supabase PostgreSQL database is required. In-memory fallback is disabled.');
  }
}

export const ChecklistModel = {
  /**
   * List all checklists belonging to a specific user, with optional filters.
   */
  async listByUser(userId, { serviceType, status, search } = {}) {
    assertSupabase();

    let query = supabase
      .from('checklists')
      .select(`
        *,
        profile:profiles(id, profile_name, full_name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (serviceType) {
      query = query.eq('service_type', serviceType);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[ChecklistModel] Supabase query error:', error.message);
      throw new Error(`Database error fetching checklists: ${error.message}`);
    }

    let results = data || [];
    if (search && search.trim() !== '') {
      const s = search.toLowerCase();
      results = results.filter(c => 
        (c.institution_name && c.institution_name.toLowerCase().includes(s)) ||
        (c.service_type && c.service_type.toLowerCase().includes(s)) ||
        (c.profile && c.profile.profile_name && c.profile.profile_name.toLowerCase().includes(s))
      );
    }
    return results;
  },

  /**
   * Get a single checklist by ID for a user.
   */
  async getById(id, userId) {
    assertSupabase();

    const { data, error } = await supabase
      .from('checklists')
      .select(`
        *,
        profile:profiles(id, profile_name, full_name)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Database error fetching checklist: ${error.message}`);
    }
    return data;
  },

  /**
   * Create a new checklist for a user.
   */
  async create({ userId, profileId, serviceType, institutionName, status = 'in_progress', resultJson, sourceUrl }) {
    assertSupabase();

    const newChecklist = {
      id: crypto.randomUUID(),
      user_id: userId,
      profile_id: profileId || null,
      service_type: serviceType,
      institution_name: institutionName,
      status: status,
      result_json: resultJson,
      source_url: sourceUrl || null,
      source_checked_at: new Date().toISOString(),
      archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('checklists')
      .insert([newChecklist])
      .select(`
        *,
        profile:profiles(id, profile_name, full_name)
      `)
      .single();

    if (error) {
      console.error('[ChecklistModel] Supabase insert failed:', error.message);
      throw new Error(`Database error saving checklist: ${error.message}`);
    }

    return data;
  },

  /**
   * Update checklist status or result_json.
   */
  async update(id, userId, updates) {
    assertSupabase();

    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('checklists')
      .update(updatedData)
      .eq('id', id)
      .eq('user_id', userId)
      .select(`
        *,
        profile:profiles(id, profile_name, full_name)
      `)
      .single();

    if (error) {
      console.error('[ChecklistModel] Supabase update failed:', error.message);
      throw new Error(`Database error updating checklist: ${error.message}`);
    }

    return data;
  },

  /**
   * Delete a checklist for a user.
   */
  async delete(id, userId) {
    assertSupabase();

    const { error } = await supabase
      .from('checklists')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[ChecklistModel] Supabase delete failed:', error.message);
      throw new Error(`Database error deleting checklist: ${error.message}`);
    }

    return true;
  }
};
