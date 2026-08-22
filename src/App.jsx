import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MyTrips from './pages/MyTrips';
import CreateTrip from './pages/CreateTrip';
import ItineraryBuilder from './pages/ItineraryBuilder';
import Profile from './pages/Profile';
import Placeholder from './pages/Placeholder';

import ItineraryView from './pages/ItineraryView';
import CitySearch from './pages/CitySearch';
import ActivitySearch from './pages/ActivitySearch';
import TripBudget from './pages/TripBudget';
import TripCalendar from './pages/TripCalendar';
import SharedView from './pages/SharedView';
import AdminDashboard from './pages/AdminDashboard';
import AITripAssistant from './pages/AITripAssistant';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) return <Navigate to="/admin/login" />;
  if (user.role !== 'ROLE_ADMIN') return <Navigate to="/dashboard" />; // redirect non-admins
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/trips" element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
        <Route path="/trips/new" element={<ProtectedRoute><CreateTrip /></ProtectedRoute>} />
        <Route path="/trips/:tripId/build" element={<ProtectedRoute><ItineraryBuilder /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/ai-planner" element={<ProtectedRoute><AITripAssistant /></ProtectedRoute>} />
        
        {/* F2 Routes */}
        <Route path="/trips/:tripId" element={<ProtectedRoute><ItineraryView /></ProtectedRoute>} />
        <Route path="/trips/:tripId/cities" element={<ProtectedRoute><CitySearch /></ProtectedRoute>} />
        <Route path="/trips/:tripId/activities" element={<ProtectedRoute><ActivitySearch /></ProtectedRoute>} />
        <Route path="/trips/:tripId/budget" element={<ProtectedRoute><TripBudget /></ProtectedRoute>} />
        <Route path="/trips/:tripId/calendar" element={<ProtectedRoute><TripCalendar /></ProtectedRoute>} />
        <Route path="/share/:shareToken" element={<SharedView />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

