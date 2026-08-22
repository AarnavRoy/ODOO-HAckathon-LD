import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Calendar, Users, Wallet, CheckCircle, RefreshCw, Save, ArrowLeft, Loader2, TrendingDown, Coffee, Activity, Utensils, Edit3 } from 'lucide-react';
import { generateTripItinerary, refineTripItinerary } from '../api/ai';
import { createTrip } from '../api/trips'; // We will use the mock createTrip

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
  
  // Loading State
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
      alert('Failed to generate trip. Please try again.');
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
      // Map AI result to existing backend/mock structure
      const newTrip = await createTrip({
        name: tripData.tripName,
        destination: tripData.destination, // Custom backend field or just use name
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + tripData.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: `AI Generated Trip for ${tripData.travelers} travelers. Style: ${preferences.style.join(', ')}`,
        coverPhotoUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800', // Default
        budgetLimit: tripData.budget
      });
      // In a real app, we'd also iterate through tripData.days and add stops/activities
      
      setSavedTripId(newTrip.id);
    } catch (err) {
      console.error('Failed to save trip', err);
      alert('Failed to save trip.');
    } finally {
      setIsSaving(false);
    }
  };

  // Autocomplete data
  const popularDestinations = [
    "Paris, France", "London, UK", "New York City, USA", "Tokyo, Japan",
    "Goa, India", "Bali, Indonesia", "Rome, Italy", "Barcelona, Spain",
    "Amsterdam, Netherlands", "Dubai, UAE", "Singapore", "Bangkok, Thailand",
    "Istanbul, Turkey", "Kyoto, Japan", "Sydney, Australia", "Cape Town, South Africa",
    "Rio de Janeiro, Brazil", "Agra, India", "Jaipur, India", "Mumbai, India", 
    "Delhi, India", "Kerala, India", "Athens, Greece", "Santorini, Greece", 
    "Prague, Czechia", "Vienna, Austria", "Berlin, Germany", "Zurich, Switzerland", 
    "Vancouver, Canada", "Toronto, Canada", "Los Angeles, USA", "Las Vegas, USA", 
    "Miami, USA", "San Francisco, USA", "Seoul, South Korea", "Hanoi, Vietnam", 
    "Phuket, Thailand", "Maldives", "Seychelles", "Mauritius"
  ];
  
  const [showDestinations, setShowDestinations] = useState(false);
  const filteredDestinations = popularDestinations.filter(d => 
    d.toLowerCase().includes(preferences.destination.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="mr-4 p-2 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="font-black tracking-tighter text-xl flex items-center">
            <Sparkles className="w-5 h-5 text-fuchsia-500 mr-2" /> AI Trip Assistant
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: INPUT */}
          {step === 'input' && (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-3xl font-black mb-2 tracking-tighter">Design Your Perfect Trip</h2>
              <p className="text-slate-500 font-medium mb-8">Tell us what you're looking for, and our AI will build a personalized itinerary.</p>
              
              <form onSubmit={handleGenerate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Where do you want to go?</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        required 
                        value={preferences.destination} 
                        onChange={e => {
                          setPreferences({...preferences, destination: e.target.value});
                          setShowDestinations(true);
                        }} 
                        onFocus={() => setShowDestinations(true)}
                        onBlur={() => setTimeout(() => setShowDestinations(false), 200)}
                        placeholder="e.g. Goa, Paris, Japan" 
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 font-medium transition-all" 
                      />
                    </div>
                    {showDestinations && preferences.destination && filteredDestinations.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {filteredDestinations.map(dest => (
                          <div 
                            key={dest} 
                            onClick={() => {
                              setPreferences({...preferences, destination: dest});
                              setShowDestinations(false);
                            }}
                            className="px-4 py-3 cursor-pointer hover:bg-fuchsia-50 hover:text-fuchsia-700 font-medium text-slate-700 transition-colors border-b border-slate-50 last:border-0"
                          >
                            <MapPin className="inline w-4 h-4 mr-2 text-slate-400" />
                            {dest}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">How many days?</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <select value={preferences.duration} onChange={e => setPreferences({...preferences, duration: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 font-medium transition-all appearance-none">
                        <option value="3">3 Days (Weekend)</option>
                        <option value="5">5 Days</option>
                        <option value="7">7 Days (1 Week)</option>
                        <option value="10">10 Days</option>
                        <option value="14">14 Days (2 Weeks)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">What's your budget? (₹)</label>
                    <div className="relative">
                      <Wallet className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input type="number" required value={preferences.budget} onChange={e => setPreferences({...preferences, budget: e.target.value})} placeholder="e.g. 20000" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 font-medium transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Who's traveling?</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <select value={preferences.travelers} onChange={e => setPreferences({...preferences, travelers: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 font-medium transition-all appearance-none">
                        <option value="1">Solo</option>
                        <option value="2">Couple (2)</option>
                        <option value="3">Small Group (3-4)</option>
                        <option value="5">Family / Friends (5+)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Travel Style (Select multiple)</label>
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
                      <button type="button" key={style.id} onClick={() => handleStyleToggle(style.id)} className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${preferences.style.includes(style.id) ? 'bg-fuchsia-100 border-fuchsia-500 text-fuchsia-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center">
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
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                <Loader2 className="w-24 h-24 text-fuchsia-500 animate-spin relative z-10" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white z-20" />
              </div>
              <h2 className="text-2xl font-black mb-4 tracking-tighter text-slate-900">{loadingText || 'Consulting the AI...'}</h2>
              <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500" initial={{ width: 0 }} animate={{ width: `${loadingProgress}%` }} transition={{ duration: 0.5 }}></motion.div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: RESULT */}
          {step === 'result' && tripData && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              {/* Overview Card */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-fuchsia-100 text-fuchsia-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{tripData.duration} Days • {tripData.travelers} Travelers</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${tripData.budgetStatus === 'within' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {tripData.budgetStatus === 'within' ? 'Within Budget' : 'Over Budget'}
                    </span>
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter">{tripData.tripName}</h2>
                  <p className="text-slate-500 font-medium flex items-center mt-2"><MapPin className="w-4 h-4 mr-1" /> {tripData.destination}</p>
                </div>
                
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  {savedTripId ? (
                    <Link to={`/trips/${savedTripId}/build`} className="flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/20">
                      <CheckCircle className="w-5 h-5 mr-2" /> View My Trip
                    </Link>
                  ) : (
                    <button onClick={handleSaveTrip} disabled={isSaving} className="flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors">
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                      Save Trip
                    </button>
                  )}
                  <button onClick={() => setStep('input')} className="flex items-center justify-center px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                    <RefreshCw className="w-5 h-5 mr-2" /> Regenerate
                  </button>
                </div>
              </div>

              {/* Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left: Itinerary */}
                <div className="lg:col-span-2 space-y-6">
                  <h3 className="text-2xl font-black tracking-tighter flex items-center">
                    <Calendar className="w-6 h-6 mr-2 text-violet-500" /> Day-wise Itinerary
                  </h3>
                  
                  {tripData.days.map((day) => (
                    <div key={day.dayNumber} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                      <h4 className="text-lg font-bold border-b border-slate-100 pb-3 mb-4 text-violet-900">Day {day.dayNumber}: {day.title}</h4>
                      <div className="space-y-6">
                        {day.activities.map((act) => (
                          <div key={act.id} className="flex gap-4">
                            <div className="w-16 shrink-0 text-sm font-bold text-slate-400 pt-1">{act.time}</div>
                            <div className="flex-1">
                              <h5 className="font-bold text-slate-900">{act.name}</h5>
                              <p className="text-sm text-slate-500 mt-1">{act.description}</p>
                              <div className="flex items-center mt-2 text-xs font-bold text-slate-400">
                                <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 mr-2">{act.category}</span>
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
                  <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl p-6 border border-violet-100">
                    <h3 className="text-lg font-black tracking-tighter mb-4 flex items-center text-violet-900">
                      <Sparkles className="w-5 h-5 mr-2 text-fuchsia-500" /> Optimize Trip
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleRefine('reduce-cost')} className="bg-white border border-violet-200 text-violet-700 text-sm font-bold py-2 px-3 rounded-lg flex items-center justify-center hover:bg-violet-600 hover:text-white transition-colors">
                        <TrendingDown className="w-4 h-4 mr-1" /> Reduce Cost
                      </button>
                      <button onClick={() => handleRefine('relax')} className="bg-white border border-violet-200 text-violet-700 text-sm font-bold py-2 px-3 rounded-lg flex items-center justify-center hover:bg-violet-600 hover:text-white transition-colors">
                        <Coffee className="w-4 h-4 mr-1" /> More Relaxed
                      </button>
                      <button onClick={() => handleRefine('add-activities')} className="bg-white border border-violet-200 text-violet-700 text-sm font-bold py-2 px-3 rounded-lg flex items-center justify-center hover:bg-violet-600 hover:text-white transition-colors">
                        <Activity className="w-4 h-4 mr-1" /> Action Packed
                      </button>
                      <button onClick={() => handleRefine('add-food')} className="bg-white border border-violet-200 text-violet-700 text-sm font-bold py-2 px-3 rounded-lg flex items-center justify-center hover:bg-violet-600 hover:text-white transition-colors">
                        <Utensils className="w-4 h-4 mr-1" /> More Food
                      </button>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-black tracking-tighter mb-4 flex items-center">
                      <Edit3 className="w-5 h-5 mr-2 text-blue-500" /> AI Insights
                    </h3>
                    <ul className="space-y-3">
                      {tripData.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-slate-600 font-medium flex items-start">
                          <span className="text-fuchsia-500 mr-2">•</span> {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Budget */}
                  <div className="bg-slate-900 rounded-2xl p-6 shadow-sm text-white">
                    <h3 className="text-lg font-black tracking-tighter mb-4 flex items-center">
                      <Wallet className="w-5 h-5 mr-2 text-green-400" /> Estimated Budget
                    </h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm"><span className="text-slate-400">Transport</span><span className="font-bold">₹{tripData.expenses.transport.toLocaleString()}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-400">Stay</span><span className="font-bold">₹{tripData.expenses.stay.toLocaleString()}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-400">Food</span><span className="font-bold">₹{tripData.expenses.food.toLocaleString()}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-400">Activities</span><span className="font-bold">₹{tripData.expenses.activities.toLocaleString()}</span></div>
                    </div>
                    
                    <div className="border-t border-slate-700 pt-4 mb-4">
                      <div className="flex justify-between items-end">
                        <span className="text-slate-400 font-medium">Total Estimate</span>
                        <span className="text-2xl font-black">₹{tripData.estimatedCost.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                      <div className={`h-2 rounded-full ${tripData.budgetStatus === 'within' ? 'bg-green-400' : 'bg-red-500'}`} style={{ width: `${Math.min((tripData.estimatedCost / tripData.budget) * 100, 100)}%` }}></div>
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
