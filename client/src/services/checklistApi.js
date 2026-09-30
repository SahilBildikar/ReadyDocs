import { supabase } from '../lib/supabaseClient';

const API_BASE_URL = import.meta.env.PROD ? "/api" : (import.meta.env.VITE_API_BASE_URL || "/api");

async function getAuthHeader() {
  let token = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token || localStorage.getItem('readydocs_token');
  } catch {
    token = localStorage.getItem('readydocs_token');
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchServices() {
  const res = await fetch(`${API_BASE_URL}/checklists/services`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch services');
  return data.services || [];
}

export async function fetchHelpGuide(guideId) {
  const res = await fetch(`${API_BASE_URL}/checklists/guides/${guideId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch help guide');
  return data.guide;
}

export async function generateChecklist({ serviceType, profileId, answers }) {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/checklists/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders
    },
    body: JSON.stringify({ serviceType, profileId, answers })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to generate checklist');
  return data;
}

export async function saveChecklist({ serviceType, profileId, institutionName, sourceUrl, answers, items }) {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/checklists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders
    },
    body: JSON.stringify({ serviceType, profileId, institutionName, sourceUrl, answers, items })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to save checklist');
  return data.checklist;
}

export async function updateChecklistItemStatus({ checklistId, itemId, status, notes = null }) {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/checklists/${checklistId}/items/${itemId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders
    },
    body: JSON.stringify({ status, notes })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to update item status');
  return data;
}

export async function fetchChecklists({ serviceType = '', status = '', search = '' } = {}) {
  const params = new URLSearchParams();
  if (serviceType) params.append('service_type', serviceType);
  if (status) params.append('status', status);
  if (search) params.append('search', search);

  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/checklists?${params.toString()}`, {
    headers: authHeaders
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch checklists');
  return data.checklists || [];
}

export async function fetchChecklistById(id) {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/checklists/${id}`, {
    headers: authHeaders
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch checklist');
  return data;
}

export async function deleteChecklist(id) {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/checklists/${id}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete checklist');
  return data;
}

export async function uploadAndClassifyDocument({ file, checklistId, targetItemId = null }) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('checklistId', checklistId);
  if (targetItemId) {
    formData.append('targetItemId', targetItemId);
  }

  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/documents/upload-and-classify`, {
    method: 'POST',
    headers: authHeaders, // Note: do NOT set Content-Type header so browser sets multipart boundary
    body: formData
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to process document');
  return data;
}

export async function deleteDocument(id) {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
    method: 'DELETE',
    headers: authHeaders
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete document');
  return data;
}
