// Popular Indian and international destinations for autocomplete
const destinations = [
  "Jaipur, Rajasthan", "Udaipur, Rajasthan", "Jodhpur, Rajasthan", "Jaisalmer, Rajasthan",
  "Goa", "Mumbai, Maharashtra", "Delhi", "Agra, Uttar Pradesh",
  "Varanasi, Uttar Pradesh", "Rishikesh, Uttarakhand", "Manali, Himachal Pradesh",
  "Shimla, Himachal Pradesh", "Leh Ladakh", "Srinagar, Kashmir",
  "Darjeeling, West Bengal", "Kolkata, West Bengal", "Munnar, Kerala",
  "Alleppey, Kerala", "Kochi, Kerala", "Ooty, Tamil Nadu",
  "Pondicherry", "Hampi, Karnataka", "Bangalore, Karnataka", "Mysore, Karnataka",
  "Hyderabad, Telangana", "Chennai, Tamil Nadu", "Amritsar, Punjab",
  "Andaman Islands", "Coorg, Karnataka", "Mount Abu, Rajasthan",
  "Paris, France", "London, UK", "New York, USA", "Tokyo, Japan",
  "Dubai, UAE", "Singapore", "Bangkok, Thailand", "Bali, Indonesia",
  "Rome, Italy", "Barcelona, Spain", "Istanbul, Turkey", "Sydney, Australia",
  "Zurich, Switzerland", "Amsterdam, Netherlands", "Prague, Czech Republic",
  "Santorini, Greece", "Maldives", "Sri Lanka", "Nepal", "Bhutan",
  "Vietnam", "Cape Town, South Africa", "Cairo, Egypt", "Marrakech, Morocco"
];

export function searchDestinations(query) {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase();
  return destinations.filter(d => d.toLowerCase().includes(q)).slice(0, 8);
}

export default destinations;
