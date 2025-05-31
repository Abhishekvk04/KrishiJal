import requests
import json

def test_backend():
    base_url = "http://localhost:5000"
    
    # Test login
    login_data = {"name": "Test User", "phone": "1234567890"}
    response = requests.post(f"{base_url}/api/login", json=login_data)
    print(f"Login test: {response.status_code}")
    
    # Test soil types
    response = requests.get(f"{base_url}/api/soil-types")
    print(f"Soil types test: {response.status_code}")
    
    # Test schedule generation
    schedule_data = {
        "personal_info": {"farmer_name": "Test", "experience": "intermediate"},
        "location": {"address": "Test", "latitude": "28.6", "longitude": "77.2", "climate_zone": "subtropical"},
        "soil_type": "Loam",
        "crop_info": {"name": "Tomato", "growth_stage": 2, "planting_date": "2025-04-01"},
        "farm_size": {"area": "2", "unit": "hectares", "irrigation_method": "drip"}
    }
    
    response = requests.post(f"{base_url}/api/generate-schedule", json=schedule_data)
    print(f"Schedule generation test: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Schedule generated with {len(data['schedule'])} days")
        print(f"ML confidence: {data['schedule'][0].get('ml_confidence', 'N/A')}")

if __name__ == "__main__":
    test_backend()
