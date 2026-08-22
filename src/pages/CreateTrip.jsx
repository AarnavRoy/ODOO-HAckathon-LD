import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { createTrip } from '../api/trips';
import { motion } from 'framer-motion';

export default function CreateTrip() {
  const [formData, setFormData] = useState({
    name: '', startDate: '', endDate: '', description: '', coverPhotoUrl: '', budgetLimit: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.startDate > formData.endDate) { setError('End date must be after start date'); return; }
    setError(''); setLoading(true);
    try {
      const trip = await createTrip({ ...formData, budgetLimit: Number(formData.budgetLimit) });
      navigate(`/trips/${trip.id}/build`);
    } catch (err) { setError('Failed to create trip'); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm";

  return (
    <AppLayout title="Plan a New Trip">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl bg-white/[0.03] border border-white/[0.06] p-8 rounded-2xl backdrop-blur-sm">
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 mb-6 rounded-xl text-sm font-semibold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Trip Name *</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange}
              className={inputClass} placeholder="e.g., Rajasthan Road Trip" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Start Date *</label>
              <input type="date" name="startDate" required value={formData.startDate} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">End Date *</label>
              <input type="date" name="endDate" required value={formData.endDate} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
            <textarea name="description" rows="3" value={formData.description} onChange={handleChange}
              className={inputClass} placeholder="Briefly describe your trip goals" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Cover Photo URL</label>
            <input type="url" name="coverPhotoUrl" value={formData.coverPhotoUrl} onChange={handleChange}
              className={inputClass} placeholder="https://example.com/image.jpg" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Budget Limit (₹) *</label>
            <input type="number" name="budgetLimit" required min="0" value={formData.budgetLimit} onChange={handleChange}
              className={inputClass} placeholder="50000" />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-white/5">
            <button type="button" onClick={() => navigate('/trips')} className="py-3 px-6 rounded-xl text-sm font-bold text-slate-400 border border-white/10 hover:bg-white/5 active:scale-95 transition-all">
              Cancel
            </button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
              className="py-3 px-6 rounded-xl text-sm font-bold text-[#0c0f1a] bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
              {loading ? 'Creating...' : 'Create Trip'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </AppLayout>
  );
}
