import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTripBudget } from '../api/budget';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function TripBudget() {
  const { tripId } = useParams();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTripBudget(tripId).then(data => {
      setBudget(data);
      setLoading(false);
    });
  }, [tripId]);

  if (loading) return <div className="p-8 text-center">Loading budget...</div>;
  if (!budget) return <div className="p-8 text-center">Failed to load.</div>;

  const chartData = [
    { name: 'Transport', value: budget.byCategory.transport },
    { name: 'Accommodation', value: budget.byCategory.stay },
    { name: 'Activities', value: budget.byCategory.activities },
    { name: 'Meals', value: budget.byCategory.meals }
  ].filter(d => d.value > 0);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trip Budget</h1>
        <Link to={`/trips/${tripId}`} className="text-blue-600 hover:underline">Back to Itinerary</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border flex flex-col justify-center items-center">
          <h2 className="text-xl text-gray-600 mb-2">Total Estimated Cost</h2>
          <div className="text-4xl font-bold text-gray-900">${budget.total.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border h-64 flex justify-center items-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-gray-400">No budget data available</div>
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Daily Breakdown</h2>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-700">Date</th>
              <th className="px-4 py-3 font-medium text-gray-700">Cost</th>
              <th className="px-4 py-3 font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {budget.byDay.map(day => (
              <tr key={day.date} className={day.overBudget ? 'bg-red-50' : ''}>
                <td className="px-4 py-3">{new Date(day.date).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-medium">${day.cost.toFixed(2)}</td>
                <td className="px-4 py-3">
                  {day.overBudget ? (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">Over Budget</span>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">On Track</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
