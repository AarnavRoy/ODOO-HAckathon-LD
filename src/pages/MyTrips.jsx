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

  if (loading) return <AppLayout title="My Trips"><div className="text-center py-20 text-slate-400 animate-pulse font-semibold">Loading trips...</div></AppLayout>;

  return (
    <AppLayout title="My Trips">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Your Journeys</h2>
          <p className="text-slate-400 font-medium mt-1">Manage and view all your planned trips.</p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Link to="/trips/new" className="inline-flex items-center bg-amber-400 text-slate-950 px-6 py-3 rounded-full text-sm font-bold shadow-md hover:shadow-lg hover:bg-amber-500 hover:text-slate-950 hover:-translate-y-0.5 transition-all">
            <Plus className="w-4 h-4 mr-2" /> Create New Trip
          </Link>
        </motion.div>
      </div>

      {trips.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#131A2A] border border-[#1F2937] border-dashed p-16 text-center rounded-3xl flex flex-col items-center shadow-sm">
          <div className="w-20 h-20 bg-[#1F2937] text-slate-300 rounded-full flex items-center justify-center mb-6">
            <Plane className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-white mb-2">No trips planned yet</h3>
          <p className="text-slate-400 mb-8 max-w-[40ch]">Your itinerary is empty. Start dreaming up your next big adventure.</p>
          <Link to="/trips/new" className="bg-amber-400 text-slate-950 hover:bg-amber-500 hover:text-slate-950 px-8 py-3.5 rounded-full font-bold transition-all shadow-md">Start planning</Link>
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map(trip => (
            <motion.div variants={cardUp} key={trip.id} className="bg-[#131A2A] rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="h-56 relative overflow-hidden">
                <img src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80'} alt={trip.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                {trip.isPublic && <span className="absolute top-4 right-4 bg-[#131A2A]/20 backdrop-blur-md text-white border border-white/20 text-xs px-3 py-1.5 rounded-full font-bold shadow-sm">Public</span>}
                <div className="absolute bottom-5 left-6 right-6">
                  <h3 className="text-2xl font-black text-white leading-tight drop-shadow-md">{trip.name}</h3>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center text-slate-400 text-sm font-medium mb-2.5">
                  <Calendar className="w-4 h-4 mr-2 text-amber-400" />
                  {trip.startDate} <span className="mx-2">→</span> {trip.endDate}
                </div>
                <div className="flex items-center text-slate-400 text-sm font-medium mb-6">
                  <MapPin className="w-4 h-4 mr-2 text-amber-400" />
                  {trip.stopCount || 0} destinations
                </div>
                <div className="mt-auto flex justify-between items-center pt-5 border-t border-slate-100">
                  <div className="flex space-x-2">
                    <Link to={`/trips/${trip.id}/build`} className="text-slate-300 hover:text-white bg-[#1F2937] hover:bg-amber-400 px-4 py-2 rounded-full flex items-center text-sm font-bold transition-all">
                      <Edit2 className="w-4 h-4 mr-1.5" /> Edit
                    </Link>
                    <Link to={`/trips/${trip.id}`} className="text-slate-300 hover:text-white bg-[#1F2937] hover:bg-amber-400 px-4 py-2 rounded-full flex items-center text-sm font-bold transition-all">
                      <Eye className="w-4 h-4 mr-1.5" /> View
                    </Link>
                  </div>
                  <button onClick={() => handleDelete(trip.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all">
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




