import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { profileApi } from '../services/profileApi';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [profiles, setProfiles] = useState([]);
  const [archivedProfiles, setArchivedProfiles] = useState([]);
  const [activeProfile, setActiveProfileState] = useState(() => {
    try {
      const saved = localStorage.getItem('readydocs_active_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfiles = useCallback(async () => {
    if (!isAuthenticated) {
      setProfiles([]);
      setArchivedProfiles([]);
      setActiveProfileState(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await profileApi.getAll(true);
      const all = data.profiles || [];

      const activeList = all.filter((p) => !p.is_archived);
      const archivedList = all.filter((p) => p.is_archived);

      setProfiles(activeList);
      setArchivedProfiles(archivedList);

      // Determine active profile:
      // 1. Profile with is_active === true
      // 2. Or the first active profile if none has is_active
      let currentActive = activeList.find((p) => p.is_active);
      if (!currentActive && activeList.length > 0) {
        currentActive = activeList[0];
      }

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
  }, [isAuthenticated]);

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

      // Update active flags in memory
      setProfiles((prev) =>
        prev.map((p) => ({
          ...p,
          is_active: p.id === id
        }))
      );

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
