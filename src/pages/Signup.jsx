import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/auth';
import { Globe, ArrowRight } from 'lucide-react';
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
    setLoading(true);
    try {
      const data = await signup({ name, email, password });
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] relative overflow-hidden font-sans">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80"
          alt="Road trip adventure"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#0c0f1a]/95 via-[#0c0f1a]/70 to-[#0c0f1a]/40"></div>
      </div>

      <div className="relative z-10 min-h-[100dvh] flex flex-row-reverse">
        <div className="w-full md:w-[480px] flex flex-col justify-center px-8 md:px-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center text-white mb-12">
              <Globe className="w-8 h-8 mr-3 text-amber-400" />
              <span className="text-2xl font-extrabold tracking-tight">GlobeTrotter</span>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight">
              Start your<br />journey.
            </h1>
            <p className="text-slate-400 mb-10 text-lg">Create an account to plan unforgettable trips.</p>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 mb-6 rounded-xl text-sm font-semibold">
                {error}
              </motion.div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm"
                  placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm"
                  placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm" />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-[#0c0f1a] bg-amber-400 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all shadow-lg shadow-amber-500/20"
              >
                {loading ? 'Creating account...' : 'Create account'} <ArrowRight className="w-4 h-4 ml-2" />
              </motion.button>
            </form>

            <p className="mt-8 text-sm text-slate-500">
              Already have an account? <Link to="/login" className="font-bold text-amber-400 hover:text-amber-300 transition-colors">Sign in</Link>
            </p>
          </motion.div>
        </div>

        <div className="hidden md:flex flex-1 items-end p-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="max-w-lg">
            <p className="text-3xl font-extrabold text-white/90 tracking-tight leading-tight mb-4">
              "Not all those who wander are lost."
            </p>
            <p className="text-amber-400 font-semibold">— J.R.R. Tolkien</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
