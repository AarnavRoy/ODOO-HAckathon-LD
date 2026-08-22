import api from './client';

export const getCities = async ({ search = '', country = '', region = '' } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (country) params.append('country', country);
  if (region) params.append('region', region);

  const query = params.toString();
  return await api.get(`/cities${query ? `?${query}` : ''}`);
};
