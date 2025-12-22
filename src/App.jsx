import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Components
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import OwnerDashboard from './components/OwnerDashboard';
import './App.css';

// --- SECURITY: Protect Dashboard Routes ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // If no token is found, redirect to Login
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Home />} />          {/* Landing Page */}
        <Route path="/login" element={<Login />} />    {/* Login Page */}
        <Route path="/signup" element={<Signup />} />  {/* Signup Page */}

        {/* --- Protected Routes (Only for logged in users) --- */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/owner-dashboard" 
          element={
            <PrivateRoute>
              <OwnerDashboard />
            </PrivateRoute>
          } 
        />

        {/* --- Catch All: Redirect unknown URLs to Home --- */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
