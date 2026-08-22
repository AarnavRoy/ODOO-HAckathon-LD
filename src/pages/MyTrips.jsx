import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getTrips, deleteTrip } from '../api/trips';
import { Calendar, MapPin, Trash2, Edit2, Eye, Plus, Plane } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

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
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadTrips();
  }, []);

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
          <Link to="/trips/new" className="inline-flex items-center justify-center bg-gradient-to-r from-fuchsia-600 to-orange-500 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 hover:scale-105 active:scale-95 transition-all duration-300">
            <Plus className="w-4 h-4 mr-2" /> Create New Trip
          </Link>
        </motion.div>
      </div>
      
      {trips.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-16 text-center rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-fuchsia-50 text-fuchsia-500 rounded-full flex items-center justify-center mb-6">
            <Plane className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900 mb-2">No trips planned yet</h3>
          <p className="text-slate-500 mb-8 max-w-[40ch]">Your itinerary is completely empty. Start dreaming up your next big adventure today.</p>
          <Link to="/trips/new" className="text-white bg-slate-900 hover:bg-slate-800 px-6 py-3 rounded-full font-bold transition-colors">Start planning now</Link>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map(trip => (
            <motion.div variants={cardVariants} key={trip.id} className="bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col group">
              <div className="h-56 relative overflow-hidden">
                <img src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05'} alt={trip.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                {trip.isPublic && <span className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-bold">Public</span>}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-black text-white leading-tight drop-shadow-md">{trip.name}</h3>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center text-slate-500 text-sm font-medium mb-3">
                  <Calendar className="w-4 h-4 mr-2 text-fuchsia-500" />
                  {trip.startDate} - {trip.endDate}
                </div>
                <div className="flex items-center text-slate-500 text-sm font-medium mb-6">
                  <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                  {trip.stopCount ?? trip.stops?.length ?? 0} destinations
                </div>
                <div className="mt-auto flex justify-between items-center pt-5 border-t border-slate-100">
                  <div className="flex space-x-2">
                    <Link to={`/trips/${trip.id}/build`} className="text-slate-600 hover:text-fuchsia-600 bg-slate-50 hover:bg-fuchsia-50 px-3 py-1.5 rounded-full flex items-center text-sm font-bold transition-colors" title="Edit Itinerary">
                      <Edit2 className="w-4 h-4 mr-1.5" /> Edit
                    </Link>
                    <Link to={`/trips/${trip.id}`} className="text-slate-600 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-full flex items-center text-sm font-bold transition-colors" title="View Itinerary">
                      <Eye className="w-4 h-4 mr-1.5" /> View
                    </Link>
                  </div>
                  <button onClick={() => handleDelete(trip.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors" title="Delete Trip">
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
