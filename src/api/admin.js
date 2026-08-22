import api from './client';

export const getAdminOverview = async () => {
  return await api.get('/admin/overview');
};

export const getAdminStats = async () => {
  return await api.get('/admin/stats');
};

export const getAdminTrends = async (period = '14d') => {
  return await api.get(`/admin/trends?period=${encodeURIComponent(period)}`);
};

export const getAdminCategories = async () => {
  return await api.get('/admin/categories');
};

export const getAdminUsers = async (search = '') => {
  return await api.get(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`);
};

export const getAdminTrips = async (search = '') => {
  return await api.get(`/admin/trips${search ? `?search=${encodeURIComponent(search)}` : ''}`);
};

export const updateUserRole = async (userId, role) => {
  return await api.put(`/admin/users/${userId}/role`, { role });
};

export const updateUserStatus = async (userId, isBanned) => {
  return await api.put(`/admin/users/${userId}/status`, { isBanned });
};

export const deleteUserAdmin = async (userId) => {
  return await api.delete(`/admin/users/${userId}`);
};
