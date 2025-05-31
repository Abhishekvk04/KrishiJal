import requests
import json
from datetime import datetime, timedelta

class WeatherAPIClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "http://api.weatherapi.com/v1"
    
    def get_weather_data(self, location, days=7):
        """
        Fetch weather data for irrigation scheduling
        location: can be city name, coordinates, or IP address
        days: forecast days (1-10 for free plan, 1-300 for paid)
        """
        try:
            # Get forecast data
            forecast_url = f"{self.base_url}/forecast.json"
            params = {
                'key': self.api_key,
                'q': location,
                'days': min(days, 7),  # Free plan limit
                'aqi': 'no',
                'alerts': 'no'
            }
            
            response = requests.get(forecast_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            return self.process_weather_data(data)
            
        except requests.exceptions.RequestException as e:
            print(f"Weather API error: {e}")
            return self.get_fallback_weather_data(days)
        except Exception as e:
            print(f"Weather processing error: {e}")
            return self.get_fallback_weather_data(days)
    
    def process_weather_data(self, api_data):
        """Convert WeatherAPI response to irrigation system format"""
        weather_data = []
        
        # Process current day
        current = api_data['current']
        location_info = api_data['location']
        
        # Process forecast days
        for day_data in api_data['forecast']['forecastday']:
            day = day_data['day']
            astro = day_data['astro']
            
            # Calculate solar radiation from UV index and daylight hours
            uv_index = day.get('uv', 5)
            solar_radiation = self.estimate_solar_radiation(uv_index, astro)
            
            # Extract relevant data for irrigation calculations
            processed_day = {
                'date': day_data['date'],
                'temp_max': day['maxtemp_c'],
                'temp_min': day['mintemp_c'],
                'temp_avg': day['avgtemp_c'],
                'humidity': day['avghumidity'],
                'wind_speed': day['maxwind_kph'] / 3.6,  # Convert kph to m/s
                'rainfall': day['totalprecip_mm'],
                'solar_radiation': solar_radiation,
                'uv_index': day.get('uv', 0),
                'cloud_cover': self.get_cloud_cover_from_hours(day_data.get('hour', [])),
                'rain_probability': day.get('daily_chance_of_rain', 0),
                'weather_condition': day['condition']['text'],
                'sunrise': astro['sunrise'],
                'sunset': astro['sunset'],
                'daylight_hours': self.calculate_daylight_hours(astro['sunrise'], astro['sunset'])
            }
            
            weather_data.append(processed_day)
        
        return weather_data
    
    def estimate_solar_radiation(self, uv_index, astro):
        """Estimate solar radiation from UV index and daylight hours"""
        # Rough conversion: UV index to solar radiation (MJ/m²/day)
        # This is an approximation - for precise calculations, use dedicated solar APIs
        daylight_hours = self.calculate_daylight_hours(astro['sunrise'], astro['sunset'])
        
        # UV index to solar radiation conversion (approximate)
        if uv_index <= 2:
            base_radiation = 15
        elif uv_index <= 5:
            base_radiation = 20
        elif uv_index <= 7:
            base_radiation = 25
        elif uv_index <= 10:
            base_radiation = 30
        else:
            base_radiation = 35
        
        # Adjust for daylight hours
        radiation = base_radiation * (daylight_hours / 12)
        return max(10, min(40, radiation))  # Reasonable bounds
    
    def calculate_daylight_hours(self, sunrise, sunset):
        """Calculate daylight hours from sunrise/sunset times"""
        try:
            sunrise_time = datetime.strptime(sunrise, "%I:%M %p")
            sunset_time = datetime.strptime(sunset, "%I:%M %p")
            
            # Handle sunset next day
            if sunset_time < sunrise_time:
                sunset_time += timedelta(days=1)
            
            daylight_duration = sunset_time - sunrise_time
            return daylight_duration.total_seconds() / 3600
        except:
            return 12  # Default fallback
    
    def get_cloud_cover_from_hours(self, hourly_data):
        """Calculate average cloud cover from hourly data"""
        if not hourly_data:
            return 50  # Default
        
        cloud_values = [hour.get('cloud', 50) for hour in hourly_data]
        return sum(cloud_values) / len(cloud_values)
    
    def get_fallback_weather_data(self, days):
        """Fallback weather data when API fails"""
        import numpy as np
        
        weather_data = []
        base_date = datetime.now()
        
        for i in range(days):
            date = base_date + timedelta(days=i)
            weather_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'temp_max': 32 + np.random.normal(0, 3),
                'temp_min': 18 + np.random.normal(0, 2),
                'temp_avg': 25 + np.random.normal(0, 2),
                'humidity': 65 + np.random.normal(0, 10),
                'wind_speed': 2.5 + np.random.normal(0, 0.5),
                'rainfall': max(0, np.random.normal(0, 5)),
                'solar_radiation': 25 + np.random.normal(0, 3),
                'uv_index': 6,
                'cloud_cover': 50,
                'rain_probability': 30,
                'weather_condition': 'Partly cloudy',
                'sunrise': '06:00 AM',
                'sunset': '06:00 PM',
                'daylight_hours': 12
            })
        
        return weather_data
