import { useState, useEffect } from "react";
import { patchStop } from "../api/stops";
import {
  getRouteInfo, getFlightDistance, estimateFlightTime,
  getNearbyAirports, getNearbyRailStations, getNearbyBusStations,
  formatDuration, formatDistance, TRANSPORT_MODES,
} from "../api/travel";
import {
  ChevronDown, ChevronUp, Clock, MapPin, Ticket, Save, Loader2,
} from "lucide-react";

/**
 * TransportLeg — shows between two stops.
 * Props: fromStop, toStop, onUpdate (callback after save)
 */
export default function TransportLeg({ fromStop, toStop, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Real-time data
  const [routeInfo, setRouteInfo] = useState(null);
  const [airDistance, setAirDistance] = useState(null);
  const [airports, setAirports] = useState({ from: [], to: [] });
  const [railStations, setRailStations] = useState({ from: [], to: [] });
  const [busStations, setBusStations] = useState({ from: [], to: [] });
  const [loadingTerminals, setLoadingTerminals] = useState(false);

  // Editable fields (saved to toStop)
  const [mode, setMode] = useState(toStop.transportMode || "");
  const [depTerminal, setDepTerminal] = useState(toStop.departureTerminal || "");
  const [arrTerminal, setArrTerminal] = useState(toStop.arrivalTerminal || "");
  const [depTime, setDepTime] = useState(toStop.departureTime || "");
  const [arrTime, setArrTime] = useState(toStop.arrivalTime || "");
  const [bookingRef, setBookingRef] = useState(toStop.bookingReference || "");
  const [cost, setCost] = useState(toStop.transportCost || "");

  const fromCity = fromStop.city;
  const toCity = toStop.city;
  const hasCoords = fromCity?.latitude && fromCity?.longitude && toCity?.latitude && toCity?.longitude;

  // Fetch OSRM route + Haversine on mount
  useEffect(() => {
    if (!hasCoords) return;
    getRouteInfo(fromCity.latitude, fromCity.longitude, toCity.latitude, toCity.longitude).then(setRouteInfo);
    setAirDistance(getFlightDistance(fromCity.latitude, fromCity.longitude, toCity.latitude, toCity.longitude));
  }, [fromCity, toCity, hasCoords]);

  // Fetch nearby terminals when expanded
  useEffect(() => {
    if (!expanded || !hasCoords) return;
    setLoadingTerminals(true);
    Promise.all([
      getNearbyAirports(fromCity.latitude, fromCity.longitude),
      getNearbyAirports(toCity.latitude, toCity.longitude),
      getNearbyRailStations(fromCity.latitude, fromCity.longitude),
      getNearbyRailStations(toCity.latitude, toCity.longitude),
      getNearbyBusStations(fromCity.latitude, fromCity.longitude),
      getNearbyBusStations(toCity.latitude, toCity.longitude),
    ]).then(([aFrom, aTo, rFrom, rTo, bFrom, bTo]) => {
      setAirports({ from: aFrom, to: aTo });
      setRailStations({ from: rFrom, to: rTo });
      setBusStations({ from: bFrom, to: bTo });
      setLoadingTerminals(false);
    });
  }, [expanded, hasCoords, fromCity, toCity]);

  // Determine which terminal list to show based on mode
  const getTerminalOptions = (direction) => {
    const list = direction === "from"
      ? (mode === "FLIGHT" ? airports.from : mode === "TRAIN" ? railStations.from : mode === "BUS" ? busStations.from : [])
      : (mode === "FLIGHT" ? airports.to : mode === "TRAIN" ? railStations.to : mode === "BUS" ? busStations.to : []);
    return list.map((t) => t.iata ? `${t.name} (${t.iata})` : t.name);
  };

  // Distance/duration for current mode
  const displayDistance = mode === "FLIGHT" ? airDistance : routeInfo?.distanceKm;
  const displayDuration = mode === "FLIGHT"
    ? (airDistance ? estimateFlightTime(airDistance) : null)
    : routeInfo?.durationMin;

  const modeInfo = TRANSPORT_MODES.find((m) => m.value === mode);

  const handleSave = async () => {
    setSaving(true);
    try {
      await patchStop(toStop.id, {
        transportMode: mode || null,
        departureTerminal: depTerminal || null,
        arrivalTerminal: arrTerminal || null,
        departureTime: depTime || null,
        arrivalTime: arrTime || null,
        bookingReference: bookingRef || null,
        transportCost: cost ? Number(cost) : null,
        distanceKm: displayDistance || null,
      });
      onUpdate?.();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative my-1">
      {/* Connecting line */}
      <div className="absolute left-[13px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-300 to-fuchsia-300" />

      <div className="ml-5 bg-[#131A2A] border border-[#1F2937] rounded-xl overflow-hidden">
        {/* Compact header bar */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-[#1F2937] transition-colors"
        >
          <span className="text-base">{modeInfo?.emoji || "??"}</span>
          <span className="text-xs font-bold text-slate-300 flex-1">
            {fromCity?.name} ? {toCity?.name}
          </span>

          {displayDistance && (
            <span className="text-xs bg-[#131A2A] border border-[#1F2937] px-2 py-0.5 rounded-full text-slate-400 font-semibold">
              {formatDistance(displayDistance)}
            </span>
          )}
          {displayDuration && (
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" />{formatDuration(displayDuration)}
            </span>
          )}
          {bookingRef && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <Ticket className="w-3 h-3" />{bookingRef}
            </span>
          )}

          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {/* Expanded form */}
        {expanded && (
          <div className="px-4 pb-4 pt-2 border-t border-[#1F2937] space-y-3">
            {/* Mode selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Mode of Travel</label>
              <div className="flex flex-wrap gap-1.5">
                {TRANSPORT_MODES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMode(m.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      mode === m.value
                        ? "bg-violet-600 text-white shadow-md shadow-violet-500/30"
                        : "bg-[#131A2A] border border-[#1F2937] text-slate-300 hover:bg-[#131A2A]"
                    }`}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance + Duration (read-only, from APIs) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#131A2A] border border-[#1F2937] rounded-lg p-3">
                <p className="text-xs font-bold text-slate-400 mb-0.5">Distance</p>
                <p className="text-lg font-black text-white">
                  {displayDistance ? `${displayDistance.toLocaleString()} km` : "—"}
                </p>
                <p className="text-[10px] text-slate-400">
                  {mode === "FLIGHT" ? "Air distance (Haversine)" : "Road distance (OSRM)"}
                </p>
              </div>
              <div className="bg-[#131A2A] border border-[#1F2937] rounded-lg p-3">
                <p className="text-xs font-bold text-slate-400 mb-0.5">Est. Travel Time</p>
                <p className="text-lg font-black text-white">{formatDuration(displayDuration)}</p>
                <p className="text-[10px] text-slate-400">
                  {mode === "FLIGHT" ? "~800 km/h avg + 30min taxi" : "Driving estimate"}
                </p>
              </div>
            </div>

            {/* Terminals */}
            {mode && ["FLIGHT", "TRAIN", "BUS"].includes(mode) && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    <MapPin className="inline w-3 h-3 mr-0.5" />Departure ({fromCity?.name})
                  </label>
                  {loadingTerminals ? (
                    <div className="flex items-center gap-1 text-xs text-slate-400"><Loader2 className="w-3 h-3 animate-spin" />Loading...</div>
                  ) : (
                    <>
                      <select
                        value={depTerminal}
                        onChange={(e) => setDepTerminal(e.target.value)}
                        className="w-full border border-[#1F2937] rounded-lg py-1.5 px-2 text-xs font-medium bg-[#131A2A] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                      >
                        <option value="">Select or type below</option>
                        {getTerminalOptions("from").map((name, i) => (
                          <option key={i} value={name}>{name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={depTerminal}
                        onChange={(e) => setDepTerminal(e.target.value)}
                        placeholder="Or type terminal name..."
                        className="w-full mt-1 border border-[#1F2937] rounded-lg py-1.5 px-2 text-xs font-medium bg-[#131A2A] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                      />
                    </>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    <MapPin className="inline w-3 h-3 mr-0.5" />Arrival ({toCity?.name})
                  </label>
                  {loadingTerminals ? (
                    <div className="flex items-center gap-1 text-xs text-slate-400"><Loader2 className="w-3 h-3 animate-spin" />Loading...</div>
                  ) : (
                    <>
                      <select
                        value={arrTerminal}
                        onChange={(e) => setArrTerminal(e.target.value)}
                        className="w-full border border-[#1F2937] rounded-lg py-1.5 px-2 text-xs font-medium bg-[#131A2A] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                      >
                        <option value="">Select or type below</option>
                        {getTerminalOptions("to").map((name, i) => (
                          <option key={i} value={name}>{name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={arrTerminal}
                        onChange={(e) => setArrTerminal(e.target.value)}
                        placeholder="Or type terminal name..."
                        className="w-full mt-1 border border-[#1F2937] rounded-lg py-1.5 px-2 text-xs font-medium bg-[#131A2A] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Times */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Departure Time</label>
                <input
                  type="time"
                  value={depTime}
                  onChange={(e) => setDepTime(e.target.value)}
                  className="w-full border border-[#1F2937] rounded-lg py-1.5 px-2 text-xs font-medium bg-[#131A2A] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Arrival Time</label>
                <input
                  type="time"
                  value={arrTime}
                  onChange={(e) => setArrTime(e.target.value)}
                  className="w-full border border-[#1F2937] rounded-lg py-1.5 px-2 text-xs font-medium bg-[#131A2A] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>

            {/* Booking ref + Cost */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  <Ticket className="inline w-3 h-3 mr-0.5" />Booking / PNR
                </label>
                <input
                  type="text"
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  placeholder="e.g., PNR123456"
                  className="w-full border border-[#1F2937] rounded-lg py-1.5 px-2 text-xs font-medium bg-[#131A2A] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Transport Cost (?)</label>
                <input
                  type="number"
                  min="0"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0"
                  className="w-full border border-[#1F2937] rounded-lg py-1.5 px-2 text-xs font-medium bg-[#131A2A] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>

            {/* Save button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-md shadow-violet-500/20 active:scale-95 transition-all disabled:opacity-60"
            >
              {saving ? <><Loader2 className="w-3 h-3 animate-spin" />Saving...</> : <><Save className="w-3 h-3" />Save Transport Details</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


