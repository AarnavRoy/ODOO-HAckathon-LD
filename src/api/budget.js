import { mockTrips, mockStops, mockTripActivities, mockActivities } from './mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const getTripBudget = async (tripId) => {
  await delay();
  const trip = mockTrips.find(t => t.id === Number(tripId));
  if (!trip) throw new Error('Not found');

  const stops = mockStops.filter(s => s.tripId === trip.id);
  
  let transport = 0;
  let stay = 0;
  let activities = 0;
  let meals = 0;

  stops.forEach(s => {
    transport += (s.transportCost || 0);
    stay += (s.accommodationCost || 0);
    
    const tripActs = mockTripActivities.filter(ta => ta.stopId === s.id);
    tripActs.forEach(ta => {
      const activity = mockActivities.find(a => a.id === ta.activityId);
      if (activity) {
        if (activity.category === 'FOOD') {
          meals += (ta.cost || 0);
        } else {
          activities += (ta.cost || 0);
        }
      }
    });
  });

  const total = transport + stay + activities + meals;

  // rough calculation for byDay
  const byDay = [
    { date: trip.startDate, cost: total / 2, overBudget: false } // placeholder
  ];

  return {
    total,
    byCategory: { transport, stay, activities, meals },
    byDay
  };
};
