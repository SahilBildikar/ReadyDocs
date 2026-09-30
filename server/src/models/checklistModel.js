import { supabase } from '../config/supabase.js';
import crypto from 'crypto';

// In-development in-memory mock store (strictly disallowed in production)
const mockChecklists = new Map();

export const ChecklistModel = {
  /**
   * List all checklists belonging to a specific user, with optional filters.
   */
  async listByUser(userId, { serviceType, status, search } = {}) {
    if (supabase) {
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
        if (process.env.NODE_ENV === 'production') {
          throw new Error(`Database error fetching checklists: ${error.message}`);
        }
        console.warn('[ChecklistModel] Supabase query error, falling back to dev store:', error.message);
      } else {
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
      }
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production environment requires active Supabase PostgreSQL connection.');
    }

    // Dev store fallback
    let userChecklists = Array.from(mockChecklists.values())
      .filter(c => c.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (serviceType) {
      userChecklists = userChecklists.filter(c => c.service_type === serviceType);
    }
    if (status) {
      userChecklists = userChecklists.filter(c => c.status === status);
    }
    if (search && search.trim() !== '') {
      const s = search.toLowerCase();
      userChecklists = userChecklists.filter(c => 
        (c.institution_name && c.institution_name.toLowerCase().includes(s)) ||
        (c.service_type && c.service_type.toLowerCase().includes(s))
      );
    }

    return userChecklists;
  },

  /**
   * Get a single checklist by ID for a user.
   */
  async getById(id, userId) {
    if (supabase) {
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
        if (process.env.NODE_ENV === 'production') {
          throw new Error(`Database error fetching checklist: ${error.message}`);
        }
      } else {
        return data;
      }
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production environment requires active Supabase PostgreSQL connection.');
    }

    const item = mockChecklists.get(id);
    if (!item || item.user_id !== userId) return null;
    return item;
  },

  /**
   * Create a new checklist for a user.
   */
  async create({ userId, profileId, serviceType, institutionName, status = 'in_progress', resultJson, sourceUrl }) {
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

    if (supabase) {
      const { data, error } = await supabase
        .from('checklists')
        .insert([newChecklist])
        .select(`
          *,
          profile:profiles(id, profile_name, full_name)
        `)
        .single();

      if (error) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error(`Database error saving checklist: ${error.message}`);
        }
        console.warn('[ChecklistModel] Supabase insert failed, saving to dev store:', error.message);
      } else {
        return data;
      }
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production environment requires active Supabase PostgreSQL connection.');
    }

    mockChecklists.set(newChecklist.id, newChecklist);
    return newChecklist;
  },

  /**
   * Update checklist status or result_json.
   */
  async update(id, userId, updates) {
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (supabase) {
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
        if (process.env.NODE_ENV === 'production') {
          throw new Error(`Database error updating checklist: ${error.message}`);
        }
      } else {
        return data;
      }
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production environment requires active Supabase PostgreSQL connection.');
    }

    const item = mockChecklists.get(id);
    if (!item || item.user_id !== userId) return null;

    const merged = { ...item, ...updatedData };
    mockChecklists.set(id, merged);
    return merged;
  },

  /**
   * Delete a checklist for a user.
   */
  async delete(id, userId) {
    if (supabase) {
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error(`Database error deleting checklist: ${error.message}`);
        }
      } else {
        return true;
      }
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production environment requires active Supabase PostgreSQL connection.');
    }

    const item = mockChecklists.get(id);
    if (!item || item.user_id !== userId) return false;
    mockChecklists.delete(id);
    return true;
  }
};
