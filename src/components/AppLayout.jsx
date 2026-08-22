import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, Plane, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppLayout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col font-sans overflow-hidden">
      <header className="bg-white/80 border-b border-slate-200/60 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center text-2xl font-black tracking-tighter bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 bg-clip-text text-transparent hover:scale-105 transition-transform">
                GlobeTrotter
              </Link>
              <nav className="ml-10 hidden md:flex space-x-2 items-center">
                <Link to="/" className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center transition-all duration-300 ${location.pathname === '/' ? 'bg-violet-100 text-violet-700' : 'text-slate-600 hover:text-violet-600 hover:bg-slate-100'}`}>
                  <Home className="w-4 h-4 mr-2"/> Dashboard
                </Link>
                <Link to="/trips" className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center transition-all duration-300 ${location.pathname.startsWith('/trips') ? 'bg-fuchsia-100 text-fuchsia-700' : 'text-slate-600 hover:text-fuchsia-600 hover:bg-slate-100'}`}>
                  <Plane className="w-4 h-4 mr-2"/> My Trips
                </Link>
                <Link to="/profile" className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center transition-all duration-300 ${location.pathname === '/profile' ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:text-orange-600 hover:bg-slate-100'}`}>
                  <User className="w-4 h-4 mr-2"/> Profile
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 flex items-center text-sm font-semibold transition-colors active:scale-95 bg-slate-100 hover:bg-red-50 px-4 py-2 rounded-full">
                <LogOut className="w-4 h-4 mr-1.5" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12"
        >
          {title && (
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 mb-8"
            >
              {title}
            </motion.h1>
          )}
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
