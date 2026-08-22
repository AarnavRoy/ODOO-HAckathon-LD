import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedTrip, copySharedTrip } from '../api/trips';

export default function SharedView() {
  const { shareToken } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    getSharedTrip(shareToken).then(data => {
      setTrip(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [shareToken]);

  const handleCopy = () => {
    setCopying(true);
    copySharedTrip(shareToken).then(() => {
      alert('Trip copied successfully to your account!');
      setCopying(false);
    }).catch(() => {
      alert('Failed to copy trip. You might need to log in first.');
      setCopying(false);
    });
  };

  if (loading) return <div className="p-8 text-center">Loading shared trip...</div>;
  if (!trip) return <div className="p-8 text-center text-red-600">This trip is either private or does not exist.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 mt-8">
      <div className="bg-[#131A2A] rounded-xl shadow-lg overflow-hidden">
        <img src={trip.coverPhotoUrl} alt={trip.name} className="w-full h-64 object-cover" />
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{trip.name}</h1>
              <p className="text-gray-600">{trip.description}</p>
              <div className="text-sm text-gray-500 mt-2">
                {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
              </div>
            </div>
            <button 
              onClick={handleCopy}
              disabled={copying}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {copying ? 'Copying...' : 'Copy Trip'}
            </button>
          </div>

          <h2 className="text-xl font-bold mb-4 mt-8 border-b pb-2">Destinations</h2>
          <div className="space-y-4">
            {trip.stops.map(stop => (
              <div key={stop.id} className="border p-4 rounded-lg bg-gray-50">
                <div className="font-bold text-lg mb-2">City ID: {stop.cityId} (View Only Mode)</div>
                <div className="text-sm text-gray-600">
                  {new Date(stop.startDate).toLocaleDateString()} to {new Date(stop.endDate).toLocaleDateString()}
                </div>
                <div className="mt-2 pl-4">
                  <div className="font-medium text-sm text-slate-300 mb-1">Activities:</div>
                  <ul className="list-disc pl-4 text-sm text-gray-600">
                    {stop.activities.map(act => (
                      <li key={act.id}>Activity ID: {act.activityId} at {act.startTime}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}




