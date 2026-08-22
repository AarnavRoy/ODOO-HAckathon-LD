import api from './client';

export const signup = async ({ name, email, password }) => {
  const data = await api.post('/auth/signup', { name, email, password });
  if (data.token) {
    localStorage.setItem('token', data.token);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  }
  return data;
};

export const login = async ({ email, password }) => {
  const data = await api.post('/auth/login', { email, password });
  if (data.token) {
    localStorage.setItem('token', data.token);
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  }
  return data;
};

export const forgotPassword = async ({ email }) => {
  return await api.post('/auth/forgot-password', { email });
};

export const getMe = async () => {
  const user = await api.get('/auth/me');
  return { user };
};

export const updateMe = async ({ name, profilePhotoUrl, languagePreference }) => {
  const user = await api.put('/users/me', { name, profilePhotoUrl, languagePreference });
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
