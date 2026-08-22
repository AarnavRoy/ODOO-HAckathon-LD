export const mockUsers = [
  {
    id: 1,
    name: 'Jane Doe',
    email: 'jane@example.com',
    passwordHash: 'hashed_password', // Just a mock
    profilePhotoUrl: 'https://i.pravatar.cc/150?u=jane',
    languagePreference: 'English',
    createdAt: '2023-01-01',
  },
];

export const mockTrips = [
  {
    id: 1,
    userId: 1,
    name: 'European Summer',
    startDate: '2024-06-01',
    endDate: '2024-06-15',
    description: 'A quick tour of France and Italy',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
    isPublic: true,
    shareToken: 'abc-123',
    budgetLimit: 5000,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 2,
    userId: 1,
    name: 'Japan Autumn',
    startDate: '2024-10-10',
    endDate: '2024-10-24',
    description: 'Foliage and food in Tokyo and Kyoto',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
    isPublic: false,
    shareToken: 'def-456',
    budgetLimit: 4000,
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10',
  },
  {
    id: 3,
    userId: 1,
    name: 'New York Weekend',
    startDate: '2024-12-20',
    endDate: '2024-12-22',
    description: 'Holiday shopping',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9',
    isPublic: false,
    shareToken: null,
    budgetLimit: 1500,
    createdAt: '2024-03-01',
    updatedAt: '2024-03-01',
  },
];

export const mockCities = [
  { id: 1, name: 'Paris', country: 'France', region: 'Europe', costIndex: 85, popularityScore: 98, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e907600e574' },
  { id: 2, name: 'Rome', country: 'Italy', region: 'Europe', costIndex: 75, popularityScore: 95, imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5' },
  { id: 3, name: 'Tokyo', country: 'Japan', region: 'Asia', costIndex: 90, popularityScore: 99, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf' },
  { id: 4, name: 'Kyoto', country: 'Japan', region: 'Asia', costIndex: 80, popularityScore: 92, imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e' },
  { id: 5, name: 'New York', country: 'USA', region: 'North America', costIndex: 100, popularityScore: 97, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9' },
  { id: 6, name: 'London', country: 'UK', region: 'Europe', costIndex: 95, popularityScore: 96, imageUrl: 'https://images.unsplash.com/photo-1513635269975-5969336acdf8' },
];

export const mockStops = [
  { id: 1, tripId: 1, cityId: 1, startDate: '2024-06-01', endDate: '2024-06-08', orderIndex: 0, transportCost: 500, accommodationCost: 1200 },
  { id: 2, tripId: 1, cityId: 2, startDate: '2024-06-08', endDate: '2024-06-15', orderIndex: 1, transportCost: 150, accommodationCost: 1000 },
  { id: 3, tripId: 2, cityId: 3, startDate: '2024-10-10', endDate: '2024-10-17', orderIndex: 0, transportCost: 1000, accommodationCost: 900 },
  { id: 4, tripId: 2, cityId: 4, startDate: '2024-10-17', endDate: '2024-10-24', orderIndex: 1, transportCost: 50, accommodationCost: 800 },
];

export const mockActivities = [
  // Paris
  { id: 1, cityId: 1, name: 'Eiffel Tower Tour', category: 'SIGHTSEEING', cost: 30, durationMinutes: 120, description: 'Skip the line tour of the Eiffel Tower.', imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f' },
  { id: 2, cityId: 1, name: 'Louvre Museum', category: 'CULTURE', cost: 20, durationMinutes: 180, description: 'Mona Lisa and other masterpieces.', imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a' },
  { id: 3, cityId: 1, name: 'Seine River Cruise', category: 'RELAXATION', cost: 15, durationMinutes: 60, description: 'Evening cruise along the Seine.', imageUrl: 'https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f' },
  // Rome
  { id: 4, cityId: 2, name: 'Colosseum Guided Tour', category: 'SIGHTSEEING', cost: 40, durationMinutes: 150, description: 'Ancient Rome history.', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5' },
  { id: 5, cityId: 2, name: 'Pasta Making Class', category: 'FOOD', cost: 80, durationMinutes: 180, description: 'Learn to make authentic Italian pasta.', imageUrl: 'https://images.unsplash.com/photo-1556761175-5972d9314bf1' },
  // Tokyo
  { id: 6, cityId: 3, name: 'Sushi Omakase', category: 'FOOD', cost: 150, durationMinutes: 120, description: 'Premium sushi experience.', imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c' },
  { id: 7, cityId: 3, name: 'Mt. Fuji Day Trip', category: 'ADVENTURE', cost: 120, durationMinutes: 600, description: 'Bus tour to Mt. Fuji 5th station.', imageUrl: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65' },
  // Kyoto
  { id: 8, cityId: 4, name: 'Fushimi Inari Shrine', category: 'CULTURE', cost: 0, durationMinutes: 120, description: 'Walk through thousands of torii gates.', imageUrl: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36' },
  { id: 9, cityId: 4, name: 'Traditional Tea Ceremony', category: 'CULTURE', cost: 45, durationMinutes: 90, description: 'Matcha and wagashi in a traditional setting.', imageUrl: 'https://images.unsplash.com/photo-1556761175-5972d9314bf1' },
  // New York
  { id: 10, cityId: 5, name: 'Broadway Show', category: 'OTHER', cost: 100, durationMinutes: 180, description: 'Tickets to a popular musical.', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9' },
  { id: 11, cityId: 5, name: 'Central Park Bike Tour', category: 'RELAXATION', cost: 35, durationMinutes: 120, description: 'Guided bike tour through the park.', imageUrl: 'https://images.unsplash.com/photo-1500989145603-8e7ef71d639e' },
  // London
  { id: 12, cityId: 6, name: 'Tower of London', category: 'SIGHTSEEING', cost: 35, durationMinutes: 180, description: 'Crown jewels and history.', imageUrl: 'https://images.unsplash.com/photo-1513635269975-5969336acdf8' },
  { id: 13, cityId: 6, name: 'Afternoon Tea', category: 'FOOD', cost: 60, durationMinutes: 120, description: 'Classic British afternoon tea.', imageUrl: 'https://images.unsplash.com/photo-1576402187878-974f70c890a5' },
  { id: 14, cityId: 1, name: 'Croissant Tasting', category: 'FOOD', cost: 15, durationMinutes: 60, description: 'Sample the best croissants in Paris.', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff' },
  { id: 15, cityId: 2, name: 'Vatican Museums', category: 'CULTURE', cost: 35, durationMinutes: 240, description: 'Sistine Chapel and Vatican art.', imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140' },
];

export const mockTripActivities = [
  { id: 1, stopId: 1, activityId: 1, dayDate: '2024-06-02', startTime: '10:00', cost: 30, notes: 'Meet at the south pillar.' },
  { id: 2, stopId: 1, activityId: 2, dayDate: '2024-06-03', startTime: '14:00', cost: 20, notes: 'Booked online.' },
  { id: 3, stopId: 2, activityId: 4, dayDate: '2024-06-09', startTime: '09:00', cost: 40, notes: 'Comfortable shoes.' },
];
