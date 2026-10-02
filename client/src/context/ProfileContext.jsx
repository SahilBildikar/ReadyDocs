import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { profileApi } from '../services/profileApi';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { isAuthenticated, user } = useAuth();

  const [profiles, setProfiles] = useState([]);
  const [archivedProfiles, setArchivedProfiles] = useState([]);
  const [activeProfile, setActiveProfileState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear in-memory and persisted profile state immediately whenever user changes or logs out
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setProfiles([]);
      setArchivedProfiles([]);
      setActiveProfileState(null);
      setIsLoading(false);
      try {
        localStorage.removeItem('readydocs_profiles_cache');
        localStorage.removeItem('readydocs_active_profile');
      } catch (_) {}
    }
  }, [isAuthenticated, user?.id]);

  const fetchProfiles = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setProfiles([]);
      setArchivedProfiles([]);
      setActiveProfileState(null);
      try {
        localStorage.removeItem('readydocs_profiles_cache');
        localStorage.removeItem('readydocs_active_profile');
      } catch (_) {}
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await profileApi.getAll(true);
      const all = data.profiles || [];

      const activeList = all.filter((p) => !p.is_archived);
      const archivedList = all.filter((p) => p.is_archived);

      // Determine active profile:
      // 1. Profile with is_active === true from server
      // 2. Or the previously saved active profile if it exists in activeList
      // 3. Or the first active profile if none has is_active
      let currentActive = activeList.find((p) => p.is_active);
      if (!currentActive) {
        const savedId = activeProfile?.id || (() => {
          try {
            const saved = localStorage.getItem('readydocs_active_profile');
            return saved ? JSON.parse(saved)?.id : null;
          } catch {
            return null;
          }
        })();
        if (savedId) {
          currentActive = activeList.find((p) => p.id === savedId);
        }
      }

      if (!currentActive && activeList.length > 0) {
        currentActive = activeList[0];
      }

      const enrichedActiveList = activeList.map((p) => ({
        ...p,
        is_active: currentActive ? p.id === currentActive.id : Boolean(p.is_active)
      }));

      setProfiles(enrichedActiveList);
      setArchivedProfiles(archivedList);
      try {
        localStorage.setItem('readydocs_profiles_cache', JSON.stringify(enrichedActiveList));
      } catch (_) {}

      if (currentActive) {
        setActiveProfileState(currentActive);
        try {
          localStorage.setItem('readydocs_active_profile', JSON.stringify(currentActive));
        } catch (_) {}
      } else {
        setActiveProfileState(null);
        try {
          localStorage.removeItem('readydocs_active_profile');
        } catch (_) {}
      }
    } catch (err) {
      console.error('[ProfileContext] Error fetching profiles:', err.message);
      setError(err.message || 'Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id, activeProfile?.id]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const setActiveProfile = async (id) => {
    try {
      const res = await profileApi.setActive(id);
      const updatedProfile = res.profile;

      setActiveProfileState(updatedProfile);
      try {
        localStorage.setItem('readydocs_active_profile', JSON.stringify(updatedProfile));
      } catch (_) {}

      // Update active flags in memory and cache
      setProfiles((prev) => {
        const next = prev.map((p) => ({
          ...p,
          is_active: p.id === id
        }));
        try {
          localStorage.setItem('readydocs_profiles_cache', JSON.stringify(next));
        } catch (_) {}
        return next;
      });

      return updatedProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const createProfile = async (profileData) => {
    try {
      const res = await profileApi.create(profileData);
      const created = res.profile;

      await fetchProfiles();
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateProfile = async (id, updateData) => {
    try {
      const res = await profileApi.update(id, updateData);
      const updated = res.profile;

      await fetchProfiles();
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const archiveProfile = async (id, isArchived = true) => {
    try {
      await profileApi.toggleArchive(id, isArchived);
      await fetchProfiles();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProfile = async (id) => {
    try {
      await profileApi.delete(id);
      await fetchProfiles();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    profiles,
    archivedProfiles,
    activeProfile,
    isLoading,
    error,
    fetchProfiles,
    setActiveProfile,
    createProfile,
    updateProfile,
    archiveProfile,
    deleteProfile
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
