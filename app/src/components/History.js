import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://krishijal.onrender.com';

const History = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [retentionDays, setRetentionDays] = useState(30);
  const [loading, setLoading] = useState(true);  // ADD THIS LINE
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.phone) {
      fetchHistory();
      fetchRetention();
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/history`, {  // FIX URL
        params: { phone: user.phone }
      });
      setReports(response.data.reports);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRetention = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/retention`);  // FIX URL
      setRetentionDays(response.data.retention_days);
    } catch (error) {
      console.error('Error fetching retention:', error);
    }
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('Delete this report permanently?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/history/${reportId}`);  // FIX URL
        setReports(reports.filter(r => r.id !== reportId));
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const handleViewSchedule = (report) => {
    // Navigate with proper schedule data
    navigate('/schedule', { 
      state: { 
        scheduleData: report.summary,
        schedule: report.summary.schedule || [],
        reportId: report.id,
        userInfo: {
          crop: report.summary.user_data?.crop_info?.name || 'Unknown',
          soil: report.summary.user_data?.soil_type || 'Unknown',
          location: report.summary.user_data?.location?.address || 'Unknown'
        }
      } 
    });
  };
  
  const updateRetention = async (days) => {
    try {
      await axios.put(`${API_BASE_URL}/api/retention`, { days });  // FIX URL
      setRetentionDays(days);
    } catch (error) {
      console.error('Error updating retention:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p className="text-lg text-primary-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-600">📋 Report History</h2>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Auto-delete after:</label>
          <select 
            value={retentionDays}
            onChange={(e) => updateRetention(parseInt(e.target.value))}
            className="border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-primary-500"
          >
            <option value="7">7 days</option>
            <option value="15">15 days</option>
            <option value="30">30 days</option>
            <option value="60">60 days</option>
            <option value="0">Never</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Reports Found</h3>
            <p className="text-gray-500 mb-4">Generate your first irrigation schedule to see it here</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-primary"
            >
              Create New Schedule
            </button>
          </div>
        ) : (
          reports.map(report => (
            <div key={report.id} className="card p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-primary-600">
                        📅 {new Date(report.created_at).toLocaleDateString()}
                    </h3>
                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                        <p>🌱 <strong>Crop:</strong> {report.summary?.user_data?.crop_info?.name || 'Unknown'}</p>
                        <p>🏞️ <strong>Soil:</strong> {report.summary?.user_data?.soil_type || 'Unknown'}</p>
                        <p>💧 <strong>Irrigation Days:</strong> {report.summary?.total_irrigation_days || 0}</p>
                    </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => handleViewSchedule(report)}
                        className="btn btn-primary text-sm"
                    >
                        👁️ View Schedule
                    </button>
                    <button
                        onClick={() => handleDelete(report.id)}
                        className="btn bg-red-500 text-white hover:bg-red-600 text-sm"
                    >
                        🗑️ Delete
                    </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 text-center">
        <button 
          onClick={() => navigate('/dashboard')}
          className="btn btn-outline"
        >
          ➕ Create New Schedule
        </button>
      </div>
    </div>
  );
};

export default History;
