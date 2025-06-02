# KrishiJal - A Smart tool for Irrigation Scheduling and Soil Image Analysis

AI-powered irrigation scheduling tool that combines soil image analysis with real-time weather data to optimize water usage for small-scale farmers.

## Overview

This system reduces water waste by 30-40% and improves crop yields by integrating:
- **AI soil analysis** using CNN/ResNet models
- **Real-time weather data** via APIs
- **Smart scheduling** with XGBoost and LSTM models

## Features

- 📸 **Soil Image Analysis**: Upload soil photos for AI-powered texture classification
- 🌤️ **Weather Integration**: Real-time temperature, humidity, and rainfall data
- 💧 **Smart Scheduling**: ML-based irrigation recommendations
- 📱 **Mobile Alerts**: SMS/WhatsApp notifications
- 💰 **Cost-Effective**: Smartphone-based solution for small farmers

## How It Works

1. **Upload** soil image via smartphone
2. **Analyze** soil texture using AI
3. **Fetch** real-time weather data
4. **Calculate** optimal irrigation schedule
5. **Receive** SMS/WhatsApp alerts

## Tech Stack

- **Backend**: Python, Flask/Django
- **AI/ML**: TensorFlow, XGBoost, LSTM
- **APIs**: OpenWeatherMap, Twilio
- **Libraries**: pyfao56, OpenCV

## Installation
- Step 1 :
  ```bash
  git clone https://github.com/Abhishekvk04/KrishiJal.git
  cd KrishiJal
  ```
  
- Step 2 :
  ```bash
  cd backend
  pip install -r requirements.txt
  python3 app.py
  ```
- Step 3 :
  ```bash
  cd app
  npm install
  npm start
  ```

## For Testing Purpose
- **User credentials**
  ```bash
  - User name: Test Farmer
  - Phone : 1234567890
  ```
    
  ```bash
  curl -X POST http://localhost:5000/api/generate-schedule \
    -H "Content-Type: application/json" \
    -d '{"personal_info":{"farmer_name":"Test Farmer","phone":"1234567890"},"soil_type":"Sandy Loam","crop_info":{"name":"Rice","growth_stage":2},"location":{"address":"Phalodi"},"farm_size":{"area":"2"}}'
  ```

- **For image processing(Soil Image Classification Model)**
  ```bash
  curl -X POST "https://krishijal.onrender.com/api/classify-soil" \
    -H "Content-Type: multipart/form-data" \
    -F "soil_image=@app/src/Assets/Soil.jpg" \
    --max-time 180 \
    --show-error
  ```

## Team

- Abhishek V K
- Vishal Prakash Daimane
- N Chinmaya
- Rohan P Kulkarni

## Impact

- **Technical**: Water savings, improved yields, reduced costs  
- **Social**: Empowering small farmers, enhancing food security, reducing rural poverty
- **Bridges FAO-56 science with AI/ML for farmer-friendly irrigation.**
- **Impact: Sustainable water use, higher yields for small farmers.**

## License

MIT License - see [LICENSE](LICENSE) for details.

