import { useState, useEffect } from "react";
import { getWeatherForecast } from "../api/travel";
import { CloudRain } from "lucide-react";

/**
 * WeatherWidget — shows real-time weather for a city during the stop dates.
 * Props: lat, lon, startDate, endDate
 */
export default function WeatherWidget({ lat, lon, startDate, endDate }) {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lat || !lon) { setLoading(false); return; }
    setLoading(true);
    getWeatherForecast(lat, lon, 16).then((data) => {
      // Filter to stop date range if possible
      if (startDate && endDate && data.length) {
        const filtered = data.filter((d) => d.date >= startDate && d.date <= endDate);
        setForecast(filtered.length > 0 ? filtered : data.slice(0, 7));
      } else {
        setForecast(data.slice(0, 7));
      }
      setLoading(false);
    });
  }, [lat, lon, startDate, endDate]);

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400 py-2">
        <span className="w-3 h-3 border border-[#1F2937] border-t-violet-400 rounded-full animate-spin" />
        Loading weather...
      </div>
    );
  }

  if (!forecast.length) {
    return (
      <div className="text-xs text-slate-400 italic py-1 flex items-center gap-1">
        <CloudRain className="w-3 h-3" /> Forecast not available for these dates
      </div>
    );
  }

  return (
    <div className="mt-2">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">??? Weather Forecast</p>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {forecast.map((day) => (
          <div
            key={day.date}
            className="flex-shrink-0 bg-[#131A2A] border border-slate-100 rounded-lg px-2 py-1.5 text-center min-w-[60px]"
          >
            <p className="text-[10px] font-medium text-slate-400">
              {new Date(day.date + "T00:00:00").toLocaleDateString("en", { weekday: "short", day: "numeric" })}
            </p>
            <p className="text-lg leading-none my-0.5">{day.emoji}</p>
            <p className="text-[10px] font-bold text-slate-300">
              {Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°
            </p>
            {day.rainPercent > 0 && (
              <p className="text-[9px] text-blue-500 font-semibold">?? {day.rainPercent}%</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


