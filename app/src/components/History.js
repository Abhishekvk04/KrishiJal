import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://krishijal.onrender.com';

const History = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [retentionDays, setRetentionDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedReports, setSelectedReports] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
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
      const response = await axios.get(`${API_BASE_URL}/api/history`, {
        params: { phone: user.phone }
      });
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRetention = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/retention`);
      setRetentionDays(response.data.retention_days || 30);
    } catch (error) {
      console.error('Error fetching retention:', error);
    }
  };

  const handleDelete = async (reportId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/history/${reportId}`);
      setReports(reports.filter(r => r.id !== reportId));
      setShowDeleteModal(false);
      setReportToDelete(null);
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReports.length === 0) return;
    
    if (window.confirm(`Delete ${selectedReports.length} selected reports permanently?`)) {
      try {
        await Promise.all(
          selectedReports.map(id => axios.delete(`${API_BASE_URL}/api/history/${id}`))
        );
        setReports(reports.filter(r => !selectedReports.includes(r.id)));
        setSelectedReports([]);
      } catch (error) {
        console.error('Error deleting reports:', error);
        alert('Failed to delete some reports. Please try again.');
      }
    }
  };

  const handleViewSchedule = (report) => {
    navigate('/schedule', { 
      state: { 
        scheduleData: report.summary,
        schedule: report.summary?.schedule || [],
        reportId: report.id,
        userInfo: {
          crop: report.summary?.user_data?.crop_info?.name || 'Unknown',
          soil: report.summary?.user_data?.soil_type || 'Unknown',
          location: report.summary?.user_data?.location?.address || 'Unknown'
        }
      } 
    });
  };
  
  const updateRetention = async (days) => {
    try {
      await axios.put(`${API_BASE_URL}/api/retention`, { days });
      setRetentionDays(days);
    } catch (error) {
      console.error('Error updating retention:', error);
      alert('Failed to update retention settings. Please try again.');
    }
  };

  // Filter and sort reports
  const filteredAndSortedReports = reports
    .filter(report => {
      const matchesSearch = 
        (report.summary?.user_data?.crop_info?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.summary?.user_data?.soil_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.summary?.user_data?.location?.address || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterBy === 'all') return matchesSearch;
      if (filterBy === 'recent') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return matchesSearch && new Date(report.created_at) > weekAgo;
      }
      if (filterBy === 'irrigation') {
        return matchesSearch && (report.summary?.total_irrigation_days || 0) > 0;
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'crop') return (a.summary?.user_data?.crop_info?.name || '').localeCompare(b.summary?.user_data?.crop_info?.name || '');
      return 0;
    });

  const getCropIcon = (cropName) => {
    const crop = cropName?.toLowerCase() || '';
    if (crop.includes('rice')) return '🌾';
    if (crop.includes('wheat')) return '🌾';
    if (crop.includes('corn') || crop.includes('maize')) return '🌽';
    if (crop.includes('tomato')) return '🍅';
    if (crop.includes('potato')) return '🥔';
    if (crop.includes('cotton')) return '🌿';
    if (crop.includes('coconut')) return '🥥';
    if (crop.includes('banana')) return '🍌';
    if (crop.includes('arecanut')) return '🌴';
    if (crop.includes('sugarcane')) return '🎋';
    return '🌱';
  };

  const getStatusColor = (irrigationDays) => {
    if (irrigationDays === 0) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (irrigationDays <= 5) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-sm w-full">
          <div className="animate-spin text-5xl mb-4">🔄</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading History</h3>
          <p className="text-gray-600 text-sm">Getting your schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimalistic Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Schedule History
              </h1>
              <p className="text-sm text-gray-600 mt-1">View and manage your irrigation schedules</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1"
              >
                <span>➕</span>
                <span className="hidden sm:inline">New</span>
              </button>
              {selectedReports.length > 0 && (
                <button 
                  onClick={handleBulkDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-1"
                >
                  <span>🗑️</span>
                  <span className="hidden sm:inline">Delete ({selectedReports.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            Storage Settings
          </h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Auto-delete after:</label>
              <select 
                value={retentionDays}
                onChange={(e) => updateRetention(parseInt(e.target.value))}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none transition-colors"
              >
                <option value="7">7 days</option>
                <option value="15">15 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="0">Never</option>
              </select>
            </div>
            <div className="text-xs text-gray-500">
              💡 Older reports are automatically cleaned up
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Search</label>
              <input
                type="text"
                placeholder="Search schedules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📊 Sort</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:outline-none transition-colors"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="crop">By crop</option>
              </select>
            </div>

            {/* Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🎯 Filter</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:outline-none transition-colors"
              >
                <option value="all">All reports</option>
                <option value="recent">Last 7 days</option>
                <option value="irrigation">With irrigation</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-gray-600">
              📈 Showing {filteredAndSortedReports.length} of {reports.length} reports
            </div>
            {reports.length > 0 && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedReports.length === filteredAndSortedReports.length && filteredAndSortedReports.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedReports(filteredAndSortedReports.map(r => r.id));
                    } else {
                      setSelectedReports([]);
                    }
                  }}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label className="text-sm text-gray-700">Select all visible</label>
              </div>
            )}
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredAndSortedReports.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
              <div className="text-6xl mb-6">📄</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {reports.length === 0 ? 'No Reports Yet' : 'No Results Found'}
              </h3>
              <p className="text-gray-600 mb-8">
                {reports.length === 0 
                  ? 'Create your first irrigation schedule to see it here'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <span className="text-lg">🌾</span>
                  <span>Create First Schedule</span>
                </button>
                {reports.length > 0 && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setFilterBy('all');
                      setSortBy('newest');
                    }}
                    className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors mx-auto block"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredAndSortedReports.map(report => (
              <div 
                key={report.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    {/* Report Info */}
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReports([...selectedReports, report.id]);
                          } else {
                            setSelectedReports(selectedReports.filter(id => id !== report.id));
                          }
                        }}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 mt-1"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-3xl">
                            {getCropIcon(report.summary?.user_data?.crop_info?.name)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {new Date(report.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(report.created_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">🌾</span>
                              <span className="text-xs font-medium text-emerald-800">Crop</span>
                            </div>
                            <p className="text-sm font-semibold text-emerald-700">
                              {report.summary?.user_data?.crop_info?.name || 'Unknown'}
                            </p>
                          </div>
                          
                          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">🌱</span>
                              <span className="text-xs font-medium text-amber-800">Soil</span>
                            </div>
                            <p className="text-sm font-semibold text-amber-700">
                              {report.summary?.user_data?.soil_type || 'Unknown'}
                            </p>
                          </div>
                          
                          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">💧</span>
                              <span className="text-xs font-medium text-blue-800">Irrigation</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-blue-700">
                                {report.summary?.total_irrigation_days || 0} days
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.summary?.total_irrigation_days || 0)}`}>
                                {(report.summary?.total_irrigation_days || 0) === 0 ? 'No irrigation' : 'Active'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Additional Details */}
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <span>📍</span>
                            <span className="truncate">
                              <strong>Location:</strong> {report.summary?.user_data?.location?.address || 'Not specified'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>🌊</span>
                            <span>
                              <strong>Total Water:</strong> {report.summary?.total_water_liters || 0}L
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 lg:ml-4">
                      <button 
                        onClick={() => handleViewSchedule(report)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <span>👁️</span>
                        <span>View</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setReportToDelete(report);
                          setShowDeleteModal(true);
                        }}
                        className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <span>🗑️</span>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create New Schedule CTA */}
        {reports.length > 0 && (
          <div className="mt-8 text-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for a New Schedule?</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Create another irrigation schedule for different crops or updated conditions.
              </p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <span className="text-lg">🌾</span>
                <span>Create New Schedule</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && reportToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Report?</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Are you sure you want to delete this irrigation schedule? This action cannot be undone.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <div className="text-sm text-gray-700">
                  <p><strong>Date:</strong> {new Date(reportToDelete.created_at).toLocaleDateString()}</p>
                  <p><strong>Crop:</strong> {reportToDelete.summary?.user_data?.crop_info?.name || 'Unknown'}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setReportToDelete(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(reportToDelete.id)}
                  className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
