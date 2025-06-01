import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import requests
from models.data_models import SOIL_TYPES, CROP_DATABASE, SOIL_THRESHOLDS, IRRIGATION_TRIGGERS
import os
from dotenv import load_dotenv

load_dotenv()
class WeatherAPIClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "http://api.weatherapi.com/v1"
    
    def get_weather_data(self, location, days=7):
        """Fetch weather data for irrigation scheduling"""
        try:
            forecast_url = f"{self.base_url}/forecast.json"
            params = {
                'key': self.api_key,
                'q': location,
                'days': min(days, 7),
                'aqi': 'no',
                'alerts': 'no'
            }
            
            response = requests.get(forecast_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            return self.process_weather_data(data)
            
        except Exception as e:
            print(f"Weather API error: {e}")
            return self.get_fallback_weather_data(days)
    
    def process_weather_data(self, api_data):
        """Convert WeatherAPI response to irrigation system format"""
        weather_data = []
        
        for day_data in api_data['forecast']['forecastday']:
            day = day_data['day']
            
            processed_day = {
                'date': day_data['date'],
                'temp_max': day['maxtemp_c'],
                'temp_min': day['mintemp_c'],
                'temp_avg': day['avgtemp_c'],
                'humidity': day['avghumidity'],
                'wind_speed': day['maxwind_kph'] / 3.6,  # Convert kph to m/s
                'rainfall': day['totalprecip_mm'],
                'solar_radiation': day.get('uv', 5) * 4,  # Rough conversion
                'weather_condition': day['condition']['text']
            }
            
            weather_data.append(processed_day)
        
        return weather_data
    
    def get_fallback_weather_data(self, days):
        """Fallback weather data when API fails"""
        weather_data = []
        base_date = datetime.now()
        
        for i in range(days):
            date = base_date + timedelta(days=i)
            weather_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'temp_max': 42 + np.random.normal(0, 3),
                'temp_min': 28 + np.random.normal(0, 2),
                'temp_avg': 35 + np.random.normal(0, 2),
                'humidity': 30 + np.random.normal(0, 10),
                'wind_speed': 6 + np.random.normal(0, 0.5),
                'rainfall': max(0, np.random.normal(0, 2)),
                'solar_radiation': 25 + np.random.normal(0, 3),
                'weather_condition': 'Hot and dry'
            })
        
        return weather_data

# Simple ML Predictor fallback
class IrrigationMLPredictor:
    def predict_irrigation(self, data):
        # Simple rule-based prediction
        need_irrigation = data['soil_moisture_percent'] < 50
        irrigation_amount = 20.0 if need_irrigation else 0.0
        
        return {
            'need_irrigation': need_irrigation,
            'irrigation_amount_mm': irrigation_amount,
            'confidence': 75.0,
            'method': 'rule_based_fallback'
        }

