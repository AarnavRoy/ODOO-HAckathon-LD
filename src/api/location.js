import api from './client';

// In-memory cache to avoid duplicate network calls
const cache = {
  countries: null,
  states: new Map(),
  cities: new Map(),
};

// Fallback countries list in case backend/network is temporarily unreachable
const FALLBACK_COUNTRIES = [
  { name: "United States", iso2: "US" },
  { name: "India", iso2: "IN" },
  { name: "United Kingdom", iso2: "GB" },
  { name: "Canada", iso2: "CA" },
  { name: "Australia", iso2: "AU" },
  { name: "France", iso2: "FR" },
  { name: "Germany", iso2: "DE" },
  { name: "Japan", iso2: "JP" },
  { name: "Italy", iso2: "IT" },
  { name: "Spain", iso2: "ES" },
  { name: "Brazil", iso2: "BR" },
  { name: "South Africa", iso2: "ZA" },
  { name: "United Arab Emirates", iso2: "AE" },
  { name: "Singapore", iso2: "SG" },
  { name: "Switzerland", iso2: "CH" },
  { name: "Netherlands", iso2: "NL" },
  { name: "Mexico", iso2: "MX" }
];

export const getCountries = async () => {
  if (cache.countries) {
    return cache.countries;
  }

  // Check localStorage cache
  try {
    const saved = localStorage.getItem('gt_cached_countries');
    if (saved) {
      cache.countries = JSON.parse(saved);
      return cache.countries;
    }
  } catch (e) {}

  try {
    const data = await api.get('/locations/countries');
    if (Array.isArray(data) && data.length > 0) {
      cache.countries = data;
      try { localStorage.setItem('gt_cached_countries', JSON.stringify(data)); } catch (e) {}
      return data;
    }
  } catch (err) {
    console.warn("Using fallback countries dataset:", err);
  }

  cache.countries = FALLBACK_COUNTRIES;
  return FALLBACK_COUNTRIES;
};

export const getStatesOfCountry = async (countryName) => {
  if (!countryName) return [];
  const key = countryName.trim().toLowerCase();
  
  if (cache.states.has(key)) {
    return cache.states.get(key);
  }

  try {
    const data = await api.get(`/locations/states?country=${encodeURIComponent(countryName)}`);
    if (Array.isArray(data)) {
      cache.states.set(key, data);
      return data;
    }
  } catch (err) {
    console.warn(`Error fetching states for ${countryName}:`, err);
  }

  return [];
};

export const getCitiesOfState = async (countryName, stateName) => {
  if (!countryName || !stateName) return [];
  const key = `${countryName.trim().toLowerCase()}_${stateName.trim().toLowerCase()}`;

  if (cache.cities.has(key)) {
    return cache.cities.get(key);
  }

  try {
    const data = await api.get(`/locations/cities?country=${encodeURIComponent(countryName)}&state=${encodeURIComponent(stateName)}`);
    if (Array.isArray(data)) {
      cache.cities.set(key, data);
      return data;
    }
  } catch (err) {
    console.warn(`Error fetching cities for ${stateName}, ${countryName}:`, err);
  }

  return [];
};

export const validateLocationHierarchy = async (country, state, city) => {
  try {
    return await api.post('/locations/validate', { country, state, city });
  } catch (err) {
    return { valid: false, message: err.message || "Invalid location selection" };
  }
};
