import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, Plane, User } from 'lucide-react';

export default function AppLayout({ children, title }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200/60 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center text-xl font-bold tracking-tight text-slate-900">
                GlobeTrotter
              </Link>
              <nav className="ml-8 hidden md:flex space-x-1 items-center">
                <Link to="/" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                  <Home className="w-4 h-4 mr-2"/> Dashboard
                </Link>
                <Link to="/trips" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                  <Plane className="w-4 h-4 mr-2"/> My Trips
                </Link>
                <Link to="/profile" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors">
                  <User className="w-4 h-4 mr-2"/> Profile
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 flex items-center text-sm font-medium transition-colors active:scale-[0.98]">
                <LogOut className="w-4 h-4 mr-1.5" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {title && <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-900 mb-8">{title}</h1>}
        {children}
      </main>
    </div>
  );
}