class IrrigationCalculator:
    def __init__(self):
        self.weather_api_key = os.getenv("WEATHER_API_KEY")
        if not self.weather_api_key:
            raise ValueError("WEATHER_API_KEY not found in environment variables.")
        self.weather_client = WeatherAPIClient(self.weather_api_key)
        self.ml_predictor = IrrigationMLPredictor()
    
    def extract_numeric_value(self, value, default=0):
        """Helper function to extract numeric values from potentially nested data"""
        if isinstance(value, dict):
            return value.get('amount', default)
        elif isinstance(value, (int, float)):
            return float(value)
        else:
            return default
    
    def get_weather_data(self, location):
        """Fetch weather data using WeatherAPI"""
        if isinstance(location, dict):
            if location.get('address'):
                location_query = location['address']
            elif location.get('latitude') and location.get('longitude'):
                location_query = f"{location['latitude']},{location['longitude']}"
            else:
                location_query = "Phalodi"
        else:
            location_query = str(location)
        
        return self.weather_client.get_weather_data(location_query, days=7)
    
    def calculate_et0_penman_monteith(self, weather_data):
        """Corrected FAO-56 Penman-Monteith equation"""
        et0_values = []
        
        for day in weather_data:
            temp_mean = (day['temp_max'] + day['temp_min']) / 2
            temp_max = day['temp_max']
            temp_min = day['temp_min']
            RH_mean = day['humidity']
            wind_speed = day['wind_speed']
            solar_rad = day.get('solar_radiation', 25)  # MJ/m²/day
            
            # Saturation vapor pressure (kPa)
            es = 0.6108 * np.exp(17.27 * temp_mean / (temp_mean + 237.3))
            
            # Actual vapor pressure (kPa)
            ea = es * RH_mean / 100
            
            # Slope of saturation vapor pressure curve (kPa/°C)
            delta = 4098 * es / (temp_mean + 237.3)**2
            
            # Psychrometric constant (kPa/°C)
            gamma = 0.665  # Simplified for sea level
            
            # FAO-56 Penman-Monteith equation (mm/day)
            numerator = (0.408 * delta * solar_rad + 
                        gamma * 900 / (temp_mean + 273) * wind_speed * (es - ea))
            denominator = delta + gamma * (1 + 0.34 * wind_speed)
            
            et0 = numerator / denominator
            et0_values.append(max(2.0, min(15.0, et0)))  # Realistic bounds
        
        return et0_values

    def calculate_crop_et(self, et0_values, crop_info, growth_stage):
        """Calculate crop evapotranspiration"""
        try:
            crop_data = CROP_DATABASE[crop_info['name']]
            
            # Determine Kc based on growth stage
            stage_mapping = {
                0: crop_data['kc_initial'],
                1: crop_data['kc_development'], 
                2: crop_data['kc_mid'],
                3: crop_data['kc_late']
            }
            
            kc = stage_mapping.get(growth_stage, crop_data['kc_mid'])
            
            # Calculate ETc for each day
            etc_values = [et0 * kc for et0 in et0_values]
            return etc_values
        except:
            # Fallback calculation
            return [et0 * 1.1 for et0 in et0_values]
    
    def calculate_irrigation_schedule(self, user_data):
        """Generate complete irrigation schedule with FIXED logic"""
        try:
            # Extract data
            location = user_data['location']
            soil_type = user_data['soil_type']
            crop_info = user_data['crop_info']
            crop_name = crop_info['name']
            farm_size = user_data['farm_size']
            
            print(f"Processing schedule for: {crop_name} in {soil_type} soil")
            
            # Get weather data
            weather_data = self.get_weather_data(location)
            
            # Calculate ET0
            et0_values = self.calculate_et0_penman_monteith(weather_data)
            
            # Calculate crop ET
            etc_values = self.calculate_crop_et(et0_values, crop_info, crop_info['growth_stage'])
            
            # Get soil properties
            soil_props = SOIL_TYPES[soil_type]
            crop_props = CROP_DATABASE[crop_info['name']]
            
            # Calculate available water capacity
            field_capacity = float(soil_props['field_capacity'])
            wilting_point = float(soil_props['wilting_point'])
            rooting_depth = float(crop_props['rooting_depth'])
            
            awc = (field_capacity - wilting_point) * rooting_depth * 1000  # mm
            # Add validation
            if awc <= 0:
                raise ValueError(f"""
                Invalid AWC calculation for:
                - Soil: {soil_type}
                - Field Capacity: {field_capacity}
                - Wilting Point: {wilting_point}
                - Root Depth: {rooting_depth}m
                AWC must be >0, got {awc}mm
                """)
            
            # FIXED: Proper irrigation thresholds for arid conditions
            crop_adjustment = CROP_DATABASE[crop_name].get('stress_factor', 1.0)
            irrigation_threshold_percent = SOIL_THRESHOLDS[soil_type] * crop_adjustment
            irrigation_threshold_mm = IRRIGATION_TRIGGERS[soil_type]
            
            print(f"""
                === AWC Calculation ===
                Soil Type: {soil_type}
                Field Capacity: {field_capacity} m³/m³
                Wilting Point: {wilting_point} m³/m³
                Root Depth: {rooting_depth}m
                AWC: {awc}mm
                Irrigation Threshold: {irrigation_threshold_mm}mm
                """)

            
            schedule = []
            soil_moisture = awc * 0.5  # Start at 80%
            days_since_irrigation = 0
            # Use proper MAD threshold (from search results)
            MAD_RICE_DRIP = 50  # 30% for drip irrigation system  # Management Allowable Depletion
            
            for i, (weather, etc) in enumerate(zip(weather_data, etc_values)):
                date = weather['date']
                day_of_year = datetime.strptime(date, '%Y-%m-%d').timetuple().tm_yday
                
                # Update soil moisture
                rainfall = self.extract_numeric_value(weather.get('rainfall', 0))
                soil_moisture += rainfall
                soil_moisture -= etc
                soil_moisture = max(0, min(soil_moisture, awc))
                
                # CORRECT depletion calculation (from search results)
                soil_moisture_percent = (soil_moisture / awc) * 100
                depletion_percent = 100 - soil_moisture_percent
    
                irrigation_needed = depletion_percent > MAD_RICE_DRIP

                # Only irrigate when truly needed
                irrigation_amount = 0
                if irrigation_needed:
                    target_moisture = awc * 0.8
                    irrigation_amount = target_moisture - soil_moisture
                    soil_moisture = target_moisture
                # irrigation_amount = 0
                # if irrigation_needed:
                #     # Refill to 80% of field capacity
                #     target_moisture = awc * 0.8
                #     irrigation_amount = max(0, target_moisture - soil_moisture)
                #     soil_moisture = target_moisture  # Apply irrigation
                #     days_since_irrigation = 0
                # else:
                #     days_since_irrigation += 1
                
                # Ensure soil moisture never goes below 0
                soil_moisture = max(0, min(soil_moisture, awc))
                soil_moisture_percent = (soil_moisture / awc) * 100
                
                # Calculate duration and water volume
                irrigation_duration = irrigation_amount / 10 if irrigation_amount > 0 else 0
                farm_area = float(farm_size['area'])
                total_water_liters = irrigation_amount * farm_area * 10 if irrigation_amount > 0 else 0

                # def get_daily_recommendation_fixed(self, irrigation_needed, soil_moisture_percent, rainfall):
                #     """Generate daily irrigation recommendation based on soil conditions"""
                #     if rainfall > 10:
                #         return "No irrigation needed due to sufficient rainfall"
                #     elif irrigation_needed:
                #         return f"🚨 IRRIGATION REQUIRED - {soil_moisture_percent:.0f}% soil moisture"
                #     elif soil_moisture_percent < 40:
                #         return "⚠️ Soil moisture decreasing - prepare for irrigation soon"
                #     else:
                #         return "✅ Soil moisture adequate - monitor daily"

                # Generate proper recommendations
                recommendation = self.get_recommendation_fixed(
                    irrigation_needed, depletion_percent, rainfall
                )

                
                schedule.append({
                    'date': date,
                    'day_name': datetime.strptime(date, '%Y-%m-%d').strftime('%A'),
                    'weather': {
                        'temp_max': round(float(weather['temp_max']), 1),
                        'temp_min': round(float(weather['temp_min']), 1),
                        'humidity': round(float(weather.get('humidity', 30)), 1),
                        'rainfall': round(rainfall, 1),
                        'wind_speed': round(float(weather.get('wind_speed', 5)), 1)
                    },
                    'et0': round(et0_values[i], 2),
                    'etc': round(etc, 2),
                    'soil_moisture_mm': round(soil_moisture, 1),
                    'soil_moisture_percent': round(soil_moisture_percent, 1),
                    'irrigation_needed': bool(irrigation_needed),
                    'irrigation_amount_mm': round(irrigation_amount, 1),
                    'irrigation_duration_hours': round(irrigation_duration, 1),
                    'best_irrigation_time': "06:00-08:00",
                    'total_water_liters': round(total_water_liters, 0),
                    'recommendation': recommendation,
                    'ml_confidence': 75.0,
                    'prediction_method': 'fao56_method'
                })
            
            print(f"Generated schedule with {len(schedule)} days")
            return schedule
            
        except Exception as e:
            print(f"Error in calculate_irrigation_schedule: {str(e)}")
            import traceback
            traceback.print_exc()
            raise e
    
    def get_recommendation_fixed(self, irrigation_needed, depletion_percent, rainfall):
        if rainfall > 10:
            return "No irrigation needed due to sufficient rainfall"
        elif irrigation_needed:
            return f"🚨 IRRIGATION REQUIRED - {depletion_percent:.0f}% soil depletion"
        elif depletion_percent > 20:
            return "⚠️ Soil moisture decreasing - prepare for irrigation soon"
        else:
            return "✅ Soil moisture adequate - monitor daily"

    
    def get_schedule_summary(self, schedule):
        """Generate summary statistics"""
        try:
            total_irrigation_days = sum(1 for day in schedule if day['irrigation_needed'])
            total_water_mm = sum(day['irrigation_amount_mm'] for day in schedule)
            total_water_liters = sum(day['total_water_liters'] for day in schedule)
            avg_daily_etc = np.mean([day['etc'] for day in schedule])
            
            return {
                'total_irrigation_days': total_irrigation_days,
                'total_water_mm': round(total_water_mm, 1),
                'total_water_liters': round(total_water_liters, 0),
                'avg_daily_etc': round(avg_daily_etc, 2),
                'irrigation_frequency': f"{total_irrigation_days} days out of 7",
                'water_efficiency': "Optimized for arid conditions"
            }
        except Exception as e:
            print(f"Error in get_schedule_summary: {str(e)}")
            return {
                'total_irrigation_days': 0,
                'total_water_mm': 0,
                'total_water_liters': 0,
                'avg_daily_etc': 0,
                'irrigation_frequency': "0 days out of 7",
                'water_efficiency': "Error calculating summary"
            }