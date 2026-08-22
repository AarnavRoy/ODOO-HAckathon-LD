const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Public auth/public endpoints do not require token header
  const isPublicAuthRoute = normalizedPath.startsWith('/auth/signup') ||
                            normalizedPath.startsWith('/auth/login') ||
                            normalizedPath.startsWith('/auth/check-username') ||
                            normalizedPath.startsWith('/auth/verify-email') ||
                            normalizedPath.startsWith('/auth/forgot-password') ||
                            (normalizedPath.startsWith('/public') && !normalizedPath.endsWith('/copy'));

  const isAuthRoute = path.startsWith('/auth') || path.startsWith('auth');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && !isAuthRoute ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const url = `${API_BASE_URL}${normalizedPath}`;
  const response = await fetch(url, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && isPublicAuthRoute) {
      localStorage.removeItem('token');
    }
    const errorMessage = (data && data.message) || (typeof data === 'string' && data) || `HTTP error! Status: ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  postFormData: (path, formData, options) => {
    const token = localStorage.getItem('token');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${API_BASE_URL}${normalizedPath}`;
    return fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      ...options
    }).then(async (response) => {
      const contentType = response.headers.get('content-type');
      let data = null;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      if (!response.ok) {
        const errorMessage = (data && data.message) || (typeof data === 'string' && data) || `HTTP error! Status: ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }
      return data;
    });
  }
};

export default api;
