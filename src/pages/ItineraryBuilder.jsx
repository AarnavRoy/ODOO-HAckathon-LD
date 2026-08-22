import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getTrip } from '../api/trips';
import { getCities } from '../api/cities';
import { createStop, reorderStops, deleteStop } from '../api/stops';
import { Plus, GripVertical, Trash2, ChevronUp, ChevronDown, Map, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ItineraryBuilder() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newCityId, setNewCityId] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [tripData, citiesData] = await Promise.all([
      getTrip(tripId),
      getCities()
    ]);
    if (tripData && tripData.stops) {
      tripData.stops.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    } else if (tripData) {
      tripData.stops = [];
    }
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

  if (loading) return <AppLayout title="Itinerary Builder"><div className="text-center py-20 font-semibold text-slate-500 animate-pulse">Loading itinerary...</div></AppLayout>;
  if (!trip) return <AppLayout title="Not Found">Trip not found.</AppLayout>;

  return (
    <AppLayout title={`Build Itinerary: ${trip.name}`}>
      <div className="flex justify-between items-center mb-8">
        <p className="text-lg font-medium text-slate-500 flex items-center">
          <Compass className="w-5 h-5 mr-2 text-fuchsia-500" /> Plan your stops and schedule activities.
        </p>
        <Link to={`/trips/${trip.id}`} className="bg-white text-slate-700 px-5 py-2.5 rounded-full font-bold shadow-sm border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all">
          Preview Itinerary
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-2xl font-black tracking-tighter text-slate-900 border-b border-slate-200/60 pb-3">Your Route</h3>
          
          <AnimatePresence>
            {trip.stops.map((stop, index) => {
              const city = cities.find(c => c.id === stop.cityId);
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  key={stop.id} 
                  className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-sm flex items-start gap-5 relative group"
                >
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-300">
                    <button onClick={() => handleMoveStop(index, -1)} disabled={index === 0} className="hover:text-violet-600 disabled:opacity-30 transition-colors">
                      <ChevronUp className="w-6 h-6" />
                    </button>
                    <GripVertical className="w-5 h-5 cursor-move" />
                    <button onClick={() => handleMoveStop(index, 1)} disabled={index === trip.stops.length - 1} className="hover:text-violet-600 disabled:opacity-30 transition-colors">
                      <ChevronDown className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-2xl font-black text-slate-900 tracking-tight">{city?.name} <span className="text-slate-400 text-lg font-medium">, {city?.country}</span></h4>
                      <button onClick={() => handleDeleteStop(stop.id)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex gap-4 text-sm font-bold text-slate-500 mb-5 bg-slate-50 inline-block px-4 py-1.5 rounded-full">
                      {stop.startDate} to {stop.endDate}
                    </div>

                    <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-bold text-slate-700">Planned Activities</h5>
                      </div>
                      {stop.activities?.length === 0 ? (
                        <p className="text-sm text-slate-400 font-medium">No activities planned for this stop.</p>
                      ) : (
                        <ul className="space-y-3">
                          {stop.activities?.map(act => (
                            <li key={act.id} className="text-sm bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center group/act">
                              <span className="font-bold text-slate-700">{act.dayDate} <span className="text-slate-400 font-medium ml-2">{act.startTime}</span></span>
                              <span className="font-bold text-violet-600">₹{act.cost}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <Link to={`/trips/${tripId}/activities`} className="text-fuchsia-600 hover:text-fuchsia-700 text-sm font-bold mt-4 inline-flex items-center group-hover:underline">
                        <Plus className="w-4 h-4 mr-1" /> Find Activities
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {trip.stops.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Map className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-lg">Your itinerary is empty. Add a city to get started!</p>
            </motion.div>
          )}
        </div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 h-fit sticky top-24">
          <h3 className="text-xl font-black tracking-tighter text-slate-900 mb-6 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-orange-500" /> Add a Stop
          </h3>
          <form onSubmit={handleAddStop} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">City</label>
              <select required value={newCityId} onChange={(e) => setNewCityId(e.target.value)} 
                      className="block w-full border-2 border-slate-100 bg-slate-50 rounded-xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all font-medium sm:text-sm">
                <option value="">Select a city</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}, {city.country}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Start Date</label>
              <input type="date" required value={newStartDate} onChange={e => setNewStartDate(e.target.value)} 
                     className="block w-full border-2 border-slate-100 bg-slate-50 rounded-xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all font-medium sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">End Date</label>
              <input type="date" required value={newEndDate} onChange={e => setNewEndDate(e.target.value)} 
                     className="block w-full border-2 border-slate-100 bg-slate-50 rounded-xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all font-medium sm:text-sm" />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-orange-500/30 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-fuchsia-600 hover:from-orange-400 hover:to-fuchsia-500 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all mt-4">
              Add Stop
            </motion.button>
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <Link to={`/trips/${tripId}/cities`} className="text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors">
                Browse More Cities
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </AppLayout>
  );
}
