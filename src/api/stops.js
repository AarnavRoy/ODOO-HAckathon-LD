import api from './client';

export const getTripStops = async (tripId) => {
  return await api.get(`/trips/${tripId}/stops`);
};

export const createStop = async (tripId, { cityId, startDate, endDate, transportCost, accommodationCost }) => {
  return await api.post(`/trips/${tripId}/stops`, {
    cityId,
    startDate,
    endDate,
    transportCost: transportCost ? Number(transportCost) : 0,
    accommodationCost: accommodationCost ? Number(accommodationCost) : 0
  });
};

export const updateStop = async (stopId, updates) => {
  return await api.put(`/stops/${stopId}`, updates);
};

export const deleteStop = async (stopId) => {
  return await api.delete(`/stops/${stopId}`);
};

export const reorderStops = async (tripId, { stopIds }) => {
  return await api.put(`/trips/${tripId}/stops/reorder`, { stopIds });
};
