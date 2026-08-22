import { mockStops } from './mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const getTripStops = async (tripId) => {
  await delay();
  return mockStops.filter(s => s.tripId === Number(tripId)).sort((a, b) => a.orderIndex - b.orderIndex);
};

export const createStop = async (tripId, { cityId, startDate, endDate, transportCost, accommodationCost }) => {
  await delay();
  const tripStops = mockStops.filter(s => s.tripId === Number(tripId));
  const newStop = {
    id: mockStops.length + 1,
    tripId: Number(tripId),
    cityId,
    startDate,
    endDate,
    orderIndex: tripStops.length,
    transportCost,
    accommodationCost
  };
  mockStops.push(newStop);
  return newStop;
};

export const updateStop = async (stopId, updates) => {
  await delay();
  const index = mockStops.findIndex(s => s.id === Number(stopId));
  if (index === -1) throw new Error('Not found');
  mockStops[index] = { ...mockStops[index], ...updates };
  return mockStops[index];
};

export const deleteStop = async (stopId) => {
  await delay();
  const index = mockStops.findIndex(s => s.id === Number(stopId));
  if (index !== -1) mockStops.splice(index, 1);
  return { message: 'Deleted' };
};

export const reorderStops = async (tripId, { stopIds }) => {
  await delay();
  stopIds.forEach((id, index) => {
    const stop = mockStops.find(s => s.id === id);
    if (stop) stop.orderIndex = index;
  });
  return mockStops.filter(s => s.tripId === Number(tripId)).sort((a, b) => a.orderIndex - b.orderIndex);
};
