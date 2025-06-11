import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://krishijal-server.onrender.com';

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [step, setStep] = useState(1);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLoadingMessage('🌱 Connecting to your farm dashboard...');

    try {
      // Enhanced loading messages for better UX
      const loadingSteps = [
        { delay: 3000, message: '🚜 Starting up the system...' },
        { delay: 8000, message: '🌾 Loading your farm data...' },
        { delay: 15000, message: '💧 Preparing irrigation tools...' },
        { delay: 30000, message: '⏳ Server is waking up... This may take up to 2 minutes' },
        { delay: 60000, message: '🔄 Still connecting... Free hosting can be slow. Please wait...' }
      ];

      loadingSteps.forEach(({ delay, message }) => {
        setTimeout(() => {
          if (loading) {
            setLoadingMessage(message);
          }
        }, delay);
      });

      const response = await axios.post(
        `${API_BASE_URL}/api/login`,
        formData,
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 180000
        }
      );
      
      if (response.data.success) {
        setLoadingMessage('✅ Login successful! Welcome to your farm dashboard...');
        setUser({
          ...response.data.user,
          phone: formData.phone
        });
        
        // Small delay to show success message
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'ECONNABORTED') {
        setError('⏰ Connection timed out. The server may be sleeping. Please try again in a few minutes.');
      } else if (err.response?.status === 404) {
        setError('🔍 Server not found. Please check your internet connection.');
      } else if (err.response?.status >= 500) {
        setError('🛠️ Server is having issues. Please try again in a few minutes.');
      } else {
        setError(err.response?.data?.error || '❌ Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user starts typing
  };

  const handleNext = () => {
    if (step === 1 && formData.name.trim()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as +91 XXXXX XXXXX for Indian numbers
    if (digits.length <= 10) {
      return digits.replace(/(\d{5})(\d{0,5})/, '$1 $2').trim();
    }
    return digits.slice(0, 10).replace(/(\d{5})(\d{5})/, '$1 $2');
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({
      ...formData,
      phone: formatted
    });
    setError('');
  };

  const isValidPhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10;
  };

  const isValidName = (name) => {
    return name.trim().length >= 2;
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Welcome Animation */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-green-100">
            <div className="animate-bounce text-8xl mb-6">🚜</div>
            <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
              Welcome to KrishiJal
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              AI-powered smart irrigation scheduling for modern farmers. 
              Optimize your water usage and increase crop yield with intelligent recommendations.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
                <div className="text-4xl mb-3">💧</div>
                <h3 className="font-bold text-green-800 mb-2">Save Water</h3>
                <p className="text-sm text-green-700">Up to 30% water savings with smart scheduling</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
                <div className="text-4xl mb-3">📈</div>
                <h3 className="font-bold text-blue-800 mb-2">Increase Yield</h3>
                <p className="text-sm text-blue-700">Optimal irrigation for maximum crop growth</p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200">
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="font-bold text-yellow-800 mb-2">AI Powered</h3>
                <p className="text-sm text-yellow-700">Weather-based intelligent recommendations</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowWelcome(false)}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🌾 Start Farming Smart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-green-100 relative">
          
          {/* Enhanced Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-98 flex flex-col items-center justify-center z-50">
              <div className="text-center max-w-sm">
                <div className="animate-spin text-6xl mb-6">🌾</div>
                <h3 className="text-xl font-bold text-green-800 mb-3">{loadingMessage}</h3>
                
                {/* Enhanced Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full animate-pulse" style={{width: '75%'}}></div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center justify-center space-x-2">
                    <span>⏳</span>
                    <span>Connecting to farm servers...</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Free hosting may take 1-2 minutes to start up
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-center">
            <div className="text-4xl mb-2">👨‍🌾</div>
            <h2 className="text-2xl font-bold text-white mb-1">Farmer Login</h2>
            <p className="text-green-100">
              Access your irrigation dashboard
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="px-6 pt-6">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'
                }`}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <span className="text-sm font-medium">Name</span>
              </div>
              
              <div className={`w-12 h-1 rounded ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
              
              <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium">Phone</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Step 1: Name */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                    <span className="text-2xl mr-2">👤</span>
                    What's your name?
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full p-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none transition-all duration-300 hover:border-green-300"
                    disabled={loading}
                    autoFocus
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    This will be used to personalize your experience
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isValidName(formData.name) || loading}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                    isValidName(formData.name) && !loading
                      ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next →
                </button>
              </div>
            )}

            {/* Step 2: Phone */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="phone" className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                    <span className="text-2xl mr-2">📱</span>
                    Your phone number
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      +91
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      required
                      placeholder="98765 43210"
                      className="w-full pl-16 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none transition-all duration-300 hover:border-green-300"
                      disabled={loading}
                      autoFocus
                      maxLength="11"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    We'll use this to save your irrigation schedules
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center space-x-2">
                    <span className="text-lg">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
                  >
                    ← Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={!isValidPhone(formData.phone) || loading}
                    className={`flex-2 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                      isValidPhone(formData.phone) && !loading
                        ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    style={{ flex: '2' }}
                  >
                    {loading ? '🌱 Connecting...' : '🚀 Enter Dashboard'}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Footer Info */}
          <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-100">
            <div className="space-y-2">
              <p className="text-xs text-gray-600 flex items-center justify-center space-x-1">
                <span>🔒</span>
                <span>Your data is secure and private</span>
              </p>
              <p className="text-xs text-gray-500">
                First time? No worries! Just enter your details to get started.
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Need Help? 🤝</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <span>📞</span>
                <span>Call support: 1800-XXX-XXXX</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <span>💬</span>
                <span>WhatsApp help available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
