import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import PlacesAutocomplete from "../components/PlacesAutocomplete";
import TransportLeg from "../components/TransportLeg";
import AccommodationForm from "../components/AccommodationForm";
import { getTrip, updateTrip } from "../api/trips";
import { upsertCity } from "../api/cities";
import { createStop, reorderStops, deleteStop, patchStop } from "../api/stops";
import { getTimezone } from "../api/travel";
import {
  Plus, GripVertical, Trash2, ChevronUp, ChevronDown,
  CalendarDays, MapPin, Globe, StickyNote, Save, 
  Edit3, Settings, Clock, Utensils, Camera, Moon, Compass, Sparkles, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ItineraryBuilder() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [timezones, setTimezones] = useState({});

  // Trip Settings Editor Modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tripSettings, setTripSettings] = useState({
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    budgetLimit: "",
    description: "",
    coverPhotoUrl: ""
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Add stop form state
  const [cityQuery, setCityQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");

  // Notes editing
  const [editingNotes, setEditingNotes] = useState({});
  const [savingNotes, setSavingNotes] = useState({});

  // AI Plan Local State (Day-wise activities)
  const [aiPlan, setAiPlan] = useState(null);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [newActivity, setNewActivity] = useState({
    name: "",
    time: "10:00 AM",
    category: "SIGHTSEEING",
    cost: "",
    description: ""
  });

  const loadData = async () => {
    setLoading(true);
    const tripData = await getTrip(tripId);
    if (tripData && tripData.stops) {
      tripData.stops.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    } else if (tripData) {
      tripData.stops = [];
    }
    setTrip(tripData);
    if (tripData) {
      setTripSettings({
        name: tripData.name || "",
        destination: tripData.destination || "",
        startDate: tripData.startDate || "",
        endDate: tripData.endDate || "",
        budgetLimit: tripData.budgetLimit || "",
        description: tripData.description || "",
        coverPhotoUrl: tripData.coverPhotoUrl || ""
      });
    }
    setLoading(false);

    // Check for stored AI plan
    const storedAiPlan = localStorage.getItem(`ai_trip_plan_${tripId}`);
    if (storedAiPlan) {
      try {
        setAiPlan(JSON.parse(storedAiPlan));
      } catch (e) {
        console.error(e);
      }
    } else if (tripData) {
      // Create initial AI plan structure if missing
      setAiPlan({
        days: [
          {
            dayNumber: 1,
            title: "Day 1: Exploration",
            activities: [
              { id: 'a1', time: '10:00 AM', name: 'City Center Walk', category: 'SIGHTSEEING', cost: 500, description: 'Explore local sights.' }
            ]
          }
        ]
      });
    }

    // Fetch timezones for stops
    if (tripData?.stops) {
      const tzMap = {};
      for (const stop of tripData.stops) {
        if (stop.city?.latitude && stop.city?.longitude) {
          try {
            const tz = await getTimezone(stop.city.latitude, stop.city.longitude);
            if (tz?.timeZone) tzMap[stop.id] = tz.timeZone;
          } catch {}
        }
      }
      setTimezones(tzMap);
    }
  };

  useEffect(() => { loadData(); }, [tripId]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const updated = await updateTrip(tripId, {
        name: tripSettings.name,
        destination: tripSettings.destination,
        startDate: tripSettings.startDate,
        endDate: tripSettings.endDate,
        budgetLimit: tripSettings.budgetLimit ? Number(tripSettings.budgetLimit) : null,
        description: tripSettings.description,
        coverPhotoUrl: tripSettings.coverPhotoUrl
      });
      setTrip(updated);
      setShowSettingsModal(false);
    } catch (err) {
      alert("Failed to update trip settings: " + (err.message || "Unknown error"));
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddStop = async (e) => {
    e.preventDefault();
    if (!selectedPlace) { setAddError("Select a city from suggestions."); return; }
    setAddError("");
    setAddLoading(true);
    try {
      const city = await upsertCity(selectedPlace);
      await createStop(tripId, {
        cityId: city.id,
        startDate: newStartDate,
        endDate: newEndDate,
        transportCost: 0,
        accommodationCost: 0,
      });
      setCityQuery("");
      setSelectedPlace(null);
      setNewStartDate("");
      setNewEndDate("");
      loadData();
    } catch (err) {
      setAddError(err.message || "Failed to add stop.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleMoveStop = async (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === trip.stops.length - 1) return;
    const newStops = [...trip.stops];
    const temp = newStops[index];
    newStops[index] = newStops[index + direction];
    newStops[index + direction] = temp;
    setTrip({ ...trip, stops: newStops });
    await reorderStops(tripId, { stopIds: newStops.map((s) => s.id) });
    loadData();
  };

  const handleDeleteStop = async (stopId) => {
    if (window.confirm("Remove this stop from the itinerary?")) {
      await deleteStop(stopId);
      loadData();
    }
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!newActivity.name) return;

    const updatedPlan = { ...aiPlan };
    if (!updatedPlan.days) updatedPlan.days = [];
    
    let targetDay = updatedPlan.days.find(d => d.dayNumber === selectedDayNumber);
    if (!targetDay) {
      targetDay = {
        dayNumber: selectedDayNumber,
        title: `Day ${selectedDayNumber}: Custom Schedule`,
        activities: []
      };
      updatedPlan.days.push(targetDay);
      updatedPlan.days.sort((a, b) => a.dayNumber - b.dayNumber);
    }

    const activityItem = {
      id: 'act-' + Date.now(),
      time: newActivity.time || '10:00 AM',
      name: newActivity.name,
      category: newActivity.category || 'SIGHTSEEING',
      cost: Number(newActivity.cost) || 0,
      description: newActivity.description || ''
    };

    targetDay.activities.push(activityItem);
    setAiPlan(updatedPlan);
    localStorage.setItem(`ai_trip_plan_${tripId}`, JSON.stringify(updatedPlan));

    setShowAddActivityModal(false);
    setNewActivity({ name: "", time: "10:00 AM", category: "SIGHTSEEING", cost: "", description: "" });
  };

  const handleDeleteActivity = (dayNumber, actId) => {
    const updatedPlan = { ...aiPlan };
    const day = updatedPlan.days.find(d => d.dayNumber === dayNumber);
    if (day) {
      day.activities = day.activities.filter(a => a.id !== actId);
      setAiPlan(updatedPlan);
      localStorage.setItem(`ai_trip_plan_${tripId}`, JSON.stringify(updatedPlan));
    }
  };

  const daysBetween = (start, end) => {
    if (!start || !end) return 0;
    return Math.max(0, Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1);
  };

  if (loading) return (
    <AppLayout title="Itinerary Builder">
      <div className="flex items-center gap-3 py-10 text-slate-400">
        <span className="w-5 h-5 border-2 border-[#1F2937] border-t-amber-500 rounded-full animate-spin" />
        Loading trip builder...
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title={`Edit Trip: ${trip?.name}`}>
      {/* Sub-header Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center">
            {trip?.name}
            <button 
              onClick={() => setShowSettingsModal(true)} 
              className="ml-3 p-2 bg-[#131A2A]/5 hover:bg-[#131A2A]/10 text-slate-400 hover:text-amber-400 rounded-xl transition-all"
              title="Edit Trip Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-cyan-400" />
            {trip?.startDate} → {trip?.endDate}
            {trip?.budgetLimit && (
              <span className="bg-amber-400/10 text-amber-400 px-2.5 py-0.5 rounded-full text-xs font-bold border border-amber-400/20">
                Budget: ₹{trip.budgetLimit.toLocaleString('en-IN')}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="bg-[#131A2A]/5 border border-white/10 hover:bg-[#131A2A]/10 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center"
          >
            <Edit3 className="w-4 h-4 mr-2 text-amber-400" /> Edit Trip Info
          </button>
          <button
            onClick={() => setShowAddActivityModal(true)}
            className="bg-amber-400 hover:bg-amber-300 text-[#0c0f1a] px-4 py-2.5 rounded-xl text-sm font-extrabold shadow-lg shadow-amber-500/20 transition-all flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Activity
          </button>
          <Link
            to={`/trips/${tripId}`}
            className="bg-[#131A2A]/5 border border-white/10 hover:bg-[#131A2A]/10 text-cyan-400 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center"
          >
            View Itinerary
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stops & Day-wise Activities */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Day-wise Activity List Editor */}
          <div className="bg-[#131A2A]/[0.03] border border-white/[0.06] rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-white flex items-center">
                <Sparkles className="w-5 h-5 text-amber-400 mr-2" /> Day-by-Day Activities
              </h3>
              <button 
                onClick={() => setShowAddActivityModal(true)}
                className="text-xs font-bold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 rounded-lg transition-colors flex items-center"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Activity
              </button>
            </div>

            {aiPlan?.days?.map((day) => (
              <div key={day.dayNumber} className="mb-6 last:mb-0 bg-[#131A2A]/5 border border-white/5 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                  <h4 className="font-extrabold text-amber-400 text-sm">{day.title || `Day ${day.dayNumber}`}</h4>
                  <button 
                    onClick={() => { setSelectedDayNumber(day.dayNumber); setShowAddActivityModal(true); }}
                    className="text-xs text-slate-400 hover:text-white flex items-center"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add to Day {day.dayNumber}
                  </button>
                </div>

                <div className="space-y-3">
                  {day.activities?.map((act) => (
                    <div key={act.id} className="bg-[#131A2A]/[0.03] border border-white/[0.06] rounded-xl p-4 flex justify-between items-start group">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">
                            {act.time}
                          </span>
                          <span className="text-xs font-semibold text-slate-400 bg-[#131A2A]/5 px-2 py-0.5 rounded uppercase">
                            {act.category}
                          </span>
                          {act.cost > 0 && (
                            <span className="text-xs font-bold text-emerald-400">₹{act.cost}</span>
                          )}
                        </div>
                        <h5 className="font-bold text-white text-base">{act.name}</h5>
                        {act.description && <p className="text-xs text-slate-400 mt-1">{act.description}</p>}
                      </div>
                      <button 
                        onClick={() => handleDeleteActivity(day.dayNumber, act.id)}
                        className="text-slate-300 hover:text-red-400 p-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(!day.activities || day.activities.length === 0) && (
                    <p className="text-xs text-slate-400 italic py-2">No activities added yet for this day.</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Stops List */}
          <div className="bg-[#131A2A]/[0.03] border border-white/[0.06] rounded-3xl p-6">
            <h3 className="text-xl font-extrabold text-white flex items-center mb-6">
              <MapPin className="w-5 h-5 text-rose-400 mr-2" /> City Destinations & Accommodation
            </h3>

            {trip?.stops?.length === 0 && (
              <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl text-slate-400">
                <p className="font-medium">No destination stops added yet.</p>
              </div>
            )}

            {trip?.stops?.map((stop, index) => (
              <div key={stop.id} className="mb-4 bg-[#131A2A]/5 border border-white/5 rounded-2xl p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-white text-lg">{stop.city?.name || `Stop #${index + 1}`}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{stop.startDate} → {stop.endDate}</p>
                  </div>
                  <button onClick={() => handleDeleteStop(stop.id)} className="text-slate-400 hover:text-red-400 p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-4">
                  <AccommodationForm stop={stop} onUpdate={loadData} />
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Add Stop Form */}
        <div className="space-y-6">
          <div className="bg-[#131A2A]/[0.03] border border-white/[0.06] rounded-3xl p-6 sticky top-24">
            <h3 className="text-lg font-extrabold text-white mb-4 flex items-center">
              <Plus className="w-5 h-5 text-amber-400 mr-2" /> Add City Stop
            </h3>

            {addError && <p className="text-xs text-red-400 font-bold mb-3">{addError}</p>}

            <form onSubmit={handleAddStop} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Search City</label>
                <PlacesAutocomplete
                  value={cityQuery}
                  onChange={setCityQuery}
                  onSelect={(place) => { setSelectedPlace(place); setCityQuery(place.name); }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={addLoading}
                className="w-full bg-amber-400 hover:bg-amber-300 text-[#0c0f1a] font-extrabold py-3 rounded-xl shadow-lg transition-all"
              >
                {addLoading ? "Adding..." : "Add Stop"}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* MODAL 1: TRIP SETTINGS EDITOR */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-amber-400/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0f1a] border border-white/10 rounded-3xl p-6 md:p-8 max-w-lg w-full text-white shadow-2xl">
            <h3 className="text-2xl font-extrabold mb-4 flex items-center">
              <Settings className="w-6 h-6 text-amber-400 mr-2" /> Edit Trip Details
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Trip Name</label>
                <input
                  type="text"
                  required
                  value={tripSettings.name}
                  onChange={(e) => setTripSettings({ ...tripSettings, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Destination</label>
                <input
                  type="text"
                  value={tripSettings.destination}
                  onChange={(e) => setTripSettings({ ...tripSettings, destination: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={tripSettings.startDate}
                    onChange={(e) => setTripSettings({ ...tripSettings, startDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={tripSettings.endDate}
                    onChange={(e) => setTripSettings({ ...tripSettings, endDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Budget Limit (₹)</label>
                <input
                  type="number"
                  value={tripSettings.budgetLimit}
                  onChange={(e) => setTripSettings({ ...tripSettings, budgetLimit: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={tripSettings.description}
                  onChange={(e) => setTripSettings({ ...tripSettings, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white font-medium"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-5 py-2.5 bg-[#131A2A]/5 hover:bg-[#131A2A]/10 text-slate-300 font-bold text-sm rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#0c0f1a] font-extrabold text-sm rounded-xl"
                >
                  {savingSettings ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD ACTIVITY MODAL */}
      {showAddActivityModal && (
        <div className="fixed inset-0 z-50 bg-amber-400/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0f1a] border border-white/10 rounded-3xl p-6 md:p-8 max-w-lg w-full text-white shadow-2xl">
            <h3 className="text-2xl font-extrabold mb-4 flex items-center">
              <Plus className="w-6 h-6 text-amber-400 mr-2" /> Add Custom Activity
            </h3>

            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Select Day</label>
                <select
                  value={selectedDayNumber}
                  onChange={(e) => setSelectedDayNumber(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-bold"
                >
                  {aiPlan?.days?.map((d) => (
                    <option key={d.dayNumber} value={d.dayNumber}>Day {d.dayNumber}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Activity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scuba Diving at Baga Beach"
                  value={newActivity.name}
                  onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={newActivity.time}
                    onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Category</label>
                  <select
                    value={newActivity.category}
                    onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  >
                    <option value="SIGHTSEEING">SIGHTSEEING</option>
                    <option value="FOOD">FOOD</option>
                    <option value="CULTURE">CULTURE</option>
                    <option value="RELAXATION">RELAXATION</option>
                    <option value="SHOPPING">SHOPPING</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Cost (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={newActivity.cost}
                  onChange={(e) => setNewActivity({ ...newActivity, cost: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description / Notes</label>
                <textarea
                  rows="2"
                  placeholder="Details about this activity..."
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white font-medium"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddActivityModal(false)}
                  className="px-5 py-2.5 bg-[#131A2A]/5 hover:bg-[#131A2A]/10 text-slate-300 font-bold text-sm rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#0c0f1a] font-extrabold text-sm rounded-xl"
                >
                  Add Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AppLayout>
  );
}




