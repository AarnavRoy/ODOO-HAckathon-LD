import api from './client';

export const getCityActivities = async (cityId, { category = '', maxCost = '', maxDuration = '' } = {}) => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (maxCost) params.append('maxCost', maxCost);
  if (maxDuration) params.append('maxDuration', maxDuration);

  const query = params.toString();
  return await api.get(`/cities/${cityId}/activities${query ? `?${query}` : ''}`);
};

export const addActivityToStop = async (stopId, { activityId, dayDate, startTime, cost, notes }) => {
  return await api.post(`/stops/${stopId}/activities`, {
    activityId,
    dayDate,
    startTime,
    cost: cost ? Number(cost) : 0,
    notes
  });
};

export const removeActivityFromStop = async (id) => {
  return await api.delete(`/trip-activities/${id}`);
};
