import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import os

class IrrigationMLPredictor:
    def __init__(self):
        self.classifier = None  # Predicts irrigation need (Yes/No)
        self.regressor = None   # Predicts irrigation amount (mm)
        self.scaler = None      # Feature scaling
        self.feature_names = [
            'soil_moisture_percent', 'temp_max', 'temp_min', 'temp_avg',
            'humidity', 'wind_speed', 'days_since_irrigation', 
            'growth_stage', 'soil_type_encoded', 'day_of_year'
        ]
        self.load_models()
    
    def load_models(self):
        """Load pre-trained models"""
        model_dir = 'ml_models'
        try:
            self.classifier = joblib.load(f'{model_dir}/irrigation_classifier.pkl')
            self.regressor = joblib.load(f'{model_dir}/irrigation_regressor.pkl')
            self.scaler = joblib.load(f'{model_dir}/feature_scaler.pkl')
            print("ML models loaded successfully")
        except FileNotFoundError:
            print("ML models not found. Using fallback calculations.")
    
    def prepare_features(self, data):
        """Convert input data to model features"""
        # Encode soil type
        soil_encoding = {'Sandy': 1, 'Clay': 2, 'Loam': 3, 'Sandy Loam': 4}
        
        features = np.array([
            data['soil_moisture_percent'],
            data['temp_max'],
            data['temp_min'],
            (data['temp_max'] + data['temp_min']) / 2,  # temp_avg
            data['humidity'],
            data['wind_speed'],
            data['days_since_irrigation'],
            data['growth_stage'],
            soil_encoding.get(data['soil_type'], 3),  # Default to Loam
            data['day_of_year']
        ]).reshape(1, -1)
        
        return features
    
    def predict_irrigation(self, input_data):
        """Predict irrigation need and amount"""
        if not all([self.classifier, self.regressor, self.scaler]):
            return self.fallback_prediction(input_data)
        
        try:
            # Prepare features
            features = self.prepare_features(input_data)
            features_scaled = self.scaler.transform(features)
            
            # Predict irrigation need
            need_irrigation = self.classifier.predict(features_scaled)[0]
            irrigation_probability = self.classifier.predict_proba(features_scaled)[0][1]
            
            # Predict irrigation amount if needed
            irrigation_amount = 0
            if need_irrigation:
                irrigation_amount = max(0, self.regressor.predict(features_scaled)[0])
            
            return {
                'need_irrigation': bool(need_irrigation),
                'irrigation_amount_mm': round(irrigation_amount, 1),
                'confidence': round(irrigation_probability * 100, 1),
                'method': 'ml_prediction'
            }
            
        except Exception as e:
            print(f"ML prediction error: {e}")
            return self.fallback_prediction(input_data)
    
    def fallback_prediction(self, data):
        """Simple rule-based fallback when ML models unavailable"""
        # Simple threshold-based approach
        need_irrigation = data['soil_moisture_percent'] < 40
        irrigation_amount = 0
        
        if need_irrigation:
            # Simple calculation based on soil moisture deficit
            target_moisture = 80
            deficit = target_moisture - data['soil_moisture_percent']
            irrigation_amount = deficit * 0.5  # Simple conversion factor
        
        return {
            'need_irrigation': need_irrigation,
            'irrigation_amount_mm': round(irrigation_amount, 1),
            'confidence': 75.0,
            'method': 'rule_based_fallback'
        }
    def load_models(self):
        """Load pre-trained models"""
        model_dir = 'ml_models'
        try:
            print(f"Looking for models in: {os.path.abspath(model_dir)}")
            self.classifier = joblib.load(f'{model_dir}/irrigation_classifier.pkl')
            self.regressor = joblib.load(f'{model_dir}/irrigation_regressor.pkl')
            self.scaler = joblib.load(f'{model_dir}/feature_scaler.pkl')
            print("ML models loaded successfully")
        except FileNotFoundError as e:
            print(f"ML models not found: {e}. Using fallback calculations.")
        except Exception as e:
            print(f"Error loading ML models: {e}. Using fallback calculations.")
