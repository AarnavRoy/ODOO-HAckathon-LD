import api from './client';

export const signup = async ({ name, username, email, password }) => {
  const data = await api.post('/auth/signup', { name, username, email, password });
  if (data.token) {
    localStorage.setItem('token', data.token);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  }
  return data;
};

export const login = async ({ username, password }) => {
  const data = await api.post('/auth/login', { username, password });
  if (data.token) {
    localStorage.setItem('token', data.token);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  }
  return data;
};

export const checkUsernameAvailability = async (username) => {
  return await api.get(`/auth/check-username?username=${encodeURIComponent(username)}`);
};

export const verifyEmailApi = async (email) => {
  return await api.post('/auth/verify-email', { email });
};

export const verifyForgotPassword = async ({ email, name }) => {
  return await api.post('/auth/forgot-password/verify', { email, name });
};

export const resetPasswordWithName = async ({ email, name, newPassword }) => {
  return await api.post('/auth/forgot-password/reset', { email, name, newPassword });
};

export const forgotPassword = async ({ email, name }) => {
  return await verifyForgotPassword({ email, name });
};

export const getMe = async () => {
  const user = await api.get('/auth/me');
  return { user };
};

export const updateMe = async ({ name, profilePhotoUrl, languagePreference, country, state, city }) => {
  const user = await api.put('/users/me', { name, profilePhotoUrl, languagePreference, country, state, city });
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
  return { user };
};

export const uploadProfilePhoto = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await api.postFormData('/users/me/photo', formData);
};

export const deleteMe = async () => {
  const res = await api.delete('/users/me');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return res;
};
