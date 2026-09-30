import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Read persisted user safely on initial mount
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('readydocs_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('readydocs_token') || null;
    } catch {
      return null;
    }
  });

  // isInitializing ensures protected routes and pages do NOT render prematurely
  const [isInitializing, setIsInitializing] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // Validate stored token against backend on app boot
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const savedToken = localStorage.getItem('readydocs_token');

      if (!savedToken) {
        if (isMounted) {
          setToken(null);
          setUser(null);
          setIsInitializing(false);
        }
        return;
      }

      try {
        const data = await authApi.getMe();
        if (isMounted) {
          if (data && data.user) {
            setUser(data.user);
            setToken(savedToken);
            localStorage.setItem('readydocs_user', JSON.stringify(data.user));
          } else {
            throw new Error('Invalid user profile response');
          }
        }
      } catch (err) {
        console.warn('[Auth] Stored session is invalid or expired:', err.message);
        if (isMounted) {
          localStorage.removeItem('readydocs_token');
          localStorage.removeItem('readydocs_user');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthLoading(true);
    try {
      const data = await authApi.login(email, password);

      // 1. Immediately persist token & user synchronously to localStorage
      localStorage.setItem('readydocs_token', data.token);
      localStorage.setItem('readydocs_user', JSON.stringify(data.user));

      // 2. Update React auth states
      setToken(data.token);
      setUser(data.user);

      return data.user;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setAuthLoading(true);
    try {
      const data = await authApi.register(name, email, password);

      // 1. Persist token & user synchronously
      localStorage.setItem('readydocs_token', data.token);
      localStorage.setItem('readydocs_user', JSON.stringify(data.user));

      // 2. Update React auth states
      setToken(data.token);
      setUser(data.user);

      return data.user;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    // 1. Clear local storage immediately
    try {
      localStorage.removeItem('readydocs_token');
      localStorage.removeItem('readydocs_user');
    } catch (e) {
      console.warn('Failed to clear localStorage on logout', e);
    }

    // 2. Clear state immediately
    setToken(null);
    setUser(null);
    setAuthLoading(false);

    // 3. Fire-and-forget backend notification without blocking UI
    authApi.logout().catch(() => {});
  }, []);

  const value = {
    user,
    token,
    isInitializing,
    authLoading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
