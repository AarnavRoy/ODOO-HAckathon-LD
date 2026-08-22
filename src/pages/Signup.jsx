import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/auth';
import { Plane, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Email Validation (Restrict to specific providers)
    if (!/^[^\s@]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/i.test(email)) {
      setError('Please enter a valid email address from a supported provider (e.g. @gmail.com, @yahoo.com)');
      return;
    }

    // Password Validation: letters, numbers, special characters
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])/.test(password)) {
      setError('Password must contain at least one letter, one number, and one special character.');
      return;
    }

    setLoading(true);
    try {
      const { token } = await signup({ name, email, password });
      localStorage.setItem('token', token);
      navigate('/');
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.message.includes('NetworkError')) {
        setError('Cannot connect to server. Is the backend running?');
      } else {
        setError(err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col md:flex-row-reverse overflow-hidden font-sans">
      {/* Right side: Form (Reversed layout for variety) */}
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} transition={{ type: "spring", stiffness: 70, damping: 20 }}
        className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white z-10 shadow-[-20px_0_40px_rgba(0,0,0,0.05)] relative"
      >
        <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-l from-orange-500 via-fuchsia-500 to-violet-600"></div>
        
        <div className="w-full max-w-sm">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center text-slate-900 mb-10 font-black text-3xl tracking-tighter">
            <Plane className="w-8 h-8 mr-3 text-orange-500" /> GlobeTrotter
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-3 flex items-center">
              Join the journey <Sparkles className="w-6 h-6 ml-2 text-fuchsia-500" />
            </h2>
            <p className="text-slate-500 mb-8 font-medium">Create an account to start planning your next adventure.</p>
          </motion.div>
          
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 text-red-600 p-4 mb-6 rounded-xl text-sm font-bold border border-red-100">
              {error}
            </motion.div>
          )}
          
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} 
                     className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all font-medium sm:text-sm" 
                     placeholder="Jane Doe" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Email address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} 
                     className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all font-medium sm:text-sm" 
                     placeholder="name@example.com" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} 
                     className="w-full border-2 border-slate-100 bg-slate-50 rounded-xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all font-medium sm:text-sm" />
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-orange-500/30 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-fuchsia-600 hover:from-orange-400 hover:to-fuchsia-500 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all duration-200"
            >
              {loading ? 'Creating...' : 'Create account'}
            </motion.button>
          </motion.form>
          
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 text-center text-sm font-medium text-slate-500">
            Already have an account? <Link to="/login" className="font-bold text-orange-500 hover:text-orange-600">Sign in</Link>
          </motion.p>
        </div>
      </motion.div>
      
      {/* Left side: Image / Asset */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
        className="hidden md:block w-full md:w-1/2 relative bg-slate-900 overflow-hidden"
      >
        <motion.img 
          initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 10, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" alt="Adventure travel" className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-overlay" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/90 via-slate-900/40 to-transparent flex items-end p-16">
          <motion.blockquote initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="text-white">
            <p className="text-3xl font-black tracking-tighter mb-4 leading-tight">"Not all those who wander are lost."</p>
            <footer className="text-orange-200 font-medium">— J.R.R. Tolkien</footer>
          </motion.blockquote>
        </div>
      </motion.div>
    </div>
  );
}
