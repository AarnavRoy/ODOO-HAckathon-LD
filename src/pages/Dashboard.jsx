import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getDashboard } from '../api/trips';
import { getMe } from '../api/auth';
import { 
  Plane, MapPin, IndianRupee, ArrowRight, Sparkles, TrendingUp, 
  Wallet, CheckCircle2, Map, Navigation, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } } };

// Mock data for 30 Iconic Landmarks
const landmarks = [
  { id: 1, name: "Taj Mahal", location: "Agra, India", img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Grand Canyon", location: "Arizona, USA", img: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "Eiffel Tower", location: "Paris, France", img: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80" },
  { id: 4, name: "Mount Fuji", location: "Honshu, Japan", img: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80" },
  { id: 5, name: "Colosseum", location: "Rome, Italy", img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80" },
  { id: 6, name: "Banff National Park", location: "Alberta, Canada", img: "https://images.unsplash.com/photo-1549880181-56a44cf4a9a5?auto=format&fit=crop&w=800&q=80" },
  { id: 7, name: "Machu Picchu", location: "Cusco Region, Peru", img: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=800&q=80" },
  { id: 8, name: "Great Wall", location: "Beijing, China", img: "https://images.unsplash.com/photo-1508804185872-d7bad10d0371?auto=format&fit=crop&w=800&q=80" },
  { id: 9, name: "Santorini", location: "Cyclades, Greece", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac542?auto=format&fit=crop&w=800&q=80" },
  { id: 10, name: "Petra", location: "Ma'an, Jordan", img: "https://images.unsplash.com/photo-1579606037160-c3d386d495b4?auto=format&fit=crop&w=800&q=80" },
  { id: 11, name: "Angkor Wat", location: "Siem Reap, Cambodia", img: "https://images.unsplash.com/photo-1563212869-7c189b2760bf?auto=format&fit=crop&w=800&q=80" },
  { id: 12, name: "Pyramids of Giza", location: "Cairo, Egypt", img: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80" },
  { id: 13, name: "Bora Bora", location: "Society Islands, French Polynesia", img: "https://images.unsplash.com/photo-1533230615438-e4b2d182283f?auto=format&fit=crop&w=800&q=80" },
  { id: 14, name: "Sydney Opera House", location: "Sydney, Australia", img: "https://images.unsplash.com/photo-1523428096881-5bd79d043006?auto=format&fit=crop&w=800&q=80" },
  { id: 15, name: "Sagrada Familia", location: "Barcelona, Spain", img: "https://images.unsplash.com/photo-1567117540939-514df5a92d6e?auto=format&fit=crop&w=800&q=80" },
  { id: 16, name: "Hawa Mahal", location: "Jaipur, India", img: "https://images.unsplash.com/photo-1599661559684-25bef6cbfb60?auto=format&fit=crop&w=800&q=80" },
  { id: 17, name: "Niagara Falls", location: "Ontario/New York", img: "https://images.unsplash.com/photo-1489447068241-b3490214e879?auto=format&fit=crop&w=800&q=80" },
  { id: 18, name: "Mount Everest", location: "Himalayas, Nepal", img: "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80" },
  { id: 19, name: "Big Ben", location: "London, UK", img: "https://images.unsplash.com/photo-1529655683823-dc58689f4175?auto=format&fit=crop&w=800&q=80" },
  { id: 20, name: "Burj Khalifa", location: "Dubai, UAE", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80" },
  { id: 21, name: "Table Mountain", location: "Cape Town, SA", img: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80" },
  { id: 22, name: "Golden Gate Bridge", location: "San Francisco, USA", img: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80" },
  { id: 23, name: "Venice Canals", location: "Venice, Italy", img: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80" },
  { id: 24, name: "Yellowstone", location: "Wyoming, USA", img: "https://images.unsplash.com/photo-1503925785028-1b2ea13eb385?auto=format&fit=crop&w=800&q=80" }
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent'); // 'recent' | 'destinations' | 'budget'
  const [viewAllLandmarks, setViewAllLandmarks] = useState(false);
  const carouselRef = useRef(null);

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

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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

  // Calculate budget statistics
  const totalBudget = data?.recentTrips?.reduce((acc, t) => acc + (t.budgetLimit || 0), 0) || 0;
  const totalSpent = data?.budgetHighlights?.totalSpent || 0;
  const remainingBudget = Math.max(0, totalBudget - totalSpent);

  return (
    <AppLayout title="Dashboard">
      {/* Welcome Banner */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Traveler'}! 
            <span className="inline-block animate-bounce">👋</span>
          </h2>
          <p className="text-slate-500 mt-1 text-base font-medium">Ready to design your next journey across the world?</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <Link 
            to="/admin" 
            className="inline-flex items-center gap-2 bg-white/80 border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold px-6 py-3.5 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-sm"
          >
            <ShieldCheck className="w-4 h-4 text-amber-500" /> Admin Portal
          </Link>
          <Link 
            to="/trips/new" 
            className="inline-flex items-center gap-2 bg-black text-white hover:bg-yellow-400 hover:text-black font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm"
          >
            <Sparkles className="w-4 h-4" /> Plan a New Trip
          </Link>
        </div>
      </motion.div>

      {/* Interactive Tabs Top Grid */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              variants={fadeUp}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`p-6 rounded-3xl border transition-all text-left relative overflow-hidden cursor-pointer ${
                isActive 
                  ? 'bg-white border-black shadow-md shadow-black/5 scale-[1.02]' 
                  : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3.5 rounded-full ${tab.bg} ${tab.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isActive ? 'bg-black text-white' : 'bg-slate-100 text-slate-500'} transition-all`}>
                  {isActive ? 'Active View' : 'Tap to View'}
                </span>
              </div>
              <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{tab.label}</h4>
              <p className="text-3xl font-black text-slate-900 mt-1">{tab.value}</p>
            </motion.button>
          );
        })}
      </motion.div>

      {/* 30 Iconic Landmarks Section */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Map className="w-6 h-6 text-black" /> Explore Iconic Landmarks
            </h3>
            <p className="text-slate-500 text-sm mt-1">Scroll through famous wonders of the world or view them all</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => scrollCarousel('left')}
              className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 transition-all hover:-translate-y-0.5 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scrollCarousel('right')}
              className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 transition-all hover:-translate-y-0.5 shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewAllLandmarks(!viewAllLandmarks)}
              className="ml-2 bg-black hover:bg-yellow-400 text-white hover:text-black px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md"
            >
              {viewAllLandmarks ? 'Show Carousel' : 'View All'}
            </button>
          </div>
        </div>

        {viewAllLandmarks ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {landmarks.map((l) => (
              <Link 
                to={`/trips/new?destination=${encodeURIComponent(l.name)}&country=${encodeURIComponent(l.location)}&coverPhotoUrl=${encodeURIComponent(l.img)}`}
                key={l.id} 
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] border border-white/10 hover:border-amber-400/50 shadow-lg transition-all"
              >
                <img src={l.img} alt={l.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                  <h4 className="text-white font-bold text-base">{l.name}</h4>
                  <p className="text-xs text-amber-400/90 font-medium">{l.location}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div 
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {landmarks.map((l) => (
              <Link
                to={`/trips/new?destination=${encodeURIComponent(l.name)}&country=${encodeURIComponent(l.location)}&coverPhotoUrl=${encodeURIComponent(l.img)}`}
                key={l.id}
                className="flex-shrink-0 w-72 h-48 relative rounded-2xl overflow-hidden group cursor-pointer border border-white/10 hover:border-amber-400/50 snap-start shadow-lg transition-all"
              >
                <img src={l.img} alt={l.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 flex flex-col justify-end">
                  <h4 className="text-white font-bold text-base leading-tight group-hover:text-amber-400 transition-colors">{l.name}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-300 font-medium">{l.location}</span>
                    <span className="text-[10px] text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-full font-bold">Plan ➔</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* AI Assistant Banner */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-12 p-6 rounded-3xl bg-white border border-slate-100 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-yellow-400 text-black rounded-full shadow-inner">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900">Ask GlobeTrotter AI</h4>
            <p className="text-sm text-slate-500 font-medium mt-1">Generate personalized multi-city itineraries, smart budget splits, and packing checklists.</p>
          </div>
        </div>
        <Link to="/ai-planner" className="bg-black text-white hover:bg-yellow-400 hover:text-black font-bold px-6 py-3 rounded-full text-sm transition-all shrink-0 shadow-lg">
          Try AI Planner ✨
        </Link>
      </motion.div>

      {/* TAB CONTENT SWITCHER */}
      <AnimatePresence mode="wait">
        {activeTab === 'recent' && (
          <motion.div 
            key="recent-tab"
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                   Your Recent Trips
                </h3>
                <p className="text-sm text-slate-500 mt-1">Manage and view your ongoing and upcoming trip itineraries</p>
              </div>
              <Link to="/trips" className="text-black hover:text-yellow-600 text-sm font-bold transition-colors flex items-center gap-1 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md">
                View All Trips <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.recentTrips?.map((trip, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.05 }}
                  key={trip.id}
                  className="p-6 rounded-3xl bg-white border border-slate-100 hover:border-yellow-400 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all group flex flex-col justify-between"
                >
                  <div className="mb-6">
                    <h4 className="font-bold text-xl text-slate-900 transition-colors line-clamp-2 leading-tight">
                      {trip.name}
                    </h4>
                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
                      📅 {trip.startDate} <ArrowRight className="w-3 h-3" /> {trip.endDate}
                    </p>
                    {trip.budgetLimit && (
                      <div className="mt-3 inline-flex">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                          Budget: ₹{trip.budgetLimit.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-end">
                    <Link 
                      to={`/trips/${trip.id}/build`} 
                      className="bg-black hover:bg-yellow-400 text-white hover:text-black px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md"
                    >
                      Edit Trip
                    </Link>
                  </div>
                </motion.div>
              ))}

              {(!data?.recentTrips || data?.recentTrips?.length === 0) && (
                <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
                  <Plane className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-xl font-bold text-slate-900">No trips planned yet</p>
                  <p className="text-sm text-slate-500 mt-1 mb-6">Start creating your first adventure itinerary today.</p>
                  <Link to="/trips/new" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-yellow-400 hover:text-black transition-all shadow-lg">
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
            className="w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                   Recommended Destinations
                </h3>
                <p className="text-sm text-slate-500 mt-1">Discover popular world-class cities and attractions for your bucket list</p>
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
                <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
                  <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-xl font-bold text-slate-900">No destinations found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

          <motion.div 
            key="budget-tab"
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                   Travel Budget Breakdown
                </h3>
                <p className="text-sm text-slate-500 mt-1">Keep track of your spending, planned allocations, and savings</p>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">
                  <Wallet className="w-5 h-5 text-black" /> Total Budget
                </div>
                <p className="text-4xl font-extrabold text-slate-900">₹{totalBudget.toLocaleString('en-IN')}</p>
              </div>

              <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">
                  <TrendingUp className="w-5 h-5 text-black" /> Total Spent
                </div>
                <p className="text-4xl font-extrabold text-slate-900">₹{totalSpent.toLocaleString('en-IN')}</p>
              </div>

              <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">
                  <CheckCircle2 className="w-5 h-5 text-black" /> Remaining Balance
                </div>
                <p className="text-4xl font-extrabold text-emerald-600">₹{remainingBudget.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Per-Trip Budget Progress Bars */}
            <div>
              <h4 className="text-xl font-bold text-slate-900 mb-6">Trip-by-Trip Spending</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data?.recentTrips?.map((trip) => {
                  const spent = trip.totalSpent || 0;
                  const limit = trip.budgetLimit || 0;
                  const pct = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
                  const isOver = spent > limit && limit > 0;
                  return (
                    <div key={trip.id} className="p-6 rounded-3xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <span className="font-bold text-slate-900 text-lg">{trip.name}</span>
                          <span className="text-xs text-slate-500 font-medium block mt-1">{trip.startDate}</span>
                        </div>
                        <div className="text-right bg-slate-50 px-4 py-2 rounded-2xl">
                          <span className={`text-base font-black ${isOver ? 'text-red-500' : 'text-slate-900'}`}>
                            ₹{spent.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-500 font-bold block"> / ₹{limit.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${
                            isOver 
                              ? 'bg-red-500' 
                              : pct > 80 
                              ? 'bg-yellow-400' 
                              : 'bg-black'
                          }`}
                          style={{ width: `${limit > 0 ? pct : 0}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-3 text-xs font-bold text-slate-500">
                        <span>{pct}% utilized</span>
                        {isOver && <span className="text-red-500 bg-red-50 px-2 py-1 rounded-md">Exceeded by ₹{(spent - limit).toLocaleString('en-IN')}</span>}
                      </div>
                    </div>
                  );
                })}

                {(!data?.recentTrips || data?.recentTrips?.length === 0) && (
                  <p className="text-slate-500 py-6 text-center w-full">No trip budget records available.</p>
                )}
              </div>
            </div>
          </motion.div>
      </AnimatePresence>
    </AppLayout>
  );
}
