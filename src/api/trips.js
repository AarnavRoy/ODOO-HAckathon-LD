import { mockTrips, mockCities, mockStops, mockTripActivities } from './mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const getDashboard = async () => {
  await delay();
  return {
    recentTrips: mockTrips.slice(0, 3),
    recommendedCities: mockCities.slice(0, 4),
    budgetHighlights: { totalSpent: 2500, saved: 500 }
  };
};

export const getTrips = async () => {
  await delay();
  return mockTrips.map(trip => ({
    ...trip,
    stopCount: mockStops.filter(s => s.tripId === trip.id).length
  }));
};

export const createTrip = async ({ name, startDate, endDate, description, coverPhotoUrl, budgetLimit }) => {
  await delay();
  const newTrip = {
    id: mockTrips.length + 1,
    userId: 1, // mock current user
    name, startDate, endDate, description, coverPhotoUrl, budgetLimit,
    isPublic: false, shareToken: null,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  };
  mockTrips.push(newTrip);
  return newTrip;
};

export const getTrip = async (tripId) => {
  await delay();
  const trip = mockTrips.find(t => t.id === Number(tripId));
  if (!trip) throw new Error('Not found');
  
  const tripStops = mockStops.filter(s => s.tripId === trip.id).map(stop => {
    const stopActivities = mockTripActivities.filter(ta => ta.stopId === stop.id);
    return { ...stop, activities: stopActivities };
  });

  return { ...trip, stops: tripStops };
};

export const updateTrip = async (tripId, updates) => {
  await delay();
  const index = mockTrips.findIndex(t => t.id === Number(tripId));
  if (index === -1) throw new Error('Not found');
  
  mockTrips[index] = { ...mockTrips[index], ...updates, updatedAt: new Date().toISOString().split('T')[0] };
  return mockTrips[index];
};

export const deleteTrip = async (tripId) => {
  await delay();
  const index = mockTrips.findIndex(t => t.id === Number(tripId));
  if (index !== -1) mockTrips.splice(index, 1);
  return { message: 'Deleted' };
};
