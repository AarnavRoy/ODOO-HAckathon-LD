import { useState, useEffect, useRef } from 'react';
import AppLayout from '../components/AppLayout';
import LocationSelector from '../components/LocationSelector';
import { getMe, updateMe, uploadProfilePhoto } from '../api/auth';
import { motion } from 'framer-motion';
import { User, Mail, Camera, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [name, setName] = useState('');
  const [location, setLocation] = useState({ country: '', state: '', city: '' });
  
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);

  const fileInputRef = useRef(null);

  useEffect(() => {
    getMe().then(data => {
      const u = data.user || data;
      setUser(u);
      setName(u?.name || '');
      setLocation({
        country: u?.country || '',
        state: u?.state || '',
        city: u?.city || '',
      });
      setLoading(false);
    }).catch(err => {
      console.error(err);
      if (err.status === 401 || err.status === 403) { 
        localStorage.removeItem('token'); 
        window.location.href = '/login'; 
      }
      setLoading(false);
    });
  }, []);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage('Only image files (JPEG, PNG, GIF, WebP) are allowed.');
      setIsSuccess(false);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage('Image size must be smaller than 5MB.');
      setIsSuccess(false);
      return;
    }

    setUploadingPhoto(true);
    setMessage('');
    try {
      const res = await uploadProfilePhoto(file);
      setUser(prev => ({ ...prev, profilePhotoUrl: res.profilePhotoUrl }));
      setMessage('Profile photo updated successfully!');
      setIsSuccess(true);
    } catch (err) {
      setMessage(err.message || 'Failed to upload profile photo.');
      setIsSuccess(false);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);

    try {
      const updated = await updateMe({
        name: name.trim(),
        country: location.country,
        state: location.state,
        city: location.city,
      });
      setUser(updated.user || updated);
      setMessage('Profile and location updated successfully!');
      setIsSuccess(true);
    } catch (err) {
      setMessage(err.message || 'Failed to update profile.');
      setIsSuccess(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Profile">
        <div className="text-center py-20 text-slate-500 animate-pulse font-semibold">
          Loading profile...
        </div>
      </AppLayout>
    );
  }

  const inputClass = "w-full bg-white/[0.04] border border-white/[0.12] rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 transition-all text-sm";

  return (
    <AppLayout title="Profile Settings">
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-2xl bg-white/[0.03] border border-white/[0.08] p-8 rounded-3xl backdrop-blur-md shadow-2xl"
      >
        {/* Header summary */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-white/[0.08]">
          {/* Avatar with Upload */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-amber-400/50 bg-slate-800 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {user?.profilePhotoUrl ? (
                <img src={user.profilePhotoUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-semibold"
            >
              {uploadingPhoto ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Camera className="w-5 h-5 mb-0.5 text-amber-400" />
                  <span>Change</span>
                </>
              )}
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/jpeg,image/png,image/gif,image/webp" 
              className="hidden" 
              onChange={handlePhotoSelect} 
            />
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
              {user?.name} <Sparkles className="w-5 h-5 text-amber-400" />
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">@{user?.username || 'user'}</p>
            <p className="text-xs text-slate-500 mt-1 flex items-center justify-center sm:justify-start gap-1">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        {message && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 mb-6 rounded-2xl text-sm font-semibold border flex items-center gap-2.5 ${
              isSuccess 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {isSuccess ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />}
            <span>{message}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (Read only) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
            </label>
            <input 
              type="email" 
              disabled 
              value={user?.email || ''} 
              className={`${inputClass} opacity-50 cursor-not-allowed`} 
            />
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" /> Full Name *
            </label>
            <input 
              type="text" 
              required
              value={name} 
              onChange={e => setName(e.target.value)} 
              className={inputClass} 
              placeholder="e.g. Jane Doe"
            />
          </div>

          {/* Cascading Location Selector (Country -> State -> City) */}
          <div className="pt-2">
            <div className="mb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Location Information
              </h3>
              <p className="text-xs text-slate-400">
                Select your verified location using the dependent Country, State, and City selectors.
              </p>
            </div>

            <LocationSelector
              country={location.country}
              state={location.state}
              city={location.city}
              onChange={setLocation}
            />
          </div>

          {/* Save Button */}
          <motion.button 
            whileHover={{ scale: 1.01 }} 
            whileTap={{ scale: 0.99 }} 
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-[#0c0f1a] bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
              </>
            ) : (
              'Save Changes'
            )}
          </motion.button>
        </form>
      </motion.div>
    </AppLayout>
  );
}
