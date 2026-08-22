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

  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
  const dailyBudgetLimit = trip.budgetLimit / totalDays;

  const daysMap = {};
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    daysMap[dateStr] = { date: dateStr, cost: 0, overBudget: false };
  }

  stops.forEach(s => {
    transport += (s.transportCost || 0);
    stay += (s.accommodationCost || 0);
    
    // Simplistic daily allocation for transport/stay (split evenly across stop days)
    const stopStart = new Date(s.startDate);
    const stopEnd = new Date(s.endDate);
    const stopDays = Math.max(1, Math.ceil((stopEnd - stopStart) / (1000 * 60 * 60 * 24)));
    const dailyStopCost = ((s.transportCost || 0) + (s.accommodationCost || 0)) / stopDays;
    
    for (let d = new Date(stopStart); d < stopEnd; d.setDate(d.getDate() + 1)) {
       const dateStr = d.toISOString().split('T')[0];
       if (daysMap[dateStr]) daysMap[dateStr].cost += dailyStopCost;
    }

    const tripActs = mockTripActivities.filter(ta => ta.stopId === s.id);
    tripActs.forEach(ta => {
      const activity = mockActivities.find(a => a.id === ta.activityId);
      if (activity) {
        if (activity.category === 'FOOD') {
          meals += (ta.cost || 0);
        } else {
          activities += (ta.cost || 0);
        }
        
        if (daysMap[ta.dayDate]) {
           daysMap[ta.dayDate].cost += (ta.cost || 0);
        }
      }
    });
  });

  const total = transport + stay + activities + meals;

  const byDay = Object.values(daysMap).map(d => ({
    ...d,
    overBudget: d.cost > dailyBudgetLimit
  }));

  return {
    total,
    byCategory: { transport, stay, activities, meals },
    byDay
  };
};
