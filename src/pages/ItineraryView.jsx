import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTripItinerary } from '../api/trips';
import { Calendar, List, MapPin, Clock } from 'lucide-react';

export default function ItineraryView() {
  const { tripId } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // list or calendar

  useEffect(() => {
    getTripItinerary(tripId).then(data => {
      setItinerary(data);
      setLoading(false);
    });
  }, [tripId]);

  if (loading) return <div className="p-8 text-center">Loading itinerary...</div>;
  if (!itinerary) return <div className="p-8 text-center">Failed to load.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Itinerary View</h1>
        <div className="flex gap-2">
          <Link to={`/trips/${tripId}/cities`} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Find Cities</Link>
          <Link to={`/trips/${tripId}/calendar`} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Full Calendar</Link>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}><List size={20} /></button>
          <button onClick={() => setViewMode('calendar')} className={`p-2 rounded ${viewMode === 'calendar' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}><Calendar size={20} /></button>
        </div>
      </div>

      <div className="space-y-8">
        {itinerary.days.map(day => (
          <div key={day.date} className="border rounded-lg shadow-sm bg-white overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b font-medium flex justify-between">
              <span>{new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="p-4 space-y-4">
              {day.stops.length === 0 ? (
                <div className="text-gray-400 italic">No activities planned</div>
              ) : (
                day.stops.map(stop => (
                  <div key={stop.city.id} className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <MapPin size={18} className="text-red-500" /> {stop.city.name}
                    </h3>
                    <div className="space-y-2 pl-6">
                      {stop.activities.map(act => (
                        <div key={act.id} className="flex justify-between items-start p-3 bg-gray-50 rounded border">
                          <div>
                            <div className="font-medium">{act.activity.name}</div>
                            <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1"><Clock size={14} /> {act.startTime || 'Any time'}</span>
                              <span>{act.activity.category}</span>
                            </div>
                            {act.notes && <div className="text-sm text-gray-500 mt-2">{act.notes}</div>}
                          </div>
                          <div className="font-medium">${act.cost}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
