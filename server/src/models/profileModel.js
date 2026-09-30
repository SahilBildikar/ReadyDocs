import crypto from 'crypto';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

function assertSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('[Database Error] Live Supabase PostgreSQL database is required. In-memory fallback is disabled.');
  }
}

// Cached check to safely adapt whether the profiles table has is_active column
let _hasIsActive = null;
async function checkHasIsActive() {
  if (_hasIsActive !== null) return _hasIsActive;
  try {
    const { error } = await supabase.from('profiles').select('is_active').limit(1);
    _hasIsActive = !error;
  } catch {
    _hasIsActive = false;
  }
  return _hasIsActive;
}

export const ProfileModel = {
  /**
   * List all profiles belonging to a user
   * @param {string} userId
   * @param {boolean} includeArchived
   * @returns {Promise<Array>}
   */
  async listByUser(userId, includeArchived = false) {
    assertSupabase();

    const hasActiveCol = await checkHasIsActive();

    let query = supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId);

    if (hasActiveCol) {
      query = query.order('is_active', { ascending: false }).order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[Database Error] Failed to list profiles in Supabase:', error.message);
      throw new Error('Database error while fetching profiles: ' + error.message);
    }

    const profiles = (data || []).map((p, idx) => ({
      ...p,
      is_active: p.is_active !== undefined ? Boolean(p.is_active) : (idx === 0)
    }));

    return profiles;
  },

  /**
   * Get a single profile by ID and user ID
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  async getById(id, userId) {
    assertSupabase();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Database Error] Failed to get profile by id in Supabase:', error.message);
      throw new Error('Database error while retrieving profile: ' + error.message);
    }

    if (!data) return null;

    return {
      ...data,
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : true
    };
  },

  /**
   * Create a new profile for a user
   * @param {string} userId
   * @param {Object} profileData
   * @returns {Promise<Object>}
   */
  async create(userId, profileData) {
    assertSupabase();

    const existing = await this.listByUser(userId, true);
    const shouldBeActive = profileData.is_active || existing.length === 0;

    const hasActiveCol = await checkHasIsActive();

    if (shouldBeActive && hasActiveCol) {
      await this.clearActive(userId);
    }

    const payload = {
      user_id: userId,
      profile_name: profileData.profile_name,
      full_name: profileData.full_name,
      date_of_birth: profileData.date_of_birth || null,
      gender: profileData.gender || null,
      email: profileData.email || null,
      phone: profileData.phone || null,
      address: profileData.address || null,
      city: profileData.city || null,
      state: profileData.state || null,
      pin_code: profileData.pin_code || null,
      education_details: profileData.education_details || null,
      language: profileData.language || 'english',
      is_archived: false
    };

    if (hasActiveCol) {
      payload.is_active = shouldBeActive;
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([payload])
      .select('*')
      .single();

    if (error) {
      console.error('[Database Error] Failed to create profile in Supabase:', error.message);
      throw new Error('Database error while creating profile: ' + error.message);
    }

    return {
      ...data,
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : shouldBeActive
    };
  },

  /**
   * Update an existing profile
   * @param {string} id
   * @param {string} userId
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async update(id, userId, updateData) {
    assertSupabase();

    const existing = await this.getById(id, userId);
    if (!existing) {
      const notFoundErr = new Error('Profile not found or access denied.');
      notFoundErr.status = 404;
      throw notFoundErr;
    }

    const hasActiveCol = await checkHasIsActive();

    if (hasActiveCol && updateData.is_active && !existing.is_active) {
      await this.clearActive(userId);
    }

    const payload = {
      profile_name: updateData.profile_name ?? existing.profile_name,
      full_name: updateData.full_name ?? existing.full_name,
      date_of_birth: updateData.date_of_birth !== undefined ? updateData.date_of_birth : existing.date_of_birth,
      gender: updateData.gender !== undefined ? updateData.gender : existing.gender,
      email: updateData.email !== undefined ? updateData.email : existing.email,
      phone: updateData.phone !== undefined ? updateData.phone : existing.phone,
      address: updateData.address !== undefined ? updateData.address : existing.address,
      city: updateData.city !== undefined ? updateData.city : existing.city,
      state: updateData.state !== undefined ? updateData.state : existing.state,
      pin_code: updateData.pin_code !== undefined ? updateData.pin_code : existing.pin_code,
      education_details: updateData.education_details !== undefined ? updateData.education_details : existing.education_details,
      language: updateData.language ?? existing.language,
      updated_at: new Date().toISOString()
    };

    if (hasActiveCol && updateData.is_active !== undefined) {
      payload.is_active = updateData.is_active;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('[Database Error] Failed to update profile in Supabase:', error.message);
      throw new Error('Database error while updating profile: ' + error.message);
    }

    return {
      ...data,
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : (updateData.is_active ?? existing.is_active)
    };
  },

  /**
   * Set a specific profile as the user's active profile
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async setActive(id, userId) {
    assertSupabase();

    const target = await this.getById(id, userId);
    if (!target) {
      const err = new Error('Profile not found.');
      err.status = 404;
      throw err;
    }

    const hasActiveCol = await checkHasIsActive();

    if (hasActiveCol) {
      await this.clearActive(userId);

      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) {
        throw new Error('Failed to set active profile: ' + error.message);
      }
      return data;
    }

    return { ...target, is_active: true };
  },

  /**
   * Clear active status from all profiles for a user
   * @param {string} userId
   */
  async clearActive(userId) {
    assertSupabase();

    const hasActiveCol = await checkHasIsActive();
    if (hasActiveCol) {
      await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('user_id', userId);
    }
  },

  /**
   * Toggle archive status of a profile (archive or restore)
   * @param {string} id
   * @param {string} userId
   * @param {boolean} isArchived
   * @returns {Promise<Object>}
   */
  async toggleArchive(id, userId, isArchived) {
    assertSupabase();

    const target = await this.getById(id, userId);
    if (!target) {
      const err = new Error('Profile not found.');
      err.status = 404;
      throw err;
    }

    const hasActiveCol = await checkHasIsActive();
    const isActive = isArchived ? false : target.is_active;

    const payload = {
      is_archived: isArchived,
      updated_at: new Date().toISOString()
    };

    if (hasActiveCol) {
      payload.is_active = isActive;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      throw new Error('Failed to toggle archive status: ' + error.message);
    }
    return {
      ...data,
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : isActive
    };
  },

  /**
   * Permanently delete a profile
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async delete(id, userId) {
    assertSupabase();

    const target = await this.getById(id, userId);
    if (!target) {
      const err = new Error('Profile not found.');
      err.status = 404;
      throw err;
    }

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error('Failed to delete profile: ' + error.message);
    }
    return true;
  }
};
