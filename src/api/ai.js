const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateTripItinerary = async (preferences, onProgress) => {
  // Simulate AI generation process with progress updates
  const phases = [
    'Understanding your preferences...',
    'Finding suitable destinations...',
    'Planning your itinerary...',
    'Estimating your budget...',
    'Optimizing your trip...'
  ];

  for (let i = 0; i < phases.length; i++) {
    if (onProgress) onProgress(phases[i], ((i + 1) / phases.length) * 100);
    await delay(1200); // Wait 1.2s per phase
  }

  // Generate a mock response that aligns with the project structure
  const budgetLimit = parseInt(preferences.budget.replace(/[^0-9]/g, ''), 10) || 20000;
  
  // Create rough estimates based on budget
  const transport = Math.floor(budgetLimit * 0.25);
  const stay = Math.floor(budgetLimit * 0.35);
  const food = Math.floor(budgetLimit * 0.20);
  const activities = Math.floor(budgetLimit * 0.10);
  const miscellaneous = Math.floor(budgetLimit * 0.05);
  
  const estimatedCost = transport + stay + food + activities + miscellaneous;
  const isOverBudget = estimatedCost > budgetLimit;

  // Mock days based on requested duration (default to 3)
  const duration = parseInt(preferences.duration) || 3;
  const days = [];
  
  for (let i = 1; i <= duration; i++) {
    days.push({
      dayNumber: i,
      title: i === 1 ? 'Arrival & Exploration' : (i === duration ? 'Final Day & Departure' : 'Adventure & Discovery'),
      activities: [
        { id: `act-${i}-1`, time: '09:00', name: 'Morning Activity', category: 'SIGHTSEEING', cost: Math.floor(activities / (duration * 3)), description: 'Start your day exploring local highlights.', icon: 'map' },
        { id: `act-${i}-2`, time: '13:00', name: 'Local Lunch', category: 'FOOD', cost: Math.floor(food / (duration * 2)), description: 'Taste authentic local cuisine.', icon: 'utensils' },
        { id: `act-${i}-3`, time: '15:30', name: 'Afternoon Experience', category: 'CULTURE', cost: Math.floor(activities / (duration * 3)), description: 'Immerse yourself in the local culture.', icon: 'camera' },
        { id: `act-${i}-4`, time: '20:00', name: 'Dinner & Evening', category: 'RELAXATION', cost: Math.floor(food / (duration * 2)), description: 'Relax and unwind after a busy day.', icon: 'moon' }
      ]
    });
  }

  return {
    tripName: `${preferences.destination || 'Mystery Destination'} Explorer`,
    destination: preferences.destination || 'Unspecified',
    duration: duration,
    travelers: parseInt(preferences.travelers) || 1,
    budget: budgetLimit,
    estimatedCost: estimatedCost,
    budgetStatus: isOverBudget ? 'over' : 'within',
    expenses: { transport, stay, food, activities, miscellaneous },
    days: days,
    recommendations: [
      `Stay in a central location in ${preferences.destination} to reduce transport costs.`,
      `Your budget of ₹${budgetLimit.toLocaleString()} is ${isOverBudget ? 'slightly tight' : 'perfect'} for ${duration} days.`,
      `Consider moving the afternoon experience on Day 2 to the morning for better weather.`
    ]
  };
};

export const refineTripItinerary = async (currentTrip, action, onProgress) => {
  if (onProgress) onProgress('Optimizing based on your request...', 50);
  await delay(1500);
  
  const updated = { ...currentTrip };
  
  if (action === 'reduce-cost') {
    updated.expenses.stay = Math.floor(updated.expenses.stay * 0.8);
    updated.expenses.transport = Math.floor(updated.expenses.transport * 0.9);
    updated.estimatedCost = Object.values(updated.expenses).reduce((a, b) => a + b, 0);
    updated.budgetStatus = updated.estimatedCost > updated.budget ? 'over' : 'within';
    updated.recommendations.unshift('✨ AI successfully swapped to budget-friendly accommodations and transport.');
  } else if (action === 'relax') {
    updated.days = updated.days.map(d => ({
      ...d,
      activities: d.activities.filter((_, idx) => idx !== 2) // Remove one activity
    }));
    updated.recommendations.unshift('✨ AI relaxed your schedule by removing afternoon activities.');
  } else if (action === 'add-activities') {
    updated.expenses.activities += 2000;
    updated.estimatedCost += 2000;
    updated.recommendations.unshift('✨ AI packed more activities into your days!');
  } else if (action === 'add-food') {
    updated.expenses.food += 1500;
    updated.estimatedCost += 1500;
    updated.recommendations.unshift('✨ AI upgraded your dining experiences!');
  }
  
  if (onProgress) onProgress('Optimization complete!', 100);
  await delay(500);
  
  return updated;
};
