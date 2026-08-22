import { useState, useEffect } from "react";
import { getLiveCurrencyRates } from "../api/travel";
import { RefreshCw, X, DollarSign } from "lucide-react";

const POPULAR_CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
];

/**
 * CurrencyWidget — floating bottom-right widget for live currency conversion.
 */
export default function CurrencyWidget() {
  const [open, setOpen] = useState(false);
  const [baseCurrency, setBaseCurrency] = useState("INR");
  const [rates, setRates] = useState(null);
  const [rateDate, setRateDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(1000);

  const fetchRates = async () => {
    setLoading(true);
    const data = await getLiveCurrencyRates(baseCurrency);
    if (data?.rates) {
      setRates(data.rates);
      setRateDate(data.date || "");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchRates();
  }, [open, baseCurrency]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        title="Currency Converter"
      >
        <DollarSign className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-white" />
          <span className="text-sm font-bold text-white">Live Currency Rates</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={fetchRates}
            disabled={loading}
            className="text-white/80 hover:text-white p-1 rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="text-white/80 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Base currency + amount */}
        <div className="flex gap-2">
          <select
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value)}
            className="border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {POPULAR_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="flex-1 border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Rates */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-4 text-xs text-slate-400">
            <span className="w-4 h-4 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
            Fetching live rates...
          </div>
        ) : rates ? (
          <div className="max-h-48 overflow-y-auto space-y-1">
            {POPULAR_CURRENCIES.filter((c) => c.code !== baseCurrency && rates[c.code]).map((c) => {
              const converted = (amount * rates[c.code]).toFixed(2);
              return (
                <div key={c.code} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-700">{c.symbol}</span>
                    <span className="text-xs text-slate-500">{c.code}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-800">{Number(converted).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">({rates[c.code].toFixed(4)})</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-2">Could not fetch rates.</p>
        )}

        {rateDate && (
          <p className="text-[10px] text-slate-400 text-center">
            Rates from {rateDate} via Frankfurter API (ECB data)
          </p>
        )}
      </div>
    </div>
  );
}
