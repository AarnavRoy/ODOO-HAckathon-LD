import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getTrips, deleteTrip } from '../api/trips';
import { Calendar, MapPin, Trash2, Edit2, Eye, Plus, Plane } from 'lucide-react';
import { motion } from 'framer-motion';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const cardUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } } };

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = () => {
    setLoading(true);
    getTrips().then(data => {
      setTrips(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      if (err.status === 401 || err.status === 403) { localStorage.removeItem('token'); window.location.href = '/login'; }
      setLoading(false);
    });
  };

  useEffect(() => { loadTrips(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      await deleteTrip(id);
      loadTrips();
    }
  };

  if (loading) return <AppLayout title="My Trips"><div className="text-center py-20 text-slate-500 animate-pulse font-semibold">Loading trips...</div></AppLayout>;

  return (
    <AppLayout title="My Trips">
      <div className="mb-8 flex justify-end">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Link to="/trips/new" className="inline-flex items-center bg-amber-400 text-[#0c0f1a] px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-300 hover:scale-105 active:scale-95 transition-all">
            <Plus className="w-4 h-4 mr-2" /> Create New Trip
          </Link>
        </motion.div>
      </div>

      {trips.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/[0.06] p-16 text-center rounded-3xl flex flex-col items-center">
          <div className="w-20 h-20 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mb-6">
            <Plane className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-white mb-2">No trips planned yet</h3>
          <p className="text-slate-500 mb-8 max-w-[40ch]">Your itinerary is empty. Start dreaming up your next big adventure.</p>
          <Link to="/trips/new" className="text-[#0c0f1a] bg-amber-400 hover:bg-amber-300 px-6 py-3 rounded-xl font-bold transition-colors">Start planning</Link>
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map(trip => (
            <motion.div variants={cardUp} key={trip.id} className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col group hover:border-amber-500/30 transition-all">
              <div className="h-52 relative overflow-hidden">
                <img src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80'} alt={trip.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f1a] to-transparent"></div>
                {trip.isPublic && <span className="absolute top-4 right-4 bg-white/10 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full font-bold">Public</span>}
                <div className="absolute bottom-4 left-5 right-5">
                  <h3 className="text-xl font-extrabold text-white leading-tight drop-shadow-md">{trip.name}</h3>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center text-slate-500 text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4 mr-2 text-cyan-400" />
                  {trip.startDate} → {trip.endDate}
                </div>
                <div className="flex items-center text-slate-500 text-sm font-medium mb-5">
                  <MapPin className="w-4 h-4 mr-2 text-rose-400" />
                  {trip.stopCount || 0} destinations
                </div>
                <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/5">
                  <div className="flex space-x-2">
                    <Link to={`/trips/${trip.id}/build`} className="text-slate-400 hover:text-amber-400 bg-white/5 hover:bg-amber-500/10 px-3 py-1.5 rounded-lg flex items-center text-sm font-bold transition-all">
                      <Edit2 className="w-4 h-4 mr-1.5" /> Edit
                    </Link>
                    <Link to={`/trips/${trip.id}`} className="text-slate-400 hover:text-cyan-400 bg-white/5 hover:bg-cyan-500/10 px-3 py-1.5 rounded-lg flex items-center text-sm font-bold transition-all">
                      <Eye className="w-4 h-4 mr-1.5" /> View
                    </Link>
                  </div>
                  <button onClick={() => handleDelete(trip.id)} className="text-slate-600 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AppLayout>
  );
}
