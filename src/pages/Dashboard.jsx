import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getDashboard } from '../api/trips';
import { getMe } from '../api/auth';
import { Plane, MapPin, IndianRupee, ArrowRight, Sparkles, Map, Navigation } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } } };

// Mock data for Iconic Landmarks
const landmarks = [
  { id: 1, name: "Taj Mahal", location: "Agra, India", img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Grand Canyon", location: "Arizona, USA", img: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "Eiffel Tower", location: "Paris, France", img: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80" },
  { id: 4, name: "Mount Fuji", location: "Honshu, Japan", img: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80" },
  { id: 5, name: "Colosseum", location: "Rome, Italy", img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80" },
  { id: 6, name: "Banff National Park", location: "Alberta, Canada", img: "https://images.unsplash.com/photo-1549880181-56a44cf4a9a5?auto=format&fit=crop&w=800&q=80" }
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const carouselRef = useRef(null);

  useEffect(() => {
    Promise.all([getDashboard(), getMe()]).then(([d, u]) => {
      setData(d);
      setUser(u.user || u);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      if (err.status === 401 || err.status === 403) { localStorage.removeItem('token'); window.location.href = '/login'; }
      setLoading(false);
    });
  }, []);

  if (loading) return <AppLayout><div className="text-center py-20 text-slate-500 animate-pulse font-semibold">Loading dashboard...</div></AppLayout>;

  return (
    <AppLayout>
      {/* Hero greeting */}
      <div className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white flex items-center">
            Welcome back, {user?.name} <Sparkles className="w-8 h-8 ml-3 text-amber-400" />
          </h2>
          <p className="mt-3 text-lg text-slate-400">Your next adventure is just a click away.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Link to="/trips/new" className="inline-flex items-center justify-center bg-amber-400 text-[#0c0f1a] px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-300 hover:scale-105 active:scale-95 transition-all">
            Plan New Trip <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>
      </div>

      {/* Stats row */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        {[
          { icon: Plane, label: 'Recent Trips', value: data?.recentTrips?.length || 0, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { icon: MapPin, label: 'Destinations', value: data?.recommendedCities?.length || 0, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { icon: IndianRupee, label: 'Budget Spent', value: `₹${data?.budgetHighlights?.totalSpent?.toLocaleString('en-IN') || 0}`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <motion.div key={i} variants={fadeUp} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center mb-3">
              <div className={`p-2.5 rounded-xl mr-3 ${stat.bg}`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</span>
            </div>
            <p className="text-4xl font-extrabold tracking-tight text-white">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* AI Assistant Card (Dark Theme) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mb-16 relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white shadow-2xl shadow-orange-900/20"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-amber-400 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-rose-400 rounded-full blur-3xl opacity-30"></div>
        
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center">
              <Sparkles className="text-amber-300 mr-3 w-8 h-8" /> 
              AI Trip Assistant
            </h3>
            <p className="text-orange-100 font-medium text-lg max-w-2xl">
              Tell us where you want to go, your budget and your travel style. We'll help build your perfect trip.
            </p>
          </div>
          <Link to="/ai-trip-assistant" className="shrink-0 bg-[#0c0f1a] text-amber-400 hover:bg-slate-900 px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-black/30 transition-all hover:scale-105 active:scale-95 flex items-center">
            Plan with AI <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </motion.div>

      {/* Iconic Landmarks Horizontal Carousel (VisitTheUSA inspired) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-16">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight text-white mb-1 flex items-center">
              <Map className="w-6 h-6 mr-3 text-rose-400" /> Iconic Landmarks
            </h3>
            <p className="text-slate-400 text-sm">Must-see destinations around the globe</p>
          </div>
          <div className="hidden md:flex space-x-2">
            <button onClick={() => carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' })} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
            <button onClick={() => carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' })} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div 
          ref={carouselRef}
          className="flex space-x-5 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {landmarks.map((landmark, i) => (
            <motion.div 
              key={landmark.id}
              whileHover={{ y: -8 }}
              className="relative shrink-0 w-72 md:w-80 h-96 rounded-3xl overflow-hidden snap-center group cursor-pointer border border-white/5"
            >
              <img src={landmark.img} alt={landmark.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f1a] via-[#0c0f1a]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="flex items-center text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
                    <Navigation className="w-3 h-3 mr-1" /> {landmark.location}
                  </div>
                  <h4 className="text-2xl font-extrabold text-white leading-tight">{landmark.name}</h4>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Recent trips */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-extrabold tracking-tight text-white">Your Recent Trips</h3>
            <Link to="/trips" className="text-amber-400 hover:text-amber-300 text-sm font-bold transition-colors">View all</Link>
          </div>
          <div className="space-y-3">
            {data?.recentTrips?.map((trip, i) => (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
                key={trip.id}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/30 transition-all group flex justify-between items-center"
              >
                <div>
                  <h4 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">{trip.name}</h4>
                  <p className="text-sm text-slate-500 mt-1">{trip.startDate} → {trip.endDate}</p>
                </div>
                <Link to={`/trips/${trip.id}/build`} className="bg-white/5 hover:bg-amber-500/10 text-slate-400 hover:text-amber-400 px-4 py-2 rounded-lg text-sm font-bold transition-all">Edit</Link>
              </motion.div>
            ))}
            {data?.recentTrips?.length === 0 && <p className="text-slate-500 py-4">No trips planned yet.</p>}
          </div>
        </motion.div>

        {/* Recommended destinations */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <h3 className="text-2xl font-extrabold tracking-tight text-white mb-6">Curated For You</h3>
          <div className="grid grid-cols-2 gap-4">
            {data?.recommendedCities?.map((city, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.08 }}
                key={city.id}
                className="relative rounded-2xl overflow-hidden aspect-[4/3] group cursor-pointer"
              >
                <img src={city.imageUrl} alt={city.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5">
                  <div className="transform transition-transform duration-300 group-hover:-translate-y-1">
                    <span className="block text-white font-bold text-lg leading-tight">{city.name}</span>
                    <span className="inline-block bg-white/10 backdrop-blur text-white text-xs px-2.5 py-1 rounded-md font-semibold mt-1">{city.country}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
