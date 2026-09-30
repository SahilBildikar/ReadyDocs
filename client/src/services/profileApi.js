import { apiRequest } from './api';

export const profileApi = {
  /**
   * List all profiles for the logged-in user
   * @param {boolean} includeArchived
   */
  getAll: (includeArchived = false) => {
    const query = includeArchived ? '?includeArchived=true' : '';
    return apiRequest(`/profiles${query}`, { method: 'GET' });
  },

  /**
   * Get a single profile by ID
   * @param {string} id
   */
  getById: (id) => apiRequest(`/profiles/${id}`, { method: 'GET' }),

  /**
   * Create a new profile
   * @param {Object} profileData
   */
  create: (profileData) =>
    apiRequest('/profiles', {
      method: 'POST',
      body: JSON.stringify(profileData)
    }),

  /**
   * Update an existing profile
   * @param {string} id
   * @param {Object} updateData
   */
  update: (id, updateData) =>
    apiRequest(`/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    }),

  /**
   * Toggle archive state
   * @param {string} id
   * @param {boolean} isArchived
   */
  toggleArchive: (id, isArchived) =>
    apiRequest(`/profiles/${id}/archive`, {
      method: 'PATCH',
      body: JSON.stringify({ is_archived: isArchived })
    }),

  /**
   * Set profile as active
   * @param {string} id
   */
  setActive: (id) =>
    apiRequest(`/profiles/${id}/active`, {
      method: 'PATCH'
    }),

  /**
   * Delete a profile permanently
   * @param {string} id
   */
  delete: (id) =>
    apiRequest(`/profiles/${id}`, {
      method: 'DELETE'
    })
};
