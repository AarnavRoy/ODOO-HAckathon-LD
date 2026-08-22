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
    getTripBudget(tripId).then(data => {
      setBudget(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [tripId]);

  if (loading) return <AppLayout title="Trip Budget"><div className="text-center py-20 font-semibold text-slate-500 animate-pulse">Calculating budget...</div></AppLayout>;
  if (!budget) return <AppLayout title="Trip Budget"><div className="text-center py-20 font-semibold text-slate-500">Failed to load budget data.</div></AppLayout>;

  const chartData = [
    { name: 'Transport', value: budget.byCategory.transport },
    { name: 'Accommodation', value: budget.byCategory.stay },
    { name: 'Activities', value: budget.byCategory.activities },
    { name: 'Meals', value: budget.byCategory.meals }
  ].filter(d => d.value > 0);

  // Vibrant, high-contrast colors for the chart
  const COLORS = ['#8b5cf6', '#d946ef', '#f97316', '#14b8a6'];

  return (
    <AppLayout title="Budget Overview">
      <div className="flex justify-between items-center mb-8">
        <Link to={`/trips/${tripId}`} className="text-violet-600 hover:text-violet-700 font-bold flex items-center transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Itinerary
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-100 via-fuchsia-50 to-orange-50 rounded-3xl -z-10 transform -skew-y-1"></div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 100 }} className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-white/50 flex flex-col justify-center items-center">
          <div className="flex items-center text-orange-600 mb-4">
            <div className="p-3 bg-orange-100 rounded-2xl mr-3"><IndianRupee className="w-6 h-6" /></div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">Total Estimated Cost</h2>
          </div>
          <div className="text-6xl font-black tracking-tighter bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
            ₹{budget.total?.toLocaleString('en-IN') || 0}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 100, delay: 0.1 }} className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/50 h-72 flex justify-center items-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={6} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontWeight: 'bold', color: '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-slate-400 font-medium">No budget data available</div>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-2xl font-black tracking-tighter text-slate-900 mb-6 flex items-center">
          <TrendingUp className="w-6 h-6 mr-3 text-fuchsia-500" /> Daily Breakdown
        </h2>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">Date</th>
                <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">Cost</th>
                <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {budget.byDay?.map((day, i) => (
                <tr key={day.date} className={`transition-colors ${day.overBudget ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50'}`}>
                  <td className="px-6 py-4 font-semibold text-slate-700">{new Date(day.date).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4 font-black text-slate-900">₹{day.cost?.toLocaleString('en-IN') || 0}</td>
                  <td className="px-6 py-4">
                    {day.overBudget ? (
                      <span className="inline-flex items-center text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-bold">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Over Budget
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-bold">
                        On Track
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {(!budget.byDay || budget.byDay.length === 0) && (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-slate-400 font-medium">No daily data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AppLayout>
  );
}
