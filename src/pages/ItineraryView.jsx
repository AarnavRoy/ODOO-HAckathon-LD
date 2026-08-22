import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getTrip, getTripItinerary } from '../api/trips';
import { 
  Calendar, MapPin, Clock, Sparkles, 
  ArrowLeft, Utensils, Camera, Moon, 
  Compass, Wallet, CheckCircle, Edit3
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ItineraryView() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [aiPlan, setAiPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('all'); // 'all' or day index 1..N
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline', 'budget'

  const generateSmartActivitiesForDay = (dayNum, dest) => {
    const titleDest = dest || 'Destination';
    
    if (dayNum === 1) {
      return [
        { id: `auto-${dayNum}-1`, time: '09:30 AM', name: `Arrival & Hotel Check-in at ${titleDest}`, category: 'RELAXATION', cost: 0, description: 'Check-in to accommodation and refresh after travel.' },
        { id: `auto-${dayNum}-2`, time: '01:00 PM', name: `Welcome Lunch & Local Cuisine in ${titleDest}`, category: 'FOOD', cost: 750, description: 'Try signature regional delicacies and popular local eateries.' },
        { id: `auto-${dayNum}-3`, time: '04:30 PM', name: `${titleDest} City Center Exploration`, category: 'CULTURE', cost: 400, description: 'Walk through historic streets, heritage spots, and local markets.' },
        { id: `auto-${dayNum}-4`, time: '08:00 PM', name: 'Sunset Dining & Evening Lounge', category: 'RELAXATION', cost: 1200, description: 'Relax with evening drinks and night views.' }
      ];
    } else if (dayNum % 2 === 0) {
      return [
        { id: `auto-${dayNum}-1`, time: '09:00 AM', name: `Highlight Sightseeing in ${titleDest}`, category: 'SIGHTSEEING', cost: 600, description: 'Visit top-rated monuments, beaches, or scenic viewpoints.' },
        { id: `auto-${dayNum}-2`, time: '01:30 PM', name: 'Gourmet Lunch & Cafe Chill', category: 'FOOD', cost: 900, description: 'Enjoy specialty coffee, desserts, and artisanal dishes.' },
        { id: `auto-${dayNum}-3`, time: '05:00 PM', name: 'Shopping & Artisan Souvenir Hunt', category: 'SHOPPING', cost: 1500, description: 'Pick up local crafts, clothing, and unique souvenirs.' },
        { id: `auto-${dayNum}-4`, time: '08:30 PM', name: 'Night Market & Live Entertainment', category: 'CULTURE', cost: 1000, description: 'Experience the night market and local cultural performances.' }
      ];
    } else {
      return [
        { id: `auto-${dayNum}-1`, time: '10:00 AM', name: `Nature Park & Coastal Trail Walk`, category: 'NATURE', cost: 350, description: 'Enjoy tranquil natural beauty and photo stops.' },
        { id: `auto-${dayNum}-2`, time: '02:00 PM', name: 'Leisurely Lunch & Street Food Tour', category: 'FOOD', cost: 650, description: 'Taste popular local street food favorites.' },
        { id: `auto-${dayNum}-3`, time: '06:00 PM', name: 'Sunset Point & Chill Out Session', category: 'RELAXATION', cost: 500, description: 'Watch the sunset and enjoy peaceful evening vibes.' }
      ];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const tripData = await getTrip(tripId);
        setTrip(tripData);

        const destName = tripData?.destination || tripData?.name || 'Destination';

        // Check if there is a saved AI plan for this trip in localStorage
        const storedAiPlan = localStorage.getItem(`ai_trip_plan_${tripId}`);
        let planData = null;

        if (storedAiPlan) {
          try {
            planData = JSON.parse(storedAiPlan);
          } catch (e) {
            console.error('Failed to parse AI plan', e);
          }
        }

        if (!planData) {
          try {
            const itin = await getTripItinerary(tripId);
            if (itin && itin.days && itin.days.length > 0) {
              planData = {
                tripName: tripData?.name || 'My Trip',
                destination: destName,
                duration: itin.days.length,
                budget: tripData?.budgetLimit || 20000,
                estimatedCost: tripData?.budgetLimit || 18000,
                budgetStatus: 'within',
                days: itin.days.map((d, idx) => {
                  const rawActivities = d.stops.flatMap(s => s.activities.map(a => ({
                    id: a.id,
                    time: a.startTime || '10:00 AM',
                    name: a.activity?.name || 'Activity',
                    category: a.activity?.category || 'SIGHTSEEING',
                    cost: a.cost || 0,
                    description: a.notes || 'Explore and enjoy this location.',
                  })));

                  return {
                    dayNumber: idx + 1,
                    title: `Day ${idx + 1} - ${new Date(d.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`,
                    activities: rawActivities.length > 0 ? rawActivities : generateSmartActivitiesForDay(idx + 1, destName)
                  };
                }),
                recommendations: [
                  `Keep local currency handy for minor expenses in ${destName}.`,
                  'Pre-book popular attractions to skip queues.'
                ]
              };
            }
          } catch (err) {
            console.error(err);
          }
        }

        // Fallback plan if planData is still null
        if (!planData || !planData.days || planData.days.length === 0) {
          planData = createFallbackPlan(tripData);
        }

        // Ensure NO day has empty activities
        if (planData && planData.days) {
          planData.days = planData.days.map(day => ({
            ...day,
            activities: (day.activities && day.activities.length > 0)
              ? day.activities
              : generateSmartActivitiesForDay(day.dayNumber, destName)
          }));
        }

        setAiPlan(planData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tripId]);

  const createFallbackPlan = (tripData) => {
    const dest = tripData?.destination || tripData?.name || 'Destination';
    return {
      tripName: tripData?.name || 'AI Trip Plan',
      destination: dest,
      duration: 3,
      budget: tripData?.budgetLimit || 25000,
      estimatedCost: Math.floor((tripData?.budgetLimit || 25000) * 0.85),
      budgetStatus: 'within',
      expenses: { transport: 4000, stay: 9000, food: 5000, activities: 3000 },
      days: [1, 2, 3].map(dayNum => ({
        dayNumber: dayNum,
        title: `Day ${dayNum}: Exploration of ${dest}`,
        activities: generateSmartActivitiesForDay(dayNum, dest)
      })),
      recommendations: [
        `Book local guides in advance during peak season in ${dest}.`,
        'Keep digital copies of tickets and travel IDs on your phone.'
      ]
    };
  };

  const getCategoryIcon = (category) => {
    switch (category?.toUpperCase()) {
      case 'FOOD': return <Utensils className="w-3.5 h-3.5 text-amber-700" />;
      case 'CULTURE': return <Compass className="w-3.5 h-3.5 text-blue-700" />;
      case 'RELAXATION': return <Moon className="w-3.5 h-3.5 text-purple-700" />;
      case 'SIGHTSEEING': return <Camera className="w-3.5 h-3.5 text-rose-700" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-yellow-700" />;
    }
  };

  if (loading) {
    return (
      <AppLayout title="Trip Itinerary">
        <div className="text-center py-20 text-slate-500 animate-pulse font-semibold">
          Loading Day-wise Plan...
        </div>
      </AppLayout>
    );
  }

  const activeDays = selectedDay === 'all' 
    ? aiPlan?.days || [] 
    : (aiPlan?.days || []).filter(d => d.dayNumber === Number(selectedDay));

  return (
    <AppLayout title={trip?.name || 'Trip Details'}>
      {/* Back Button & Action Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link to="/trips" className="inline-flex items-center text-slate-600 hover:text-black text-sm font-bold transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Trips
        </Link>

        <div className="flex items-center space-x-3">
          <Link 
            to={`/trips/${tripId}/build`}
            className="inline-flex items-center bg-black hover:bg-yellow-400 hover:text-black text-white px-6 py-3 rounded-full font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <Edit3 className="w-4 h-4 mr-2" /> Edit Trip & Activities
          </Link>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-100 p-8 md:p-10 mb-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-900 border border-yellow-300">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-yellow-700" /> Plan Overview
              </span>
              <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> {trip?.startDate || '2026-08-22'} → {trip?.endDate || '2026-08-27'}
              </span>
              {aiPlan?.days?.length > 0 && (
                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {aiPlan.days.length} Days Plan
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
              {trip?.name || aiPlan?.tripName || 'Goa Explorer'}
            </h1>
            <p className="text-slate-600 font-medium flex items-center text-base">
              <MapPin className="w-4 h-4 mr-1.5 text-slate-900 shrink-0" />
              {trip?.destination || aiPlan?.destination || 'Goa'} 
              {trip?.description && <span className="ml-3 text-slate-500">• {trip.description}</span>}
            </p>
          </div>

          {/* Budget Metric Box */}
          <div className="bg-[#FEFCE8] border border-yellow-200 p-6 rounded-3xl shrink-0 w-full md:w-auto text-slate-900">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Estimated Budget
            </span>
            <div className="text-3xl font-black text-slate-900">
              ₹{aiPlan?.estimatedCost?.toLocaleString('en-IN') || trip?.budgetLimit?.toLocaleString('en-IN') || '20,000'}
            </div>
            <div className="text-xs text-slate-600 mt-1.5 flex items-center font-medium">
              <Wallet className="w-3.5 h-3.5 mr-1 text-slate-900" />
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
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              selectedDay === 'all'
                ? 'bg-black text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Days ({aiPlan?.days?.length || 0})
          </button>
          {aiPlan?.days?.map(d => (
            <button
              key={d.dayNumber}
              onClick={() => setSelectedDay(String(d.dayNumber))}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedDay === String(d.dayNumber)
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Day {d.dayNumber}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-white p-1.5 rounded-full border border-slate-200 shadow-sm shrink-0">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              viewMode === 'timeline' ? 'bg-yellow-400 text-black shadow-sm' : 'text-slate-600 hover:text-black'
            }`}
          >
            Day Timeline
          </button>
          <button
            onClick={() => setViewMode('budget')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              viewMode === 'budget' ? 'bg-yellow-400 text-black shadow-sm' : 'text-slate-600 hover:text-black'
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
              className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm"
            >
              {/* Day Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-yellow-700 block mb-1">
                    Day {day.dayNumber}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900">
                    {day.title}
                  </h3>
                </div>
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3.5 py-1.5 rounded-full border border-slate-200">
                  {day.activities?.length || 0} Activities
                </span>
              </div>

              {/* Time-slotted Activities Timeline */}
              <div className="relative pl-6 md:pl-8 space-y-6 before:absolute before:left-2.5 md:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {day.activities?.map((act) => (
                  <div key={act.id} className="relative group">
                    {/* Timeline Node */}
                    <div className="absolute -left-6 md:-left-8 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-black flex items-center justify-center group-hover:scale-125 transition-transform">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                    </div>

                    {/* Activity Card */}
                    <div className="bg-[#FEFCE8]/50 border border-yellow-100 hover:border-yellow-300 rounded-2xl p-5 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-bold text-slate-900 bg-yellow-200/80 px-3 py-1 rounded-full flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1" /> {act.time}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                            {getCategoryIcon(act.category)}
                            <span className="ml-1.5">{act.category}</span>
                          </span>
                        </div>
                        {act.cost > 0 && (
                          <span className="text-sm font-black text-slate-900 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                            ₹{act.cost.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg font-bold text-slate-900 mb-1">
                        {act.name}
                      </h4>
                      {act.description && (
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                          {act.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* BUDGET & INSIGHTS VIEW */}
      {viewMode === 'budget' && (() => {
        const totalB = aiPlan?.budget || trip?.budgetLimit || aiPlan?.estimatedCost || 5000;
        const stayCost = aiPlan?.expenses?.stay ?? Math.floor(totalB * 0.35);
        const transportCost = aiPlan?.expenses?.transport ?? Math.floor(totalB * 0.25);
        const foodCost = aiPlan?.expenses?.food ?? Math.floor(totalB * 0.25);
        const activitiesCost = aiPlan?.expenses?.activities ?? Math.floor(totalB * 0.15);
        const totalEst = stayCost + transportCost + foodCost + activitiesCost;

        const expenseItems = [
          { label: 'Accommodation / Stay', cost: stayCost, color: 'bg-yellow-400' },
          { label: 'Transport & Transfers', cost: transportCost, color: 'bg-slate-900' },
          { label: 'Food & Dining', cost: foodCost, color: 'bg-amber-500' },
          { label: 'Activities & Sightseeing', cost: activitiesCost, color: 'bg-yellow-600' }
        ];

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Budget Breakdown */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center">
                <Wallet className="w-5 h-5 text-slate-900 mr-2" /> Expense Breakdown
              </h3>
              <div className="space-y-4">
                {expenseItems.map((exp, i) => (
                  <div key={i} className="bg-[#FEFCE8]/40 p-4 rounded-2xl border border-yellow-100">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-slate-700 font-bold">{exp.label}</span>
                      <span className="text-slate-900 font-black">₹{exp.cost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${exp.color}`} 
                        style={{ width: `${Math.min((exp.cost / (totalEst || 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights & Recommendations */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center">
                <Sparkles className="w-5 h-5 text-yellow-500 mr-2" /> Smart Recommendations
              </h3>
              <div className="space-y-4">
                {aiPlan?.recommendations?.map((rec, i) => (
                  <div key={i} className="flex items-start p-4 rounded-2xl bg-yellow-50/80 border border-yellow-200">
                    <CheckCircle className="w-5 h-5 text-yellow-600 mr-3 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </AppLayout>
  );
}
