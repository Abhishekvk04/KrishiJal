import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'https://krishijal.onrender.com';

const Dashboard = ({ user, formData, setFormData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [soilTypes, setSoilTypes] = useState({});
  const [crops, setCrops] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSoilTypes();
    fetchCrops();
  }, []);

  const fetchSoilTypes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/soil-types`);
      setSoilTypes(response.data);
    } catch (error) {
      console.error('Error fetching soil types:', error);
    }
  };

  const fetchCrops = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/crops`);
      setCrops(response.data);
    } catch (error) {
      console.error('Error fetching crops:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Include phone in personal_info with proper validation
      const submissionData = {
        ...formData,
        personal_info: {
          ...formData.personal_info,
          phone: user?.phone || formData.personal_info?.phone
        }
      };

      console.log('Submitting data:', submissionData); // Debug log

      const response = await axios.post(
        `${API_BASE_URL}/api/generate-schedule`, 
        submissionData,
        {
          timeout: 180000, // 3 minute timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        navigate('/schedule', { 
          state: { 
            scheduleData: response.data,
            reportId: response.data.report_id 
          } 
        });
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
      if (error.code === 'ECONNABORTED') {
        alert('Request timed out. The server may be sleeping. Please try again in a few minutes.');
      } else {
        alert('Error generating schedule. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (stepData) => {
    setFormData({ ...formData, ...stepData });
  };

  // ENHANCED SOIL CLASSIFICATION COMPONENT
  const SoilImageClassification = ({ formData, updateFormData, soilTypes }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [showManualSelection, setShowManualSelection] = useState(false);
    const [manualSoilType, setManualSoilType] = useState('');

    const handleImageUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file size (reduce to 2MB for faster processing)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size too large. Please upload an image smaller than 2MB.');
        return;
      }

      setSelectedImage(file);
      setLoading(true);
      setPrediction(null);
      setLoadingStage('Uploading image...');

      const formDataUpload = new FormData();
      formDataUpload.append('soil_image', file);

      try {
        setLoadingStage('Processing image... This may take up to 2 minutes on free hosting');
        
        const response = await axios.post(
          `${API_BASE_URL}/api/classify-soil`, 
          formDataUpload, 
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 180000, // Increase to 3 minutes
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setLoadingStage(`Uploading... ${percentCompleted}%`);
            }
          }
        );
        
        // Success handling...
        setPrediction(response.data);
        updateFormData({ 
          soil_type: response.data.predicted_soil_type,
          soil_confidence: response.data.confidence 
        });
        
      } catch (error) {
        console.error('Soil classification error:', error);
        
        if (error.code === 'ECONNABORTED') {
          // Timeout error - show helpful message
          alert(`
            The server took too long to respond (over 3 minutes). 
            This often happens with free hosting when the server is "sleeping".
            
            Please try:
            1. Using a smaller image (under 1MB)
            2. Waiting a few minutes and trying again
            3. Or select soil type manually below
          `);
          setShowManualSelection(true);
        } else {
          alert('Error classifying soil. Please select soil type manually.');
          setShowManualSelection(true);
        }
      } finally {
        setLoading(false);
        setLoadingStage('');
      }
    };

    const handleManualSelection = async (soilType) => {
      try {
        setManualSoilType(soilType);
        updateFormData({ 
          soil_type: soilType,
          soil_confidence: 100,
          soil_classification_method: 'manual_selection'
        });
        setShowManualSelection(false);
      } catch (error) {
        console.error('Manual selection error:', error);
      }
    };

    return (
      <div className="p-8">
        <h3 className="text-2xl font-bold text-primary-600 mb-6">
          🔬 Soil Type Classification
        </h3>
        
        {/* Enhanced Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md text-center">
              <div className="animate-spin text-6xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-2">{loadingStage}</h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                {loadingStage.includes('Uploading') && (
                  <p>📤 Sending image to server...</p>
                )}
                {loadingStage.includes('Processing') && (
                  <p>🖥️ Server is processing your image...</p>
                )}
                {loadingStage.includes('Analyzing') && (
                  <p>🧠 AI is analyzing soil properties...</p>
                )}
                {loadingStage.includes('timed out') && (
                  <div className="text-orange-600">
                    <p>⏰ Server is taking longer than expected</p>
                    <p>This happens when the server is "sleeping" on free hosting</p>
                    <p>Please wait or try manual selection</p>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => {
                  setLoading(false);
                  setLoadingStage('');
                  setShowManualSelection(true);
                }}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Cancel and select manually
              </button>
            </div>
          </div>
        )}
        
        {/* Image Upload Area */}
        {!prediction && !showManualSelection && (
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Upload Soil Image for AI Classification
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="soil-image-upload"
              />
              <label htmlFor="soil-image-upload" className="cursor-pointer">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-lg text-gray-600 mb-2">Click to upload soil image</p>
                <p className="text-sm text-gray-500">
                  Take a clear photo of your soil surface from about 1 meter height
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supported formats: JPEG, PNG, BMP, GIF (max 5MB)
                </p>
              </label>
            </div>
            
            <div className="text-center mt-4">
              <button 
                onClick={() => setShowManualSelection(true)}
                className="text-primary-600 hover:underline text-sm"
              >
                Or select soil type manually
              </button>
            </div>
          </div>
        )}

        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Uploaded Image:</h4>
            <div className="flex justify-center">
              <img 
                src={imagePreview} 
                alt="Soil sample" 
                className="max-w-xs max-h-64 rounded-lg shadow-md object-cover"
              />
            </div>
          </div>
        )}

        {/* Prediction Results */}
        {prediction && (
          <div className="bg-primary-50 p-6 rounded-xl border border-primary-200 mb-6">
            <h4 className="text-xl font-bold text-primary-600 mb-4">
              🎯 Soil Classification Results
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold mb-2">Predicted Soil Type:</h5>
                <p className="text-2xl font-bold text-primary-600">
                  {prediction.predicted_soil_type}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Confidence: {prediction.confidence}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Method: {prediction.method?.replace('_', ' ')}
                </p>
              </div>
              
              <div>
                <h5 className="font-semibold mb-2">Soil Properties:</h5>
                <div className="space-y-1 text-sm">
                  <div>💧 Water Holding: {prediction.soil_properties?.water_holding_capacity}</div>
                  <div>⬇️ Infiltration: {prediction.soil_properties?.infiltration_rate}</div>
                  <div>🌊 Field Capacity: {(prediction.soil_properties?.field_capacity * 100).toFixed(1)}%</div>
                  <div>📝 Description: {prediction.soil_properties?.description}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => {
                  setPrediction(null);
                  setImagePreview(null);
                  setSelectedImage(null);
                }}
                className="btn btn-outline text-sm"
              >
                📷 Upload Different Image
              </button>
              <button 
                onClick={() => setShowManualSelection(true)}
                className="btn btn-outline text-sm"
              >
                ✋ Choose Manually Instead
              </button>
            </div>
          </div>
        )}

        {/* Manual Selection */}
        {showManualSelection && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4">Manual Soil Type Selection</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(soilTypes).map(([type, properties]) => (
                <div
                  key={type}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    manualSoilType === type
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-primary-300'
                  }`}
                  onClick={() => handleManualSelection(type)}
                >
                  <h5 className="font-semibold text-primary-600 mb-2">{type}</h5>
                  <p className="text-sm text-gray-600 mb-3">{properties.description}</p>
                  <div className="space-y-1 text-xs">
                    <div>💧 {properties.water_holding_capacity} water holding</div>
                    <div>⬇️ {properties.infiltration_rate} infiltration</div>
                    <div>🌊 {(properties.field_capacity * 100).toFixed(1)}% field capacity</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-4">
              <button 
                onClick={() => {
                  setShowManualSelection(false);
                  setManualSoilType('');
                }}
                className="text-primary-600 hover:underline text-sm"
              >
                ← Back to image upload
              </button>
            </div>
          </div>
        )}

        {/* Selected Soil Summary */}
        {(prediction || manualSoilType) && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-700 mb-2">
              ✅ Soil Type Selected: {formData.soil_type}
            </h4>
            <p className="text-sm text-green-600">
              Confidence: {formData.soil_confidence}% | 
              Method: {formData.soil_classification_method?.replace('_', ' ')}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfo formData={formData} updateFormData={updateFormData} user={user} />;
      case 2:
        return <LocationInfo formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <SoilImageClassification formData={formData} updateFormData={updateFormData} soilTypes={soilTypes} />;
      case 4:
        return <CropInfo formData={formData} updateFormData={updateFormData} crops={crops} />;
      case 5:
        return <FarmSizeInfo formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <ReviewInfo formData={formData} soilTypes={soilTypes} crops={crops} />;
      default:
        return null;
    }
  };

  const steps = ['Personal', 'Location', 'Soil', 'Crop', 'Farm Size', 'Review'];

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header with History Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-600">Smart Irrigation Dashboard</h2>
        <button 
          onClick={() => navigate('/history')}
          className="btn btn-outline"
        >
          📋 View History
        </button>
      </div>

      {/* Progress Bar */}
      <div className="card p-8 mb-8">
        <div className="relative mb-8">
          <div className="flex justify-between items-center relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep >= index + 1
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
            <div 
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          {steps.map((step, index) => (
            <span key={index} className="text-center">{step}</span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="card mb-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        {currentStep > 1 && (
          <button onClick={handlePrevious} className="btn btn-secondary">
            Previous
          </button>
        )}

        <div className="ml-auto">
          {currentStep < 6 ? (
            <button onClick={handleNext} className="btn btn-primary">
              Next
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className={`btn btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Generating Schedule...
                </>
              ) : (
                'Generate Irrigation Schedule'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Keep all your existing component definitions (PersonalInfo, LocationInfo, CropInfo, FarmSizeInfo, ReviewInfo)
// but add the missing useState import at the top of each component

const PersonalInfo = ({ formData, updateFormData, user }) => {
  const [data, setData] = useState({
    farmer_name: formData.personal_info?.farmer_name || '',
    experience: formData.personal_info?.experience || '',
    contact_email: formData.personal_info?.contact_email || '',
    phone: user?.phone || ''
  });

  const handleChange = (e) => {
    const newData = { ...data, [e.target.name]: e.target.value };
    setData(newData);
    updateFormData({ personal_info: newData });
  };

  return (
    <div className="p-8">
      <h3 className="text-2xl font-bold text-primary-600 mb-6">Personal Information</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Farmer Name
          </label>
          <input
            type="text"
            name="farmer_name"
            value={data.farmer_name}
            onChange={handleChange}
            placeholder="Enter farmer name"
            className="form-input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Farming Experience
          </label>
          <select name="experience" value={data.experience} onChange={handleChange} className="form-input">
            <option value="">Select experience level</option>
            <option value="beginner">Beginner (0-2 years)</option>
            <option value="intermediate">Intermediate (3-10 years)</option>
            <option value="experienced">Experienced (10+ years)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Email (Optional)
          </label>
          <input
            type="email"
            name="contact_email"
            value={data.contact_email}
            onChange={handleChange}
            placeholder="Enter email for notifications"
            className="form-input"
          />
        </div>
      </div>
    </div>
  );
};

const LocationInfo = ({ formData, updateFormData }) => {
  const [data, setData] = useState({
    address: formData.location?.address || '',
    latitude: formData.location?.latitude || '',
    longitude: formData.location?.longitude || '',
    climate_zone: formData.location?.climate_zone || ''
  });

  const handleChange = (e) => {
    const newData = { ...data, [e.target.name]: e.target.value };
    setData(newData);
    updateFormData({ location: newData });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const newData = {
          ...data,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        };
        setData(newData);
        updateFormData({ location: newData });
      });
    }
  };

  return (
    <div className="p-8">
      <h3 className="text-2xl font-bold text-primary-600 mb-6">Farm Location</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Farm Address
          </label>
          <input
            type="text"
            name="address"
            value={data.address}
            onChange={handleChange}
            placeholder="Enter farm address"
            className="form-input"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latitude
            </label>
            <input
              type="number"
              name="latitude"
              value={data.latitude}
              onChange={handleChange}
              placeholder="Latitude"
              step="0.000001"
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitude
            </label>
            <input
              type="number"
              name="longitude"
              value={data.longitude}
              onChange={handleChange}
              placeholder="Longitude"
              step="0.000001"
              className="form-input"
            />
          </div>
        </div>
        
        <button onClick={getCurrentLocation} className="btn btn-outline">
          📍 Use Current Location
        </button>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Climate Zone
          </label>
          <select name="climate_zone" value={data.climate_zone} onChange={handleChange} className="form-input">
            <option value="">Select climate zone</option>
            <option value="arid">Arid</option>
            <option value="semi-arid">Semi-Arid</option>
            <option value="tropical">Tropical</option>
            <option value="subtropical">Subtropical</option>
            <option value="temperate">Temperate</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const CropInfo = ({ formData, updateFormData, crops }) => {
  const [data, setData] = useState({
    name: formData.crop_info?.name || '',
    growth_stage: formData.crop_info?.growth_stage || 0,
    planting_date: formData.crop_info?.planting_date || ''
  });

  const handleChange = (e) => {
    const value = e.target.name === 'growth_stage' ? parseInt(e.target.value) : e.target.value;
    const newData = { ...data, [e.target.name]: value };
    setData(newData);
    updateFormData({ crop_info: newData });
  };

  return (
    <div className="p-8">
      <h3 className="text-2xl font-bold text-primary-600 mb-6">Crop Information</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Crop Type
          </label>
          <select name="name" value={data.name} onChange={handleChange} className="form-input">
            <option value="">Select crop type</option>
            {Object.keys(crops).map(crop => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
        </div>
        
        {data.name && crops[data.name] && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Growth Stage
              </label>
              <select name="growth_stage" value={data.growth_stage} onChange={handleChange} className="form-input">
                {crops[data.name]?.growth_stages?.map((stage, index) => (
                  <option key={index} value={index}>{stage}</option>
                )) || (
                  <>
                    <option value={0}>Initial Stage</option>
                    <option value={1}>Development Stage</option>
                    <option value={2}>Mid Season</option>
                    <option value={3}>Late Season</option>
                  </>
                )}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Planting Date
              </label>
              <input
                type="date"
                name="planting_date"
                value={data.planting_date}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-primary-600 mb-4">Crop Characteristics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium">Season Length</div>
                  <div className="text-primary-600">{crops[data.name]?.season_length || 120} days</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Rooting Depth</div>
                  <div className="text-primary-600">{crops[data.name]?.rooting_depth || 0.5} m</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">Critical Depletion</div>
                  <div className="text-primary-600">{((crops[data.name]?.critical_depletion || 0.5) * 100)}%</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const FarmSizeInfo = ({ formData, updateFormData }) => {
  const [data, setData] = useState({
    area: formData.farm_size?.area || '',
    unit: formData.farm_size?.unit || 'hectares',
    irrigation_method: formData.farm_size?.irrigation_method || ''
  });

  const handleChange = (e) => {
    const newData = { ...data, [e.target.name]: e.target.value };
    setData(newData);
    updateFormData({ farm_size: newData });
  };

  return (
    <div className="p-8">
      <h3 className="text-2xl font-bold text-primary-600 mb-6">Farm Size & Irrigation Method</h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Farm Area
            </label>
            <input
              type="number"
              name="area"
              value={data.area}
              onChange={handleChange}
              placeholder="Enter area"
              min="0"
              step="0.1"
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit
            </label>
            <select name="unit" value={data.unit} onChange={handleChange} className="form-input">
              <option value="hectares">Hectares</option>
              <option value="acres">Acres</option>
              <option value="square_meters">Square Meters</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Irrigation Method
          </label>
          <select name="irrigation_method" value={data.irrigation_method} onChange={handleChange} className="form-input">
            <option value="">Select irrigation method</option>
            <option value="drip">Drip Irrigation</option>
            <option value="sprinkler">Sprinkler System</option>
            <option value="flood">Flood Irrigation</option>
            <option value="furrow">Furrow Irrigation</option>
          </select>
        </div>
        
        {data.area && (
          <div className="bg-gray-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-primary-600 mb-2">Area Conversions</h4>
            <div className="text-sm text-gray-600">
              {data.unit === 'hectares' && `${data.area} hectares = ${(data.area * 2.471).toFixed(2)} acres`}
              {data.unit === 'acres' && `${data.area} acres = ${(data.area * 0.405).toFixed(2)} hectares`}
              {data.unit === 'square_meters' && `${data.area} m² = ${(data.area / 10000).toFixed(4)} hectares`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ReviewInfo = ({ formData, soilTypes, crops }) => {
  const sections = [
    {
      title: 'Personal Information',
      data: [
        { label: 'Name', value: formData.personal_info?.farmer_name },
        { label: 'Experience', value: formData.personal_info?.experience },
        { label: 'Email', value: formData.personal_info?.contact_email }
      ]
    },
    {
      title: 'Location',
      data: [
        { label: 'Address', value: formData.location?.address },
        { label: 'Coordinates', value: `${formData.location?.latitude}, ${formData.location?.longitude}` },
        { label: 'Climate', value: formData.location?.climate_zone }
      ]
    },
    {
      title: 'Soil Type',
      data: [
        { label: 'Type', value: formData.soil_type },
        { label: 'Description', value: soilTypes[formData.soil_type]?.description }
      ]
    },
    {
      title: 'Crop Information',
      data: [
        { label: 'Crop', value: formData.crop_info?.name },
        { 
          label: 'Growth Stage', 
          value: formData.crop_info?.name && crops[formData.crop_info.name] 
            ? crops[formData.crop_info.name].growth_stages?.[formData.crop_info.growth_stage] || `Stage ${formData.crop_info.growth_stage}`
            : ''
        },
        { label: 'Planting Date', value: formData.crop_info?.planting_date }
      ]
    },
    {
      title: 'Farm Size',
      data: [
        { label: 'Area', value: `${formData.farm_size?.area} ${formData.farm_size?.unit}` },
        { label: 'Irrigation Method', value: formData.farm_size?.irrigation_method }
      ]
    }
  ];

  return (
    <div className="p-8">
      <h3 className="text-2xl font-bold text-primary-600 mb-6">Review Information</h3>
      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="bg-gray-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-primary-600 mb-4">{section.title}</h4>
            <div className="space-y-2">
              {section.data.map((item, itemIndex) => (
                item.value && (
                  <div key={itemIndex} className="flex justify-between">
                    <span className="font-medium text-gray-700">{item.label}:</span>
                    <span className="text-gray-600">{item.value}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
