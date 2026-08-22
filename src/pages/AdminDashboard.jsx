import React, { useState, useEffect } from 'react';
import { getAdminStats } from '../api/trips';
import { Users, Plane, MapPin, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading admin stats...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-blue-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
            <Users className="text-blue-500" size={20} />
          </div>
          <div className="text-3xl font-bold">{stats.totalUsers}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-green-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Total Trips</h3>
            <Plane className="text-green-500" size={20} />
          </div>
          <div className="text-3xl font-bold">{stats.totalTrips}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-purple-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Daily Active</h3>
            <Activity className="text-purple-500" size={20} />
          </div>
          <div className="text-3xl font-bold">{stats.engagement.dailyActive}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-orange-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Weekly Active</h3>
            <Activity className="text-orange-500" size={20} />
          </div>
          <div className="text-3xl font-bold">{stats.engagement.weeklyActive}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin size={20} /> Top Cities
          </h2>
          <div className="space-y-4">
            {stats.topCities.map(city => (
              <div key={city.id} className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-3">
                  <img src={city.imageUrl} alt={city.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-medium">{city.name}</div>
                    <div className="text-xs text-gray-500">{city.country}</div>
                  </div>
                </div>
                <div className="text-sm font-medium px-2 py-1 bg-gray-100 rounded">
                  Score: {city.popularityScore}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity size={20} /> Top Activities
          </h2>
          <div className="space-y-4">
            {stats.topActivities.map(act => (
              <div key={act.id} className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-3">
                  <img src={act.imageUrl} alt={act.name} className="w-10 h-10 rounded object-cover" />
                  <div>
                    <div className="font-medium">{act.name}</div>
                    <div className="text-xs text-gray-500">{act.category}</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-green-600">
                  ${act.cost}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
