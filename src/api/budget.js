import api from './client';

export const getTripBudget = async (tripId) => {
  return await api.get(`/trips/${tripId}/budget`);
};
