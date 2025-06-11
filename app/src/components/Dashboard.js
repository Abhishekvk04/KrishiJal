import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://krishijal-server.onrender.com';

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
    if (validateCurrentStep() && currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return formData.personal_info?.farmer_name && formData.personal_info?.experience;
      case 2:
        return formData.location?.address && formData.location?.climate_zone;
      case 3:
        return formData.soil_type;
      case 4:
        return formData.crop_info?.name && formData.crop_info?.planting_date;
      case 5:
        return formData.farm_size?.area && formData.farm_size?.irrigation_method;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submissionData = {
        ...formData,
        personal_info: {
          ...formData.personal_info,
          phone: user?.phone || formData.personal_info?.phone
        }
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/generate-schedule`, 
        submissionData,
        {
          timeout: 180000,
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

  // Minimalistic Personal Info Component
  const PersonalInfo = ({ formData, updateFormData, user }) => {
    const [data, setData] = useState({
      farmer_name: formData.personal_info?.farmer_name || user?.name || '',
      experience: formData.personal_info?.experience || '',
      contact_email: formData.personal_info?.contact_email || '',
      phone: user?.phone || formData.personal_info?.phone || ''
    });

    const handleChange = (e) => {
      const newData = { ...data, [e.target.name]: e.target.value };
      setData(newData);
      updateFormData({ personal_info: newData });
    };

    const experienceOptions = [
      { value: 'beginner', label: 'New Farmer', desc: '0-2 years', icon: '🌱' },
      { value: 'intermediate', label: 'Experienced', desc: '3-10 years', icon: '🌿' },
      { value: 'experienced', label: 'Expert', desc: '10+ years', icon: '🌳' }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Minimalistic Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="text-5xl sm:text-6xl mb-4">👨‍🌾</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-emerald-800 mb-2">Tell us about yourself</h2>
            <p className="text-gray-600 text-sm sm:text-base">This helps us personalize your experience</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6 sm:space-y-8">
            {/* Name Field */}
            <div>
              <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
                Your Name
              </label>
              <input
                type="text"
                name="farmer_name"
                value={data.farmer_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full p-3 sm:p-4 text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                required
              />
            </div>

            {/* Experience Selection */}
            <div>
              <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-4">
                Farming Experience
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {experienceOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`p-4 sm:p-6 border-2 rounded-xl transition-all duration-200 ${
                      data.experience === option.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                    onClick={() => handleChange({ target: { name: 'experience', value: option.value } })}
                  >
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl mb-2">{option.icon}</div>
                      <div className="font-semibold text-sm sm:text-base">{option.label}</div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">{option.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={data.contact_email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full p-3 sm:p-4 text-base border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={data.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full p-3 sm:p-4 text-base border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Progress Indicator */}
            {data.farmer_name && data.experience && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                <div className="flex items-center justify-center text-emerald-800">
                  <div className="text-2xl mr-3">✓</div>
                  <div className="text-center">
                    <div className="font-semibold">Ready to continue!</div>
                    <div className="text-sm">Let's set up your farm location</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Location Info Component with Address OR Current Location
  const LocationInfo = ({ formData, updateFormData }) => {
    const [data, setData] = useState({
      address: formData.location?.address || '',
      latitude: formData.location?.latitude || '',
      longitude: formData.location?.longitude || '',
      climate_zone: formData.location?.climate_zone || ''
    });

    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationMethod, setLocationMethod] = useState('address'); // 'address' or 'gps'

    const handleChange = (e) => {
      const newData = { ...data, [e.target.name]: e.target.value };
      setData(newData);
      updateFormData({ location: newData });
    };

    const getCurrentLocation = () => {
      setIsGettingLocation(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newData = {
              ...data,
              latitude: position.coords.latitude.toFixed(6),
              longitude: position.coords.longitude.toFixed(6),
              address: `GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
            };
            setData(newData);
            updateFormData({ location: newData });
            setIsGettingLocation(false);
            setLocationMethod('gps');
          },
          (error) => {
            alert('Unable to get location. Please enter address manually.');
            setIsGettingLocation(false);
            setLocationMethod('address');
          }
        );
      } else {
        alert('Geolocation is not supported by this browser.');
        setIsGettingLocation(false);
        setLocationMethod('address');
      }
    };

    const climateZones = [
      { value: 'arid', label: 'Arid', icon: '🏜️', desc: 'Hot & dry' },
      { value: 'semi-arid', label: 'Semi-Arid', icon: '🌵', desc: 'Moderate rain' },
      { value: 'tropical', label: 'Tropical', icon: '🌴', desc: 'Hot & humid' },
      { value: 'subtropical', label: 'Subtropical', icon: '🌞', desc: 'Warm climate' },
      { value: 'temperate', label: 'Temperate', icon: '🍂', desc: 'Mild seasons' }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-emerald-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="text-5xl sm:text-6xl mb-4">📍</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-sky-800 mb-2">Where is your farm?</h2>
            <p className="text-gray-600 text-sm sm:text-base">Help us understand your location</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6 sm:space-y-8">
            {/* Location Method Selection */}
            <div>
              <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-4">
                How would you like to share your location?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`p-4 border-2 rounded-xl transition-all ${
                    locationMethod === 'address'
                      ? 'border-sky-500 bg-sky-50 text-sky-800'
                      : 'border-gray-200 hover:border-sky-300'
                  }`}
                  onClick={() => setLocationMethod('address')}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">🏠</div>
                    <div className="font-semibold">Enter Address</div>
                    <div className="text-sm text-gray-600">Type your farm address</div>
                  </div>
                </button>

                <button
                  type="button"
                  className={`p-4 border-2 rounded-xl transition-all ${
                    locationMethod === 'gps'
                      ? 'border-sky-500 bg-sky-50 text-sky-800'
                      : 'border-gray-200 hover:border-sky-300'
                  }`}
                  onClick={() => setLocationMethod('gps')}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">📱</div>
                    <div className="font-semibold">Use Current Location</div>
                    <div className="text-sm text-gray-600">GPS location</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Address Input */}
            {locationMethod === 'address' && (
              <div>
                <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
                  Farm Address
                </label>
                <textarea
                  name="address"
                  value={data.address}
                  onChange={handleChange}
                  placeholder="Village, Taluka, District, State..."
                  rows="3"
                  className="w-full p-3 sm:p-4 text-base border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white resize-none"
                  required
                />
              </div>
            )}

            {/* GPS Location */}
            {locationMethod === 'gps' && (
              <div>
                <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
                  GPS Location
                </label>
                {data.latitude && data.longitude ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                    <div className="flex items-center justify-center text-emerald-800">
                      <div className="text-2xl mr-3">✓</div>
                      <div>
                        <div className="font-semibold">Location captured!</div>
                        <div className="text-sm">Lat: {data.latitude}, Lng: {data.longitude}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="w-full bg-sky-600 text-white p-4 rounded-xl font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGettingLocation ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin mr-2">🔄</div>
                        Getting location...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <div className="mr-2">📍</div>
                        Get Current Location
                      </div>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Climate Zone */}
            <div>
              <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-4">
                Climate Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {climateZones.map((zone) => (
                  <button
                    key={zone.value}
                    type="button"
                    className={`p-3 sm:p-4 border-2 rounded-xl transition-all ${
                      data.climate_zone === zone.value
                        ? 'border-sky-500 bg-sky-50 text-sky-800'
                        : 'border-gray-200 hover:border-sky-300'
                    }`}
                    onClick={() => handleChange({ target: { name: 'climate_zone', value: zone.value } })}
                  >
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl mb-1">{zone.icon}</div>
                      <div className="font-semibold text-xs sm:text-sm">{zone.label}</div>
                      <div className="text-xs text-gray-600 hidden sm:block">{zone.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Location Summary */}
            {((locationMethod === 'address' && data.address) || (locationMethod === 'gps' && data.latitude)) && data.climate_zone && (
              <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl">
                <div className="flex items-center justify-center text-sky-800">
                  <div className="text-2xl mr-3">✓</div>
                  <div className="text-center">
                    <div className="font-semibold">Location confirmed!</div>
                    <div className="text-sm">Climate: {data.climate_zone}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Minimalistic Soil Classification Component
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

      if (file.size > 5 * 1024 * 1024) {
        alert('Image too large! Please choose an image smaller than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);

      setSelectedImage(file);
      setLoading(true);
      setPrediction(null);
      setLoadingStage('Uploading soil image...');

      const formDataUpload = new FormData();
      formDataUpload.append('soil_image', file);

      try {
        setLoadingStage('AI analyzing your soil...');
        
        const response = await axios.post(
          `${API_BASE_URL}/api/classify-soil`, 
          formDataUpload, 
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 180000,
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setLoadingStage(`Uploading... ${percentCompleted}%`);
            }
          }
        );
        
        if (response.data && response.data.success) {
          const predictionData = {
            predicted_soil_type: response.data.predicted_soil_type,
            confidence: response.data.confidence,
            method: response.data.method,
            soil_properties: response.data.soil_properties || {
              water_holding_capacity: 'Medium',
              infiltration_rate: 'Moderate',
              field_capacity: 0.25,
              description: 'Good for irrigation'
            }
          };
          
          setPrediction(predictionData);
          updateFormData({ 
            soil_type: response.data.predicted_soil_type,
            soil_confidence: response.data.confidence,
            soil_classification_method: response.data.method
          });
        }
        
      } catch (error) {
        console.error('Soil classification error:', error);
        setLoadingStage('Analysis failed. You can select manually.');
        setTimeout(() => {
          setLoading(false);
          setShowManualSelection(true);
        }, 2000);
        return;
      }
      
      setLoading(false);
      setLoadingStage('');
    };

    const handleManualSelection = (soilType) => {
      setManualSoilType(soilType);
      updateFormData({ 
        soil_type: soilType,
        soil_confidence: 100,
        soil_classification_method: 'manual_selection'
      });
      setShowManualSelection(false);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-emerald-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="text-5xl sm:text-6xl mb-4">🌱</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-amber-800 mb-2">Soil Analysis</h2>
            <p className="text-gray-600 text-sm sm:text-base">Upload a photo or select manually</p>
          </div>

          {/* Loading Overlay */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-white p-6 sm:p-8 rounded-2xl max-w-sm mx-4 text-center">
                <div className="animate-spin text-4xl sm:text-5xl mb-4">🔄</div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-amber-800">{loadingStage}</h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div className="bg-amber-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
                <p className="text-sm text-gray-600">AI analyzing soil properties...</p>
              </div>
            </div>
          )}
          
          {/* Image Upload or Manual Selection */}
          {!prediction && !loading && (
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
              {!showManualSelection ? (
                <>
                  {/* Image Upload */}
                  <div>
                    <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-4">
                      Take a Soil Photo
                    </label>
                    <div className="border-2 border-dashed border-amber-300 rounded-xl p-6 sm:p-8 text-center hover:border-amber-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="soil-image-upload"
                      />
                      <label htmlFor="soil-image-upload" className="cursor-pointer block">
                        <div className="text-4xl sm:text-5xl mb-4">📷</div>
                        <h4 className="text-lg sm:text-xl font-semibold text-amber-800 mb-2">Upload Soil Photo</h4>
                        <p className="text-gray-600 mb-4 text-sm sm:text-base">
                          Take a clear photo of your soil from 1 meter height
                        </p>
                        <div className="inline-block bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors">
                          Choose Photo
                        </div>
                      </label>
                    </div>
                    
                    {imagePreview && (
                      <div className="mt-4 text-center">
                        <img 
                          src={imagePreview} 
                          alt="Soil sample" 
                          className="max-w-full max-h-48 object-cover rounded-xl mx-auto"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <button 
                      type="button"
                      onClick={() => setShowManualSelection(true)}
                      className="text-amber-600 hover:text-amber-800 font-medium hover:underline transition-colors"
                    >
                      Select soil type manually instead
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Manual Selection */}
                  <div>
                    <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-4">
                      Select Your Soil Type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(soilTypes).map(([type, properties]) => (
                        <button
                          key={type}
                          type="button"
                          className={`p-4 border-2 rounded-xl transition-all text-left ${
                            manualSoilType === type
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-gray-200 hover:border-amber-300'
                          }`}
                          onClick={() => handleManualSelection(type)}
                        >
                          <div className="text-center mb-3">
                            <div className="text-3xl mb-2">🌱</div>
                            <h5 className="font-semibold text-amber-700">{type}</h5>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{properties.description}</p>
                          <div className="text-xs text-gray-500">
                            Water holding: {properties.water_holding_capacity}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <button 
                      type="button"
                      onClick={() => setShowManualSelection(false)}
                      className="text-amber-600 hover:text-amber-800 font-medium hover:underline transition-colors"
                    >
                      ← Back to photo upload
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Prediction Results */}
          {prediction && !loading && (
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="text-4xl sm:text-5xl mb-2">🎯</div>
                <h4 className="text-xl sm:text-2xl font-bold text-amber-800">Analysis Complete!</h4>
              </div>
              
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                  <h5 className="font-semibold text-amber-800 mb-2">Soil Type Identified</h5>
                  <p className="text-2xl font-bold text-amber-600 mb-2">{prediction.predicted_soil_type}</p>
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                    {prediction.confidence}% confident
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <span className="text-gray-600">Water Holding:</span>
                    <span className="ml-2 font-medium">{prediction.soil_properties?.water_holding_capacity}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <span className="text-gray-600">Infiltration:</span>
                    <span className="ml-2 font-medium">{prediction.soil_properties?.infiltration_rate}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setPrediction(null);
                    setImagePreview(null);
                    setSelectedImage(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Try Different Photo
                </button>
                <button 
                  type="button"
                  onClick={() => setShowManualSelection(true)}
                  className="flex-1 px-4 py-3 bg-amber-100 text-amber-700 rounded-xl font-medium hover:bg-amber-200 transition-colors"
                >
                  Choose Manually
                </button>
              </div>
            </div>
          )}

          {/* Confirmation */}
          {(prediction || formData.soil_type) && !loading && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mt-6">
              <div className="flex items-center justify-center text-emerald-800">
                <div className="text-2xl mr-3">✓</div>
                <div className="text-center">
                  <div className="font-semibold">Soil Type Confirmed</div>
                  <div className="text-sm">{formData.soil_type || prediction?.predicted_soil_type}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Minimalistic Crop Info Component
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

    const growthStageIcons = ['🌱', '🌿', '🌸', '🍅', '🌾'];
    const growthStageNames = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity'];

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="text-5xl sm:text-6xl mb-4">🌾</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-2">Your Crop Details</h2>
            <p className="text-gray-600 text-sm sm:text-base">Tell us about what you're growing</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6 sm:space-y-8">
            {/* Crop Selection */}
            <div>
              <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
                What crop are you growing?
              </label>
              <select 
                name="name" 
                value={data.name} 
                onChange={handleChange} 
                className="w-full p-3 sm:p-4 text-base border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                required
              >
                <option value="">Select your crop</option>
                {Object.keys(crops).map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>

            {/* Planting Date */}
            <div>
              <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
                When did you plant it?
              </label>
              <input
                type="date"
                name="planting_date"
                value={data.planting_date}
                onChange={handleChange}
                className="w-full p-3 sm:p-4 text-base border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                required
              />
            </div>

            {/* Growth Stage Selection */}
            {data.name && crops[data.name] && (
              <div>
                <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-4">
                  Current growth stage
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {(crops[data.name]?.growth_stages || growthStageNames).map((stage, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`p-3 sm:p-4 border-2 rounded-xl transition-all ${
                        data.growth_stage === index
                          ? 'border-green-500 bg-green-50 text-green-800'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                      onClick={() => handleChange({ target: { name: 'growth_stage', value: index } })}
                    >
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl mb-1">{growthStageIcons[index]}</div>
                        <div className="font-medium text-xs sm:text-sm">{stage}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Crop Information Display */}
            {data.name && crops[data.name] && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-3">{data.name} Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-xl mb-1">⏱️</div>
                    <div className="font-medium text-gray-700">Season</div>
                    <div className="text-green-600 font-semibold">{crops[data.name]?.season_length || 120} days</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-xl mb-1">🌿</div>
                    <div className="font-medium text-gray-700">Root Depth</div>
                    <div className="text-green-600 font-semibold">{crops[data.name]?.rooting_depth || 0.5} m</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-xl mb-1">💧</div>
                    <div className="font-medium text-gray-700">Water Need</div>
                    <div className="text-green-600 font-semibold">{((crops[data.name]?.critical_depletion || 0.5) * 100)}%</div>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Indicator */}
            {data.name && data.planting_date && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                <div className="flex items-center justify-center text-emerald-800">
                  <div className="text-2xl mr-3">✓</div>
                  <div className="text-center">
                    <div className="font-semibold">Crop details saved!</div>
                    <div className="text-sm">Ready for farm size setup</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Minimalistic Farm Size Info Component
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

    const irrigationMethods = [
      { value: 'drip', label: 'Drip', icon: '💧', desc: 'Water efficient' },
      { value: 'sprinkler', label: 'Sprinkler', icon: '🌧️', desc: 'Good coverage' },
      { value: 'flood', label: 'Flood', icon: '🌊', desc: 'Traditional' },
      { value: 'furrow', label: 'Furrow', icon: '🚜', desc: 'Row crops' }
    ];

    const getAreaConversion = () => {
      if (!data.area) return '';
      const area = parseFloat(data.area);
      switch (data.unit) {
        case 'hectares':
          return `${(area * 2.471).toFixed(2)} acres`;
        case 'acres':
          return `${(area * 0.405).toFixed(2)} hectares`;
        case 'square_meters':
          return `${(area / 10000).toFixed(4)} hectares`;
        default:
          return '';
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="text-5xl sm:text-6xl mb-4">📏</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-2">Farm Setup</h2>
            <p className="text-gray-600 text-sm sm:text-base">Final details about your farm</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6 sm:space-y-8">
            {/* Farm Area */}
            <div>
              <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-3">
                Farm size
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="area"
                  value={data.area}
                  onChange={handleChange}
                  placeholder="Enter area"
                  min="0"
                  step="0.1"
                  className="p-3 sm:p-4 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                  required
                />
                <select 
                  name="unit" 
                  value={data.unit} 
                  onChange={handleChange} 
                  className="p-3 sm:p-4 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
                >
                  <option value="hectares">Hectares</option>
                  <option value="acres">Acres</option>
                  <option value="square_meters">Square Meters</option>
                </select>
              </div>
              
              {data.area && (
                <div className="mt-3 text-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    ≈ {getAreaConversion()}
                  </span>
                </div>
              )}
            </div>

            {/* Irrigation Method */}
            <div>
              <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-4">
                Irrigation method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {irrigationMethods.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    className={`p-3 sm:p-4 border-2 rounded-xl transition-all ${
                      data.irrigation_method === method.value
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleChange({ target: { name: 'irrigation_method', value: method.value } })}
                  >
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl mb-1">{method.icon}</div>
                      <div className="font-semibold text-xs sm:text-sm">{method.label}</div>
                      <div className="text-xs text-gray-600 hidden sm:block">{method.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Farm Summary */}
            {data.area && data.irrigation_method && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-800 mb-3 text-center">Farm Setup Complete!</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-xl mb-1">📐</div>
                    <div className="font-medium text-gray-700">Size</div>
                    <div className="text-blue-600 font-semibold">{data.area} {data.unit}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-xl mb-1">💧</div>
                    <div className="font-medium text-gray-700">Method</div>
                    <div className="text-blue-600 font-semibold text-xs">{data.irrigation_method}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-xl mb-1">✓</div>
                    <div className="font-medium text-gray-700">Status</div>
                    <div className="text-emerald-600 font-semibold">Ready!</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Minimalistic Review Component
  const ReviewInfo = ({ formData, soilTypes, crops }) => {
    const sections = [
      {
        title: 'Personal',
        icon: '👤',
        data: [
          { label: 'Name', value: formData.personal_info?.farmer_name },
          { label: 'Experience', value: formData.personal_info?.experience },
          { label: 'Phone', value: formData.personal_info?.phone || 'Not provided' }
        ]
      },
      {
        title: 'Location',
        icon: '📍',
        data: [
          { label: 'Address', value: formData.location?.address },
          { label: 'Climate', value: formData.location?.climate_zone }
        ]
      },
      {
        title: 'Soil',
        icon: '🌱',
        data: [
          { label: 'Type', value: formData.soil_type },
          { label: 'Confidence', value: `${formData.soil_confidence}%` }
        ]
      },
      {
        title: 'Crop',
        icon: '🌾',
        data: [
          { label: 'Type', value: formData.crop_info?.name },
          { label: 'Planted', value: formData.crop_info?.planting_date }
        ]
      },
      {
        title: 'Farm',
        icon: '📏',
        data: [
          { label: 'Size', value: `${formData.farm_size?.area} ${formData.farm_size?.unit}` },
          { label: 'Irrigation', value: formData.farm_size?.irrigation_method }
        ]
      }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-emerald-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="text-5xl sm:text-6xl mb-4">✅</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-2">Review & Confirm</h2>
            <p className="text-gray-600 text-sm sm:text-base">Check your details before generating schedule</p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {sections.map((section, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <span className="text-xl mr-2">{section.icon}</span>
                  {section.title}
                </h4>
                <div className="space-y-2">
                  {section.data.map((item, itemIndex) => (
                    item.value && (
                      <div key={itemIndex} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700 text-sm">{item.label}:</span>
                        <span className="text-gray-600 text-sm text-right">{item.value}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))}

            {/* Ready Card */}
            <div className="bg-gradient-to-r from-purple-100 to-emerald-100 rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl mb-4">🚀</div>
                <h4 className="text-xl sm:text-2xl font-bold text-purple-800 mb-2">Ready to Generate!</h4>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  AI will create your personalized irrigation schedule
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-white p-3 rounded-xl">
                    <div className="text-xl mb-1">🌾</div>
                    <div className="font-semibold text-gray-700 text-xs">Crop</div>
                    <div className="text-purple-600 font-bold text-xs">{formData.crop_info?.name}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl">
                    <div className="text-xl mb-1">🌱</div>
                    <div className="font-semibold text-gray-700 text-xs">Soil</div>
                    <div className="text-purple-600 font-bold text-xs">{formData.soil_type}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl">
                    <div className="text-xl mb-1">📐</div>
                    <div className="font-semibold text-gray-700 text-xs">Area</div>
                    <div className="text-purple-600 font-bold text-xs">{formData.farm_size?.area} {formData.farm_size?.unit}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl">
                    <div className="text-xl mb-1">💧</div>
                    <div className="font-semibold text-gray-700 text-xs">Method</div>
                    <div className="text-purple-600 font-bold text-xs">{formData.farm_size?.irrigation_method}</div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl inline-block">
                  <p className="text-xs text-gray-600 mb-2">🤖 AI Analysis includes:</p>
                  <div className="flex flex-wrap justify-center gap-1 text-xs">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Weather</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Soil</span>
                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded">Crop Needs</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Local Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

  const steps = [
    { name: 'Personal', icon: '👤' },
    { name: 'Location', icon: '📍' },
    { name: 'Soil', icon: '🌱' },
    { name: 'Crop', icon: '🌾' },
    { name: 'Farm', icon: '📏' },
    { name: 'Review', icon: '✅' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50">
      {/* Minimalistic Progress Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Smart Irrigation</h1>
            <button 
              onClick={() => navigate('/history')}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
            >
              History
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Step {currentStep} of {steps.length}</span>
            <span className="text-sm text-gray-600">{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-sky-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col items-center ${
                  currentStep >= index + 1 ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                <div className={`text-lg sm:text-xl mb-1 ${currentStep >= index + 1 ? 'scale-110' : ''} transition-transform`}>
                  {step.icon}
                </div>
                <div className="text-xs font-medium hidden sm:block">{step.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="pb-20">
        {renderStep()}
      </div>

      {/* Minimalistic Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          {currentStep > 1 ? (
            <button 
              onClick={handlePrevious} 
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              ← Back
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 6 ? (
            <button 
              onClick={handleNext} 
              disabled={!validateCurrentStep()}
              className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                validateCurrentStep()
                  ? 'bg-gradient-to-r from-emerald-600 to-sky-600 text-white hover:from-emerald-700 hover:to-sky-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next →
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-bold transition-colors ${
                loading 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-gradient-to-r from-emerald-600 to-sky-600 text-white hover:from-emerald-700 hover:to-sky-700'
              }`}
            >
              {loading ? 'Generating...' : 'Generate Schedule'}
            </button>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl max-w-md mx-4 text-center">
            <div className="animate-spin text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-4 text-emerald-800">Creating Your Schedule</h3>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div className="bg-gradient-to-r from-emerald-500 to-sky-500 h-3 rounded-full animate-pulse" style={{width: '75%'}}></div>
            </div>
            
            <div className="space-y-2 text-gray-600 text-sm">
              <p>🌡️ Analyzing weather patterns</p>
              <p>🌱 Processing soil data</p>
              <p>🌾 Calculating crop needs</p>
              <p>💧 Optimizing irrigation</p>
            </div>
            
            <p className="mt-4 text-xs text-gray-500">This usually takes 1-3 minutes</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
