import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { getTrips, deleteTrip } from '../api/trips';
import { Calendar, MapPin, MoreVertical, Trash2, Edit2, Eye } from 'lucide-react';

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = () => {
    setLoading(true);
    getTrips().then(data => {
      setTrips(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      await deleteTrip(id);
      loadTrips();
    }
  };

  if (loading) return <AppLayout title="My Trips"><div className="text-center py-10">Loading...</div></AppLayout>;

  return (
    <AppLayout title="My Trips">
      <div className="mb-6 flex justify-end">
        <Link to="/trips/new" className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700">
          Create New Trip
        </Link>
      </div>
      
      {trips.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">You haven't created any trips yet.</p>
          <Link to="/trips/new" className="text-blue-600 font-medium hover:underline">Start planning now</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map(trip => (
            <div key={trip.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="h-48 relative">
                <img src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05'} alt={trip.name} className="w-full h-full object-cover" />
                {trip.isPublic && <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-semibold">Public</span>}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{trip.name}</h3>
                <div className="flex items-center text-gray-500 text-sm mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  {trip.startDate} - {trip.endDate}
                </div>
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  {trip.stopCount} destinations
                </div>
                <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <Link to={`/trips/${trip.id}/build`} className="text-gray-600 hover:text-blue-600 flex items-center text-sm" title="Edit Itinerary">
                      <Edit2 className="w-4 h-4 mr-1" /> Edit
                    </Link>
                    <Link to={`/trips/${trip.id}`} className="text-gray-600 hover:text-green-600 flex items-center text-sm" title="View Itinerary">
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Link>
                  </div>
                  <button onClick={() => handleDelete(trip.id)} className="text-gray-400 hover:text-red-600" title="Delete Trip">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
