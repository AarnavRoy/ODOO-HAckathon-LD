import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getDashboard } from '../api/trips';
import { getMe } from '../api/auth';
import { Plane, MapPin, IndianRupee, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } } };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');

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

  const tabs = [
    { id: 'recent', label: 'Recent Trips', icon: Plane, color: 'violet', value: data?.recentTrips?.length || 0 },
    { id: 'explore', label: 'Explore', icon: MapPin, color: 'fuchsia', value: data?.recommendedCities?.length || 0 },
    { id: 'budget', label: 'Budget Spent', icon: IndianRupee, color: 'orange', value: `₹${data?.budgetHighlights?.totalSpent?.toLocaleString('en-IN') || 0}` },
  ];

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

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Recent trips */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
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
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <h3 className="text-2xl font-extrabold tracking-tight text-white mb-6">Recommended Destinations</h3>
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
                  <Link to={`/trips/${trip.id}/build`} className="bg-slate-50 text-slate-600 hover:bg-violet-50 hover:text-violet-600 px-4 py-2 rounded-full text-sm font-bold transition-colors">Edit</Link>
                </motion.div>
              ))}
              {data?.recentTrips?.length === 0 && <p className="text-slate-500 py-4 font-medium">No trips planned yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'explore' && (
          <div>
            <h3 className="text-2xl font-black tracking-tighter text-slate-900 mb-6">Recommended Destinations</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {data?.recommendedCities?.map((city, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                  key={city.id} 
                  className="relative rounded-2xl overflow-hidden aspect-[4/3] group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  <img src={city.imageUrl} alt={city.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex items-end p-5">
                    <div className="transform transition-transform duration-300 group-hover:-translate-y-1">
                      <span className="block text-white font-bold text-xl leading-tight mb-1">{city.name}</span>
                      <span className="inline-block bg-white/20 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md font-semibold">{city.country}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {data?.recommendedCities?.length === 0 && <p className="text-slate-500 py-4 font-medium col-span-full">No recommended destinations available.</p>}
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div>
            <h3 className="text-2xl font-black tracking-tighter text-slate-900 mb-6">Budget Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Total Budget</p>
                <p className="text-3xl font-black tracking-tight text-slate-900">₹{data?.budgetHighlights?.totalBudget?.toLocaleString('en-IN') || 0}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Total Spent</p>
                <p className="text-3xl font-black tracking-tight text-orange-600">₹{data?.budgetHighlights?.totalSpent?.toLocaleString('en-IN') || 0}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Remaining</p>
                <p className="text-3xl font-black tracking-tight text-emerald-600">
                  ₹{((data?.budgetHighlights?.totalBudget || 0) - (data?.budgetHighlights?.totalSpent || 0)).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
            {data?.recentTrips?.length > 0 && (
              <div>
                <h4 className="text-lg font-bold text-slate-800 mb-4">Per-Trip Budget</h4>
                <div className="space-y-3">
                  {data.recentTrips.map((trip) => {
                    const spent = trip.totalSpent || 0;
                    const limit = trip.budgetLimit || 0;
                    const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                    return (
                      <div key={trip.id} className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-slate-800">{trip.name}</span>
                          <span className="text-sm font-semibold text-slate-500">₹{spent.toLocaleString('en-IN')} / ₹{limit.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full transition-all duration-500 ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-orange-500' : 'bg-violet-500'}`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {data?.recentTrips?.length === 0 && <p className="text-slate-500 py-4 font-medium">No budget data available yet.</p>}
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
