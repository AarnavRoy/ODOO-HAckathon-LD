import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTripItinerary } from '../api/trips';

export default function TripCalendar() {
  const { tripId } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTripItinerary(tripId).then(data => {
      setItinerary(data);
      setLoading(false);
    });
  }, [tripId]);

  if (loading) return <div className="p-8 text-center">Loading calendar...</div>;
  if (!itinerary) return <div className="p-8 text-center">Failed to load.</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trip Calendar</h1>
        <Link to={`/trips/${tripId}`} className="text-blue-600 hover:underline">Back to Itinerary</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {itinerary.days.map(day => (
          <div key={day.date} className="border rounded bg-[#131A2A] shadow-sm flex flex-col h-full min-h-[200px]">
            <div className="bg-blue-600 text-white px-3 py-2 font-bold text-sm">
              {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <div className="p-3 flex-1 flex flex-col gap-2 overflow-y-auto">
              {day.stops.map(stop => (
                <div key={stop.city.id}>
                  <div className="text-xs font-bold text-gray-500 uppercase">{stop.city.name}</div>
                  {stop.activities.map(act => (
                    <div key={act.id} className="text-sm bg-blue-50 p-2 rounded mb-1 border border-blue-100">
                      <div className="font-medium">{act.activity.name}</div>
                      <div className="text-xs text-gray-600">{act.startTime || 'Any time'}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




