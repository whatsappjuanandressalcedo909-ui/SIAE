import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import LockScreen from './components/LockScreen';
import CitizenDashboard from './features/citizen/pages/CitizenDashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  return (
    <BrowserRouter>
      <div className="min-h-[100dvh] bg-gray-50 text-gray-900 font-sans p-0 sm:p-4 flex justify-center items-center">
        <div className="w-full max-w-lg bg-white p-6 sm:p-8 rounded-none sm:rounded-2xl shadow-none sm:shadow-sm border-0 sm:border border-gray-100 min-h-[100dvh] sm:min-h-0 relative">
          <LockScreen user={user}>
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
              <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" />} />
              <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
              <Route path="/citizen" element={user ? <CitizenDashboard /> : <Navigate to="/login" />} />
              <Route path="/" element={user ? <Home user={user} /> : <Navigate to="/login" />} />
            </Routes>
          </LockScreen>
        </div>
      </div>
    </BrowserRouter>
  );
}

