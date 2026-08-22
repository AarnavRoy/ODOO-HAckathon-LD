import { useState, useEffect, useRef } from 'react';
import AppLayout from '../components/AppLayout';
import { getMe, updateMe } from '../api/auth';
import { motion } from 'framer-motion';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getMe().then(data => {
      setUser(data.user || data);
      setName((data.user || data)?.name || '');
      setLoading(false);
    }).catch(err => {
      console.error(err);
      if (err.status === 401 || err.status === 403) { localStorage.removeItem('token'); window.location.href = '/login'; }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMe({ name });
      setMessage('Profile updated successfully');
    } catch (err) {
      setMessage('Failed to update profile');
    }
  };

  if (loading) return <AppLayout title="Profile"><div className="text-center py-20 text-slate-500 animate-pulse font-semibold">Loading profile...</div></AppLayout>;

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm";

  return (
    <AppLayout title="Profile">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg bg-white/[0.03] border border-white/[0.06] p-8 rounded-2xl backdrop-blur-sm">
        {message && (
          <div className={`p-4 mb-6 rounded-xl text-sm font-semibold border ${message.includes('success') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
            <input type="email" disabled value={user?.email || ''} className={`${inputClass} opacity-50 cursor-not-allowed`} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
            className="w-full py-3 rounded-xl text-sm font-bold text-[#0c0f1a] bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/20 transition-all">
            Save Changes
          </motion.button>
        </form>
      </motion.div>
    </AppLayout>
  );
}
