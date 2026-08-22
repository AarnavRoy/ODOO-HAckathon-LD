import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getDashboard } from '../api/trips';
import { getMe } from '../api/auth';
import { Plane, MapPin, DollarSign } from 'lucide-react';

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

  if (loading) return <AppLayout><div className="text-center py-10">Loading...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h2>
          <p className="mt-1 text-gray-500">Ready for your next adventure?</p>
        </div>
        <Link to="/trips/new" className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700">
          Plan New Trip
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center text-blue-600 mb-2">
            <Plane className="w-5 h-5 mr-2" />
            <h3 className="font-semibold text-gray-900">Recent Trips</h3>
          </div>
          <p className="text-3xl font-bold">{data?.recentTrips?.length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center text-green-600 mb-2">
            <MapPin className="w-5 h-5 mr-2" />
            <h3 className="font-semibold text-gray-900">Places to Explore</h3>
          </div>
          <p className="text-3xl font-bold">{data?.recommendedCities?.length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center text-purple-600 mb-2">
            <DollarSign className="w-5 h-5 mr-2" />
            <h3 className="font-semibold text-gray-900">Budget Spent</h3>
          </div>
          <p className="text-3xl font-bold">${data?.budgetHighlights?.totalSpent || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Your Recent Trips</h3>
            <Link to="/trips" className="text-blue-600 hover:underline text-sm font-medium">View all</Link>
          </div>
          <div className="space-y-4">
            {data?.recentTrips?.map(trip => (
              <div key={trip.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-lg">{trip.name}</h4>
                  <p className="text-sm text-gray-500">{trip.startDate} to {trip.endDate}</p>
                </div>
                <Link to={`/trips/${trip.id}/build`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit Trip</Link>
              </div>
            ))}
            {data?.recentTrips?.length === 0 && <p className="text-gray-500">No trips planned yet.</p>}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Destinations</h3>
          <div className="grid grid-cols-2 gap-4">
            {data?.recommendedCities?.map(city => (
              <div key={city.id} className="relative rounded-lg overflow-hidden h-32 shadow-sm">
                <img src={city.imageUrl} alt={city.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end p-3">
                  <span className="text-white font-semibold">{city.name}, {city.country}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
