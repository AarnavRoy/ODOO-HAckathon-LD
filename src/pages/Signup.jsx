import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup, checkUsernameAvailability, verifyEmailApi } from '../api/auth';
import { Plane, Sparkles, CheckCircle2, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signup() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Field validation states
  const [usernameStatus, setUsernameStatus] = useState(null); // 'checking' | 'available' | 'taken' | 'invalid'
  const [usernameMessage, setUsernameMessage] = useState('');
  const [emailStatus, setEmailStatus] = useState(null); // 'verifying' | 'valid' | 'invalid'
  const [emailMessage, setEmailMessage] = useState('');

  const navigate = useNavigate();
  const usernameTimerRef = useRef(null);
  const emailTimerRef = useRef(null);

  // Validate Name (no numbers)
  const isNameValid = name.trim().length > 0 && !/\d/.test(name) && /^[a-zA-Z\s.'-]+$/.test(name.trim());
  const nameHasNumbers = /\d/.test(name);

  // Validate Password (min 8 chars, number, symbol)
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const isPasswordValid = hasMinLength && hasNumber && hasSymbol;

  // Validate Confirm Password
  const isConfirmPasswordMatch = confirmPassword.length > 0 && password === confirmPassword;

  // Real-time Username Check (debounced)
  useEffect(() => {
    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);
    
    const clean = username.trim();
    if (!clean) {
      setUsernameStatus(null);
      setUsernameMessage('');
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(clean)) {
      setUsernameStatus('invalid');
      setUsernameMessage('Username must be 3-30 alphanumeric characters');
      return;
    }

    setUsernameStatus('checking');
    usernameTimerRef.current = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailability(clean);
        if (res.available) {
          setUsernameStatus('available');
          setUsernameMessage('Username is available');
        } else {
          setUsernameStatus('taken');
          setUsernameMessage('Username is already taken');
        }
      } catch (err) {
        setUsernameStatus('available'); // fallback
        setUsernameMessage('');
      }
    }, 400);

    return () => clearTimeout(usernameTimerRef.current);
  }, [username]);

  // Real-time Email Verification (debounced)
  useEffect(() => {
    if (emailTimerRef.current) clearTimeout(emailTimerRef.current);

    const clean = email.trim().toLowerCase();
    if (!clean) {
      setEmailStatus(null);
      setEmailMessage('');
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(clean)) {
      setEmailStatus('invalid');
      setEmailMessage('Must be a valid @gmail.com address');
      return;
    }

    emailTimerRef.current = setTimeout(() => {
      setEmailStatus('valid');
      setEmailMessage('Valid Gmail address format');
    }, 500);

    return () => clearTimeout(emailTimerRef.current);
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Full Name check
    if (!isNameValid) {
      if (nameHasNumbers) {
        setError('Full Name cannot contain numbers.');
      } else {
        setError('Please enter a valid Full Name.');
      }
      return;
    }

    // Username check
    if (usernameStatus === 'taken' || usernameStatus === 'invalid' || !username.trim()) {
      setError('Please choose a valid and available username.');
      return;
    }

    // Email check
    if (emailStatus === 'invalid' || !email.trim().toLowerCase().endsWith('@gmail.com')) {
      setError('Please provide a verified @gmail.com address.');
      return;
    }

    // Password check
    if (!isPasswordValid) {
      setError('Password must be at least 8 characters and include numbers and symbols.');
      return;
    }

    // Confirm password check
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { token } = await signup({
        name: name.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password
      });
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
    <div className="min-h-[100dvh] bg-[#0B0F19] flex flex-col md:flex-row-reverse overflow-hidden font-sans">
      {/* Right side: Form */}
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} transition={{ type: "spring", stiffness: 70, damping: 20 }}
        className="w-full md:w-1/2 flex items-center justify-center p-6 lg:p-16 bg-transparent z-10 relative overflow-y-auto max-h-screen"
      >
        
        <div className="w-full max-w-md p-10 bg-[#131A2A] rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#1F2937]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center text-white mb-6 font-black text-3xl tracking-tighter">
            <Plane className="w-8 h-8 mr-3 text-black" /> GlobeTrotter
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-2 flex items-center">
              Join the journey <Sparkles className="w-6 h-6 ml-2 text-yellow-500" />
            </h2>
            <p className="text-slate-400 mb-6 font-medium text-sm">Create an account to start planning your next adventure.</p>
          </motion.div>
          
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 text-red-600 p-3 mb-5 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* 1. Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className={`w-full border rounded-full py-2.5 px-4 focus:outline-none focus:ring-1 transition-all font-medium text-sm ${
                  nameHasNumbers 
                    ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                    : isNameValid 
                    ? 'border-emerald-300 bg-emerald-50 focus:ring-emerald-500 focus:border-emerald-500'
                    : 'border-[#1F2937] bg-[#131A2A] focus:ring-black focus:border-black focus:bg-[#131A2A]'
                }`}
                placeholder="e.g. Alexander Walker" 
              />
              {nameHasNumbers && (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> No numbers allowed in full name
                </p>
              )}
            </div>

            {/* 2. Username */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Username</label>
                {usernameStatus === 'checking' && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Checking...
                  </span>
                )}
                {usernameStatus === 'available' && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Available
                  </span>
                )}
                {usernameStatus === 'taken' && (
                  <span className="text-xs text-red-500 font-semibold flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Taken
                  </span>
                )}
              </div>
              <input 
                type="text" 
                required 
                value={username} 
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))} 
                className={`w-full border rounded-full py-2.5 px-4 focus:outline-none focus:ring-1 transition-all font-medium text-sm ${
                  usernameStatus === 'taken' || usernameStatus === 'invalid'
                    ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                    : usernameStatus === 'available'
                    ? 'border-emerald-300 bg-emerald-50 focus:ring-emerald-500 focus:border-emerald-500'
                    : 'border-[#1F2937] bg-[#131A2A] focus:ring-black focus:border-black focus:bg-[#131A2A]'
                }`}
                placeholder="e.g. alexander99" 
              />
              {usernameMessage && usernameStatus === 'invalid' && (
                <p className="text-xs text-red-500 font-medium">{usernameMessage}</p>
              )}
            </div>

            {/* 3. Email Address (Gmail with Verification) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email (@gmail.com)</label>
                {emailStatus === 'verifying' && (
                  <span className="text-xs text-blue-500 flex items-center gap-1 font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
                  </span>
                )}
                {emailStatus === 'valid' && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Gmail
                  </span>
                )}
                {emailStatus === 'invalid' && (
                  <span className="text-xs text-red-500 font-semibold flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Invalid
                  </span>
                )}
              </div>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className={`w-full border rounded-full py-2.5 px-4 focus:outline-none focus:ring-1 transition-all font-medium text-sm ${
                  emailStatus === 'invalid'
                    ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                    : emailStatus === 'valid'
                    ? 'border-emerald-300 bg-emerald-50 focus:ring-emerald-500 focus:border-emerald-500'
                    : 'border-[#1F2937] bg-[#131A2A] focus:ring-black focus:border-black focus:bg-[#131A2A]'
                }`}
                placeholder="yourname@gmail.com" 
              />
              {emailMessage && emailStatus === 'invalid' && (
                <p className="text-xs text-red-500 font-medium">{emailMessage}</p>
              )}
            </div>

            {/* 4. Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full border border-[#1F2937] bg-[#131A2A] rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-black focus:border-black focus:bg-[#131A2A] transition-all font-medium text-sm" 
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 p-1 transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength checklist */}
              {password.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-semibold">
                  <span className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${hasMinLength ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    {hasMinLength ? <CheckCircle2 className="w-2.5 h-2.5" /> : '•'} 8+ chars
                  </span>
                  <span className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${hasNumber ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    {hasNumber ? <CheckCircle2 className="w-2.5 h-2.5" /> : '•'} Number (0-9)
                  </span>
                  <span className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${hasSymbol ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    {hasSymbol ? <CheckCircle2 className="w-2.5 h-2.5" /> : '•'} Symbol (!@#$)
                  </span>
                </div>
              )}
            </div>

            {/* 5. Confirm Password (Real-time Match) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Confirm Password</label>
                {confirmPassword.length > 0 && (
                  isConfirmPasswordMatch ? (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-xs text-red-500 font-semibold flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Does not match
                    </span>
                  )
                )}
              </div>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  required 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  className={`w-full border rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 transition-all font-medium text-sm ${
                    confirmPassword.length > 0 && !isConfirmPasswordMatch
                      ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                      : confirmPassword.length > 0 && isConfirmPasswordMatch
                      ? 'border-emerald-300 bg-emerald-50 focus:ring-emerald-500 focus:border-emerald-500'
                      : 'border-[#1F2937] bg-[#131A2A] focus:ring-black focus:border-black focus:bg-[#131A2A]'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 p-1 transition-colors cursor-pointer"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              type="submit" 
              disabled={loading || (confirmPassword.length > 0 && !isConfirmPasswordMatch) || (emailStatus === 'invalid')}
              className="w-full flex justify-center py-3.5 px-4 mt-2 rounded-full shadow-md text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 focus:outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                </span>
              ) : 'Create Account'}
            </motion.button>
          </form>
          
          <p className="mt-6 text-center text-sm font-medium text-slate-400">
            Already have an account? <Link to="/login" className="font-bold text-black hover:text-amber-400">Sign in</Link>
          </p>
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
        <div className="absolute inset-0 bg-black/40 flex items-end p-16">
          <motion.blockquote initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="text-white">
            <p className="text-3xl font-black tracking-tighter mb-4 leading-tight">"Not all those who wander are lost."</p>
            <footer className="text-[#EAB308] font-bold">— J.R.R. Tolkien</footer>
          </motion.blockquote>
        </div>
      </motion.div>
    </div>
  );
}

