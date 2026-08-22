import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, X } from "lucide-react";

/**
 * PlacesAutocomplete
 * Uses OpenStreetMap Nominatim (free, no API key needed).
 * Props:
 *   value        controlled string value shown in the input
 *   onChange     called with raw string on input change
 *   onSelect     called with { name, country, lat, lng } on selection
 *   placeholder  input placeholder
 *   className    extra class names for the wrapper div
 */
export default function PlacesAutocomplete({
  value = "",
  onChange,
  onSelect,
  placeholder = "Search for a city...",
  className = "",
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=7&featuretype=city`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await res.json();

      const seen = new Set();
      const results = data
        .map((item) => ({
          name:
            item.address?.city ||
            item.address?.town ||
            item.address?.village ||
            item.address?.county ||
            item.name,
          country: item.address?.country || "",
          countryCode: (item.address?.country_code || "").toUpperCase(),
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }))
        .filter((item) => {
          const key = `${item.name}|${item.country}`;
          if (seen.has(key) || !item.name) return false;
          seen.add(key);
          return true;
        });

      setSuggestions(results);
      setOpen(results.length > 0);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange?.(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 400);
  };

  const handleSelect = (suggestion) => {
    onChange?.(suggestion.name + (suggestion.country ? `, ${suggestion.country}` : ""));
    onSelect?.({ name: suggestion.name, country: suggestion.country, lat: suggestion.lat, lng: suggestion.lng });
    setSuggestions([]);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const handleClear = () => {
    onChange?.("");
    onSelect?.(null);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <MapPin className="absolute left-3 w-4 h-4 text-violet-500 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-9 pr-9 py-2.5 border-2 border-[#1F2937] bg-[#131A2A] rounded-xl text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:bg-[#131A2A] transition-all placeholder:text-slate-400"
        />
        {loading && <Loader2 className="absolute right-3 w-4 h-4 text-slate-400 animate-spin" />}
        {!loading && value && (
          <button type="button" onClick={handleClear} className="absolute right-3 text-slate-400 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-[#131A2A] border border-[#1F2937] rounded-xl shadow-xl overflow-hidden" role="listbox">
          {suggestions.map((s, i) => (
            <li
              key={`${s.name}-${s.country}-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={() => handleSelect(s)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors text-sm ${i === activeIndex ? "bg-violet-50" : "hover:bg-[#131A2A]"} ${i > 0 ? "border-t border-slate-100" : ""}`}
            >
              <span className="text-lg leading-none mt-0.5 select-none">{countryFlag(s.countryCode)}</span>
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">{s.name}</p>
                <p className="text-xs text-slate-400 truncate">{s.country}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function countryFlag(code) {
  if (!code || code.length !== 2) return "??";
  const offset = 127397;
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => c.charCodeAt(0) + offset));
}


