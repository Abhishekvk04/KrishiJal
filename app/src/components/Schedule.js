import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Schedule = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data from navigation state with fallbacks
  const scheduleData = location.state?.scheduleData || {};
  const schedule = location.state?.schedule || scheduleData.schedule || [];
  const userInfo = location.state?.userInfo || {};

  // Handle case where no data is available
  if (!schedule || schedule.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="text-6xl mb-4">📄</div>
        <h2 className="text-2xl font-bold text-gray-600 mb-4">No Schedule Data Found</h2>
        <p className="text-gray-500 mb-6">
          The irrigation schedule data could not be loaded.
        </p>
        <button 
          onClick={() => navigate('/history')}
          className="btn btn-primary"
        >
          ← Back to History
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-primary-600">
            🌾 Irrigation Schedule
          </h1>
          <button 
            onClick={() => navigate('/history')}
            className="btn btn-outline"
          >
            ← Back to History
          </button>
        </div>
        
        {/* Farm Info */}
        <div className="bg-primary-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>🌱 <strong>Crop:</strong> {userInfo.crop}</div>
            <div>🏞️ <strong>Soil:</strong> {userInfo.soil}</div>
            <div>📍 <strong>Location:</strong> {userInfo.location}</div>
          </div>
        </div>
      </div>

      {/* Schedule Cards */}
      <div className="space-y-4">
        {schedule.map((day, index) => (
          <div key={index} className="card p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Date & Weather */}
              <div>
                <h3 className="text-lg font-semibold text-primary-600 mb-2">
                  📅 {day.day_name}, {new Date(day.date).toLocaleDateString()}
                </h3>
                <div className="space-y-1 text-sm">
                  <div>🌡️ {day.weather?.temp_max}°C / {day.weather?.temp_min}°C</div>
                  <div>💧 Humidity: {day.weather?.humidity}%</div>
                  <div>🌧️ Rainfall: {day.weather?.rainfall}mm</div>
                  <div>💨 Wind: {day.weather?.wind_speed} m/s</div>
                </div>
              </div>

              {/* Soil & ET */}
              <div>
                <h4 className="font-semibold mb-2">Soil & Evapotranspiration</h4>
                <div className="space-y-1 text-sm">
                  <div>🌱 Soil Moisture: {day.soil_moisture_percent}%</div>
                  <div>💧 ET₀: {day.et0}mm</div>
                  <div>🌾 ETc: {day.etc}mm</div>
                </div>
              </div>

              {/* Irrigation */}
              <div>
                <h4 className="font-semibold mb-2">Irrigation</h4>
                <div className="space-y-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    day.irrigation_needed 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {day.irrigation_needed ? '🚨 Irrigation Required' : '✅ No Irrigation'}
                  </div>
                  
                  {day.irrigation_needed && (
                    <div className="text-sm space-y-1">
                      <div>💧 Amount: {day.irrigation_amount_mm}mm</div>
                      <div>⏱️ Duration: {day.irrigation_duration_hours}h</div>
                      <div>🕕 Best Time: {day.best_irrigation_time}</div>
                      <div>🚰 Water Volume: {day.total_water_liters}L</div>
                    </div>
                  )}
                </div>
                
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                  {day.recommendation}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {scheduleData.summary && (
        <div className="mt-8 card p-6">
          <h3 className="text-xl font-bold text-primary-600 mb-4">📊 Week Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600">
                {scheduleData.summary.total_irrigation_days}
              </div>
              <div className="text-sm text-gray-600">Irrigation Days</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {scheduleData.summary.total_water_mm}mm
              </div>
              <div className="text-sm text-gray-600">Total Water</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {scheduleData.summary.avg_daily_etc}mm
              </div>
              <div className="text-sm text-gray-600">Avg Daily ETc</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {scheduleData.summary.total_water_liters}L
              </div>
              <div className="text-sm text-gray-600">Total Volume</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
