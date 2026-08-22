import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Calendar, Users, Wallet, CheckCircle, RefreshCw, Save, ArrowLeft, Loader2, TrendingDown, Coffee, Activity, Utensils, Edit3 } from 'lucide-react';
import { generateTripItinerary, refineTripItinerary, saveAITrip } from '../api/ai';
import { importAITrip } from '../api/trips';
import { searchDestinations } from '../data/destinations';


export default function AITripAssistant() {
  const navigate = useNavigate();
  const [step, setStep] = useState('input'); // 'input', 'loading', 'result'
  
  // Input State
  const [preferences, setPreferences] = useState({
    destination: '',
    duration: '5',
    budget: '20000',
    travelers: '2',
    style: [],
    pace: 'balanced',
    additional: ''
  });

  // Destination autocomplete
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const destRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (destRef.current && !destRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDestinationChange = (value) => {
    setPreferences({ ...preferences, destination: value });
    if (value.trim().length > 0) {
      const matches = searchDestinations(value);
      setFilteredDestinations(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectDestination = (dest) => {
    setPreferences({ ...preferences, destination: dest });
    setShowSuggestions(false);
  };

  const [loadingText, setLoadingText] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Result State
  const [tripData, setTripData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedTripId, setSavedTripId] = useState(null);

  const handleStyleToggle = (style) => {
    setPreferences(prev => {
      const exists = prev.style.includes(style);
      return {
        ...prev,
        style: exists ? prev.style.filter(s => s !== style) : [...prev.style, style]
      };
    });
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setStep('loading');
    setLoadingProgress(0);
    
    try {
      const result = await generateTripItinerary(preferences, (text, progress) => {
        setLoadingText(text);
        setLoadingProgress(progress);
      });
      setTripData(result);
      setStep('result');
    } catch (err) {
      console.error('AI Generation Failed:', err);
      alert(err.message || 'Failed to generate trip. Please try again.');
      setStep('input');
    }
  };

  const handleRefine = async (action) => {
    setStep('loading');
    try {
      const result = await refineTripItinerary(tripData, action, (text, progress) => {
        setLoadingText(text);
        setLoadingProgress(progress);
      });
      setTripData(result);
      setStep('result');
    } catch (err) {
      console.error(err);
      setStep('result');
    }
  };

  const handleSaveTrip = async () => {
    setIsSaving(true);
    try {
      let savedTrip = null;
      try {
        savedTrip = await saveAITrip(tripData);
      } catch (e) {
        console.warn('saveAITrip backend call failed, attempting fallback importAITrip', e);
        const payload = {
          tripName: tripData.tripName,
          startCityName: "", 
          destinationName: tripData.destination,
          duration: tripData.duration,
          budget: tripData.budget,
          startDate: new Date().toISOString().split('T')[0],
          days: (tripData.days || []).map(day => ({
             dayNumber: day.dayNumber,
             title: day.title,
             activities: (day.activities || []).map(act => ({
                name: act.name,
                description: act.description,
                category: act.category,
                cost: act.cost || act.estimatedCost || 0,
                time: act.startTime || act.time || "10:00"
             }))
          }))
        };
        savedTrip = await importAITrip(payload);
      }
      
      if (savedTrip && savedTrip.id) {
        localStorage.setItem(`ai_trip_plan_${savedTrip.id}`, JSON.stringify(tripData));
        setSavedTripId(savedTrip.id);
      }
    } catch (err) {
      console.error('Failed to save trip', err);
      alert('Failed to save trip.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-200 pb-20">
      {/* Header */}
      <div className="bg-[#131A2A] border-b border-[#1F2937] px-6 py-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="mr-4 p-2 rounded-full hover:bg-amber-400/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="font-black tracking-tighter text-xl flex items-center text-white">
            <Sparkles className="w-5 h-5 text-amber-400 mr-2" /> AI Trip Assistant
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: INPUT */}
          {step === 'input' && (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#131A2A] rounded-3xl p-8 shadow-sm border border-[#1F2937]">
              <h2 className="text-3xl font-black mb-2 tracking-tighter">Design Your Perfect Trip</h2>
              <p className="text-slate-400 font-medium mb-8">Tell us what you're looking for, and our AI will build a personalized itinerary.</p>
              
              <form onSubmit={handleGenerate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div ref={destRef} className="relative">
                    <label className="block text-sm font-bold text-slate-300 mb-2">Where do you want to go?</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 z-10" />
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        value={preferences.destination}
                        onChange={e => handleDestinationChange(e.target.value)}
                        onFocus={() => {
                          if (preferences.destination.trim().length > 0 && filteredDestinations.length > 0) {
                            setShowSuggestions(true);
                          }
                        }}
                        placeholder="e.g. Goa, Paris, Japan..."
                        className="w-full pl-11 pr-4 py-3 bg-[#131A2A] text-slate-200 border border-[#1F2937] rounded-full focus:ring-1 focus:ring-amber-400 focus:border-amber-400 font-medium transition-all shadow-sm"
                      />
                    </div>
                    <AnimatePresence>
                      {showSuggestions && (
                        <motion.ul
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-50 left-0 right-0 mt-2 bg-[#131A2A] border border-[#1F2937] rounded-xl shadow-xl overflow-hidden"
                        >
                          {filteredDestinations.map((dest, i) => {
                            const name = typeof dest === 'string' ? dest : dest.name;
                            const country = typeof dest === 'object' ? dest.country : null;
                            return (
                              <li
                                key={i}
                                onMouseDown={() => handleSelectDestination(name)}
                                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#131A2A]/10 cursor-pointer transition-colors text-sm border-b border-[#1F2937] last:border-0"
                              >
                                <div className="flex items-center gap-3">
                                  <MapPin className="w-4 h-4 text-white shrink-0" />
                                  <span className="font-bold text-slate-200">{name}</span>
                                </div>
                                {country && (
                                  <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full shrink-0">{country}</span>
                                )}
                              </li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">How many days?</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type="number"
                        min="1"
                        max="30"
                        required
                        value={preferences.duration}
                        onChange={e => setPreferences({...preferences, duration: e.target.value})}
                        placeholder="Enter days (e.g. 2, 4, 6, 8...)"
                        className="w-full pl-11 pr-4 py-3 bg-[#131A2A] border border-[#1F2937] rounded-full focus:ring-1 focus:ring-amber-400 focus:border-amber-400 font-medium transition-all shadow-sm"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['2', '3', '5', '7', '10', '14'].map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setPreferences({ ...preferences, duration: d })}
                          className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${
                            String(preferences.duration) === d
                              ? 'bg-[#EAB308] text-slate-950 border-[#EAB308]'
                              : 'bg-[#131A2A] text-slate-300 border-[#1F2937] hover:bg-[#1F2937]'
                          }`}
                        >
                          {d} Days
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">What's your budget? (₹)</label>
                    <div className="relative">
                      <Wallet className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input type="number" required value={preferences.budget} onChange={e => setPreferences({...preferences, budget: e.target.value})} placeholder="e.g. 20000" className="w-full pl-11 pr-4 py-3 bg-[#131A2A] border border-[#1F2937] rounded-full focus:ring-1 focus:ring-amber-400 focus:border-amber-400 font-medium transition-all shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Who's traveling?</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <select value={preferences.travelers} onChange={e => setPreferences({...preferences, travelers: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-[#131A2A] border border-[#1F2937] rounded-full focus:ring-1 focus:ring-amber-400 focus:border-amber-400 font-medium transition-all appearance-none shadow-sm">
                        <option value="1">Solo</option>
                        <option value="2">Couple (2)</option>
                        <option value="3">Small Group (3-4)</option>
                        <option value="5">Family / Friends (5+)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-3">Travel Style (Select multiple)</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { id: 'relaxation', label: '🏖️ Relaxation' },
                      { id: 'adventure', label: '🏔️ Adventure' },
                      { id: 'culture', label: '🏛️ Culture' },
                      { id: 'food', label: '🍜 Food' },
                      { id: 'nature', label: '🌿 Nature' },
                      { id: 'shopping', label: '🛍️ Shopping' },
                      { id: 'nightlife', label: '🌃 Nightlife' }
                    ].map(style => (
                      <button type="button" key={style.id} onClick={() => handleStyleToggle(style.id)} className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${preferences.style.includes(style.id) ? 'bg-amber-400/10 border-yellow-400 text-amber-400' : 'bg-[#131A2A] border-[#1F2937] text-slate-300 hover:bg-[#131A2A] shadow-sm'}`}>
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full md:w-auto px-8 py-4 bg-amber-400 text-slate-950 rounded-full font-bold text-lg shadow-md hover:bg-[#EAB308] hover:text-white hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center">
                    <Sparkles className="w-5 h-5 mr-2" /> Generate My Trip
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 2: LOADING */}
          {step === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-32 flex flex-col items-center justify-center text-center">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-40 animate-pulse"></div>
                <Loader2 className="w-24 h-24 text-white animate-spin relative z-10" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white z-20" />
              </div>
              <h2 className="text-2xl font-black mb-4 tracking-tighter text-slate-200">{loadingText || 'Consulting the AI...'}</h2>
              <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div className="h-full bg-[#EAB308]" initial={{ width: 0 }} animate={{ width: `${loadingProgress}%` }} transition={{ duration: 0.5 }}></motion.div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: RESULT */}
          {step === 'result' && tripData && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              {/* Overview Card */}
              <div className="bg-[#131A2A] rounded-3xl p-8 shadow-sm border border-[#1F2937] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-amber-400/10 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{tripData.duration} Days • {tripData.travelers} Travelers</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${tripData.budgetStatus === 'within' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-red-400/10 text-red-400 border-red-400/20'}`}>
                      {tripData.budgetStatus === 'within' ? 'Within Budget' : 'Over Budget'}
                    </span>
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter">{tripData.tripName}</h2>
                  <p className="text-slate-400 font-medium flex items-center mt-2"><MapPin className="w-4 h-4 mr-1" /> {tripData.destination}</p>
                </div>
                
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  {savedTripId ? (
                    <Link to={`/trips/${savedTripId}/build`} className="flex items-center justify-center px-6 py-3 bg-[#EAB308] text-white rounded-full font-bold shadow-md hover:bg-[#CA8A04]">
                      <CheckCircle className="w-5 h-5 mr-2" /> View My Trip
                    </Link>
                  ) : (
                    <button onClick={handleSaveTrip} disabled={isSaving} className="flex items-center justify-center px-6 py-3 bg-amber-400 text-slate-950 rounded-full font-bold shadow-md hover:bg-[#1F2937] transition-colors">
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                      Save Trip
                    </button>
                  )}
                  <button onClick={() => setStep('input')} className="flex items-center justify-center px-6 py-3 bg-[#1F2937] text-slate-300 rounded-full font-bold hover:bg-slate-200 transition-colors">
                    <RefreshCw className="w-5 h-5 mr-2" /> Regenerate
                  </button>
                </div>
              </div>

              {/* Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left: Itinerary */}
                <div className="lg:col-span-2 space-y-6">
                  <h3 className="text-2xl font-black tracking-tighter flex items-center">
                    <Calendar className="w-6 h-6 mr-2 text-white" /> Day-wise Itinerary
                  </h3>
                  
                  {tripData.days.map((day) => (
                    <div key={day.dayNumber} className="bg-[#131A2A] rounded-3xl p-6 shadow-sm border border-[#1F2937]">
                      <h4 className="text-lg font-bold border-b border-[#1F2937] pb-3 mb-4 text-white">Day {day.dayNumber}: {day.title}</h4>
                      <div className="space-y-6">
                        {day.activities.map((act) => (
                          <div key={act.id} className="flex gap-4">
                            <div className="w-16 shrink-0 text-sm font-bold text-slate-400 pt-1">{act.time}</div>
                            <div className="flex-1">
                              <h5 className="font-bold text-slate-200">{act.name}</h5>
                              <p className="text-sm text-slate-400 mt-1">{act.description}</p>
                              <div className="flex items-center mt-2 text-xs font-bold text-slate-400">
                                <span className="bg-[#1F2937] px-2 py-1 rounded text-slate-300 mr-2">{act.category}</span>
                                ₹{act.cost.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: Budget & Tools */}
                <div className="space-y-6">
                  
                  {/* Optimization Tools */}
                  <div className="bg-[#131A2A] rounded-3xl p-6 border border-[#1F2937] shadow-sm">
                    <h3 className="text-lg font-black tracking-tighter mb-4 flex items-center text-slate-200">
                      <Sparkles className="w-5 h-5 mr-2 text-amber-400" /> Optimize Trip
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleRefine('reduce-cost')} className="bg-[#131A2A] border border-[#1F2937] text-slate-300 text-sm font-bold py-2 px-3 rounded-xl flex items-center justify-center hover:border-black transition-colors">
                        <TrendingDown className="w-4 h-4 mr-1" /> Reduce Cost
                      </button>
                      <button onClick={() => handleRefine('relax')} className="bg-[#131A2A] border border-[#1F2937] text-slate-300 text-sm font-bold py-2 px-3 rounded-xl flex items-center justify-center hover:border-black transition-colors">
                        <Coffee className="w-4 h-4 mr-1" /> More Relaxed
                      </button>
                      <button onClick={() => handleRefine('add-activities')} className="bg-[#131A2A] border border-[#1F2937] text-slate-300 text-sm font-bold py-2 px-3 rounded-xl flex items-center justify-center hover:border-black transition-colors">
                        <Activity className="w-4 h-4 mr-1" /> Action Packed
                      </button>
                      <button onClick={() => handleRefine('add-food')} className="bg-[#131A2A] border border-[#1F2937] text-slate-300 text-sm font-bold py-2 px-3 rounded-xl flex items-center justify-center hover:border-black transition-colors">
                        <Utensils className="w-4 h-4 mr-1" /> More Food
                      </button>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-[#131A2A] rounded-3xl p-6 border border-yellow-100 shadow-sm">
                    <h3 className="text-lg font-black tracking-tighter mb-4 flex items-center text-amber-400">
                      <Sparkles className="w-5 h-5 mr-2 text-amber-400" /> AI Insights
                    </h3>
                    <ul className="space-y-3">
                      {tripData.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-amber-400 font-medium flex items-start">
                          <span className="text-amber-400 mr-2">•</span> {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Budget */}
                  <div className="bg-amber-400 rounded-3xl p-6 shadow-sm text-white">
                    <h3 className="text-lg font-black tracking-tighter mb-4 flex items-center">
                      <Wallet className="w-5 h-5 mr-2 text-[#EAB308]" /> Estimated Budget
                    </h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm"><span className="text-slate-400">Transport</span><span className="font-bold">₹{tripData.expenses.transport.toLocaleString()}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-400">Stay</span><span className="font-bold">₹{tripData.expenses.stay.toLocaleString()}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-400">Food</span><span className="font-bold">₹{tripData.expenses.food.toLocaleString()}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-400">Activities</span><span className="font-bold">₹{tripData.expenses.activities.toLocaleString()}</span></div>
                    </div>
                    
                    <div className="border-t border-[#1F2937] pt-4 mb-4">
                      <div className="flex justify-between items-end">
                        <span className="text-slate-400 font-medium">Total Estimate</span>
                        <span className="text-2xl font-black text-[#EAB308]">₹{tripData.estimatedCost.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-[#1F2937] rounded-full h-2 mb-2">
                      <div className={`h-2 rounded-full ${tripData.budgetStatus === 'within' ? 'bg-emerald-400' : 'bg-red-500'}`} style={{ width: `${Math.min((tripData.estimatedCost / tripData.budget) * 100, 100)}%` }}></div>
                    </div>
                    <div className="text-xs font-bold text-slate-400 text-right">
                      Budget: ₹{tripData.budget.toLocaleString()}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}






