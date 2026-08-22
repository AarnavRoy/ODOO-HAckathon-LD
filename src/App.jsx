import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MyTrips from './pages/MyTrips';
import CreateTrip from './pages/CreateTrip';
import ItineraryBuilder from './pages/ItineraryBuilder';
import Profile from './pages/Profile';
import Placeholder from './pages/Placeholder';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
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
        
        {/* Placeholder Routes for F2 */}
        <Route path="/trips/:tripId" element={<ProtectedRoute><Placeholder pageName="Itinerary View" /></ProtectedRoute>} />
        <Route path="/trips/:tripId/cities" element={<ProtectedRoute><Placeholder pageName="City Search" /></ProtectedRoute>} />
        <Route path="/trips/:tripId/activities" element={<ProtectedRoute><Placeholder pageName="Activity Search" /></ProtectedRoute>} />
        <Route path="/trips/:tripId/budget" element={<ProtectedRoute><Placeholder pageName="Trip Budget" /></ProtectedRoute>} />
        <Route path="/trips/:tripId/calendar" element={<ProtectedRoute><Placeholder pageName="Trip Calendar / Timeline" /></ProtectedRoute>} />
        <Route path="/share/:shareToken" element={<Placeholder pageName="Shared Public View" />} />
        <Route path="/admin" element={<ProtectedRoute><Placeholder pageName="Admin Dashboard" /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
