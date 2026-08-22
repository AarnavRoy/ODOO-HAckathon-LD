import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getTrip, getTripItinerary } from '../api/trips';
import { 
  Calendar, MapPin, Clock, DollarSign, Sparkles, 
  ChevronRight, ArrowLeft, Utensils, Camera, Moon, 
  Compass, Wallet, CheckCircle, Edit3, Shield, Info, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ItineraryView() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [aiPlan, setAiPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('all'); // 'all' or day index 1..N
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline', 'budget', 'calendar'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const tripData = await getTrip(tripId);
        setTrip(tripData);

        // Check if there is a saved AI plan for this trip in localStorage
        const storedAiPlan = localStorage.getItem(`ai_trip_plan_${tripId}`);
        if (storedAiPlan) {
          try {
            setAiPlan(JSON.parse(storedAiPlan));
          } catch (e) {
            console.error('Failed to parse AI plan', e);
          }
        } else {
          // If no stored AI plan, fetch backend itinerary or generate a fallback day plan
          try {
            const itin = await getTripItinerary(tripId);
            if (itin && itin.days && itin.days.length > 0) {
              setAiPlan({
                tripName: tripData?.name || 'My Trip',
                destination: tripData?.destination || tripData?.name || 'Destination',
                duration: itin.days.length,
                budget: tripData?.budgetLimit || 20000,
                estimatedCost: tripData?.budgetLimit || 18000,
                budgetStatus: 'within',
                days: itin.days.map((d, idx) => ({
                  dayNumber: idx + 1,
                  title: `Day ${idx + 1} - ${new Date(d.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`,
                  activities: d.stops.flatMap(s => s.activities.map(a => ({
                    id: a.id,
                    time: a.startTime || '10:00 AM',
                    name: a.activity?.name || 'Activity',
                    category: a.activity?.category || 'SIGHTSEEING',
                    cost: a.cost || 0,
                    description: a.notes || 'Explore and enjoy this location.',
                  })))
                })),
                recommendations: [
                  'Keep local currency handy for minor expenses.',
                  'Pre-book popular attractions to skip queues.'
                ]
              });
            } else {
              // Generate standard fallback 3-day itinerary
              setAiPlan(createFallbackPlan(tripData));
            }
          } catch {
            setAiPlan(createFallbackPlan(tripData));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tripId]);

  const createFallbackPlan = (tripData) => {
    const dest = tripData?.name || 'Destination';
    return {
      tripName: tripData?.name || 'AI Trip Plan',
      destination: dest,
      duration: 3,
      budget: tripData?.budgetLimit || 25000,
      estimatedCost: Math.floor((tripData?.budgetLimit || 25000) * 0.85),
      budgetStatus: 'within',
      expenses: { transport: 4000, stay: 9000, food: 5000, activities: 3000 },
      days: [
        {
          dayNumber: 1,
          title: 'Arrival & City Orientation',
          activities: [
            { id: 'f-1-1', time: '09:00 AM', name: `Arrive in ${dest} & Hotel Check-in`, category: 'RELAXATION', cost: 0, description: 'Settle down, unpack, and refresh after arrival.' },
            { id: 'f-1-2', time: '01:00 PM', name: 'Welcome Lunch at Local Hotspot', category: 'FOOD', cost: 800, description: 'Enjoy authentic regional food and popular local dishes.' },
            { id: 'f-1-3', time: '04:30 PM', name: 'Historic City Center Walking Tour', category: 'CULTURE', cost: 500, description: 'Explore iconic landmarks, street art, and culture.' },
            { id: 'f-1-4', time: '08:00 PM', name: 'Sunset Dinner & Evening Promenade', category: 'RELAXATION', cost: 1200, description: 'Relax with evening drinks and ambient atmosphere.' }
          ]
        },
        {
          dayNumber: 2,
          title: 'Adventure & Highlight Sightseeing',
          activities: [
            { id: 'f-2-1', time: '09:30 AM', name: 'Famous Landmark & Viewpoint Visit', category: 'SIGHTSEEING', cost: 600, description: 'Capture panoramic views and photography spots.' },
            { id: 'f-2-2', time: '01:30 PM', name: 'Artisan Market & Shopping District', category: 'SHOPPING', cost: 1500, description: 'Shop for handcrafted souvenirs and local specialties.' },
            { id: 'f-2-3', time: '06:00 PM', name: 'Cultural Performance & Gourmet Dinner', category: 'CULTURE', cost: 2000, description: 'Experience live cultural shows and fine local dining.' }
          ]
        },
        {
          dayNumber: 3,
          title: 'Hidden Gems & Departure',
          activities: [
            { id: 'f-3-1', time: '10:00 AM', name: 'Scenic Nature Park Walk', category: 'NATURE', cost: 300, description: 'Unwind amidst peaceful gardens and lush natural surroundings.' },
            { id: 'f-3-2', time: '02:00 PM', name: 'Farewell Cafe & Souvenir Pickup', category: 'FOOD', cost: 700, description: 'Last-minute coffee, dessert, and souvenir shopping.' },
            { id: 'f-3-3', time: '06:00 PM', name: 'Departure Transfer', category: 'TRANSPORT', cost: 1000, description: 'Head to airport/station for departure.' }
          ]
        }
      ],
      recommendations: [
        `Book local guides in advance during peak season in ${dest}.`,
        'Keep digital copies of tickets and travel IDs on your phone.'
      ]
    };
  };

  const getCategoryIcon = (category) => {
    switch (category?.toUpperCase()) {
      case 'FOOD': return <Utensils className="w-4 h-4 text-orange-400" />;
      case 'CULTURE': return <Compass className="w-4 h-4 text-violet-400" />;
      case 'RELAXATION': return <Moon className="w-4 h-4 text-cyan-400" />;
      case 'SIGHTSEEING': return <Camera className="w-4 h-4 text-rose-400" />;
      default: return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  if (loading) {
    return (
      <AppLayout title="Trip Itinerary">
        <div className="text-center py-20 text-slate-500 animate-pulse font-semibold">
          Loading AI Day-wise Plan...
        </div>
      </AppLayout>
    );
  }

  const activeDays = selectedDay === 'all' 
    ? aiPlan?.days || [] 
    : (aiPlan?.days || []).filter(d => d.dayNumber === Number(selectedDay));

  return (
    <AppLayout title={trip?.name || 'Trip Details'}>
      {/* Back Button & Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link to="/trips" className="inline-flex items-center text-slate-400 hover:text-white text-sm font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Trips
        </Link>

        <div className="flex items-center space-x-3">
          <Link 
            to={`/trips/${tripId}/build`}
            className="inline-flex items-center bg-amber-400 hover:bg-amber-300 text-[#0c0f1a] px-5 py-2.5 rounded-xl font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Edit3 className="w-4 h-4 mr-2" /> Edit Trip & Activities
          </Link>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-white/10 p-8 md:p-10 mb-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI Generated Plan
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                <Calendar className="w-3.5 h-3.5 mr-1.5" /> {trip?.startDate || '2026-08-22'} → {trip?.endDate || '2026-08-27'}
              </span>
              {aiPlan?.duration && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-purple-400/20 text-purple-300 border border-purple-400/30">
                  {aiPlan.duration} Days Plan
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md mb-2">
              {trip?.name || aiPlan?.tripName || 'Goa Explorer'}
            </h1>
            <p className="text-slate-400 font-medium flex items-center text-base">
              <MapPin className="w-4 h-4 mr-1.5 text-rose-400 shrink-0" />
              {trip?.destination || aiPlan?.destination || 'Goa'} 
              {trip?.description && <span className="ml-3 text-slate-500">• {trip.description}</span>}
            </p>
          </div>

          {/* Budget Metric Box */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shrink-0 w-full md:w-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Estimated Budget
            </span>
            <div className="text-3xl font-extrabold text-amber-400">
              ₹{aiPlan?.estimatedCost?.toLocaleString('en-IN') || trip?.budgetLimit?.toLocaleString('en-IN') || '20,000'}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center">
              <Wallet className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Budget Limit: ₹{trip?.budgetLimit?.toLocaleString('en-IN') || aiPlan?.budget?.toLocaleString('en-IN') || '20,000'}
            </div>
          </div>
        </div>
      </div>

      {/* Main View Mode Controls & Day Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        
        {/* Day Selector Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 max-w-full">
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
              selectedDay === 'all'
                ? 'bg-amber-400 text-[#0c0f1a] shadow-lg shadow-amber-500/20'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            All Days ({aiPlan?.days?.length || 0})
          </button>
          {aiPlan?.days?.map(d => (
            <button
              key={d.dayNumber}
              onClick={() => setSelectedDay(String(d.dayNumber))}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                selectedDay === String(d.dayNumber)
                  ? 'bg-amber-400 text-[#0c0f1a] shadow-lg shadow-amber-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Day {d.dayNumber}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${
              viewMode === 'timeline' ? 'bg-amber-400 text-[#0c0f1a]' : 'text-slate-400 hover:text-white'
            }`}
          >
            Day Timeline
          </button>
          <button
            onClick={() => setViewMode('budget')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${
              viewMode === 'budget' ? 'bg-amber-400 text-[#0c0f1a]' : 'text-slate-400 hover:text-white'
            }`}
          >
            Budget & Insights
          </button>
        </div>
      </div>

      {/* VIEW CONTENT */}
      {viewMode === 'timeline' && (
        <div className="space-y-8">
          {activeDays.map((day) => (
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              key={day.dayNumber}
              className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 md:p-8"
            >
              {/* Day Header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 block mb-1">
                    Day {day.dayNumber}
                  </span>
                  <h3 className="text-xl md:text-2xl font-extrabold text-white">
                    {day.title}
                  </h3>
                </div>
                <span className="bg-white/5 text-slate-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-white/5">
                  {day.activities?.length || 0} Activities
                </span>
              </div>

              {/* Time-slotted Activities Timeline */}
              <div className="relative pl-6 md:pl-8 space-y-6 before:absolute before:left-2.5 md:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
                {day.activities?.map((act) => (
                  <div key={act.id} className="relative group">
                    {/* Timeline Node */}
                    <div className="absolute -left-6 md:-left-8 top-1.5 w-5 h-5 rounded-full bg-[#0c0f1a] border-2 border-amber-400 flex items-center justify-center group-hover:scale-125 transition-transform">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                    </div>

                    {/* Activity Card */}
                    <div className="bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/30 rounded-2xl p-5 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1" /> {act.time}
                          </span>
                          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                            {getCategoryIcon(act.category)}
                            <span className="ml-1.5">{act.category}</span>
                          </span>
                        </div>
                        {act.cost > 0 && (
                          <span className="text-sm font-extrabold text-emerald-400">
                            ₹{act.cost.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg font-extrabold text-white mb-1 group-hover:text-amber-400 transition-colors">
                        {act.name}
                      </h4>
                      {act.description && (
                        <p className="text-sm text-slate-400 font-medium leading-relaxed">
                          {act.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {(!day.activities || day.activities.length === 0) && (
                  <p className="text-slate-500 text-sm italic py-4">No activities scheduled for this day.</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* BUDGET & INSIGHTS VIEW */}
      {viewMode === 'budget' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Budget Breakdown */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8">
            <h3 className="text-xl font-extrabold text-white mb-6 flex items-center">
              <Wallet className="w-5 h-5 text-emerald-400 mr-2" /> Expense Breakdown
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Accommodation / Stay', cost: aiPlan?.expenses?.stay || 8000, color: 'bg-purple-500' },
                { label: 'Transport & Transfers', cost: aiPlan?.expenses?.transport || 4000, color: 'bg-cyan-500' },
                { label: 'Food & Dining', cost: aiPlan?.expenses?.food || 4500, color: 'bg-orange-500' },
                { label: 'Activities & Sightseeing', cost: aiPlan?.expenses?.activities || 3500, color: 'bg-rose-500' }
              ].map((exp, i) => (
                <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-slate-300 font-bold">{exp.label}</span>
                    <span className="text-white font-extrabold">₹{exp.cost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${exp.color}`} 
                      style={{ width: `${Math.min((exp.cost / (aiPlan?.estimatedCost || 20000)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights & Recommendations */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8">
            <h3 className="text-xl font-extrabold text-white mb-6 flex items-center">
              <Sparkles className="w-5 h-5 text-amber-400 mr-2" /> AI Smart Recommendations
            </h3>
            <div className="space-y-4">
              {aiPlan?.recommendations?.map((rec, i) => (
                <div key={i} className="flex items-start p-4 rounded-2xl bg-white/5 border border-white/5">
                  <CheckCircle className="w-5 h-5 text-amber-400 mr-3 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
