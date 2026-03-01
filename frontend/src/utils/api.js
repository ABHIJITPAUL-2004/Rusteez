const BASE_URL = 'http://127.0.0.1:8000/analyze';

async function postImage(endpoint, file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }
  return response.json();
}

export const api = {
  analyzeHSV: (file) => postImage('/hsv', file),
  analyzeAI: (file) => postImage('/ai', file),
  analyzeBoth: (file) => postImage('/both', file),
  health: () => fetch('/health').then(r => r.json()),
};
