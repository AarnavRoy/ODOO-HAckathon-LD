import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { createTrip } from '../api/trips';

export default function CreateTrip() {
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    coverPhotoUrl: '',
    budgetLimit: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.startDate > formData.endDate) {
      setError('End date must be after start date');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const trip = await createTrip({
        ...formData,
        budgetLimit: Number(formData.budgetLimit)
      });
      navigate(`/trips/${trip.id}/build`);
    } catch (err) {
      setError('Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Plan a New Trip">
      <div className="max-w-2xl bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        {error && <div className="bg-red-50 text-red-700 p-3 mb-4 rounded text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Trip Name *</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} 
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                   placeholder="e.g., Summer in Europe" />
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date *</label>
              <input type="date" name="startDate" required value={formData.startDate} onChange={handleChange} 
                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date *</label>
              <input type="date" name="endDate" required value={formData.endDate} onChange={handleChange} 
                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" rows="3" value={formData.description} onChange={handleChange} 
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                      placeholder="Briefly describe your trip goals" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Cover Photo URL</label>
            <input type="url" name="coverPhotoUrl" value={formData.coverPhotoUrl} onChange={handleChange} 
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                   placeholder="https://example.com/image.jpg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Budget Limit (₹) *</label>
            <input type="number" name="budgetLimit" required min="0" value={formData.budgetLimit} onChange={handleChange} 
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                   placeholder="5000" />
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={() => navigate('/trips')} className="bg-white py-3 px-6 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 active:scale-95 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="inline-flex justify-center py-3 px-6 border border-transparent shadow-lg shadow-violet-500/30 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-4 focus:ring-violet-500/30 active:scale-95 transition-all">
              {loading ? 'Creating...' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
