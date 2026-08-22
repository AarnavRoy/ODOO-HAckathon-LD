import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getDashboard } from '../api/trips';
import { getMe } from '../api/auth';
import { Plane, MapPin, IndianRupee, ArrowRight, Sparkles, TrendingUp, Wallet, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } } };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent'); // 'recent' | 'destinations' | 'budget'

  useEffect(() => {
    Promise.all([getDashboard(), getMe()]).then(([d, u]) => {
      setData(d);
      setUser(u.user || u);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      if (err.status === 401 || err.status === 403) { 
        localStorage.removeItem('token'); 
        window.location.href = '/login'; 
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <AppLayout><div className="text-center py-20 text-slate-500 animate-pulse font-semibold">Loading dashboard...</div></AppLayout>;

  const tabs = [
    { 
      id: 'recent', 
      label: 'Recent Trips', 
      value: data?.recentTrips?.length || 0, 
      icon: Plane, 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-500/10',
      activeRing: 'border-cyan-500/60 bg-cyan-500/10 shadow-[0_0_25px_rgba(6,182,212,0.15)]',
      badge: 'text-cyan-400 bg-cyan-500/20'
    },
    { 
      id: 'destinations', 
      label: 'Destinations', 
      value: data?.recommendedCities?.length || 0, 
      icon: MapPin, 
      color: 'text-rose-400', 
      bg: 'bg-rose-500/10',
      activeRing: 'border-rose-500/60 bg-rose-500/10 shadow-[0_0_25px_rgba(244,63,94,0.15)]',
      badge: 'text-rose-400 bg-rose-500/20'
    },
    { 
      id: 'budget', 
      label: 'Budget Spent', 
      value: `₹${data?.budgetHighlights?.totalSpent?.toLocaleString('en-IN') || 0}`, 
      icon: IndianRupee, 
      color: 'text-amber-400', 
      bg: 'bg-amber-500/10',
      activeRing: 'border-amber-500/60 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.15)]',
      badge: 'text-amber-400 bg-amber-500/20'
    },
  ];

  const totalBudget = data?.budgetHighlights?.totalBudget || 0;
  const totalSpent = data?.budgetHighlights?.totalSpent || 0;
  const remainingBudget = Math.max(0, totalBudget - totalSpent);

  return (
    <AppLayout>
      {/* Hero greeting */}
      <div className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white flex items-center">
            Welcome back, {user?.name} <Sparkles className="w-8 h-8 ml-3 text-amber-400" />
          </h2>
          <p className="mt-3 text-lg text-slate-400">Your next adventure is just a tap away. Select a tab below to explore.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Link to="/trips/new" className="inline-flex items-center justify-center bg-amber-400 text-[#0c0f1a] px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-300 hover:scale-105 active:scale-95 transition-all">
            Plan New Trip <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </motion.div>
      </div>

      {/* Interactive Tappable Stats / Tab Cards */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              variants={fadeUp}
              onClick={() => setActiveTab(tab.id)}
              className={`text-left rounded-2xl p-6 transition-all duration-300 relative border cursor-pointer group ${
                isActive 
                  ? `${tab.activeRing} scale-[1.02]` 
                  : 'bg-white/[0.03] border-white/[0.06] hover:border-white/20 hover:bg-white/[0.06]'
              }`}
            >
              {/* Active Tab Pill Indicator */}
              {isActive && (
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/10 text-white backdrop-blur-md border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active View
                </div>
              )}

              <div className="flex items-center mb-3">
                <div className={`p-2.5 rounded-xl mr-3 ${tab.bg}`}>
                  <Icon className={`w-5 h-5 ${tab.color}`} />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-400'}`}>
                  {tab.label}
                </span>
              </div>
              <p className="text-4xl font-extrabold tracking-tight text-white">{tab.value}</p>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-medium">
                Tap to switch view <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-1 transition-transform" />
              </p>
            </motion.button>
          );
        })}
      </motion.div>

      {/* AI Assistant Card Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="mb-10 relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white shadow-2xl shadow-orange-900/20"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-amber-400 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-rose-400 rounded-full blur-3xl opacity-30"></div>
        
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-1.5 flex items-center">
              <Sparkles className="text-amber-300 mr-2.5 w-7 h-7" /> 
              AI Trip Assistant
            </h3>
            <p className="text-orange-100 font-medium text-sm md:text-base max-w-2xl">
              Tell us where you want to go, your budget, and travel style. We'll generate an instant tailored itinerary for you.
            </p>
          </div>
          <Link to="/ai-trip-assistant" className="shrink-0 bg-[#0c0f1a] text-amber-400 hover:bg-slate-900 px-6 py-3.5 rounded-xl font-bold text-sm md:text-base shadow-xl shadow-black/30 transition-all hover:scale-105 active:scale-95 flex items-center">
            Plan with AI <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </motion.div>

      {/* Dynamic Tab Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'recent' && (
          <motion.div 
            key="recent-tab"
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="bg-white/[0.02] border border-white/[0.08] rounded-3xl p-6 md:p-8 backdrop-blur-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <Plane className="w-6 h-6 text-cyan-400" /> Your Recent Trips
                </h3>
                <p className="text-sm text-slate-400 mt-1">Manage and edit your current travel itineraries</p>
              </div>
              <Link to="/trips" className="text-cyan-400 hover:text-cyan-300 text-sm font-bold transition-colors flex items-center gap-1">
                View all ({data?.recentTrips?.length || 0}) <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.recentTrips?.map((trip, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  key={trip.id}
                  className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-cyan-500/40 hover:bg-white/[0.06] transition-all group flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">{trip.name}</h4>
                    <p className="text-sm text-slate-400 mt-1">{trip.startDate} → {trip.endDate}</p>
                    {trip.budgetLimit && (
                      <span className="inline-block mt-2 text-xs font-semibold text-cyan-300/80 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                        Budget: ₹{trip.budgetLimit.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/trips/${trip.id}/build`} 
                      className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                    >
                      Edit
                    </Link>
                  </div>
                </motion.div>
              ))}

              {(!data?.recentTrips || data?.recentTrips?.length === 0) && (
                <div className="col-span-full text-center py-12 text-slate-400">
                  <Plane className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-white">No trips planned yet</p>
                  <p className="text-sm text-slate-400 mt-1 mb-4">Start creating your first adventure itinerary today.</p>
                  <Link to="/trips/new" className="inline-flex items-center gap-2 bg-amber-400 text-slate-900 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-amber-300 transition-all">
                    Create a Trip <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'destinations' && (
          <motion.div 
            key="destinations-tab"
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="bg-white/[0.02] border border-white/[0.08] rounded-3xl p-6 md:p-8 backdrop-blur-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-rose-400" /> Recommended Destinations
                </h3>
                <p className="text-sm text-slate-400 mt-1">Discover popular world-class cities and attractions for your bucket list</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.recommendedCities?.map((city, i) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: i * 0.05 }}
                  key={city.id}
                  className="rounded-2xl overflow-hidden shadow-lg"
                >
                  <Link
                    to={`/trips/new?destination=${encodeURIComponent(city.name)}&country=${encodeURIComponent(city.country)}&coverPhotoUrl=${encodeURIComponent(city.imageUrl || '')}`}
                    className="relative block w-full aspect-[4/3] group cursor-pointer border border-white/10 hover:border-rose-500/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-2xl hover:scale-[1.02]"
                  >
                    <img 
                      src={city.imageUrl} 
                      alt={city.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-0.5" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-between p-5 transition-opacity">
                      <div className="flex justify-between items-start">
                        {city.popularityScore ? (
                          <span className="text-xs font-bold text-amber-300 bg-amber-500/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-amber-500/30">
                            ★ {city.popularityScore} Popular
                          </span>
                        ) : <span />}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-bold bg-rose-600 text-white px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
                          Plan Trip <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>

                      <div className="transform transition-transform duration-300 group-hover:-translate-y-1">
                        <span className="block text-white font-black text-2xl leading-tight drop-shadow-md">{city.name}</span>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="inline-block bg-white/20 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md font-semibold border border-white/10">
                            {city.country}
                          </span>
                          <span className="text-xs font-bold text-rose-300 group-hover:text-rose-200 transition-colors flex items-center gap-1">
                            Tap to plan trip →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}

              {(!data?.recommendedCities || data?.recommendedCities?.length === 0) && (
                <div className="col-span-full text-center py-12 text-slate-400">
                  <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-white">No destinations found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'budget' && (
          <motion.div 
            key="budget-tab"
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="bg-white/[0.02] border border-white/[0.08] rounded-3xl p-6 md:p-8 backdrop-blur-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <IndianRupee className="w-6 h-6 text-amber-400" /> Travel Budget Breakdown
                </h3>
                <p className="text-sm text-slate-400 mt-1">Keep track of your spending, planned allocations, and savings</p>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Wallet className="w-4 h-4 text-cyan-400" /> Total Budget
                </div>
                <p className="text-3xl font-extrabold text-white">₹{totalBudget.toLocaleString('en-IN')}</p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" /> Total Spent
                </div>
                <p className="text-3xl font-extrabold text-amber-400">₹{totalSpent.toLocaleString('en-IN')}</p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Remaining Balance
                </div>
                <p className="text-3xl font-extrabold text-emerald-400">₹{remainingBudget.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Per-Trip Budget Progress Bars */}
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Trip-by-Trip Spending</h4>
              <div className="space-y-4">
                {data?.recentTrips?.map((trip) => {
                  const spent = trip.totalSpent || 0;
                  const limit = trip.budgetLimit || 0;
                  const pct = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
                  const isOver = spent > limit && limit > 0;
                  return (
                    <div key={trip.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                      <div className="flex justify-between items-center mb-2.5">
                        <div>
                          <span className="font-bold text-white text-base">{trip.name}</span>
                          <span className="text-xs text-slate-400 ml-3">{trip.startDate}</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-bold ${isOver ? 'text-rose-400' : 'text-amber-400'}`}>
                            ₹{spent.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-500 font-semibold"> / ₹{limit.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${
                            isOver 
                              ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]' 
                              : pct > 80 
                              ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]' 
                              : 'bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                          }`}
                          style={{ width: `${limit > 0 ? pct : 0}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                        <span>{pct}% of budget utilized</span>
                        {isOver && <span className="text-rose-400 font-semibold">Exceeded by ₹{(spent - limit).toLocaleString('en-IN')}</span>}
                      </div>
                    </div>
                  );
                })}

                {(!data?.recentTrips || data?.recentTrips?.length === 0) && (
                  <p className="text-slate-400 py-4 text-center">No trip budget records available.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
