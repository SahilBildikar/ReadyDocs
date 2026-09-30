import { profileSchema } from '../validators/profileValidator.js';
import { ProfileModel } from '../models/profileModel.js';

export const ProfileController = {
  /**
   * GET /api/profiles
   * List all profiles for the authenticated user
   */
  async getAllProfiles(req, res) {
    try {
      const includeArchived = req.query.includeArchived === 'true';
      const profiles = await ProfileModel.listByUser(req.user.id, includeArchived);

      return res.status(200).json({
        profiles,
        count: profiles.length
      });
    } catch (err) {
      console.error('[ProfileController.getAllProfiles Error]:', err);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'Failed to retrieve profiles.'
      });
    }
  },

  /**
   * GET /api/profiles/:id
   * Get a single profile by ID
   */
  async getProfileById(req, res) {
    try {
      const { id } = req.params;
      const profile = await ProfileModel.getById(id, req.user.id);

      if (!profile) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Profile not found.'
        });
      }

      return res.status(200).json({ profile });
    } catch (err) {
      console.error('[ProfileController.getProfileById Error]:', err);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'Failed to retrieve profile.'
      });
    }
  },

  /**
   * POST /api/profiles
   * Create a new profile
   */
  async createProfile(req, res) {
    try {
      const parseResult = profileSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Validation failed',
          details: parseResult.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      const newProfile = await ProfileModel.create(req.user.id, parseResult.data);

      return res.status(201).json({
        message: 'Profile created successfully',
        profile: newProfile
      });
    } catch (err) {
      console.error('[ProfileController.createProfile Error]:', err);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'Failed to create profile.'
      });
    }
  },

  /**
   * PUT /api/profiles/:id
   * Update an existing profile
   */
  async updateProfile(req, res) {
    try {
      const { id } = req.params;
      const parseResult = profileSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Validation failed',
          details: parseResult.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      const updated = await ProfileModel.update(id, req.user.id, parseResult.data);

      return res.status(200).json({
        message: 'Profile updated successfully',
        profile: updated
      });
    } catch (err) {
      if (err.status === 404) {
        return res.status(404).json({
          error: 'Not Found',
          message: err.message
        });
      }

      console.error('[ProfileController.updateProfile Error]:', err);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'Failed to update profile.'
      });
    }
  },

  /**
   * PATCH /api/profiles/:id/archive
   * Toggle archive status of a profile (archive or restore)
   */
  async toggleArchive(req, res) {
    try {
      const { id } = req.params;
      const isArchived = req.body.is_archived !== undefined ? Boolean(req.body.is_archived) : true;

      const updated = await ProfileModel.toggleArchive(id, req.user.id, isArchived);

      return res.status(200).json({
        message: isArchived ? 'Profile archived successfully' : 'Profile restored successfully',
        profile: updated
      });
    } catch (err) {
      if (err.status === 404) {
        return res.status(404).json({
          error: 'Not Found',
          message: err.message
        });
      }

      console.error('[ProfileController.toggleArchive Error]:', err);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'Failed to update archive status.'
      });
    }
  },

  /**
   * PATCH /api/profiles/:id/active
   * Set a specific profile as the user's active profile
   */
  async setActive(req, res) {
    try {
      const { id } = req.params;
      const updated = await ProfileModel.setActive(id, req.user.id);

      return res.status(200).json({
        message: 'Profile set as active successfully',
        profile: updated
      });
    } catch (err) {
      if (err.status === 404) {
        return res.status(404).json({
          error: 'Not Found',
          message: err.message
        });
      }

      console.error('[ProfileController.setActive Error]:', err);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'Failed to set active profile.'
      });
    }
  },

  /**
   * DELETE /api/profiles/:id
   * Permanently delete a profile
   */
  async deleteProfile(req, res) {
    try {
      const { id } = req.params;
      await ProfileModel.delete(id, req.user.id);

      return res.status(200).json({
        message: 'Profile deleted successfully'
      });
    } catch (err) {
      if (err.status === 404) {
        return res.status(404).json({
          error: 'Not Found',
          message: err.message
        });
      }

      console.error('[ProfileController.deleteProfile Error]:', err);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'Failed to delete profile.'
      });
    }
  }
};
