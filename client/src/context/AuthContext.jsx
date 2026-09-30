import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

function formatUser(sbUser) {
  if (!sbUser) return null;
  return {
    id: sbUser.id,
    email: sbUser.email,
    name: sbUser.user_metadata?.name || sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'User',
    ...sbUser.user_metadata
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // Sync Supabase Auth session on mount and listen to changes
  useEffect(() => {
    let isMounted = true;

    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      if (error) {
        console.warn('[AuthContext] Error getting initial session:', error.message);
      }
      if (session) {
        const formatted = formatUser(session.user);
        setUser(formatted);
        setToken(session.access_token);
        localStorage.setItem('readydocs_token', session.access_token);
        localStorage.setItem('readydocs_user', JSON.stringify(formatted));
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('readydocs_token');
        localStorage.removeItem('readydocs_user');
      }
      setIsInitializing(false);
    });

    // 2. Subscribe to auth state updates (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session) {
        const formatted = formatUser(session.user);
        setUser(formatted);
        setToken(session.access_token);
        localStorage.setItem('readydocs_token', session.access_token);
        localStorage.setItem('readydocs_user', JSON.stringify(formatted));
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('readydocs_token');
        localStorage.removeItem('readydocs_user');
      }
      setIsInitializing(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.session) {
        const formatted = formatUser(data.user);
        setUser(formatted);
        setToken(data.session.access_token);
        localStorage.setItem('readydocs_token', data.session.access_token);
        localStorage.setItem('readydocs_user', JSON.stringify(formatted));
        return formatted;
      }

      return formatUser(data?.user);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            full_name: name
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.session) {
        const formatted = formatUser(data.user);
        setUser(formatted);
        setToken(data.session.access_token);
        localStorage.setItem('readydocs_token', data.session.access_token);
        localStorage.setItem('readydocs_user', JSON.stringify(formatted));
        return formatted;
      }

      return formatUser(data?.user);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('readydocs_token');
      localStorage.removeItem('readydocs_user');
      localStorage.removeItem('readydocs_active_profile');
    } catch (_) {}

    setUser(null);
    setToken(null);

    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('[AuthContext] SignOut error:', e.message);
    }
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
