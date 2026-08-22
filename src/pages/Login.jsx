import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, verifyForgotPassword, resetPasswordWithName } from '../api/auth';
import { Plane, Sparkles, X, CheckCircle2, XCircle, ArrowLeft, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Name/Email Match, 2 = New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotName, setForgotName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const identifier = username.trim();
      const payload = identifier.includes('@')
        ? { email: identifier, username: identifier, password }
        : { username: identifier, password };

      const { token } = await login(payload);
      localStorage.setItem('token', token);
      navigate('/');
    } catch (err) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        setError('Cannot connect to backend server. Please run ./start.sh or mvn spring-boot:run in terminal.');
      } else if (err.status === 401) {
        setError('Invalid username or password. Please try again.');
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Verify Email + Full Name
  const handleVerifyName = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotEmail.trim() || !forgotName.trim()) {
      setForgotError('Please enter both your Email Address and Full Name');
      return;
    }

    setForgotLoading(true);
    try {
      await verifyForgotPassword({
        email: forgotEmail.trim(),
        name: forgotName.trim()
      });
      setForgotStep(2);
      setForgotSuccess('Identity verified! Please set your new password.');
    } catch (err) {
      // Generic security error message
      setForgotError('Email or Name does not match our records');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Reset New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    // Password validation: min 8 chars, number, symbol
    if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)) {
      setForgotError('New password must be at least 8 characters long and contain both numbers and symbols.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotError('New passwords do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await resetPasswordWithName({
        email: forgotEmail.trim(),
        name: forgotName.trim(),
        newPassword
      });
      setForgotSuccess(res.message || 'Password reset successfully! You can now sign in.');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotEmail('');
        setForgotName('');
        setNewPassword('');
        setConfirmNewPassword('');
        setForgotSuccess('');
        setForgotError('');
      }, 2500);
    } catch (err) {
      setForgotError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep(1);
    setForgotError('');
    setForgotSuccess('');
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col md:flex-row overflow-hidden font-sans relative">
      {/* Left side: Form */}
      <motion.div 
        initial={{ x: '-100%' }} animate={{ x: 0 }} transition={{ type: "spring", stiffness: 70, damping: 20 }}
        className="w-full md:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white z-10 shadow-[20px_0_40px_rgba(0,0,0,0.05)] relative"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500"></div>
        
        <div className="w-full max-w-sm">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center text-slate-900 mb-8 font-black text-3xl tracking-tighter">
            <Plane className="w-8 h-8 mr-3 text-violet-600" /> GlobeTrotter
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-2 flex items-center">
              Welcome back <Sparkles className="w-6 h-6 ml-2 text-fuchsia-500" />
            </h2>
            <p className="text-slate-500 mb-8 font-medium">Enter your username and password to access your trips.</p>
          </motion.div>
          
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 text-red-600 p-3 mb-6 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
          
          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Username or Email</label>
              <input 
                type="text" 
                required 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition-all font-medium sm:text-sm" 
                placeholder="Enter your username or email" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                <button 
                  type="button" 
                  onClick={() => setShowForgotModal(true)} 
                  className="text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors cursor-pointer"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl py-3 pl-4 pr-11 focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition-all font-medium sm:text-sm" 
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-violet-500/30 text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-4 focus:ring-violet-500/30 transition-all duration-200 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                </span>
              ) : 'Sign in to your account'}
            </motion.button>
          </form>
          
          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Don't have an account? <Link to="/signup" className="font-bold text-violet-600 hover:text-violet-700">Create one</Link>
          </p>
        </div>
      </motion.div>
      
      {/* Right side: Image / Hero */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
        className="hidden md:block w-full md:w-1/2 relative bg-slate-900 overflow-hidden"
      >
        <motion.img 
          initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 10, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" alt="Beautiful destination" className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-overlay" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-violet-900/90 via-slate-900/40 to-transparent flex items-end p-16">
          <motion.blockquote initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="text-white">
            <p className="text-3xl font-black tracking-tighter mb-4 leading-tight">"The world is a book and those who do not travel read only one page."</p>
            <footer className="text-violet-200 font-medium">— Saint Augustine</footer>
          </motion.blockquote>
        </div>
      </motion.div>

      {/* Forgot Password Modal (Name-Based Verification Flow) */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative border border-slate-100"
            >
              <button 
                onClick={closeForgotModal} 
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-violet-100 text-violet-600 rounded-2xl">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Reset Password</h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    {forgotStep === 1 ? 'Step 1 of 2: Name Verification' : 'Step 2 of 2: Set New Password'}
                  </p>
                </div>
              </div>

              {forgotError && (
                <div className="bg-red-50 text-red-600 p-3 mb-4 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div className="bg-emerald-50 text-emerald-700 p-3 mb-4 rounded-xl text-xs font-bold border border-emerald-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {/* Step 1: Email + Full Name Matching */}
              {forgotStep === 1 && (
                <form onSubmit={handleVerifyName} className="space-y-4">
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    Enter your registered email address and full name. Your identity will be verified immediately without OTP or email links.
                  </p>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={forgotEmail} 
                      onChange={e => setForgotEmail(e.target.value)} 
                      className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition-all font-medium text-sm" 
                      placeholder="e.g. name@gmail.com" 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={forgotName} 
                      onChange={e => setForgotName(e.target.value)} 
                      className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition-all font-medium text-sm" 
                      placeholder="e.g. Jane Doe" 
                    />
                    <span className="text-[11px] text-slate-400">Must match the exact name registered on your account</span>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button 
                      type="button" 
                      onClick={closeForgotModal} 
                      className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={forgotLoading} 
                      className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-fuchsia-500 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {forgotLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                        </>
                      ) : 'Verify & Continue'}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: New Password & Confirm New Password */}
              {forgotStep === 2 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? "text" : "password"} 
                        required 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)} 
                        className="w-full border-2 border-slate-200 bg-slate-50 rounded-xl py-2.5 pl-3.5 pr-10 focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition-all font-medium text-sm" 
                        placeholder="••••••••" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
                        title={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-400">At least 8 characters with numbers & symbols</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmNewPassword ? "text" : "password"} 
                        required 
                        value={confirmNewPassword} 
                        onChange={e => setConfirmNewPassword(e.target.value)} 
                        className={`w-full border-2 rounded-xl py-2.5 pl-3.5 pr-10 focus:outline-none focus:ring-4 transition-all font-medium text-sm ${
                          confirmNewPassword && newPassword !== confirmNewPassword 
                            ? 'border-red-300 bg-red-50/50 focus:border-red-500' 
                            : confirmNewPassword && newPassword === confirmNewPassword
                            ? 'border-emerald-300 bg-emerald-50/20 focus:border-emerald-500'
                            : 'border-slate-200 bg-slate-50 focus:border-violet-500 focus:bg-white'
                        }`}
                        placeholder="••••••••" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
                        title={showConfirmNewPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setForgotStep(1)} 
                      className="py-3 px-4 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button 
                      type="submit" 
                      disabled={forgotLoading || (confirmNewPassword.length > 0 && newPassword !== confirmNewPassword)} 
                      className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-fuchsia-500 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {forgotLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                        </>
                      ) : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
