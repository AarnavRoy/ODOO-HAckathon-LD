import { useState } from "react";
import { patchStop } from "../api/stops";
import { ChevronDown, ChevronUp, Hotel, Save, Loader2, Clock, Ticket } from "lucide-react";

/**
 * AccommodationForm — collapsible hotel/stay form per stop.
 * Props: stop, onUpdate
 */
export default function AccommodationForm({ stop, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(stop.accommodationName || "");
  const [checkin, setCheckin] = useState(stop.accommodationCheckin || "");
  const [checkout, setCheckout] = useState(stop.accommodationCheckout || "");
  const [bookingRef, setBookingRef] = useState(stop.accommodationBookingRef || "");
  const [notes, setNotes] = useState(stop.accommodationNotes || "");
  const [cost, setCost] = useState(stop.accommodationCost || "");

  const hasData = name || checkin || checkout || bookingRef;

  const handleSave = async () => {
    setSaving(true);
    try {
      await patchStop(stop.id, {
        accommodationName: name || null,
        accommodationCheckin: checkin || null,
        accommodationCheckout: checkout || null,
        accommodationBookingRef: bookingRef || null,
        accommodationNotes: notes || null,
        accommodationCost: cost ? Number(cost) : null,
      });
      onUpdate?.();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-2 border border-slate-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#131A2A] transition-colors"
      >
        <Hotel className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-xs font-bold text-slate-300 flex-1">
          {hasData ? name || "Accommodation" : "Where are you staying?"}
        </span>
        {hasData && (
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
            {name || "Booked"}
          </span>
        )}
        {cost && (
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
            ?{Number(cost).toLocaleString()}
          </span>
        )}
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-2 border-t border-slate-100 space-y-2.5 bg-[#131A2A]/50">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">
              <Hotel className="inline w-3 h-3 mr-0.5" />Hotel / Hostel / Airbnb Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., The Taj Palace"
              className="w-full border border-[#1F2937] rounded-lg py-1.5 px-2 text-xs font-medium bg-[#131A2A] focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">
                <Clock className="inline w-3 h-3 mr-0.5" />Check-in Time
              </label>
              <input
                type="time"
                value={checkin}
                onChange={(e) => setCheckin(e.target.value)}
                className="w-full border border-[#1F2937] rounded-lg py-1.5 px-2 text-xs font-medium bg-[#131A2A] focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">
                <Clock className="inline w-3 h-3 mr-0.5" />Check-out Time
              </label>
              <input
                type="time"
                value={checkout}
                onChange={(e) => setCheckout(e.target.value)}
                className="w-full border border-[#1F2937] rounded-lg py-1.5 px-2 text-xs font-medium bg-[#131A2A] focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">
                <Ticket className="inline w-3 h-3 mr-0.5" />Booking Confirmation #
              </label>
              <input
                type="text"
                value={bookingRef}
                onChange={(e) => setBookingRef(e.target.value)}
                placeholder="e.g., BKG-12345"
                className="w-full border border-[#1F2937] rounded-lg py-1.5 px-2 text-xs font-medium bg-[#131A2A] focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1">Accommodation Cost (?)</label>
              <input
                type="number"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0"
                className="w-full border border-[#1F2937] rounded-lg py-1.5 px-2 text-xs font-medium bg-[#131A2A] focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">Notes / Address</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Address, WiFi password, room number..."
              className="w-full border border-[#1F2937] rounded-lg py-1.5 px-2 text-xs font-medium bg-[#131A2A] focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-sm active:scale-95 transition-all disabled:opacity-60"
          >
            {saving ? <><Loader2 className="w-3 h-3 animate-spin" />Saving...</> : <><Save className="w-3 h-3" />Save Stay Details</>}
          </button>
        </div>
      )}
    </div>
  );
}


