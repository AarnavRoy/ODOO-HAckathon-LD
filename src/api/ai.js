const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const DESTINATION_ACTIVITIES = {
  Goa: [
    { time: '09:00 AM', name: 'Calangute Beach Walk & Water Sports', category: 'ADVENTURE', cost: 1500, description: 'Enjoy parasailing, jet skiing, and morning beach views.' },
    { time: '01:00 PM', name: 'Authentic Goan Seafood Lunch at Britto\'s', category: 'FOOD', cost: 900, description: 'Taste Goan Fish Curry, Prawn Balchão, and fresh coconut water.' },
    { time: '04:30 PM', name: 'Explore Fort Aguada & Lighthouse', category: 'CULTURE', cost: 300, description: 'Tour the 17th-century Portuguese fort overlooking the Arabian Sea.' },
    { time: '08:00 PM', name: 'Anjuna Beach Sunset Lounge & Live Music', category: 'RELAXATION', cost: 1200, description: 'Unwind with beachside cocktails and ambient sunset beats.' }
  ],
  Paris: [
    { time: '09:00 AM', name: 'Eiffel Tower Summit & Champ de Mars', category: 'SIGHTSEEING', cost: 2500, description: 'Ascend to the top for panoramic views across Paris.' },
    { time: '01:00 PM', name: 'French Croissant & Bistro Lunch at Le Marais', category: 'FOOD', cost: 1200, description: 'Savor gourmet quiche, wine, and fresh Parisian pastries.' },
    { time: '04:00 PM', name: 'Louvre Museum Guided Masterpiece Tour', category: 'CULTURE', cost: 1800, description: 'See the Mona Lisa, Venus de Milo, and royal galleries.' },
    { time: '08:30 PM', name: 'Seine River Sunset Evening Cruise', category: 'RELAXATION', cost: 2000, description: 'Glide past illuminated monuments along the river Seine.' }
  ],
  Tokyo: [
    { time: '09:00 AM', name: 'Sensō-ji Temple & Asakusa Shopping Street', category: 'CULTURE', cost: 400, description: 'Visit Tokyo\'s oldest Buddhist temple and Nakamise arcade.' },
    { time: '01:00 PM', name: 'Tonkotsu Ramen Tasting at Harajuku', category: 'FOOD', cost: 850, description: 'Slurp authentic Japanese ramen and gyoza.' },
    { time: '04:30 PM', name: 'Shibuya Crossing & Skyscraper Viewpoint', category: 'SIGHTSEEING', cost: 1200, description: 'Cross the world\'s busiest intersection and Shibuya Sky.' },
    { time: '08:00 PM', name: 'Shinjuku Omoide Yokocho Bar Hopping', category: 'NIGHTLIFE', cost: 2200, description: 'Experience atmospheric alleyways, yakitori skewers, and sake.' }
  ]
};

