import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCities } from '../api/cities';
import { Search } from 'lucide-react';

export default function CitySearch() {
  const { tripId } = useParams();
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCities({ search }).then(data => {
      setCities(data);
      setLoading(false);
    });
  }, [search]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Discover Cities</h1>
        <Link to={`/trips/${tripId}`} className="text-blue-600 hover:underline">Back to Trip</Link>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search cities by name..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-200 outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Searching...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map(city => (
            <div key={city.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
              <img src={city.imageUrl} alt={city.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{city.name}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{city.country}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>Cost Index: {city.costIndex}/100</span>
                  <span>Popularity: {city.popularityScore}/100</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Add to Trip</button>
                  <Link to={`/trips/${tripId}/activities?cityId=${city.id}`} className="flex-1 bg-gray-100 text-center py-2 rounded hover:bg-gray-200">Activities</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
