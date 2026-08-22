import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, Plane, User, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppLayout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: Home, match: (p) => p === '/' },
    { to: '/trips', label: 'My Trips', icon: Plane, match: (p) => p.startsWith('/trips') },
    { to: '/profile', label: 'Profile', icon: User, match: (p) => p === '/profile' },
  ];

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[#FEFCE8] to-[#f8f9fa] flex flex-col font-sans text-slate-900">
      {/* Navbar */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 mt-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center bg-transparent">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center text-2xl font-extrabold tracking-tight text-slate-900 hover:scale-105 transition-transform">
              <Globe className="w-7 h-7 mr-2 text-black" />
              Wandrly<span className="text-yellow-400">.</span>
            </Link>
            
            {/* Pill Navigation */}
            <nav className="hidden md:flex space-x-1 items-center bg-black rounded-full px-2 py-2 shadow-xl shadow-black/10">
              {navLinks.map(link => {
                const active = link.match(location.pathname);
                return (
                  <Link key={link.to} to={link.to} className={`px-5 py-2 rounded-full text-sm font-semibold flex items-center transition-all duration-200 ${active ? 'bg-yellow-400 text-black' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}>
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <button onClick={handleLogout} className="text-slate-600 hover:text-red-500 flex items-center text-sm font-semibold transition-colors active:scale-95 hover:bg-black/5 px-4 py-2 rounded-full">
              <LogOut className="w-4 h-4 mr-1.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Page content with route transitions */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12"
        >
          {title && (
            <motion.h1
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08, duration: 0.35 }}
              className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-8"
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
