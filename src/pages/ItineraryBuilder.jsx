import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import PlacesAutocomplete from "../components/PlacesAutocomplete";
import TransportLeg from "../components/TransportLeg";
import WeatherWidget from "../components/WeatherWidget";
import AccommodationForm from "../components/AccommodationForm";
import CurrencyWidget from "../components/CurrencyWidget";
import { getTrip } from "../api/trips";
import { upsertCity } from "../api/cities";
import { createStop, reorderStops, deleteStop, patchStop } from "../api/stops";
import { getTimezone } from "../api/travel";
import {
  Plus, GripVertical, Trash2, ChevronUp, ChevronDown,
  CalendarDays, AlertTriangle, MapPin, CheckCircle2,
  Globe, StickyNote, Save, Loader2,
} from "lucide-react";

export default function ItineraryBuilder() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [timezones, setTimezones] = useState({});

  // Add stop form state
  const [cityQuery, setCityQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");

  // Notes editing
  const [editingNotes, setEditingNotes] = useState({});
  const [savingNotes, setSavingNotes] = useState({});

  const loadData = async () => {
    setLoading(true);
    const tripData = await getTrip(tripId);
    if (tripData && tripData.stops) {
      tripData.stops.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    } else if (tripData) {
      tripData.stops = [];
    }
    setTrip(tripData);
    setLoading(false);

    // Fetch timezones for all stops
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

  const tripStart = trip?.startDate;
  const tripEnd = trip?.endDate;

  const stopDateError = (() => {
    if (!newStartDate || !newEndDate) return null;
    if (newStartDate > newEndDate) return "Stop end date must be after start date.";
    if (tripStart && newStartDate < tripStart) return `Cannot start before trip (${tripStart}).`;
    if (tripEnd && newEndDate > tripEnd) return `Cannot end after trip (${tripEnd}).`;
    return null;
  })();

  const handleAddStop = async (e) => {
    e.preventDefault();
    if (!selectedPlace) { setAddError("Select a city from suggestions."); return; }
    if (stopDateError) { setAddError(stopDateError); return; }
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

  const handleSaveNotes = async (stopId) => {
    setSavingNotes((p) => ({ ...p, [stopId]: true }));
    try {
      await patchStop(stopId, { notes: editingNotes[stopId] ?? "" });
      loadData();
    } catch {} finally {
      setSavingNotes((p) => ({ ...p, [stopId]: false }));
    }
  };

  const daysBetween = (start, end) => {
    if (!start || !end) return 0;
    return Math.max(0, Math.round((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1);
  };

  if (loading) return (
    <AppLayout title="Itinerary Builder">
      <div className="flex items-center gap-3 py-10 text-slate-500">
        <span className="w-5 h-5 border-2 border-slate-300 border-t-violet-500 rounded-full animate-spin" />
        Loading trip...
      </div>
    </AppLayout>
  );
  if (!trip) return <AppLayout title="Not Found"><p className="text-slate-500">Trip not found.</p></AppLayout>;

  return (
    <AppLayout title={`Build: ${trip.name}`}>
      {/* Sub-header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">{trip.name}</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {trip.startDate} → {trip.endDate}
            {trip.startDate && trip.endDate && (
              <span className="ml-3 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 shadow-sm">
                {daysBetween(trip.startDate, trip.endDate)} days
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/trips/${trip.id}/budget`}
            className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-full text-sm font-bold shadow-sm hover:shadow-md hover:border-slate-300 hover:bg-slate-50 transition-all"
          >
            💰 Budget
          </Link>
          <Link
            to={`/trips/${trip.id}`}
            className="bg-black text-white hover:bg-yellow-400 hover:text-black px-6 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            Preview Itinerary
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Stops list with transport legs between them */}
        <div className="lg:col-span-2 space-y-0">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-black" /> Your Stops
            <span className="ml-auto text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">{trip.stops.length} stop{trip.stops.length !== 1 ? "s" : ""}</span>
          </h3>

          {/* Starting Point Banner */}
          {trip.startCity && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3 text-emerald-800 my-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/80 mb-0.5">Starting Point</p>
                <p className="font-black text-sm">{trip.startCity.name}, {trip.startCity.country}</p>
              </div>
            </div>
          )}

          {trip.stops.length === 0 && (
            <div className="text-center py-14 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
              <MapPin className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="font-semibold">No stops yet</p>
              <p className="text-sm mt-1">Search for a city on the right to add your first stop.</p>
            </div>
          )}

          {trip.stops.map((stop, index) => {
            const nights = daysBetween(stop.startDate, stop.endDate);
            const tz = timezones[stop.id];
            const notesKey = stop.id;
            const currentNotes = editingNotes[notesKey] !== undefined ? editingNotes[notesKey] : (stop.notes || "");

            return (
              <div key={stop.id}>
                {/* Transport Leg */}
                {index > 0 ? (
                  <TransportLeg
                    fromStop={trip.stops[index - 1]}
                    toStop={stop}
                    onUpdate={loadData}
                  />
                ) : (
                  trip.startCity && (
                    <TransportLeg
                      fromStop={{ city: trip.startCity }}
                      toStop={stop}
                      onUpdate={loadData}
                    />
                  )
                )}

                {/* Stop Card */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md flex items-start gap-4 group my-2 transition-shadow">
                  {/* Reorder controls */}
                  <div className="flex flex-col items-center space-y-1 text-slate-300 pt-2">
                    <button onClick={() => handleMoveStop(index, -1)} disabled={index === 0} className="hover:text-black disabled:opacity-20 transition-colors p-1 rounded-full hover:bg-slate-50">
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <GripVertical className="w-5 h-5 cursor-move" />
                    <button onClick={() => handleMoveStop(index, 1)} disabled={index === trip.stops.length - 1} className="hover:text-black disabled:opacity-20 transition-colors p-1 rounded-full hover:bg-slate-50">
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Stop number badge */}
                  <div className="w-8 h-8 rounded-full bg-black text-white text-sm font-black flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          {stop.city?.name || `City #${stop.cityId}`}
                          <span className="text-slate-400 text-sm font-normal ml-1">{stop.city?.country}</span>
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" /> {stop.startDate} → {stop.endDate}
                          </span>
                          <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-slate-700">{nights} day{nights !== 1 ? "s" : ""}</span>
                          {tz && (
                            <span className="bg-yellow-50 text-yellow-800 border border-yellow-200 px-3 py-1 rounded-full flex items-center gap-1">
                              <Globe className="w-3 h-3" />{tz}
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteStop(stop.id)} className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all ml-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Weather Widget */}
                    {stop.city?.latitude && stop.city?.longitude && (
                      <WeatherWidget
                        lat={stop.city.latitude}
                        lon={stop.city.longitude}
                        startDate={stop.startDate}
                        endDate={stop.endDate}
                      />
                    )}

                    {/* Accommodation */}
                    <AccommodationForm stop={stop} onUpdate={loadData} />

                    {/* Day Notes */}
                    <div className="mt-4 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <StickyNote className="w-3.5 h-3.5" /> Notes
                        </span>
                        {currentNotes !== (stop.notes || "") && (
                          <button
                            onClick={() => handleSaveNotes(stop.id)}
                            disabled={savingNotes[stop.id]}
                            className="text-xs font-bold text-black hover:text-yellow-600 flex items-center gap-1 bg-yellow-400 px-3 py-1 rounded-full shadow-sm"
                          >
                            {savingNotes[stop.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            Save
                          </button>
                        )}
                      </div>
                      <textarea
                        value={currentNotes}
                        onChange={(e) => setEditingNotes((p) => ({ ...p, [notesKey]: e.target.value }))}
                        rows={2}
                        placeholder="Day plans, reminders, tips..."
                        className="w-full border border-slate-200 rounded-xl py-2 px-3 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-black resize-none transition-all shadow-sm"
                      />
                    </div>

                    {/* Activities mini section */}
                    <div className="mt-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="text-sm font-bold text-slate-900">Activities</span>
                        <Link to={`/trips/${tripId}/activities?cityId=${stop.cityId || stop.city?.id}`} className="text-xs font-bold text-white bg-black hover:bg-yellow-400 hover:text-black px-3 py-1.5 rounded-full transition-all">+ Add</Link>
                      </div>
                      {!stop.tripActivities?.length ? (
                        <p className="text-xs text-slate-400 italic">No activities planned yet.</p>
                      ) : (
                        <ul className="space-y-1">
                          {stop.tripActivities.map((act) => (
                            <li key={act.id} className="text-xs bg-white p-2 rounded-lg border border-slate-100 flex justify-between items-center">
                              <span className="font-medium text-slate-700">{act.dayDate} {act.startTime && `@ ${act.startTime}`}</span>
                              <span className="text-slate-400">{"\u20B9"}{act.cost}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Add stop panel */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 h-fit sticky top-24 overflow-hidden">
          <div className="h-2 bg-yellow-400" />
          <div className="p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Add a Stop</h3>

            {addError && (
              <div className="flex items-start gap-2 bg-red-50 text-red-600 p-3 mb-4 rounded-xl text-xs font-semibold border border-red-100">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />{addError}
              </div>
            )}

            <form onSubmit={handleAddStop} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">City *</label>
                <PlacesAutocomplete
                  value={cityQuery}
                  onChange={(v) => { setCityQuery(v); if (!v) setSelectedPlace(null); }}
                  onSelect={(place) => setSelectedPlace(place)}
                  placeholder="Search any city worldwide..."
                />
                {selectedPlace && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-900 font-bold bg-yellow-50 px-3 py-2 rounded-xl border border-yellow-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-yellow-600" />
                    {selectedPlace.name}, {selectedPlace.country}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Start Date *</label>
                <input
                  type="date" required
                  value={newStartDate}
                  min={tripStart || undefined}
                  max={tripEnd || undefined}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 rounded-full py-3 px-4 text-sm font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">End Date *</label>
                <input
                  type="date" required
                  value={newEndDate}
                  min={newStartDate || tripStart || undefined}
                  max={tripEnd || undefined}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 rounded-full py-3 px-4 text-sm font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black focus:bg-white transition-all"
                />
              </div>

              {stopDateError && (
                <p className="text-xs text-amber-600 font-semibold flex items-center gap-1.5 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />{stopDateError}
                </p>
              )}

              {newStartDate && newEndDate && !stopDateError && (
                <p className="text-xs text-violet-600 font-semibold">
                  {"\uD83D\uDCC5"} {daysBetween(newStartDate, newEndDate)} day{daysBetween(newStartDate, newEndDate) !== 1 ? "s" : ""}
                </p>
              )}

              <button
                type="submit"
                disabled={addLoading || !!stopDateError || !selectedPlace}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full text-sm font-bold text-white bg-black hover:bg-yellow-400 hover:text-black shadow-md focus:outline-none active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {addLoading ? (
                  <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Adding...</>
                ) : (
                  <><Plus className="w-4 h-4" />Add Stop</>
                )}
              </button>
            </form>

            {trip.startDate && trip.endDate && (
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 font-medium">
                {"\uD83D\uDCC5"} Trip range: {trip.startDate} {"\u2192"} {trip.endDate}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Currency Widget */}
      <CurrencyWidget />
    </AppLayout>
  );
}
