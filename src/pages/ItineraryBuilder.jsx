import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getTrip } from '../api/trips';
import { getCities } from '../api/cities';
import { createStop, reorderStops, deleteStop } from '../api/stops';
import { Plus, GripVertical, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

export default function ItineraryBuilder() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add stop form
  const [newCityId, setNewCityId] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [tripData, citiesData] = await Promise.all([
      getTrip(tripId),
      getCities()
    ]);
    // Sort stops by orderIndex
    tripData.stops.sort((a, b) => a.orderIndex - b.orderIndex);
    setTrip(tripData);
    setCities(citiesData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [tripId]);

  const handleAddStop = async (e) => {
    e.preventDefault();
    if (!newCityId || !newStartDate || !newEndDate) return;
    
    await createStop(tripId, {
      cityId: Number(newCityId),
      startDate: newStartDate,
      endDate: newEndDate,
      transportCost: 0,
      accommodationCost: 0
    });
    
    setNewCityId('');
    setNewStartDate('');
    setNewEndDate('');
    loadData();
  };

  const handleMoveStop = async (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === trip.stops.length - 1) return;
    
    const newStops = [...trip.stops];
    const temp = newStops[index];
    newStops[index] = newStops[index + direction];
    newStops[index + direction] = temp;
    
    // Optimistic update
    setTrip({ ...trip, stops: newStops });
    
    const stopIds = newStops.map(s => s.id);
    await reorderStops(tripId, { stopIds });
    loadData();
  };

  const handleDeleteStop = async (stopId) => {
    if (window.confirm('Remove this stop?')) {
      await deleteStop(stopId);
      loadData();
    }
  };

  if (loading) return <AppLayout title="Itinerary Builder"><div className="text-center py-10">Loading...</div></AppLayout>;
  if (!trip) return <AppLayout title="Not Found">Trip not found.</AppLayout>;

  return (
    <AppLayout title={`Build Itinerary: ${trip.name}`}>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Plan your stops and schedule activities.</p>
        <Link to={`/trips/${trip.id}`} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200">
          Preview Itinerary
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Your Stops</h3>
          
          {trip.stops.map((stop, index) => {
            const city = cities.find(c => c.id === stop.cityId);
            return (
              <div key={stop.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-start gap-4">
                <div className="flex flex-col items-center justify-center space-y-1 text-gray-400">
                  <button onClick={() => handleMoveStop(index, -1)} disabled={index === 0} className="hover:text-blue-600 disabled:opacity-30">
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <GripVertical className="w-4 h-4 cursor-move" />
                  <button onClick={() => handleMoveStop(index, 1)} disabled={index === trip.stops.length - 1} className="hover:text-blue-600 disabled:opacity-30">
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xl font-bold text-gray-900">{city?.name} <span className="text-gray-500 text-base font-normal">, {city?.country}</span></h4>
                    <button onClick={() => handleDeleteStop(stop.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex gap-4 text-sm text-gray-600 mb-4">
                    <div><span className="font-medium">Dates:</span> {stop.startDate} to {stop.endDate}</div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium text-gray-700 text-sm">Activities</h5>
                    </div>
                    {stop.activities?.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No activities planned yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {stop.activities?.map(act => (
                          <li key={act.id} className="text-sm bg-white p-2 rounded border shadow-sm flex justify-between">
                            <span>{act.dayDate} at {act.startTime}</span>
                            <span className="text-gray-500">${act.cost}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link to={`/trips/${tripId}/activities`} className="text-blue-600 hover:underline text-sm font-medium mt-2 inline-block">+ Find Activities</Link>
                  </div>
                </div>
              </div>
            );
          })}
          
          {trip.stops.length === 0 && <p className="text-gray-500 italic py-4">No stops added yet. Add your first city!</p>}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit sticky top-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add a Stop</h3>
          <form onSubmit={handleAddStop} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <select required value={newCityId} onChange={(e) => setNewCityId(e.target.value)} 
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="">Select a city</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}, {city.country}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" required value={newStartDate} onChange={e => setNewStartDate(e.target.value)} 
                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input type="date" required value={newEndDate} onChange={e => setNewEndDate(e.target.value)} 
                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
              <Plus className="w-4 h-4 mr-1" /> Add Stop
            </button>
            <div className="mt-4 border-t pt-4 text-center">
              <Link to={`/trips/${tripId}/cities`} className="text-sm font-medium text-blue-600 hover:underline">
                Browse More Cities
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
