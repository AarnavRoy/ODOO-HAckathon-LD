import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getDashboard } from '../api/trips';
import { getMe } from '../api/auth';
import { Plane, MapPin, DollarSign, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboard(), getMe()]).then(([dashData, userData]) => {
      setData(dashData);
      setUser(userData.user);
      setLoading(false);
    });
  }, []);

  if (loading) return <AppLayout><div className="text-center py-20 text-slate-500 animate-pulse">Loading dashboard...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter text-slate-900">Welcome back, {user?.name}</h2>
          <p className="mt-2 text-lg text-slate-500 max-w-[65ch]">Ready to plan your next great adventure?</p>
        </div>
        <Link to="/trips/new" className="inline-flex items-center justify-center bg-slate-900 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-slate-800 active:scale-[0.98] transition-all duration-200">
          Plan New Trip <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>

      {/* Breathable Metrics - removing generic cards, using divide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 border-y border-slate-200/60 py-8">
        <div className="flex flex-col">
          <div className="flex items-center text-slate-500 mb-2">
            <Plane className="w-4 h-4 mr-2" />
            <h3 className="text-sm font-medium uppercase tracking-wider">Recent Trips</h3>
          </div>
          <p className="text-5xl font-bold tracking-tighter text-slate-900">{data?.recentTrips?.length || 0}</p>
        </div>
        <div className="flex flex-col md:border-l border-slate-200/60 md:pl-8">
          <div className="flex items-center text-slate-500 mb-2">
            <MapPin className="w-4 h-4 mr-2" />
            <h3 className="text-sm font-medium uppercase tracking-wider">Explore</h3>
          </div>
          <p className="text-5xl font-bold tracking-tighter text-slate-900">{data?.recommendedCities?.length || 0}</p>
        </div>
        <div className="flex flex-col md:border-l border-slate-200/60 md:pl-8">
          <div className="flex items-center text-slate-500 mb-2">
            <DollarSign className="w-4 h-4 mr-2" />
            <h3 className="text-sm font-medium uppercase tracking-wider">Budget Spent</h3>
          </div>
          <p className="text-5xl font-bold tracking-tighter text-slate-900">${data?.budgetHighlights?.totalSpent || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold tracking-tighter text-slate-900">Your Recent Trips</h3>
            <Link to="/trips" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors">View all</Link>
          </div>
          <div className="divide-y divide-slate-200/60">
            {data?.recentTrips?.map(trip => (
              <div key={trip.id} className="py-4 flex justify-between items-center group">
                <div>
                  <h4 className="font-semibold text-lg text-slate-900 group-hover:text-emerald-600 transition-colors">{trip.name}</h4>
                  <p className="text-sm text-slate-500">{trip.startDate} to {trip.endDate}</p>
                </div>
                <Link to={`/trips/${trip.id}/build`} className="text-slate-400 hover:text-emerald-600 text-sm font-medium transition-colors">Edit</Link>
              </div>
            ))}
            {data?.recentTrips?.length === 0 && <p className="text-slate-500 py-4">No trips planned yet.</p>}
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold tracking-tighter text-slate-900 mb-6">Recommended Destinations</h3>
          <div className="grid grid-cols-2 gap-4">
            {data?.recommendedCities?.map(city => (
              <div key={city.id} className="relative rounded-lg overflow-hidden aspect-[4/3] group cursor-pointer">
                <img src={city.imageUrl} alt={city.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent flex items-end p-4">
                  <div>
                    <span className="block text-white font-semibold text-lg leading-tight">{city.name}</span>
                    <span className="block text-slate-300 text-sm">{city.country}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
