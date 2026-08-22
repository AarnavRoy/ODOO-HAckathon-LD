import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import PlacesAutocomplete from "../components/PlacesAutocomplete";
import { upsertCity } from "../api/cities";
import { createTrip } from "../api/trips";
import { CalendarDays, DollarSign, FileText, Image, MapPin, AlertCircle, Sparkles, Home } from "lucide-react";

export default function CreateTrip() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get pre-filled destination info from URL params or navigation state
  const paramDestination = searchParams.get("destination") || location.state?.destination || "";
  const paramCountry = searchParams.get("country") || location.state?.country || "";
  const paramCover = searchParams.get("coverPhotoUrl") || searchParams.get("cover") || location.state?.imageUrl || "";

  const [formData, setFormData] = useState({
    name: paramDestination ? `Trip to ${paramDestination}` : "",
    startDate: "",
    endDate: "",
    description: paramDestination ? `Exploring the best of ${paramDestination}${paramCountry ? `, ${paramCountry}` : ""}!` : "",
    coverPhotoUrl: paramCover,
    budgetLimit: "",
  });
  
  const [startPointQuery, setStartPointQuery] = useState("");
  const [selectedStartPoint, setSelectedStartPoint] = useState(null);
  const [destinationQuery, setDestinationQuery] = useState(
    paramDestination ? `${paramDestination}${paramCountry ? `, ${paramCountry}` : ""}` : ""
  );
  const [selectedPlace, setSelectedPlace] = useState(
    paramDestination ? { name: paramDestination, country: paramCountry } : null
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (paramDestination && !formData.name) {
      setFormData((f) => ({
        ...f,
        name: `Trip to ${paramDestination}`,
        coverPhotoUrl: f.coverPhotoUrl || paramCover,
        description: f.description || `Exploring the best of ${paramDestination}${paramCountry ? `, ${paramCountry}` : ""}!`,
      }));
      setDestinationQuery(`${paramDestination}${paramCountry ? `, ${paramCountry}` : ""}`);
      setSelectedPlace({ name: paramDestination, country: paramCountry });
    }
  }, [paramDestination, paramCountry, paramCover]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Compute trip duration
  const tripDuration = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return null;
    const diff = (new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24);
    return diff >= 0 ? diff + 1 : null;
  }, [formData.startDate, formData.endDate]);

  const dateError = formData.startDate && formData.endDate && formData.startDate > formData.endDate;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dateError) {
      setError("End date must be after start date.");
      return;
    }
    if (!selectedStartPoint) {
      setError("Please select a valid Starting Point from the suggestions.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Upsert the start city to get its ID
      const startCity = await upsertCity(selectedStartPoint);

      const trip = await createTrip({
        ...formData,
        startCityId: startCity.id,
        budgetLimit: formData.budgetLimit ? Number(formData.budgetLimit) : null,
      });
      navigate(`/trips/${trip.id}/build`);
    } catch (err) {
      setError(err.message || "Failed to create trip.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Plan a New Trip">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Plan a New Trip ✈️</h1>
          <p className="text-slate-500 mt-1 font-medium">Fill in the details below to start building your itinerary.</p>
        </div>

        {/* Pre-filled Destination Alert */}
        {paramDestination && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-violet-500/10 border border-rose-200 text-slate-800 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500 text-white rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Pre-filled with {paramDestination} {paramCountry ? `(${paramCountry})` : ""}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Destination name and cover photo have been pre-selected for you.
                </p>
              </div>
            </div>
            {paramCover && (
              <img 
                src={paramCover} 
                alt={paramDestination} 
                className="w-12 h-12 rounded-xl object-cover border border-rose-200 shrink-0 shadow-sm"
              />
            )}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="h-2 bg-yellow-400" />

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="flex items-start gap-3 bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-100">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Trip Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Trip Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Summer in Europe"
                className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black focus:border-black focus:bg-white transition-all"
              />
            </div>

            {/* Starting Point */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                <Home className="inline w-4 h-4 mr-1 text-slate-400" />
                Starting Point (Home City) *
              </label>
              <PlacesAutocomplete
                value={startPointQuery}
                onChange={setStartPointQuery}
                onSelect={setSelectedStartPoint}
                placeholder="Where are you traveling from?"
              />
              {selectedStartPoint && (
                <div className="mt-2 flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-2 rounded-lg text-xs font-semibold">
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  <span>{selectedStartPoint.name}, {selectedStartPoint.country}</span>
                </div>
              )}
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Primary Destination
                <span className="ml-2 font-normal text-slate-400 text-xs">(optional, for reference)</span>
              </label>
              <PlacesAutocomplete
                value={destinationQuery}
                onChange={setDestinationQuery}
                onSelect={(place) => {
                  setSelectedPlace(place);
                  if (place && !formData.name) {
                    setFormData((f) => ({ ...f, name: `Trip to ${place.name}` }));
                  }
                }}
                placeholder="Search any city in the world..."
              />

              {selectedPlace && (
                <div className="mt-2 flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-slate-900 px-3 py-2 rounded-lg text-xs font-bold">
                  <MapPin className="w-4 h-4 shrink-0 text-yellow-600" />
                  <span>{selectedPlace.name}{selectedPlace.country ? `, ${selectedPlace.country}` : ""}</span>
                  {selectedPlace.lat && (
                    <span className="ml-auto text-slate-400 font-medium">
                      {selectedPlace.lat.toFixed(2)}°, {selectedPlace.lng.toFixed(2)}°
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Date range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  <CalendarDays className="inline w-3.5 h-3.5 mr-1" />Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full border-2 bg-slate-50 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 focus:bg-white transition-all ${dateError ? "border-red-400" : "border-slate-200"}`}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  <CalendarDays className="inline w-3.5 h-3.5 mr-1" />End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  required
                  value={formData.endDate}
                  min={formData.startDate || undefined}
                  onChange={handleChange}
                  className={`w-full border-2 bg-slate-50 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 focus:bg-white transition-all ${dateError ? "border-red-400" : "border-slate-200"}`}
                />
              </div>
            </div>

            {tripDuration !== null && !dateError && (
              <p className="text-xs font-bold text-slate-900 -mt-3">
                🗓️ {tripDuration} day{tripDuration !== 1 ? "s" : ""}
              </p>
            )}

            {dateError && (
              <p className="text-xs font-semibold text-red-500 -mt-3">⚠️ End date must be after start date</p>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                <FileText className="inline w-3.5 h-3.5 mr-1" />Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly describe your trip goals or theme..."
                className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black focus:border-black focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Cover Photo URL */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                <Image className="inline w-3.5 h-3.5 mr-1" />Cover Photo URL
              </label>
              <input
                type="url"
                name="coverPhotoUrl"
                value={formData.coverPhotoUrl}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
                className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-black focus:border-black focus:bg-white transition-all"
              />
              {formData.coverPhotoUrl && (
                <img
                  src={formData.coverPhotoUrl}
                  alt="Cover preview"
                  onError={(e) => e.currentTarget.classList.add("hidden")}
                  className="mt-2 h-36 w-full object-cover rounded-xl border border-slate-200 shadow-sm"
                />
              )}
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                <DollarSign className="inline w-3.5 h-3.5 mr-1" />Budget Limit (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  name="budgetLimit"
                  required
                  min="0"
                  value={formData.budgetLimit}
                  onChange={handleChange}
                  placeholder="50000"
                  className="w-full pl-8 pr-4 border-2 border-slate-200 bg-slate-50 rounded-xl py-2.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate("/trips")}
                className="py-3 px-6 rounded-full text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !!dateError}
                className="inline-flex items-center gap-2 py-3 px-8 rounded-full text-sm font-bold text-white bg-black hover:bg-yellow-400 hover:text-black shadow-md focus:outline-none active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Trip 🚀"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
