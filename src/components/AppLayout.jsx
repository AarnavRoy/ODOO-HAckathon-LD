import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, Plane, User, Globe, ShieldCheck, Map, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppLayout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home, match: (p) => p === '/' },
    { to: '/trips', label: 'My Trips', icon: Map, match: (p) => p.startsWith('/trips') && !p.includes('/new') },
    { to: '/trips/new', label: 'Plan Trip', icon: Plus, match: (p) => p === '/trips/new' },
    { to: '/ai-planner', label: 'AI Planner', icon: Sparkles, match: (p) => p === '/ai-planner' },
    { to: '/profile', label: 'Profile', icon: User, match: (p) => p === '/profile' },
  ];

  if (user?.role === 'ROLE_ADMIN') {
    navLinks.push({ to: '/admin', label: 'Admin', icon: ShieldCheck, match: (p) => p.startsWith('/admin') });
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[#FEFCE8] to-[#f8f9fa] flex flex-col font-sans text-slate-900">
      {/* Navbar */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 mt-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between items-center bg-white/70 backdrop-blur-md border border-slate-200/60 p-3 rounded-3xl shadow-sm gap-3">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center text-2xl font-extrabold tracking-tight text-slate-900 hover:scale-105 transition-transform">
              <Globe className="w-7 h-7 mr-2 text-black" />
              GlobeTrotter<span className="text-yellow-400">.</span>
            </Link>
            
            {/* Pill Navigation */}
            <nav className="flex space-x-1 items-center bg-black rounded-full px-2 py-1.5 shadow-md shadow-black/10 overflow-x-auto max-w-full">
              {navLinks.map(link => {
                const Icon = link.icon;
                const active = link.match(location.pathname);
                return (
                  <Link 
                    key={link.to} 
                    to={link.to} 
                    className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap ${
                      active ? 'bg-yellow-400 text-black shadow-sm font-bold' : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <button 
              onClick={handleLogout} 
              className="text-slate-600 hover:text-red-500 flex items-center text-xs sm:text-sm font-semibold transition-colors active:scale-95 hover:bg-black/5 px-4 py-2 rounded-full cursor-pointer"
            >
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
          className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10"
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
