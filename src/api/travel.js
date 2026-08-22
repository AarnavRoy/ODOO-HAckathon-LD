/**
 * travel.js — Real-time API calls for distance, weather, currency, timezone, and nearby terminals.
 * All APIs are free and require NO API keys.
 */

// ─── OSRM: Road Distance & Duration ─────────────────────────────────

/** Returns { distanceKm, durationMin } using OSRM (driving) */
export async function getRouteInfo(lat1, lon1, lat2, lon2) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === "Ok" && data.routes?.[0]) {
      const route = data.routes[0];
      return {
        distanceKm: Math.round(route.distance / 1000),
        durationMin: Math.round(route.duration / 60),
      };
    }
  } catch {}
  return null;
}

// ─── Haversine: Flight Distance ──────────────────────────────────────

/** Returns distance in km (straight line / air) */
export function getFlightDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/** Estimates flight time in minutes (avg 800 km/h + 30 min taxi) */
export function estimateFlightTime(distanceKm) {
  return Math.round((distanceKm / 800) * 60 + 30);
}

// ─── Overpass: Nearby Airports / Stations ────────────────────────────

async function queryOverpass(query) {
  try {
    const url = `https://overpass-api.de/api/interpreter`;
    const res = await fetch(url, {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const data = await res.json();
    return data.elements || [];
  } catch {
    return [];
  }
}

/** Finds airports within radiusKm of a coordinate */
export async function getNearbyAirports(lat, lon, radiusKm = 100) {
  const radiusM = radiusKm * 1000;
  const q = `[out:json];node["aeroway"="aerodrome"]["iata"~"."](around:${radiusM},${lat},${lon});out 8;`;
  const elements = await queryOverpass(q);
  return elements.map((e) => ({
    name: e.tags?.name || "Unknown Airport",
    iata: e.tags?.iata || "",
    lat: e.lat,
    lon: e.lon,
  }));
}

/** Finds railway stations within radiusKm of a coordinate */
export async function getNearbyRailStations(lat, lon, radiusKm = 30) {
  const radiusM = radiusKm * 1000;
  const q = `[out:json];node["railway"="station"]["name"~"."](around:${radiusM},${lat},${lon});out 8;`;
  const elements = await queryOverpass(q);
  return elements.map((e) => ({
    name: e.tags?.name || "Unknown Station",
    lat: e.lat,
    lon: e.lon,
  }));
}

/** Finds bus stations within radiusKm of a coordinate */
export async function getNearbyBusStations(lat, lon, radiusKm = 20) {
  const radiusM = radiusKm * 1000;
  const q = `[out:json];node["amenity"="bus_station"]["name"~"."](around:${radiusM},${lat},${lon});out 5;`;
  const elements = await queryOverpass(q);
  return elements.map((e) => ({
    name: e.tags?.name || "Unknown Bus Station",
    lat: e.lat,
    lon: e.lon,
  }));
}

// ─── Open-Meteo: Weather Forecast ────────────────────────────────────

/** WMO weather code → { emoji, label } */
const WMO_CODES = {
  0: { emoji: "☀️", label: "Clear sky" },
  1: { emoji: "🌤️", label: "Mainly clear" },
  2: { emoji: "⛅", label: "Partly cloudy" },
  3: { emoji: "☁️", label: "Overcast" },
  45: { emoji: "🌫️", label: "Fog" },
  48: { emoji: "🌫️", label: "Depositing rime fog" },
  51: { emoji: "🌦️", label: "Light drizzle" },
  53: { emoji: "🌦️", label: "Moderate drizzle" },
  55: { emoji: "🌧️", label: "Dense drizzle" },
  61: { emoji: "🌧️", label: "Slight rain" },
  63: { emoji: "🌧️", label: "Moderate rain" },
  65: { emoji: "🌧️", label: "Heavy rain" },
  71: { emoji: "🌨️", label: "Slight snow" },
  73: { emoji: "🌨️", label: "Moderate snow" },
  75: { emoji: "❄️", label: "Heavy snow" },
  80: { emoji: "🌦️", label: "Slight showers" },
  81: { emoji: "🌧️", label: "Moderate showers" },
  82: { emoji: "⛈️", label: "Violent showers" },
  95: { emoji: "⛈️", label: "Thunderstorm" },
  96: { emoji: "⛈️", label: "Thunderstorm w/ hail" },
  99: { emoji: "⛈️", label: "Thunderstorm w/ heavy hail" },
};

export function getWeatherInfo(code) {
  return WMO_CODES[code] || { emoji: "🌡️", label: "Unknown" };
}

/**
 * Get weather forecast for a location.
 * Returns array of { date, maxTemp, minTemp, rainPercent, code, emoji, label }
 */
export async function getWeatherForecast(lat, lon, days = 7) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=${days}`;
    const res = await fetch(url);
    const data = await res.json();
    const d = data.daily;
    if (!d?.time) return [];
    return d.time.map((date, i) => {
      const wmo = getWeatherInfo(d.weathercode[i]);
      return {
        date,
        maxTemp: d.temperature_2m_max[i],
        minTemp: d.temperature_2m_min[i],
        rainPercent: d.precipitation_probability_max[i],
        code: d.weathercode[i],
        ...wmo,
      };
    });
  } catch {
    return [];
  }
}

// ─── Frankfurter: Currency Rates ─────────────────────────────────────

/**
 * Get live exchange rates from a base currency.
 * Returns { base, date, rates: { USD: 0.01, EUR: 0.009, ... } }
 */
export async function getLiveCurrencyRates(baseCurrency = "INR") {
  try {
    const url = `https://api.frankfurter.app/latest?from=${baseCurrency}`;
    const res = await fetch(url);
    return await res.json();
  } catch {
    return null;
  }
}

// ─── TimeAPI: Timezone ───────────────────────────────────────────────

/**
 * Get timezone name + current local time for coordinates.
 * Returns { timeZone: "Asia/Kolkata", currentLocalTime: "2026-..." }
 */
export async function getTimezone(lat, lon) {
  try {
    const url = `https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lon}`;
    const res = await fetch(url);
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────

/** Format minutes into "Xh Ym" string */
export function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

/** Format km distance nicely */
export function formatDistance(km) {
  if (!km) return "—";
  if (km >= 1000) return `${(km / 1000).toFixed(1)}k km`;
  return `${km} km`;
}

export const TRANSPORT_MODES = [
  { value: "FLIGHT", emoji: "✈️", label: "Flight" },
  { value: "TRAIN", emoji: "🚂", label: "Train" },
  { value: "BUS", emoji: "🚌", label: "Bus" },
  { value: "CAR", emoji: "🚗", label: "Car / Taxi" },
  { value: "FERRY", emoji: "🚢", label: "Ferry" },
];
