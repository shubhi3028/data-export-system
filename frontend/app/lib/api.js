const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function fetchUsers(page = 1, filters = {}) {
  const params = new URLSearchParams({
    page,
    page_size: 1000,
    ...filters,
  });

  const response = await fetch(`${API_BASE_URL}/api/users?${params}`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

export async function initiateExport(filters) {
  const response = await fetch(`${API_BASE_URL}/api/export/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filters,
      format: 'csv',
      chunk_size: 10000,
    }),
  });

  if (!response.ok) throw new Error('Failed to initiate export');
  return response.json();
}

export async function checkExportStatus(sessionId) {
  const response = await fetch(
    `${API_BASE_URL}/api/export/status?session_id=${sessionId}`
  );

  if (!response.ok) throw new Error('Failed to check export status');
  return response.json();
}

export async function downloadExport(sessionId) {
  return `${API_BASE_URL}/api/export/download?session_id=${sessionId}`;
}
