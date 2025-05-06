import React from "react";
import { useLocation } from "react-router-dom";

function AnalysisPage() {
  const { state } = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-4xl mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-green-800 mb-2">Irrigation Schedule Analysis</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Based on your soil sample and crop selection, we've created a personalized irrigation plan
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-2xl">
        {/* Analysis Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Card Header */}
          <div className="bg-green-700 py-4 px-6">
            <h2 className="text-xl font-bold text-white">Farm Information</h2>
          </div>

          {/* Card Body */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 font-medium text-gray-600">Name:</div>
              <div className="col-span-2">{state?.name || "Not provided"}</div>
              
              <div className="col-span-1 font-medium text-gray-600">Phone:</div>
              <div className="col-span-2">{state?.phone || "Not provided"}</div>
              
              <div className="col-span-1 font-medium text-gray-600">Address:</div>
              <div className="col-span-2">{state?.address || "Not provided"}</div>
              
              <div className="col-span-1 font-medium text-gray-600">Location:</div>
              <div className="col-span-2">{state?.location || "Not provided"}</div>
              
              <div className="col-span-1 font-medium text-gray-600">Crop:</div>
              <div className="col-span-2">{state?.cropName || "Not provided"}</div>
              
              <div className="col-span-1 font-medium text-gray-600">Soil Image:</div>
              <div className="col-span-2">{state?.soilImage?.name || "Not provided"}</div>
            </div>
          </div>
        </div>

        {/* Irrigation Schedule Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Card Header */}
          <div className="bg-blue-600 py-4 px-6">
            <h2 className="text-xl font-bold text-white">Recommended Irrigation Schedule</h2>
          </div>

          {/* Card Body */}
          <div className="p-6">
            <div className="mb-4">
              <p className="text-gray-600">
                Based on your soil analysis and crop type, we recommend the following irrigation schedule:
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">Week 1: Establishment Phase</h3>
                <p className="text-blue-700">Water daily in the morning (6-8 AM) with 10-15mm of water per session</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">Weeks 2-4: Development Phase</h3>
                <p className="text-blue-700">Alternate day watering with 15-20mm of water per session</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">Week 5 onward: Maturation Phase</h3>
                <p className="text-blue-700">Twice a week based on crop type and weather conditions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Soil Analysis Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Card Header */}
          <div className="bg-amber-600 py-4 px-6">
            <h2 className="text-xl font-bold text-white">Soil Analysis Results</h2>
          </div>

          {/* Card Body */}
          <div className="p-6">
            <div className="mb-4">
              <p className="text-gray-600">
                Our AI analysis of your soil sample indicates the following properties:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <h3 className="font-semibold text-amber-800 mb-1">Soil Type</h3>
                <p className="text-amber-700">Loamy Clay</p>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <h3 className="font-semibold text-amber-800 mb-1">pH Level</h3>
                <p className="text-amber-700">6.5 (Slightly Acidic)</p>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <h3 className="font-semibold text-amber-800 mb-1">Nitrogen (N)</h3>
                <p className="text-amber-700">Medium (45 kg/ha)</p>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <h3 className="font-semibold text-amber-800 mb-1">Phosphorus (P)</h3>
                <p className="text-amber-700">Low (15 kg/ha)</p>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <h3 className="font-semibold text-amber-800 mb-1">Potassium (K)</h3>
                <p className="text-amber-700">High (120 kg/ha)</p>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <h3 className="font-semibold text-amber-800 mb-1">Organic Matter</h3>
                <p className="text-amber-700">2.5% (Moderate)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Back to Form
          </button>
          
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Print Report
          </button>
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
}

export default AnalysisPage;
