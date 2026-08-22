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
    try {
      const [tripData, citiesData] = await Promise.all([getTrip(tripId), getCities()]);
      if (tripData && tripData.stops) tripData.stops.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
      else if (tripData) tripData.stops = [];
      setTrip(tripData);
      setCities(citiesData);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [tripId]);

  const handleAddStop = async (e) => {
    e.preventDefault();
    if (!newCityId || !newStartDate || !newEndDate) return;
    await createStop(tripId, { cityId: Number(newCityId), startDate: newStartDate, endDate: newEndDate, transportCost: 0, accommodationCost: 0 });
    setNewCityId(''); setNewStartDate(''); setNewEndDate('');
    loadData();
  };

  const handleMoveStop = async (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === trip.stops.length - 1) return;
    const newStops = [...trip.stops];
    [newStops[index], newStops[index + direction]] = [newStops[index + direction], newStops[index]];
    setTrip({ ...trip, stops: newStops });
    await reorderStops(tripId, { stopIds: newStops.map(s => s.id) });
    loadData();
  };

  const handleDeleteStop = async (stopId) => {
    if (window.confirm('Remove this stop?')) { await deleteStop(stopId); loadData(); }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm";

  if (loading) return <AppLayout title="Itinerary Builder"><div className="text-center py-20 text-slate-500 animate-pulse font-semibold">Loading itinerary...</div></AppLayout>;
  if (!trip) return <AppLayout title="Not Found"><p className="text-slate-500">Trip not found.</p></AppLayout>;

  return (
    <AppLayout title={`Build: ${trip.name}`}>
      <div className="flex justify-between items-center mb-8">
        <p className="text-lg text-slate-400 flex items-center">
          <Compass className="w-5 h-5 mr-2 text-amber-400" /> Plan your stops and activities.
        </p>
        <Link to={`/trips/${trip.id}`} className="bg-white/5 border border-white/10 text-slate-300 px-5 py-2.5 rounded-xl font-bold hover:bg-white/10 active:scale-95 transition-all text-sm">
          Preview Itinerary
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <h3 className="text-xl font-extrabold tracking-tight text-white border-b border-white/5 pb-3">Your Route</h3>

          <AnimatePresence>
            {trip.stops.map((stop, index) => {
              const city = cities.find(c => c.id === stop.cityId);
              return (
                <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  key={stop.id} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 flex items-start gap-5 group hover:border-amber-500/20 transition-all">
                  <div className="flex flex-col items-center space-y-2 text-slate-600">
                    <button onClick={() => handleMoveStop(index, -1)} disabled={index === 0} className="hover:text-amber-400 disabled:opacity-20 transition-colors"><ChevronUp className="w-5 h-5" /></button>
                    <GripVertical className="w-4 h-4 cursor-move" />
                    <button onClick={() => handleMoveStop(index, 1)} disabled={index === trip.stops.length - 1} className="hover:text-amber-400 disabled:opacity-20 transition-colors"><ChevronDown className="w-5 h-5" /></button>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-extrabold text-white">{city?.name} <span className="text-slate-500 text-base font-medium">, {city?.country}</span></h4>
                      <button onClick={() => handleDeleteStop(stop.id)} className="text-slate-700 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="text-sm font-semibold text-slate-500 bg-white/5 inline-block px-3 py-1 rounded-lg mb-4">{stop.startDate} → {stop.endDate}</div>
                    <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                      <h5 className="font-bold text-slate-400 text-sm mb-3">Activities</h5>
                      {stop.activities?.length === 0 ? (
                        <p className="text-sm text-slate-600">No activities yet.</p>
                      ) : (
                        <ul className="space-y-2">
                          {stop.activities?.map(act => (
                            <li key={act.id} className="text-sm bg-white/5 px-4 py-2.5 rounded-lg border border-white/5 flex justify-between items-center">
                              <span className="font-semibold text-slate-300">{act.dayDate} <span className="text-slate-500 ml-2">{act.startTime}</span></span>
                              <span className="font-bold text-amber-400">₹{act.cost}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <Link to={`/trips/${tripId}/activities`} className="text-amber-400 hover:text-amber-300 text-sm font-bold mt-3 inline-flex items-center"><Plus className="w-4 h-4 mr-1" /> Find Activities</Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {trip.stops.length === 0 && (
            <div className="text-center py-16">
              <Map className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 font-medium text-lg">Your itinerary is empty. Add a city to begin!</p>
            </div>
          )}
        </div>

        {/* Sidebar: Add stop */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.03] border border-white/[0.06] p-7 rounded-2xl h-fit sticky top-24">
          <h3 className="text-lg font-extrabold tracking-tight text-white mb-5 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-amber-400" /> Add a Stop
          </h3>
          <form onSubmit={handleAddStop} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-1.5">City</label>
              <select required value={newCityId} onChange={(e) => setNewCityId(e.target.value)} className={inputClass}>
                <option value="">Select a city</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}, {c.country}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-1.5">Start Date</label>
              <input type="date" required value={newStartDate} onChange={e => setNewStartDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-1.5">End Date</label>
              <input type="date" required value={newEndDate} onChange={e => setNewEndDate(e.target.value)} className={inputClass} />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full py-3 rounded-xl text-sm font-bold text-[#0c0f1a] bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/20 transition-all mt-2">
              Add Stop
            </motion.button>
            <div className="pt-4 border-t border-white/5 text-center">
              <Link to={`/trips/${tripId}/cities`} className="text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors">Browse Cities</Link>
            </div>
          </form>
        </motion.div>
      </div>
    </AppLayout>
  );
}
