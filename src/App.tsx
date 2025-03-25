import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import FillerDashboard from './pages/FillerDashboard';
import DispatcherDashboard from './pages/DispatcherDashboard';
import { useStore } from './store/useStore';

function App() {
  const { setUser } = useStore();

  useEffect(() => {
    // Check for user in localStorage on app load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [setUser]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/filler" element={<FillerDashboard />} />
        <Route path="/dispatcher" element={<DispatcherDashboard />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;