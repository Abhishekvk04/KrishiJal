import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Schedule from './components/Schedule';
import History from './components/History';

function App() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});

  return (
    <Router>
      <AppContent user={user} setUser={setUser} formData={formData} setFormData={setFormData} />
    </Router>
  );
}

function AppContent({ user, setUser, formData, setFormData }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 shadow-lg">
        <div className="flex justify-between items-center">
          <h1 
            className="text-2xl font-bold cursor-pointer" 
            onClick={() => navigate('/')}
          >
            🌱 Smart Irrigation System
          </h1>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-primary-100 text-sm">
                Welcome, {user.name}
              </span>
              {/* <button 
                onClick={() => navigate('/history')}
                className="btn btn-outline"
              >
                View History
              </button> */}
            </div>
          )}
        </div>
      </header>
      
      <Routes>
        <Route 
          path="/" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            user ? (
              <Dashboard 
                user={user} 
                formData={formData}
                setFormData={setFormData}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/schedule" 
          element={
            user ? (
              <Schedule formData={formData} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/history" 
          element={
            user ? <History user={user} /> : <Navigate to="/" replace />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
