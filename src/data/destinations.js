// Popular Indian and International destinations for autocomplete
export const WORLD_DESTINATIONS = [
  // India
  { name: 'Goa', country: 'India' },
  { name: 'Jaipur', country: 'India' },
  { name: 'Udaipur', country: 'India' },
  { name: 'Jodhpur', country: 'India' },
  { name: 'Manali', country: 'India' },
  { name: 'Shimla', country: 'India' },
  { name: 'Mumbai', country: 'India' },
  { name: 'Delhi', country: 'India' },
  { name: 'Bangalore', country: 'India' },
  { name: 'Kolkata', country: 'India' },
  { name: 'Chennai', country: 'India' },
  { name: 'Hyderabad', country: 'India' },
  { name: 'Agra', country: 'India' },
  { name: 'Varanasi', country: 'India' },
  { name: 'Rishikesh', country: 'India' },
  { name: 'Leh Ladakh', country: 'India' },
  { name: 'Srinagar', country: 'India' },
  { name: 'Darjeeling', country: 'India' },
  { name: 'Munnar', country: 'India' },
  { name: 'Kochi', country: 'India' },
  { name: 'Ooty', country: 'India' },
  { name: 'Pondicherry', country: 'India' },
  { name: 'Hampi', country: 'India' },
  { name: 'Amritsar', country: 'India' },
  { name: 'Andaman Islands', country: 'India' },
  { name: 'Coorg', country: 'India' },
  { name: 'Kerala', country: 'India' },
  { name: 'Rajasthan', country: 'India' },

  // Asia
  { name: 'Tokyo', country: 'Japan' },
  { name: 'Kyoto', country: 'Japan' },
  { name: 'Osaka', country: 'Japan' },
  { name: 'Bangkok', country: 'Thailand' },
  { name: 'Phuket', country: 'Thailand' },
  { name: 'Chiang Mai', country: 'Thailand' },
  { name: 'Singapore', country: 'Singapore' },
  { name: 'Bali', country: 'Indonesia' },
  { name: 'Hanoi', country: 'Vietnam' },
  { name: 'Ho Chi Minh City', country: 'Vietnam' },
  { name: 'Kathmandu', country: 'Nepal' },
  { name: 'Colombo', country: 'Sri Lanka' },
  { name: 'Kuala Lumpur', country: 'Malaysia' },
  { name: 'Maldives', country: 'Maldives' },
  { name: 'Beijing', country: 'China' },
  { name: 'Shanghai', country: 'China' },
  { name: 'Hong Kong', country: 'China' },
  { name: 'Seoul', country: 'South Korea' },
  { name: 'Manila', country: 'Philippines' },

  // Europe
  { name: 'Paris', country: 'France' },
  { name: 'London', country: 'UK' },
  { name: 'Rome', country: 'Italy' },
  { name: 'Venice', country: 'Italy' },
  { name: 'Florence', country: 'Italy' },
  { name: 'Barcelona', country: 'Spain' },
  { name: 'Madrid', country: 'Spain' },
  { name: 'Amsterdam', country: 'Netherlands' },
  { name: 'Berlin', country: 'Germany' },
  { name: 'Munich', country: 'Germany' },
  { name: 'Prague', country: 'Czech Republic' },
  { name: 'Vienna', country: 'Austria' },
  { name: 'Budapest', country: 'Hungary' },
  { name: 'Athens', country: 'Greece' },
  { name: 'Santorini', country: 'Greece' },
  { name: 'Lisbon', country: 'Portugal' },
  { name: 'Dublin', country: 'Ireland' },
  { name: 'Zurich', country: 'Switzerland' },
  { name: 'Istanbul', country: 'Turkey' },

  // Middle East & Africa
  { name: 'Dubai', country: 'UAE' },
  { name: 'Abu Dhabi', country: 'UAE' },
  { name: 'Cairo', country: 'Egypt' },
  { name: 'Marrakech', country: 'Morocco' },
  { name: 'Cape Town', country: 'South Africa' },

  // Americas & Oceania
  { name: 'New York', country: 'USA' },
  { name: 'Los Angeles', country: 'USA' },
  { name: 'San Francisco', country: 'USA' },
  { name: 'Miami', country: 'USA' },
  { name: 'Las Vegas', country: 'USA' },
  { name: 'Toronto', country: 'Canada' },
  { name: 'Vancouver', country: 'Canada' },
  { name: 'Cancun', country: 'Mexico' },
  { name: 'Rio de Janeiro', country: 'Brazil' },
  { name: 'Buenos Aires', country: 'Argentina' },
  { name: 'Sydney', country: 'Australia' },
  { name: 'Melbourne', country: 'Australia' },
  { name: 'Auckland', country: 'New Zealand' }
];

export function searchDestinations(query) {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase();
  return WORLD_DESTINATIONS.filter(item => {
    if (typeof item === 'string') return item.toLowerCase().includes(q);
    return item.name.toLowerCase().includes(q) || item.country.toLowerCase().includes(q);
  }).slice(0, 8);
}

export default WORLD_DESTINATIONS;
