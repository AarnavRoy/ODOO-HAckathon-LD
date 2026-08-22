import api from './client';

export const getDashboard = async () => {
  return await api.get('/dashboard');
};

export const getTrips = async () => {
  return await api.get('/trips');
};

export const createTrip = async ({ name, startDate, endDate, description, coverPhotoUrl, budgetLimit }) => {
  return await api.post('/trips', {
    name,
    startDate,
    endDate,
    description,
    coverPhotoUrl,
    budgetLimit: budgetLimit ? Number(budgetLimit) : null
  });
};

export const getTrip = async (tripId) => {
  return await api.get(`/trips/${tripId}`);
};

export const updateTrip = async (tripId, updates) => {
  return await api.put(`/trips/${tripId}`, updates);
};

export const deleteTrip = async (tripId) => {
  return await api.delete(`/trips/${tripId}`);
};

export const getTripItinerary = async (tripId) => {
  return await api.get(`/trips/${tripId}/itinerary`);
};

export const shareTrip = async (tripId) => {
  return await api.post(`/trips/${tripId}/share`);
};

export const getSharedTrip = async (shareToken) => {
  return await api.get(`/public/trips/${shareToken}`);
};

export const copySharedTrip = async (shareToken) => {
  return await api.post(`/public/trips/${shareToken}/copy`);
};

export const getAdminStats = async () => {
  return await api.get('/admin/stats');
};
