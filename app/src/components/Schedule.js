import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Schedule = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState(null);
  const [filterMode, setFilterMode] = useState('all');
  
  // Enhanced data extraction with debug logging
  console.log('Full location state:', location.state);
  
  const scheduleData = location.state?.scheduleData || {};
  const schedule = location.state?.schedule || scheduleData.schedule || [];
  const summary = scheduleData.summary || {};
  const userInfo = location.state?.userInfo || {};
  
  // Enhanced data extraction function
  const extractUserData = () => {
    // Try multiple paths to find user data
    const userData = 
      summary?.user_data || 
      scheduleData?.user_data || 
      location.state?.userData ||
      {};

    console.log('Extracted userData:', userData); // Debug log

    return {
      crop: userInfo.crop || 
            userData.crop_info?.name || 
            userData.crop?.name ||
            summary?.crop_info?.name ||
            scheduleData?.crop_info?.name ||
            'Not specified',
      
      soil: userInfo.soil || 
            userData.soil_type || 
            summary?.soil_type ||
            scheduleData?.soil_type ||
            'Not specified',
      
      location: userInfo.location || 
                userData.location?.address || 
                summary?.location?.address ||
                scheduleData?.location?.address ||
                'Not specified'
    };
  };

  const farmInfo = extractUserData();
  console.log('Final farmInfo:', farmInfo); // Debug log

  // Add data validation
  useEffect(() => {
    if (schedule.length === 0) {
      console.warn('No schedule data found');
    }
    if (farmInfo.crop === 'Not specified') {
      console.warn('Crop information not found in data structure');
    }
  }, [schedule, farmInfo]);

  // Filter schedule based on mode
  const filteredSchedule = schedule.filter(day => {
    if (filterMode === 'irrigation') return day.irrigation_needed;
    if (filterMode === 'no-irrigation') return !day.irrigation_needed;
    return true;
  });

  // Enhanced print function
  const handlePrint = () => {
    const printStyles = `
      <style>
        @media print {
          body { font-family: Arial, sans-serif; margin: 0; padding: 15px; background: white !important; }
          .no-print { display: none !important; }
          .print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .print-day { page-break-inside: avoid; margin-bottom: 15px; border: 1px solid #ddd; padding: 12px; border-radius: 6px; }
          .print-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin: 10px 0; }
          .print-card { border: 1px solid #eee; padding: 8px; border-radius: 4px; background: #f9f9f9; }
          .irrigation-needed { background-color: #fee2e2 !important; border-color: #fca5a5 !important; }
          .no-irrigation { background-color: #dcfce7 !important; border-color: #86efac !important; }
          h1, h2, h3 { color: #333 !important; }
        }
      </style>
    `;

    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Irrigation Schedule</title>
          ${printStyles}
        </head>
        <body>
          <div class="print-header">
            <h1>🌾 Irrigation Schedule</h1>
            <div class="print-grid">
              <div><strong>Crop:</strong> ${farmInfo.crop}</div>
              <div><strong>Soil:</strong> ${farmInfo.soil}</div>
              <div><strong>Location:</strong> ${farmInfo.location}</div>
            </div>
          </div>
          
          ${schedule.map((day, index) => `
            <div class="print-day ${day.irrigation_needed ? 'irrigation-needed' : 'no-irrigation'}">
              <h3>${day.day_name || 'Unknown'} - ${new Date(day.date).toLocaleDateString()}</h3>
              <p><strong>Status:</strong> ${day.irrigation_needed ? '🚨 Irrigation Required' : '✅ No Irrigation Needed'}</p>
              
              <div class="print-grid">
                <div class="print-card">
                  <strong>🌡️ Temperature:</strong><br>
                  ${day.weather?.temp_max || 'N/A'}°C / ${day.weather?.temp_min || 'N/A'}°C
                </div>
                <div class="print-card">
                  <strong>🌧️ Rainfall:</strong><br>
                  ${day.weather?.rainfall || 0}mm
                </div>
                <div class="print-card">
                  <strong>🌱 Soil Moisture:</strong><br>
                  ${day.soil_moisture_percent || 'N/A'}%
                </div>
                ${day.irrigation_needed ? `
                  <div class="print-card">
                    <strong>💧 Water Amount:</strong><br>
                    ${day.irrigation_amount_mm || 0}mm
                  </div>
                ` : ''}
              </div>
              
              ${day.recommendation ? `
                <div class="print-card" style="margin-top: 10px;">
                  <strong>💡 Recommendation:</strong><br>
                  ${day.recommendation}
                </div>
              ` : ''}
            </div>
          `).join('')}
          
          <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #666;">
            Generated on ${new Date().toLocaleDateString()} - Smart Irrigation Assistant
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  // Handle case where no data is available
  if (!schedule || schedule.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center bg-white rounded-2xl shadow-lg p-8">
          <div className="text-6xl mb-6">📄</div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">No Schedule Found</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Create your first irrigation schedule to see it here
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-emerald-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              🌾 Create Schedule
            </button>
            <button 
              onClick={() => navigate('/history')}
              className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              📋 View History
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getWeatherIcon = (temp, rainfall) => {
    if (rainfall > 5) return '🌧️';
    if (temp > 35) return '☀️';
    if (temp > 25) return '⛅';
    return '☁️';
  };

  const getMoistureColor = (moisture) => {
    if (moisture > 70) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (moisture > 40) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (moisture > 20) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimalistic Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">🌾</span>
                Your 7-Day Irrigation Schedule
              </h1>
              <p className="text-sm text-gray-600 mt-1">AI-powered farming recommendations</p>
            </div>
            
            <div className="flex flex-wrap gap-2 no-print">
              <button 
                onClick={handlePrint}
                className="bg-amber-100 text-amber-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors flex items-center gap-1"
              >
                <span>🖨️</span>
                <span className="hidden sm:inline">Print</span>
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1"
              >
                <span>➕</span>
                <span className="hidden sm:inline">New</span>
              </button>
              <button 
                onClick={() => navigate('/history')}
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
              >
                <span>📋</span>
                <span className="hidden sm:inline">History</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6" id="schedule-content">
        {/* Farm Info Card - UPDATED */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">🏡</span>
            Farm Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl">🌾</span>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Crop</div>
                <div className="font-medium text-gray-900 text-sm">
                  {farmInfo.crop}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl">🌱</span>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Soil</div>
                <div className="font-medium text-gray-900 text-sm">
                  {farmInfo.soil}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-xl">📍</span>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Location</div>
                <div className="font-medium text-gray-900 text-sm truncate">
                  {farmInfo.location}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && Object.keys(summary).length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Irrigation Days</div>
                  <div className="text-xl font-bold text-blue-600">{summary.total_irrigation_days || 0}</div>
                </div>
                <span className="text-2xl">📅</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Total Water</div>
                  <div className="text-xl font-bold text-emerald-600">{summary.total_water_liters || 0}L</div>
                </div>
                <span className="text-2xl">💧</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Water Depth</div>
                  <div className="text-xl font-bold text-amber-600">{summary.total_water_mm || 0}mm</div>
                </div>
                <span className="text-2xl">🌊</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Avg Daily ET</div>
                  <div className="text-xl font-bold text-purple-600">{summary.avg_daily_etc || 0}mm</div>
                </div>
                <span className="text-2xl">🌡️</span>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 no-print">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">Daily Schedule</h3>
              <p className="text-sm text-gray-600">Tap any day for details</p>
            </div>
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterMode === 'all' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('irrigation')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterMode === 'irrigation' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🚨 Irrigation
              </button>
              <button
                onClick={() => setFilterMode('no-irrigation')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  filterMode === 'no-irrigation' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ✅ Rest
              </button>
            </div>
          </div>
        </div>

        {/* Daily Schedule Cards */}
        <div className="space-y-4">
          {filteredSchedule.map((day, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                day.irrigation_needed 
                  ? 'border-red-200 hover:border-red-300' 
                  : 'border-emerald-200 hover:border-emerald-300'
              } ${selectedDay === index ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
              onClick={() => setSelectedDay(selectedDay === index ? null : index)}
            >
              <div className="p-4 sm:p-6">
                {/* Day Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {getWeatherIcon(day.weather?.temp_max, day.weather?.rainfall)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {day.day_name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(day.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 ${
                    day.irrigation_needed 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    <span>{day.irrigation_needed ? '🚨' : '✅'}</span>
                    <span>{day.irrigation_needed ? 'Irrigation Needed' : 'No Irrigation'}</span>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🌡️</span>
                      <span className="text-xs text-orange-700 font-medium">Temperature</span>
                    </div>
                    <div className="text-sm font-semibold text-orange-800">
                      {day.weather?.temp_max || 'N/A'}°C / {day.weather?.temp_min || 'N/A'}°C
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🌧️</span>
                      <span className="text-xs text-blue-700 font-medium">Rainfall</span>
                    </div>
                    <div className="text-sm font-semibold text-blue-800">
                      {day.weather?.rainfall || 0}mm
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg border ${getMoistureColor(day.soil_moisture_percent)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🌱</span>
                      <span className="text-xs font-medium">Soil Moisture</span>
                    </div>
                    <div className="text-sm font-semibold">
                      {day.soil_moisture_percent || 'N/A'}%
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">💧</span>
                      <span className="text-xs text-purple-700 font-medium">Water Amount</span>
                    </div>
                    <div className="text-sm font-semibold text-purple-800">
                      {day.irrigation_needed ? `${day.irrigation_amount_mm || 0}mm` : '0mm'}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedDay === index && (
                  <div className="border-t border-gray-200 pt-4 no-print">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Weather Details */}
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <span className="text-lg">🌤️</span>
                          Weather
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">Humidity:</span>
                            <span className="font-medium">{day.weather?.humidity || 'N/A'}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Wind:</span>
                            <span className="font-medium">{day.weather?.wind_speed || 'N/A'} m/s</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">ET₀:</span>
                            <span className="font-medium">{day.et0 || 'N/A'}mm</span>
                          </div>
                        </div>
                      </div>

                      {/* Irrigation Plan */}
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                          <span className="text-lg">💧</span>
                          Irrigation
                        </h4>
                        {day.irrigation_needed ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-emerald-700">Amount:</span>
                              <span className="font-medium">{day.irrigation_amount_mm || 0}mm</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-emerald-700">Duration:</span>
                              <span className="font-medium">{day.irrigation_duration_hours || 0}h</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-emerald-700">Best Time:</span>
                              <span className="font-medium">{day.best_irrigation_time || '06:00-08:00'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-emerald-700">Volume:</span>
                              <span className="font-medium">{day.total_water_liters || 0}L</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-2">
                            <div className="text-2xl mb-1">✅</div>
                            <div className="text-emerald-700 font-medium text-sm">No irrigation needed</div>
                          </div>
                        )}
                      </div>

                      {/* Crop Status */}
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                          <span className="text-lg">🌾</span>
                          Crop Status
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-amber-700">ETc:</span>
                            <span className="font-medium">{day.etc || 'N/A'}mm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-700">Method:</span>
                            <span className="font-medium">{day.prediction_method || 'FAO-56'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-700">Confidence:</span>
                            <span className="font-medium">{day.ml_confidence || 'N/A'}%</span>
                          </div>
                        </div>
                        
                        {day.recommendation && (
                          <div className="bg-amber-100 border border-amber-300 p-3 rounded-lg mt-3">
                            <div className="text-xs text-amber-800 font-medium mb-1">💡 AI Recommendation:</div>
                            <div className="text-xs text-amber-700">{day.recommendation}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center no-print">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What's Next?</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Create a new schedule or explore your farming history
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg">🌾</span>
                <span>Create New Schedule</span>
              </button>
              <button 
                onClick={() => navigate('/history')}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg">📋</span>
                <span>View All Schedules</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
