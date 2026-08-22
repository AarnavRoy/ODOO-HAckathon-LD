import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/auth';
import { Plane } from 'lucide-react';

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
      const { token } = await signup({ name, email, password });
      localStorage.setItem('token', token);
      navigate('/');
    } catch (err) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col md:flex-row-reverse">
      {/* Right side: Form (Reversed layout for variety) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white z-10 shadow-[-1px_0_20px_rgba(0,0,0,0.03)]">
        <div className="w-full max-w-sm">
          <div className="flex items-center text-slate-900 mb-8 font-bold text-2xl tracking-tight">
            <Plane className="w-6 h-6 mr-2 text-emerald-600" /> GlobeTrotter
          </div>
          
          <h2 className="text-4xl font-bold tracking-tighter text-slate-900 mb-2">Join the journey</h2>
          <p className="text-slate-500 mb-8">Create an account to start planning your next adventure.</p>
          
          {error && <div className="bg-red-50 text-red-700 p-3 mb-6 rounded-md text-sm font-medium border border-red-100">{error}</div>}
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} 
                     className="w-full border border-slate-200 bg-slate-50 rounded-md py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors sm:text-sm" 
                     placeholder="Jane Doe" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Email address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} 
                     className="w-full border border-slate-200 bg-slate-50 rounded-md py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors sm:text-sm" 
                     placeholder="name@example.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} 
                     className="w-full border border-slate-200 bg-slate-50 rounded-md py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors sm:text-sm" />
            </div>
            
            <button type="submit" disabled={loading}
                    className="w-full flex justify-center py-2.5 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 active:scale-[0.98] transition-all duration-200">
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-700">Sign in</Link>
          </p>
        </div>
      </div>
      
      {/* Left side: Image / Asset */}
      <div className="hidden md:block w-full md:w-1/2 relative bg-slate-900 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" alt="Adventure travel" className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent flex items-end p-16">
          <blockquote className="text-white">
            <p className="text-2xl font-medium tracking-tight mb-4">"Not all those who wander are lost."</p>
            <footer className="text-slate-300">— J.R.R. Tolkien</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
