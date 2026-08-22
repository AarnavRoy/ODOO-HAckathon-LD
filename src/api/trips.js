import api from './client';

export const getDashboard = async () => {
  return await api.get('/dashboard');
};

export const getTrips = async () => {
  return await api.get('/trips');
};

export const createTrip = async (tripData) => {
  return await api.post('/trips', {
    name: tripData.name,
    startDate: tripData.startDate,
    endDate: tripData.endDate,
    description: tripData.description,
    coverPhotoUrl: tripData.coverPhotoUrl,
    budgetLimit: tripData.budgetLimit ? Number(tripData.budgetLimit) : null,
    startCityId: tripData.startCityId || null,
  });
};

export const importAITrip = async (aiData) => {
  return await api.post('/trips/ai-import', aiData);
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

export const uploadTripCoverPhoto = async (tripId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await api.postFormData(`/trips/${tripId}/cover-photo`, formData);
};
