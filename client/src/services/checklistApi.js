const API_BASE = 'http://localhost:5000/api';

function getAuthHeader() {
  const token = localStorage.getItem('readydocs_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchServices() {
  const res = await fetch(`${API_BASE}/checklists/services`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch services');
  return data.services || [];
}

export async function fetchHelpGuide(guideId) {
  const res = await fetch(`${API_BASE}/checklists/guides/${guideId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch help guide');
  return data.guide;
}

export async function generateChecklist({ serviceType, profileId, answers }) {
  const res = await fetch(`${API_BASE}/checklists/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ serviceType, profileId, answers })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to generate checklist');
  return data;
}

export async function saveChecklist({ serviceType, profileId, institutionName, sourceUrl, answers, items }) {
  const res = await fetch(`${API_BASE}/checklists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ serviceType, profileId, institutionName, sourceUrl, answers, items })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to save checklist');
  return data.checklist;
}

export async function updateChecklistItemStatus({ checklistId, itemId, status, notes = null }) {
  const res = await fetch(`${API_BASE}/checklists/${checklistId}/items/${itemId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
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

  const res = await fetch(`${API_BASE}/checklists?${params.toString()}`, {
    headers: getAuthHeader()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch checklists');
  return data.checklists || [];
}

export async function fetchChecklistById(id) {
  const res = await fetch(`${API_BASE}/checklists/${id}`, {
    headers: getAuthHeader()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch checklist');
  return data;
}

export async function deleteChecklist(id) {
  const res = await fetch(`${API_BASE}/checklists/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
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

  const res = await fetch(`${API_BASE}/documents/upload-and-classify`, {
    method: 'POST',
    headers: getAuthHeader(), // Note: do NOT set Content-Type header so browser sets multipart boundary
    body: formData
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || 'Failed to process document');
  return data;
}

export async function deleteDocument(id) {
  const res = await fetch(`${API_BASE}/documents/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete document');
  return data;
}
