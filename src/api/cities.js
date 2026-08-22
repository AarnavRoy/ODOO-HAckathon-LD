import api from './client';

export const getCities = async ({ search = '', country = '', region = '' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (country) params.append('country', country);
  if (region) params.append('region', region);

  const query = params.toString();
  return await api.get(`/cities${query ? `?${query}` : ''}`);
};

/**
 * Find an existing city by name+country or create a new one.
 * @param {{ name: string, country: string, lat?: number, lng?: number }} place
 * @returns {Promise<{ id: number, name: string, country: string }>}
 */
export const upsertCity = async ({ name, country, lat, lng }) => {
  return await api.post('/cities/upsert', { name, country, latitude: lat, longitude: lng });
};

