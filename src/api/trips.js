import { mockTrips, mockCities, mockStops, mockTripActivities, mockUsers, mockActivities } from './mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const getDashboard = async () => {
  await delay();
  return {
    recentTrips: mockTrips.slice(0, 3),
    recommendedCities: mockCities.slice(0, 4),
    budgetHighlights: { totalSpent: 200000, saved: 40000 }
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

export const getTripItinerary = async (tripId) => {
  await delay();
  const trip = mockTrips.find(t => t.id === Number(tripId));
  if (!trip) throw new Error('Trip not found');

  const stops = mockStops.filter(s => s.tripId === trip.id).sort((a, b) => a.orderIndex - b.orderIndex);
  const tripActs = mockTripActivities.filter(ta => stops.some(s => s.id === ta.stopId));

  const daysMap = {};
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    daysMap[dateStr] = { date: dateStr, stops: [] };
  }

  stops.forEach(stop => {
    const city = mockCities.find(c => c.id === stop.cityId);
    const stopActivities = tripActs.filter(ta => ta.stopId === stop.id).map(ta => ({
      ...ta,
      activity: mockActivities.find(a => a.id === ta.activityId)
    }));

    stopActivities.forEach(ta => {
      if (daysMap[ta.dayDate]) {
        let dayStop = daysMap[ta.dayDate].stops.find(s => s.city.id === city.id);
        if (!dayStop) {
          dayStop = { city, activities: [] };
          daysMap[ta.dayDate].stops.push(dayStop);
        }
        dayStop.activities.push(ta);
      }
    });
  });

  return { days: Object.values(daysMap) };
};

export const shareTrip = async (tripId) => {
  await delay();
  const trip = mockTrips.find(t => t.id === Number(tripId));
  if (!trip) throw new Error('Trip not found');
  trip.isPublic = true;
  trip.shareToken = `share-${Math.random().toString(36).substring(7)}`;
  return { shareToken: trip.shareToken, publicUrl: `/share/${trip.shareToken}` };
};

export const getSharedTrip = async (shareToken) => {
  await delay();
  const trip = mockTrips.find(t => t.shareToken === shareToken && t.isPublic);
  if (!trip) throw new Error('Not found');
  
  const tripStops = mockStops.filter(s => s.tripId === trip.id).map(stop => {
    const stopActivities = mockTripActivities.filter(ta => ta.stopId === stop.id);
    return { ...stop, activities: stopActivities };
  });

  return { ...trip, stops: tripStops };
};

export const copySharedTrip = async (shareToken) => {
  await delay();
  const trip = mockTrips.find(t => t.shareToken === shareToken && t.isPublic);
  if (!trip) throw new Error('Not found');
  
  const newTrip = {
    ...trip,
    id: mockTrips.length + 1,
    userId: 1, 
    name: `Copy of ${trip.name}`,
    isPublic: false,
    shareToken: null,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  };
  mockTrips.push(newTrip);
  return newTrip;
};

export const getAdminStats = async () => {
  await delay();
  return {
    totalUsers: mockUsers.length,
    totalTrips: mockTrips.length,
    topCities: mockCities.slice(0, 3),
    topActivities: mockActivities.slice(0, 3),
    engagement: {
      dailyActive: 42,
      weeklyActive: 120
    }
  };
};
