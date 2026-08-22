import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getTripBudget } from '../api/budget';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { IndianRupee, ArrowLeft, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TripBudget() {
  const { tripId } = useParams();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTripBudget(tripId).then(data => { setBudget(data); setLoading(false); }).catch(() => setLoading(false));
  }, [tripId]);

  if (loading) return <AppLayout title="Budget"><div className="text-center py-20 text-slate-500 animate-pulse font-semibold">Calculating...</div></AppLayout>;
  if (!budget) return <AppLayout title="Budget"><div className="text-center py-20 text-slate-500">Failed to load.</div></AppLayout>;

  const chartData = [
    { name: 'Transport', value: budget.byCategory.transport },
    { name: 'Accommodation', value: budget.byCategory.stay },
    { name: 'Activities', value: budget.byCategory.activities },
    { name: 'Meals', value: budget.byCategory.meals }
  ].filter(d => d.value > 0);

  const COLORS = ['#06b6d4', '#f43f5e', '#f59e0b', '#10b981'];

  return (
    <AppLayout title="Budget Overview">
      <div className="mb-8">
        <Link to={`/trips/${tripId}`} className="text-amber-400 hover:text-amber-300 font-bold flex items-center text-sm transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Itinerary
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] border border-white/[0.06] p-8 rounded-2xl flex flex-col justify-center items-center">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl mr-3"><IndianRupee className="w-6 h-6 text-amber-400" /></div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Estimated Cost</span>
          </div>
          <div className="text-5xl font-extrabold tracking-tight text-white">₹{budget.total?.toLocaleString('en-IN') || 0}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/[0.03] border border-white/[0.06] p-6 rounded-2xl h-72 flex justify-center items-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={5} dataKey="value" stroke="none">
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#f1f5f9' }} />
                <Legend iconType="circle" wrapperStyle={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.8rem' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-slate-600 font-medium">No budget data</div>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-xl font-extrabold tracking-tight text-white mb-5 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-cyan-400" /> Daily Breakdown
        </h2>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Cost</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {budget.byDay?.map(day => (
                <tr key={day.date} className={`${day.overBudget ? 'bg-red-500/5' : ''} hover:bg-white/[0.02] transition-colors`}>
                  <td className="px-6 py-4 font-semibold text-slate-300">{new Date(day.date).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4 font-bold text-white">₹{day.cost?.toLocaleString('en-IN') || 0}</td>
                  <td className="px-6 py-4">
                    {day.overBudget ? (
                      <span className="inline-flex items-center text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-full font-bold"><AlertTriangle className="w-3 h-3 mr-1" /> Over Budget</span>
                    ) : (
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full font-bold">On Track</span>
                    )}
                  </td>
                </tr>
              ))}
              {(!budget.byDay || budget.byDay.length === 0) && (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-600 font-medium">No daily data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AppLayout>
  );
}
