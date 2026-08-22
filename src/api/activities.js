import { mockActivities, mockTripActivities } from './mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const getCityActivities = async (cityId, { category = '', maxCost = '', maxDuration = '' } = {}) => {
  await delay();
  return mockActivities.filter(a => {
    if (a.cityId !== Number(cityId)) return false;
    if (category && a.category !== category) return false;
    if (maxCost && a.cost > Number(maxCost)) return false;
    if (maxDuration && a.durationMinutes > Number(maxDuration)) return false;
    return true;
  });
};

export const addActivityToStop = async (stopId, { activityId, dayDate, startTime, cost, notes }) => {
  await delay();
  const newTripActivity = {
    id: mockTripActivities.length + 1,
    stopId: Number(stopId),
    activityId,
    dayDate,
    startTime,
    cost,
    notes
  };
  mockTripActivities.push(newTripActivity);
  return newTripActivity;
};

export const removeActivityFromStop = async (id) => {
  await delay();
  const index = mockTripActivities.findIndex(ta => ta.id === Number(id));
  if (index !== -1) mockTripActivities.splice(index, 1);
  return { message: 'Deleted' };
};