export const generateTripItinerary = async (preferences = {}, onProgress) => {
  const phases = [
    'Analyzing travel preferences...',
    'Scanning optimal destination spots...',
    'Building day-by-day itinerary...',
    'Calculating budget breakdown...',
    'Finalizing AI travel recommendations...'
  ];

  for (let i = 0; i < phases.length; i++) {
    if (onProgress) onProgress(phases[i], ((i + 1) / phases.length) * 100);
    await delay(500); // 0.5s per phase
  }

  // Safe parsing of user input
  const destination = (preferences.destination || 'Explore Destination').trim();
  const rawBudget = preferences.budget ? String(preferences.budget) : '20000';
  const budgetLimit = Math.max(1000, parseInt(rawBudget.replace(/[^0-9]/g, ''), 10) || 20000);
  const duration = Math.min(14, Math.max(1, parseInt(String(preferences.duration || '5'), 10) || 5));
  const travelers = Math.max(1, parseInt(String(preferences.travelers || '2'), 10) || 2);

  // Budget allocations
  const transport = Math.floor(budgetLimit * 0.25);
  const stay = Math.floor(budgetLimit * 0.35);
  const food = Math.floor(budgetLimit * 0.20);
  const activitiesCost = Math.floor(budgetLimit * 0.15);
  const miscellaneous = Math.floor(budgetLimit * 0.05);

  const estimatedCost = transport + stay + food + activitiesCost + miscellaneous;
  const isOverBudget = estimatedCost > budgetLimit;

  // Generate Days
  const days = [];
  const presetKey = Object.keys(DESTINATION_ACTIVITIES).find(
    k => k.toLowerCase() === destination.toLowerCase()
  );

  for (let i = 1; i <= duration; i++) {
    let dayActivities = [];

    if (presetKey && DESTINATION_ACTIVITIES[presetKey]) {
      dayActivities = DESTINATION_ACTIVITIES[presetKey].map((act, idx) => ({
        ...act,
        id: `act-${i}-${idx + 1}`
      }));
    } else {
      // Dynamic destination generator
      dayActivities = [
        {
          id: `act-${i}-1`,
          time: '09:00 AM',
          name: i === 1 ? `Arrive in ${destination} & Check-in` : `Morning Tour of ${destination}`,
          category: i === 1 ? 'RELAXATION' : 'SIGHTSEEING',
          cost: Math.floor(activitiesCost / (duration * 2)),
          description: `Discover key highlights and scenic spots in ${destination}.`
        },
        {
          id: `act-${i}-2`,
          time: '01:00 PM',
          name: `Authentic Local Lunch in ${destination}`,
          category: 'FOOD',
          cost: Math.floor(food / (duration * 2)),
          description: `Sample regional specialties and popular eateries in ${destination}.`
        },
        {
          id: `act-${i}-3`,
          time: '04:30 PM',
          name: `${destination} Cultural & Heritage Walk`,
          category: 'CULTURE',
          cost: Math.floor(activitiesCost / (duration * 2)),
          description: `Walk through local markets, art galleries, and historic streets.`
        },
        {
          id: `act-${i}-4`,
          time: '08:00 PM',
          name: 'Sunset Dinner & Relaxation',
          category: 'RELAXATION',
          cost: Math.floor(food / (duration * 2)),
          description: `Unwind with dinner, drinks, and night atmosphere.`
        }
      ];
    }

    days.push({
      dayNumber: i,
      title: i === 1 ? 'Arrival & City Orientation' : (i === duration ? 'Final Day & Departure' : `Day ${i} Highlights`),
      activities: dayActivities
    });
  }

  return {
    tripName: `${destination} Explorer`,
    destination: destination,
    duration: duration,
    travelers: travelers,
    budget: budgetLimit,
    estimatedCost: estimatedCost,
    budgetStatus: isOverBudget ? 'over' : 'within',
    expenses: { transport, stay, food, activities: activitiesCost, miscellaneous },
    days: days,
    recommendations: [
      `Stay in a central location in ${destination} to minimize local transport costs.`,
      `Your budget of ₹${budgetLimit.toLocaleString('en-IN')} is ${isOverBudget ? 'slightly tight' : 'well balanced'} for ${duration} days.`,
      `Pre-book top attractions in ${destination} online to skip long queues.`
    ]
  };
};

export const refineTripItinerary = async (currentTrip, action, onProgress) => {
  if (onProgress) onProgress('Optimizing based on your request...', 50);
  await delay(800);
  
  const updated = JSON.parse(JSON.stringify(currentTrip));
  
  if (action === 'reduce-cost') {
    updated.expenses.stay = Math.floor(updated.expenses.stay * 0.8);
    updated.expenses.transport = Math.floor(updated.expenses.transport * 0.9);
    updated.estimatedCost = Object.values(updated.expenses).reduce((a, b) => a + b, 0);
    updated.budgetStatus = updated.estimatedCost > updated.budget ? 'over' : 'within';
    updated.recommendations.unshift('✨ AI swapped to budget-friendly stay & transport options.');
  } else if (action === 'relax') {
    updated.days = updated.days.map(d => ({
      ...d,
      activities: d.activities.filter((_, idx) => idx !== 2)
    }));
    updated.recommendations.unshift('✨ AI relaxed your schedule with extra downtime.');
  } else if (action === 'add-activities') {
    updated.expenses.activities += 2000;
    updated.estimatedCost += 2000;
    updated.recommendations.unshift('✨ AI added action-packed activities to your itinerary!');
  } else if (action === 'add-food') {
    updated.expenses.food += 1500;
    updated.estimatedCost += 1500;
    updated.recommendations.unshift('✨ AI added gourmet dining experiences to your plan!');
  }
  
  if (onProgress) onProgress('Optimization complete!', 100);
  await delay(400);
  
  return updated;
};
