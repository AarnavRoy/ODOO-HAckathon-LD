import { mockCities } from './mockData';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const getCities = async ({ search = '', country = '', region = '' } = {}) => {
  await delay();
  return mockCities.filter(city => {
    const matchSearch = city.name.toLowerCase().includes(search.toLowerCase());
    const matchCountry = country ? city.country === country : true;
    const matchRegion = region ? city.region === region : true;
    return matchSearch && matchCountry && matchRegion;
  });
};
