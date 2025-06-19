import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import Dashboard from './pages/Dashboard';
import MyReservationsPage from './pages/MyReservations';
import ReservationWindow from './pages/ReservationWindow';
import Availability from './pages/components/Availability';
import CreateAdmin from './auth/CreateAdmin';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('auth_token') !== null);

  useEffect(() => {
    const handler = () => {
      setIsLoggedIn(localStorage.getItem('auth_token') !== null);
    };
    window.addEventListener('storage', handler); // para cambios entre pestañas
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/myreservations" element={<MyReservationsPage />} />
        <Route path="/reserve/:id/:name" element={<ReservationWindow />} />
        <Route path="/availability/:spaceId" element={<Availability />} />
        <Route path="/create-admin" element={<CreateAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;
