import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setUser }) => {
  // ADD MISSING STATE DECLARATIONS
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLoadingMessage('Connecting to server...');

    try {
      // Simulate connection delay awareness
      setTimeout(() => {
        if (loading) {
          setLoadingMessage('Server is starting up... This may take up to 2 minutes on first load');
        }
      }, 5000);

      setTimeout(() => {
        if (loading) {
          setLoadingMessage('Still connecting... Free hosting can be slow. Please wait...');
        }
      }, 30000);

      const response = await axios.post(
        'https://krishijal.onrender.com/api/login',
        formData,
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 180000 // 3 minute timeout
        }
      );
      
      if (response.data.success) {
        setLoadingMessage('Login successful! Redirecting...');
        setUser({
          ...response.data.user,
          phone: formData.phone
        });
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Connection timed out. The server may be sleeping. Please try again in a few minutes.');
      } else {
        setError(err.response?.data?.error || 'Login failed');
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
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)] p-8">
      <div className="card p-12 max-w-md w-full text-center relative">
        
        {/* Enhanced loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center rounded-lg z-10">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-lg font-semibold text-primary-600 mb-2">{loadingMessage}</p>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
            <p className="text-xs text-gray-500 text-center px-4">
              Free hosting services can take time to wake up. Thank you for your patience!
            </p>
          </div>
        )}

        <h2 className="text-3xl font-bold text-primary-600 mb-2">Farmer Login</h2>
        <p className="text-gray-600 mb-8">
          Enter your details to access the irrigation scheduling system
        </p>
        
        <form onSubmit={handleSubmit} className="text-left space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              className="form-input"
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
              className="form-input"
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading} 
            className={`btn btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Connecting...' : 'Continue to Dashboard'}
          </button>
        </form>
        
        {/* Server status info */}
        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>💡 First login may take 1-2 minutes as the server starts up</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
