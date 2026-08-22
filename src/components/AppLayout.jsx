import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Home, Plane, User } from 'lucide-react';

export default function AppLayout({ children, title }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center text-xl font-bold text-blue-600">
                GlobeTrotter
              </Link>
              <nav className="ml-6 flex space-x-4 items-center">
                <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"><Home className="w-4 h-4 mr-1"/> Dashboard</Link>
                <Link to="/trips" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"><Plane className="w-4 h-4 mr-1"/> My Trips</Link>
                <Link to="/profile" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"><User className="w-4 h-4 mr-1"/> Profile</Link>
              </nav>
            </div>
            <div className="flex items-center">
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 flex items-center">
                <LogOut className="w-5 h-5 mr-1" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>}
        {children}
      </main>
    </div>
  );
}
