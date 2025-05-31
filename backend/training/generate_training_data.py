import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_synthetic_irrigation_data(n_samples=5000):
    """Generate synthetic training data for irrigation prediction"""
    
    np.random.seed(42)
    random.seed(42)
    
    data = []
    
    for i in range(n_samples):
        # Generate weather features
        day_of_year = random.randint(1, 365)
        season_factor = np.sin(2 * np.pi * day_of_year / 365)  # Seasonal variation
        
        temp_max = 25 + 10 * season_factor + np.random.normal(0, 5)
        temp_min = temp_max - random.uniform(8, 15)
        temp_avg = (temp_max + temp_min) / 2
        
        humidity = max(20, min(95, 60 + np.random.normal(0, 15)))
        wind_speed = max(0, np.random.exponential(2))
        
        # Generate soil and crop features
        soil_types = ['Sandy', 'Clay', 'Loam', 'Sandy Loam']
        soil_type = random.choice(soil_types)
        soil_type_encoded = {'Sandy': 1, 'Clay': 2, 'Loam': 3, 'Sandy Loam': 4}[soil_type]
        
        growth_stage = random.randint(0, 3)
        days_since_irrigation = random.randint(0, 10)
        
        # Generate soil moisture (influenced by various factors)
        base_moisture = 70
        
        # Decrease moisture based on temperature and days since irrigation
        moisture_loss = (temp_avg - 20) * 0.5 + days_since_irrigation * 3
        
        # Soil type affects moisture retention
        soil_retention = {'Sandy': 0.7, 'Clay': 1.3, 'Loam': 1.0, 'Sandy Loam': 0.85}[soil_type]
        
        soil_moisture = max(10, base_moisture - moisture_loss * soil_retention + np.random.normal(0, 5))
        
        # Determine irrigation need (target logic)
        irrigation_threshold = {'Sandy': 45, 'Clay': 35, 'Loam': 40, 'Sandy Loam': 42}[soil_type]
        need_irrigation = soil_moisture < irrigation_threshold
        
        # Calculate irrigation amount
        irrigation_amount = 0
        if need_irrigation:
            target_moisture = irrigation_threshold + 25
            moisture_deficit = target_moisture - soil_moisture
            irrigation_amount = max(5, moisture_deficit * 0.6 + np.random.normal(0, 2))
        
        data.append({
            'soil_moisture_percent': round(soil_moisture, 1),
            'temp_max': round(temp_max, 1),
            'temp_min': round(temp_min, 1),
            'temp_avg': round(temp_avg, 1),
            'humidity': round(humidity, 1),
            'wind_speed': round(wind_speed, 1),
            'days_since_irrigation': days_since_irrigation,
            'growth_stage': growth_stage,
            'soil_type': soil_type,
            'soil_type_encoded': soil_type_encoded,
            'day_of_year': day_of_year,
            'need_irrigation': need_irrigation,
            'irrigation_amount_mm': round(irrigation_amount, 1)
        })
    
    return pd.DataFrame(data)

if __name__ == "__main__":
    # Generate training data
    df = generate_synthetic_irrigation_data(5000)
    
    # Save to CSV
    df.to_csv('training_data.csv', index=False)
    print(f"Generated {len(df)} training samples")
    print(f"Irrigation needed: {df['need_irrigation'].sum()} samples")
    print("Training data saved to training_data.csv")
