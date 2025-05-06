// pages/HomePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    location: "",
    soilImage: null,
    cropName: "",
  });

  const handleLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = `${pos.coords.latitude}, ${pos.coords.longitude}`;
      setForm({ ...form, location: coords });
    });
  };

  const handleSubmit = () => {
    navigate("/analysis", { state: form });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-4xl mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-green-800 mb-2">Sustainable Agriculture</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get personalized recommendations for your farm based on soil analysis and location data
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-2xl">
        {/* Progress Steps */}
        <div className="mb-8 hidden sm:block">
          <div className="flex justify-between items-center">
            {[
              "Personal Info",
              "Location",
              "Soil Analysis",
              "Crop Selection",
              "Review"
            ].map((label, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step > index + 1 ? 'bg-green-600 text-white' : 
                    step === index + 1 ? 'bg-green-500 text-white border-2 border-green-300' : 
                    'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                <span className={`text-xs mt-2 ${step === index + 1 ? 'font-semibold text-green-700' : 'text-gray-500'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute left-0 right-0 h-1 top-0 bg-gray-200"></div>
            <div 
              className="absolute left-0 h-1 top-0 bg-green-500 transition-all duration-300"
              style={{ width: `${(step - 1) * 25}%` }}
            ></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Card Header */}
          <div className="bg-green-700 py-4 px-6">
            <h2 className="text-xl font-bold text-white">
              {step === 1 && "Personal Information"}
              {step === 2 && "Farm Location"}
              {step === 3 && "Soil Analysis"}
              {step === 4 && "Crop Selection"}
              {step === 5 && "Review Your Information"}
            </h2>
          </div>

          {/* Card Body */}
          <div className="p-6">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">Please provide your basic information to get started.</p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      id="phone"
                      type="text"
                      placeholder="Enter your phone number"
                      className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Farm Address</label>
                    <input
                      id="address"
                      type="text"
                      placeholder="Enter your farm address"
                      className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Geolocation */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">We need your precise location to provide accurate soil and crop recommendations.</p>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Why we need your location</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Your precise location helps us analyze local soil conditions, climate patterns, and recommend suitable crops for your area.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLocation();
                  }}
                  className="bg-green-600 hover:bg-green-700 transition-colors text-white px-6 py-3 rounded-lg w-full font-semibold flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Get My Location
                </button>
                {form.location && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-1">Location Detected</h4>
                    <p className="text-sm text-gray-700">{form.location}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Soil Image Upload */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">Upload a clear image of your soil for our AI-powered analysis.</p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="soil-image" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input 
                          id="soil-image" 
                          name="soil-image" 
                          type="file" 
                          className="sr-only"
                          accept="image/*"
                          onChange={(e) => setForm({ ...form, soilImage: e.target.files[0] })}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
                {form.soilImage && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-green-800">File uploaded successfully</p>
                      <p className="text-xs text-gray-500">{form.soilImage.name}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Crop Name */}
            {step === 4 && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">Tell us which crop you want to grow in your farm.</p>
                <div>
                  <label htmlFor="crop-name" className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
                  <input
                    id="crop-name"
                    type="text"
                    placeholder="Enter crop name (e.g., Wheat, Rice, Corn)"
                    className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={form.cropName}
                    onChange={(e) => setForm({ ...form, cropName: e.target.value })}
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Crop Selection Tip</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>Choose crops that are suitable for your region's climate and soil conditions for best results.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review and Submit */}
            {step === 5 && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">Please review your information before submitting.</p>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-3 gap-2 border-b pb-2">
                    <span className="font-medium col-span-1 text-gray-600">Name:</span>
                    <span className="col-span-2">{form.name || "Not provided"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-b pb-2">
                    <span className="font-medium col-span-1 text-gray-600">Phone:</span>
                    <span className="col-span-2">{form.phone || "Not provided"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-b pb-2">
                    <span className="font-medium col-span-1 text-gray-600">Address:</span>
                    <span className="col-span-2">{form.address || "Not provided"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-b pb-2">
                    <span className="font-medium col-span-1 text-gray-600">Location:</span>
                    <span className="col-span-2">{form.location || "Not provided"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-b pb-2">
                    <span className="font-medium col-span-1 text-gray-600">Soil Image:</span>
                    <span className="col-span-2">{form.soilImage ? form.soilImage.name : "None"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-medium col-span-1 text-gray-600">Crop Name:</span>
                    <span className="col-span-2">{form.cropName || "Not provided"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Back
              </button>
            ) : (
              <div></div> // Empty div to maintain spacing with flex justify-between
            )}
            
            {step < 5 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {form.location && step === 2 ? "Continue" : "Next"}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 w-full max-w-2xl text-center">
        <p className="text-sm text-gray-500">
          © 2025 Sustainable Agriculture. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
