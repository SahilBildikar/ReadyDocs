import { supabase } from '../lib/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

/**
 * Standard fetch wrapper that automatically injects the Supabase Auth Bearer token
 * @param {string} endpoint - API endpoint relative to base URL (e.g. '/profiles')
 * @param {RequestInit} options - fetch options
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  let token = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token || localStorage.getItem('readydocs_token');
  } catch {
    token = localStorage.getItem('readydocs_token');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.details = data.details || null;
    error.data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  getMe: () =>
    apiRequest('/auth/me', {
      method: 'GET'
    })
};
