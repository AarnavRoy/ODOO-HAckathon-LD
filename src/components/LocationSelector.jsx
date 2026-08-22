import { useState, useEffect } from 'react';
import { getCountries, getStatesOfCountry, getCitiesOfState } from '../api/location';
import { Globe, MapPin, Building2, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';

export default function LocationSelector({ country = '', state = '', city = '', onChange }) {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // 1. Fetch Countries on Mount
  useEffect(() => {
    let isMounted = true;
    getCountries().then((data) => {
      if (isMounted) {
        setCountries(data);
        setLoadingCountries(false);
      }
    }).catch(() => {
      if (isMounted) setLoadingCountries(false);
    });
    return () => { isMounted = false; };
  }, []);

  // 2. Fetch States when Country changes
  useEffect(() => {
    if (!country) {
      setStates([]);
      setCities([]);
      return;
    }

    let isMounted = true;
    setLoadingStates(true);
    getStatesOfCountry(country).then((data) => {
      if (isMounted) {
        setStates(data);
        setLoadingStates(false);
      }
    }).catch(() => {
      if (isMounted) setLoadingStates(false);
    });

    return () => { isMounted = false; };
  }, [country]);

  // 3. Fetch Cities when State changes
  useEffect(() => {
    if (!country || !state) {
      setCities([]);
      return;
    }

    let isMounted = true;
    setLoadingCities(true);
    getCitiesOfState(country, state).then((data) => {
      if (isMounted) {
        setCities(data);
        setLoadingCities(false);
      }
    }).catch(() => {
      if (isMounted) setLoadingCities(false);
    });

    return () => { isMounted = false; };
  }, [country, state]);

  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    onChange({ country: newCountry, state: '', city: '' });
  };

  const handleStateChange = (e) => {
    const newState = e.target.value;
    onChange({ country, state: newState, city: '' });
  };

  const handleCityChange = (e) => {
    const newCity = e.target.value;
    onChange({ country, state, city: newCity });
  };

  const selectClasses = "w-full bg-white/[0.04] border border-white/[0.12] rounded-xl py-3 pl-10 pr-9 text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-white/[0.12]";

  return (
    <div className="space-y-4">
      {/* Country Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" /> Country *
          </span>
          {loadingCountries && (
            <span className="text-[11px] text-slate-400 font-normal flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Loading countries...
            </span>
          )}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Globe className="w-4 h-4 text-cyan-400/80" />
          </div>
          <select
            value={country || ''}
            onChange={handleCountryChange}
            disabled={loadingCountries}
            className={selectClasses}
          >
            <option value="" className="bg-slate-900 text-slate-400">
              {loadingCountries ? "Loading countries..." : "-- Select Country --"}
            </option>
            {countries.map((c) => (
              <option key={c.name} value={c.name} className="bg-slate-900 text-white">
                {c.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* State / Province Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-400" /> State / Province *
          </span>
          {loadingStates && (
            <span className="text-[11px] text-rose-300/80 font-normal flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Fetching states...
            </span>
          )}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <MapPin className="w-4 h-4 text-rose-400/80" />
          </div>
          <select
            value={state || ''}
            onChange={handleStateChange}
            disabled={!country || loadingStates}
            className={selectClasses}
          >
            <option value="" className="bg-slate-900 text-slate-400">
              {!country 
                ? "Select a Country first" 
                : loadingStates 
                ? "Loading states..." 
                : states.length === 0 
                ? "No specific states listed (Optional)" 
                : "-- Select State / Province --"}
            </option>
            {states.map((s) => (
              <option key={s} value={s} className="bg-slate-900 text-white">
                {s}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* City Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-400" /> City *
          </span>
          {loadingCities && (
            <span className="text-[11px] text-amber-300/80 font-normal flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Fetching cities...
            </span>
          )}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Building2 className="w-4 h-4 text-amber-400/80" />
          </div>
          <select
            value={city || ''}
            onChange={handleCityChange}
            disabled={!state || loadingCities}
            className={selectClasses}
          >
            <option value="" className="bg-slate-900 text-slate-400">
              {!state 
                ? "Select a State first" 
                : loadingCities 
                ? "Loading cities..." 
                : cities.length === 0 
                ? "No specific cities listed" 
                : "-- Select City --"}
            </option>
            {cities.map((c) => (
              <option key={c} value={c} className="bg-slate-900 text-white">
                {c}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Selected Location Summary Badge */}
      {country && state && city && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Location Verified: {city}, {state}, {country}</span>
        </div>
      )}
    </div>
  );
}
