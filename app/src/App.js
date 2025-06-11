import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Schedule from './components/Schedule';
import History from './components/History';

function App() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved user data on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('smartIrrigationUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('smartIrrigationUser');
      }
    }
    setIsLoading(false);
  }, []);

  // Save user data when user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('smartIrrigationUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('smartIrrigationUser');
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🌾</div>
          <h2 className="text-2xl font-bold text-green-800">Loading Smart Irrigation</h2>
          <p className="text-gray-600 mt-2">Preparing your farming dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppContent 
        user={user} 
        setUser={setUser} 
        formData={formData} 
        setFormData={setFormData} 
      />
    </Router>
  );
}

function AppContent({ user, setUser, formData, setFormData }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setUser(null);
    setFormData({});
    localStorage.removeItem('smartIrrigationUser');
    navigate('/');
    setShowLogoutModal(false);
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/schedule':
        return 'Schedule';
      case '/history':
        return 'History';
      default:
        return 'Smart Irrigation';
    }
  };

  const navigationItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard', description: 'Create schedules' },
    { path: '/history', icon: '📋', label: 'History', description: 'View past schedules' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      {/* Enhanced Header */}
      {user && (
        <header className="bg-white shadow-xl border-b border-green-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              {/* Logo and Title */}
              <div 
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={() => navigate('/dashboard')}
              >
                <div className="text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-300">
                  🌱
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-green-800 group-hover:text-green-600 transition-colors">
                    KrishiJal
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 hidden md:block">
                    AI-Powered Farm Management
                  </p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      location.pathname === item.path
                        ? 'bg-green-100 text-green-800 shadow-md'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div className="text-left">
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="text-xs opacity-75">{item.description}</div>
                    </div>
                  </button>
                ))}
              </nav>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-800">
                      👨‍🌾 {user.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      📱 {user.phone}
                    </div>
                  </div>
                </div>

                {/* Logout Button - Desktop */}
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="hidden md:flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-xl font-medium hover:bg-red-200 transition-all duration-300"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                    <div className={`h-0.5 bg-gray-600 transition-all ${showMobileMenu ? 'rotate-45 translate-y-1' : ''}`}></div>
                    <div className={`h-0.5 bg-gray-600 transition-all ${showMobileMenu ? 'opacity-0' : ''}`}></div>
                    <div className={`h-0.5 bg-gray-600 transition-all ${showMobileMenu ? '-rotate-45 -translate-y-1' : ''}`}></div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
              <div className="px-4 py-4 space-y-3">
                {/* User Info Mobile */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">👨‍🌾</div>
                    <div>
                      <div className="font-semibold text-green-800">{user.name}</div>
                      <div className="text-sm text-green-600">📱 {user.phone}</div>
                    </div>
                  </div>
                </div>

                {/* Navigation Items Mobile */}
                {navigationItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 p-4 rounded-xl font-medium transition-all duration-300 ${
                      location.pathname === item.path
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="text-left">
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-sm opacity-75">{item.description}</div>
                    </div>
                  </button>
                ))}

                {/* Logout Button Mobile */}
                <button
                  onClick={() => {
                    setShowLogoutModal(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 p-4 rounded-xl font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-all duration-300"
                >
                  <span className="text-2xl">🚪</span>
                  <div className="text-left">
                    <div className="font-semibold">Logout</div>
                    <div className="text-sm opacity-75">Exit dashboard</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </header>
      )}

      {/* Page Title Bar for Mobile */}
      {user && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
          <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
            <span className="text-2xl">
              {location.pathname === '/dashboard' && '🏠'}
              {location.pathname === '/schedule' && '📅'}
              {location.pathname === '/history' && '📋'}
            </span>
            <span>{getPageTitle()}</span>
          </h2>
        </div>
      )}
      
      {/* Main Content */}
      <main className="flex-1">
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
      </main>

      {/* Enhanced Footer */}
      {user && (
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <div className="text-center md:text-left">
                <h3 className="font-bold text-gray-800 mb-2">🌱 Smart Irrigation</h3>
                <p className="text-sm text-gray-600">
                  Helping farmers optimize water usage with AI-powered recommendations
                </p>
              </div>

              {/* Quick Links */}
              <div className="text-center">
                <h4 className="font-semibold text-gray-800 mb-2">Quick Actions</h4>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-sm text-green-600 hover:text-green-800 transition-colors"
                  >
                    📊 New Schedule
                  </button>
                  <button
                    onClick={() => navigate('/history')}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    📋 View History
                  </button>
                </div>
              </div>

              {/* Support */}
              <div className="text-center md:text-right">
                <h4 className="font-semibold text-gray-800 mb-2">Need Help?</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📞 Support: 1800-XXX-XXXX</p>
                  <p>💬 WhatsApp available</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 mt-6 pt-4 text-center">
              <p className="text-xs text-gray-500">
                © 2025 Smart Irrigation System. Empowering farmers with technology.
              </p>
            </div>
          </div>
        </footer>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">👋</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Leaving Already?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to logout? Your data will be saved for next time.
              </p>
              
              <div className="bg-green-50 p-4 rounded-2xl mb-6">
                <div className="text-sm text-green-800">
                  <p><strong>Logged in as:</strong> {user.name}</p>
                  <p><strong>Phone:</strong> {user.phone}</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-300"
                >
                  Stay Logged In
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-500 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-red-600 transition-all duration-300"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
          <div className="grid grid-cols-2 gap-1">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center py-3 px-4 transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'bg-green-100 text-green-800'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Spacer for mobile bottom navigation */}
      {user && <div className="md:hidden h-20"></div>}
    </div>
  );
}

export default App;
