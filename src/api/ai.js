import api from './client';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateTripItinerary = async (preferences, onProgress) => {
  const phases = [
    'Understanding your preferences...',
    'Planning your route...',
    'Creating your itinerary with AI...',
    'Calculating budget breakdown...',
    'Adding travel recommendations...',
    'Finalizing your trip...'
  ];

  // Animate loading stages while calling backend API
  let currentProgress = 0;
  const progressInterval = setInterval(() => {
    if (currentProgress < 85 && onProgress) {
      currentProgress += 15;
      const phaseIdx = Math.min(Math.floor((currentProgress / 100) * phases.length), phases.length - 1);
      onProgress(phases[phaseIdx], currentProgress);
    }
  }, 400);

  try {
    const payload = {
      destination: preferences.destination || 'Goa',
      days: parseInt(preferences.duration, 10) || 5,
      budget: parseFloat(String(preferences.budget).replace(/[^0-9.]/g, '')) || 20000,
      travelers: parseInt(preferences.travelers, 10) || 2,
      travelStyle: preferences.style || ['BEACH', 'CULTURE'],
      pace: preferences.pace || 'BALANCED',
      preferences: preferences.additional || ''
    };

    const result = await api.post('/ai/generate-trip', payload);

    clearInterval(progressInterval);
    if (onProgress) onProgress('Finalizing your trip...', 100);
    await delay(300);

    return result;
  } catch (error) {
    clearInterval(progressInterval);
    console.error('AI Generation Backend API Call Failed:', error);
    throw error;
  }
};

export const refineTripItinerary = async (currentTrip, action, onProgress) => {
  if (onProgress) onProgress('Optimizing itinerary with AI...', 50);
  await delay(400);

  try {
    const payload = {
      currentTrip: currentTrip,
      action: action,
      customPrompt: action
    };

    const result = await api.post('/ai/refine-trip', payload);

    if (onProgress) onProgress('Optimization complete!', 100);
    await delay(300);

    return result;
  } catch (error) {
    console.error('AI Refinement Backend API Call Failed:', error);
    throw error;
  }
};

export const saveAITrip = async (aiTripData) => {
  return await api.post('/ai/save-trip', aiTripData);
};
