import { useState, useEffect, useRef } from 'react';
import AppLayout from '../components/AppLayout';
import { getMe, updateMe, uploadProfilePhoto, deleteMe } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMe().then(data => {
      setUser(data.user || data);
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

  // Clean up preview blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage('Only image files are allowed (JPEG, PNG, GIF, WebP)');
      e.target.value = '';
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setMessage('Image must be smaller than 5MB');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setMessage('');

    // Create local preview
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      // Upload photo first if a new file was selected
      if (selectedFile) {
        const uploadResult = await uploadProfilePhoto(selectedFile);
        user.profilePhotoUrl = uploadResult.profilePhotoUrl;
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
      }

      await updateMe(user);
      setMessage('Profile updated successfully');
    } catch (err) {
      setMessage(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      await deleteMe();
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  // Determine which image to show: preview > saved photo > initials
  const displayPhotoUrl = previewUrl || user?.profilePhotoUrl;

  if (loading) return <AppLayout title="Profile Settings"><div className="text-center py-10">Loading...</div></AppLayout>;

  return (
    <AppLayout title="Profile Settings">
      <div className="max-w-2xl bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {message && <div className={`p-3 mb-4 rounded text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-6 mb-6">
            <div 
              className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {displayPhotoUrl ? (
                <img src={displayPhotoUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-500 text-2xl font-bold">
                  {user.name?.charAt(0)}
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">Change</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
              />
              <p className="mt-1 text-xs text-gray-400">JPEG, PNG, GIF or WebP. Max 5MB.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="name" required value={user.name || ''} onChange={handleChange} 
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address (Read-only)</label>
            <input type="email" readOnly value={user.email || ''} 
                   className="mt-1 block w-full border border-gray-300 bg-gray-50 rounded-md shadow-sm py-2 px-3 text-gray-500 sm:text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Language Preference</label>
            <select name="languagePreference" value={user.languagePreference || 'English'} onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Japanese">Japanese</option>
            </select>
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <button type="button" onClick={handleDelete} className="text-red-600 hover:text-red-800 text-sm font-medium">
              Delete Account
            </button>
            <button type="submit" disabled={saving} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
