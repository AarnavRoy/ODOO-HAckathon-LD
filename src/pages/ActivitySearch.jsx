import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getCityActivities } from '../api/activities';

export default function ActivitySearch() {
  const { tripId } = useParams();
  const [searchParams] = useSearchParams();
  const cityId = searchParams.get('cityId');
  const [activities, setActivities] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cityId) {
      setLoading(true);
      getCityActivities(cityId, { category }).then(data => {
        setActivities(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [cityId, category]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Activities</h1>
        <Link to={`/trips/${tripId}/cities`} className="text-blue-600 hover:underline">Back to Cities</Link>
      </div>

      <div className="mb-6 flex gap-4">
        <select value={category} onChange={e => setCategory(e.target.value)} className="border p-2 rounded">
          <option value="">All Categories</option>
          <option value="SIGHTSEEING">Sightseeing</option>
          <option value="FOOD">Food</option>
          <option value="CULTURE">Culture</option>
          <option value="ADVENTURE">Adventure</option>
          <option value="RELAXATION">Relaxation</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {!cityId && <div className="text-red-500 mb-4">Please select a city first.</div>}

      {loading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map(act => (
            <div key={act.id} className="border rounded-lg overflow-hidden shadow-sm flex flex-col">
              <img src={act.imageUrl} alt={act.name} className="w-full h-40 object-cover" />
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{act.name}</h3>
                  <span className="text-green-600 font-medium">${act.cost}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4 flex-1">{act.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                  <span className="bg-gray-100 px-2 py-1 rounded">{act.category}</span>
                  <span>{act.durationMinutes} mins</span>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Add to Trip</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
