import crypto from 'crypto';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

// Development-only in-memory storage fallback. STRICTLY DISABLED in production.
const devOnlyProfiles = new Map();

/**
 * Asserts that production environments MUST use Supabase.
 */
function assertProductionDatabase() {
  if (process.env.NODE_ENV === 'production' && !isSupabaseConfigured) {
    throw new Error(
      '[FATAL DATABASE ERROR] Production environment detected without valid Supabase credentials. ' +
      'In-memory fallback is strictly forbidden in production. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
}

export const ProfileModel = {
  /**
   * List all profiles belonging to a user
   * @param {string} userId
   * @param {boolean} includeArchived
   * @returns {Promise<Array>}
   */
  async listByUser(userId, includeArchived = false) {
    assertProductionDatabase();

    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .order('is_active', { ascending: false })
        .order('created_at', { ascending: false });

      if (!includeArchived) {
        query = query.eq('is_archived', false);
      }

      const { data, error } = await query;
      if (error) {
        console.error('[Database Error] Failed to list profiles in Supabase:', error.message);
        throw new Error('Database error while fetching profiles: ' + error.message);
      }
      return data || [];
    }

    // [DEVELOPMENT-ONLY FALLBACK]
    const userProfiles = [];
    for (const profile of devOnlyProfiles.values()) {
      if (profile.user_id === userId) {
        if (includeArchived || !profile.is_archived) {
          userProfiles.push({ ...profile });
        }
      }
    }

    return userProfiles.sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0));
  },

  /**
   * Get a single profile by ID and user ID
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  async getById(id, userId) {
    assertProductionDatabase();

    if (isSupabaseConfigured && supabase) {
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
      return data;
    }

    // [DEVELOPMENT-ONLY FALLBACK]
    const profile = devOnlyProfiles.get(id);
    if (profile && profile.user_id === userId) {
      return { ...profile };
    }
    return null;
  },

  /**
   * Create a new profile for a user
   * @param {string} userId
   * @param {Object} profileData
   * @returns {Promise<Object>}
   */
  async create(userId, profileData) {
    assertProductionDatabase();

    // Check if this is the user's first profile; if so, make it active by default
    const existing = await this.listByUser(userId, true);
    const shouldBeActive = profileData.is_active || existing.length === 0;

    if (shouldBeActive) {
      await this.clearActive(userId);
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
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
            is_active: shouldBeActive,
            is_archived: false
          }
        ])
        .select('*')
        .single();

      if (error) {
        console.error('[Database Error] Failed to create profile in Supabase:', error.message);
        throw new Error('Database error while creating profile: ' + error.message);
      }
      return data;
    }

    // [DEVELOPMENT-ONLY FALLBACK]
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newProfile = {
      id,
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
      is_active: shouldBeActive,
      is_archived: false,
      created_at: now,
      updated_at: now
    };

    devOnlyProfiles.set(id, newProfile);
    return newProfile;
  },

  /**
   * Update an existing profile
   * @param {string} id
   * @param {string} userId
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async update(id, userId, updateData) {
    assertProductionDatabase();

    const existing = await this.getById(id, userId);
    if (!existing) {
      const notFoundErr = new Error('Profile not found or access denied.');
      notFoundErr.status = 404;
      throw notFoundErr;
    }

    if (updateData.is_active && !existing.is_active) {
      await this.clearActive(userId);
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
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
          is_active: updateData.is_active !== undefined ? updateData.is_active : existing.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) {
        console.error('[Database Error] Failed to update profile in Supabase:', error.message);
        throw new Error('Database error while updating profile: ' + error.message);
      }
      return data;
    }

    // [DEVELOPMENT-ONLY FALLBACK]
    const updated = {
      ...existing,
      ...updateData,
      id,
      user_id: userId,
      updated_at: new Date().toISOString()
    };
    devOnlyProfiles.set(id, updated);
    return updated;
  },

  /**
   * Set a specific profile as the user's active profile
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async setActive(id, userId) {
    assertProductionDatabase();

    const target = await this.getById(id, userId);
    if (!target) {
      const err = new Error('Profile not found.');
      err.status = 404;
      throw err;
    }

    await this.clearActive(userId);

    if (isSupabaseConfigured && supabase) {
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

    // [DEVELOPMENT-ONLY FALLBACK]
    const updated = { ...target, is_active: true, updated_at: new Date().toISOString() };
    devOnlyProfiles.set(id, updated);
    return updated;
  },

  /**
   * Clear active status from all profiles for a user
   * @param {string} userId
   */
  async clearActive(userId) {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('user_id', userId);
      return;
    }

    // [DEVELOPMENT-ONLY FALLBACK]
    for (const [key, profile] of devOnlyProfiles.entries()) {
      if (profile.user_id === userId && profile.is_active) {
        devOnlyProfiles.set(key, { ...profile, is_active: false });
      }
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
    assertProductionDatabase();

    const target = await this.getById(id, userId);
    if (!target) {
      const err = new Error('Profile not found.');
      err.status = 404;
      throw err;
    }

    // If archiving the active profile, clear active flag
    const isActive = isArchived ? false : target.is_active;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          is_archived: isArchived,
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) {
        throw new Error('Failed to toggle archive status: ' + error.message);
      }
      return data;
    }

    // [DEVELOPMENT-ONLY FALLBACK]
    const updated = {
      ...target,
      is_archived: isArchived,
      is_active: isActive,
      updated_at: new Date().toISOString()
    };
    devOnlyProfiles.set(id, updated);
    return updated;
  },

  /**
   * Permanently delete a profile
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async delete(id, userId) {
    assertProductionDatabase();

    const target = await this.getById(id, userId);
    if (!target) {
      const err = new Error('Profile not found.');
      err.status = 404;
      throw err;
    }

    if (isSupabaseConfigured && supabase) {
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

    // [DEVELOPMENT-ONLY FALLBACK]
    devOnlyProfiles.delete(id);
    return true;
  }
};
