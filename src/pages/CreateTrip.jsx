import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { createTrip, uploadTripCoverPhoto } from '../api/trips';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only image files are allowed (JPEG, PNG, GIF, WebP)');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be smaller than 5MB');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setError('');

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
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
      // Create the trip first
      const trip = await createTrip({
        ...formData,
        budgetLimit: Number(formData.budgetLimit)
      });

      // Upload cover photo if a file was selected
      if (selectedFile && trip.id) {
        await uploadTripCoverPhoto(trip.id, selectedFile);
      }

      navigate(`/trips/${trip.id}/build`);
    } catch (err) {
      setError(err.message || 'Failed to create trip');
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
            <label className="block text-sm font-medium text-gray-700">Cover Photo</label>
            <div 
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="relative w-full">
                  <img src={previewUrl} alt="Cover preview" className="w-full h-40 object-cover rounded-md" />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md">
                    <span className="text-white text-sm font-medium">Change Image</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-xs text-gray-500">Click to upload an image</p>
                  <p className="text-xs text-gray-400">JPEG, PNG, GIF or WebP. Max 5MB.</p>
                </div>
              )}
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden" 
            />
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
