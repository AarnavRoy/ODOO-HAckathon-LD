import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getTripBudget } from '../api/budget';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { IndianRupee, ArrowLeft, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TripBudget() {
  const { tripId } = useParams();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTripBudget(tripId).then(data => { setBudget(data); setLoading(false); }).catch(() => setLoading(false));
  }, [tripId]);

  if (loading) return (
    <AppLayout title="Budget">
      <div className="text-center py-20 text-slate-400 animate-pulse font-semibold">
        Calculating Budget Breakdown...
      </div>
    </AppLayout>
  );

  if (!budget) return (
    <AppLayout title="Budget">
      <div className="text-center py-20 text-slate-400 font-semibold">
        Failed to load budget data.
      </div>
    </AppLayout>
  );

  const chartData = [
    { name: 'Transport', value: budget.byCategory?.transport || 0 },
    { name: 'Accommodation', value: budget.byCategory?.stay || 0 },
    { name: 'Activities', value: budget.byCategory?.activities || 0 },
    { name: 'Meals', value: budget.byCategory?.meals || 0 }
  ].filter(d => d.value > 0);

  const COLORS = ['#eab308', '#0f172a', '#f59e0b', '#10b981'];

  return (
    <AppLayout title="Budget Overview">
      <div className="mb-6">
        <Link to={`/trips/${tripId}`} className="text-slate-300 hover:text-amber-400 font-bold flex items-center text-sm transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Itinerary
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-[#131A2A] border border-slate-100 p-8 rounded-3xl shadow-sm flex flex-col justify-center items-center text-center">
          <div className="flex items-center mb-3">
            <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl mr-3 border border-yellow-200">
              <IndianRupee className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Estimated Cost</span>
          </div>
          <div className="text-5xl font-black tracking-tight text-white">
            ₹{budget.total?.toLocaleString('en-IN') || 0}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#131A2A] border border-slate-100 p-6 rounded-3xl shadow-sm h-72 flex justify-center items-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip 
                  formatter={(v) => `₹${v.toLocaleString('en-IN')}`} 
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '1rem', 
                    color: '#0f172a',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ color: '#475569', fontWeight: 700, fontSize: '0.8rem' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-slate-400 font-semibold">No budget data available</div>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-xl font-black tracking-tight text-white mb-5 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-amber-400" /> Daily Breakdown
        </h2>
        <div className="bg-[#131A2A] border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#131A2A]/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Cost</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budget.byDay?.map(day => (
                <tr key={day.date} className={`${day.overBudget ? 'bg-red-50/30' : ''} hover:bg-yellow-50/40 transition-colors`}>
                  <td className="px-6 py-4 font-bold text-white">{new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                  <td className="px-6 py-4 font-black text-white">₹{day.cost?.toLocaleString('en-IN') || 0}</td>
                  <td className="px-6 py-4">
                    {day.overBudget ? (
                      <span className="inline-flex items-center text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-bold border border-red-200">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Over Budget
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full font-bold border border-emerald-200">
                        <CheckCircle className="w-3 h-3 mr-1" /> On Track
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {(!budget.byDay || budget.byDay.length === 0) && (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-400 font-semibold">No daily data available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AppLayout>
  );
}




