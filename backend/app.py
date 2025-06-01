from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
from datetime import datetime, timedelta  # ADD THIS IMPORT

# Existing imports
from models.irrigation_calculator import IrrigationCalculator
from models.data_models import *

# New import
from utils.soil_image_processor import SoilImageClassifier

# Add these at the top
from database import db, Report, RetentionSetting
from apscheduler.schedulers.background import BackgroundScheduler
import uuid

import traceback
from utils.json_encoder import NpEncoder


app = Flask(__name__)
CORS(app, origins=["*"])

app.json_encoder = NpEncoder

# Add after app initialization
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///reports.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Initialize database
with app.app_context():
    db.create_all()
    if not RetentionSetting.query.first():
        db.session.add(RetentionSetting(retention_days=30))
        db.session.commit()
    print("Database initialized successfully")

# Scheduler setup
scheduler = BackgroundScheduler(daemon=True)
scheduler.start()

def cleanup_reports():
    with app.app_context():
        retention_setting = RetentionSetting.query.first()
        cutoff = datetime.utcnow() - timedelta(days=retention_setting.retention_days)
        
        # Delete expired and old reports
        Report.query.filter(
            (Report.expires_at < datetime.utcnow()) | 
            (Report.created_at < cutoff)
        ).delete()
        
        db.session.commit()

scheduler.add_job(cleanup_reports, 'interval', hours=12)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create upload directory
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize calculators
calculator = IrrigationCalculator()
soil_classifier = SoilImageClassifier()

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Existing endpoints
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    name = data.get('name')
    phone = data.get('phone')
    
    if not name or not phone:
        return jsonify({'error': 'Name and phone are required'}), 400
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'user': {'name': name, 'phone': phone}
    })

@app.route('/api/soil-types', methods=['GET'])
def get_soil_types():
    return jsonify(SOIL_TYPES)

@app.route('/api/crops', methods=['GET'])
def get_crops():
    return jsonify(CROP_DATABASE)

@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        phone = request.args.get('phone')
        if not phone:
            return jsonify({'error': 'Phone number required'}), 400
        
        reports = Report.query.filter_by(phone_number=phone)\
                   .order_by(Report.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'reports': [{
                'id': r.id,
                'created_at': r.created_at.isoformat(),
                'summary': r.report_data.get('summary', {})
            } for r in reports]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/history/<report_id>', methods=['DELETE'])
def delete_report(report_id):
    Report.query.filter_by(id=report_id).delete()
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/retention', methods=['GET', 'PUT'])
def retention_settings():
    setting = RetentionSetting.query.first()
    if request.method == 'PUT':
        days = request.json.get('days', 30)
        setting.retention_days = days
        db.session.commit()
    return jsonify({'retention_days': setting.retention_days})

# NEW: Soil image classification endpoint
@app.route('/api/classify-soil', methods=['POST'])
def classify_soil():
    try:
        if 'soil_image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['soil_image']
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload an image.'}), 400
        
        # Save temporary file
        filename = secure_filename(file.filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(temp_path)
        
        # Classify soil
        result = soil_classifier.predict_soil_type(temp_path)
        
        # Get soil properties
        soil_properties = SOIL_TYPES.get(result['predicted_class'], SOIL_TYPES['Loam'])
        
        # Extract additional features
        features = soil_classifier.extract_soil_features(temp_path)
        
        # Clean up temporary file
        try:
            os.remove(temp_path)
        except:
            pass  # Don't fail if cleanup fails
        
        return jsonify({
            'success': True,
            'predicted_soil_type': result['predicted_class'],
            'confidence': result['confidence'],
            'alternatives': result['alternatives'],
            'method': result['method'],
            'soil_properties': soil_properties,
            'extracted_features': features
        })
        
    except Exception as e:
        # Clean up on error
        try:
            if 'temp_path' in locals():
                os.remove(temp_path)
        except:
            pass
        return jsonify({'error': f'Classification failed: {str(e)}'}), 500

# NEW: Manual soil type selection (fallback)
@app.route('/api/select-soil-manual', methods=['POST'])
def select_soil_manual():
    try:
        data = request.get_json()
        soil_type = data.get('soil_type')
        
        if soil_type not in SOIL_TYPES:
            return jsonify({'error': 'Invalid soil type'}), 400
        
        return jsonify({
            'success': True,
            'selected_soil_type': soil_type,
            'soil_properties': SOIL_TYPES[soil_type],
            'method': 'manual_selection'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/weather/<location>', methods=['GET'])
def get_weather(location):
    try:
        weather_data = calculator.get_weather_data(location)
        return jsonify(weather_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-schedule', methods=['POST'])
def generate_schedule():
    try:
        data = request.get_json()
        
        # Generate irrigation schedule
        schedule = calculator.calculate_irrigation_schedule(data)
        summary = calculator.get_schedule_summary(schedule)
        
        # Save report with complete user data
        report_id = str(uuid.uuid4())
        new_report = Report(
            id=report_id,
            phone_number=data.get('personal_info', {}).get('phone', 'unknown'),
            report_data={
                'schedule': schedule,
                'summary': {
                    **summary,
                    'schedule': schedule,  # Include schedule in summary
                    'user_data': {
                        'crop_info': data.get('crop_info', {}),
                        'soil_type': data.get('soil_type', ''),
                        'location': data.get('location', {}),
                        'farm_size': data.get('farm_size', {}),
                        'personal_info': data.get('personal_info', {})
                    }
                }
            },
            created_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(days=30)
        )
        
        db.session.add(new_report)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'report_id': report_id,
            'schedule': schedule,
            'summary': summary
        })
        
    except Exception as e:
        print(f"Error in generate_schedule: {str(e)}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/test-schedule', methods=['GET'])
def test_schedule():
    try:
        # Test data with full required structure
        test_data = {
            'personal_info': {
                'phone': 'test',
                'farmer_name': 'Test Farmer',
                'experience': 'intermediate'
            },
            'location': {
                'address': 'Phalodi',
                'latitude': 27.1311,
                'longitude': 72.3643,
                'climate_zone': 'arid'
            },
            'soil_type': 'Sandy Loam',
            'crop_info': {
                'name': 'Rice',
                'growth_stage': 1,
                'planting_date': '2023-01-01'
            },
            'farm_size': {
                'area': '10',
                'unit': 'hectares',
                'irrigation_method': 'drip'
            }
        }
        
        print("\n=== Test Data ===")
        print(json.dumps(test_data, indent=2))
        
        schedule = calculator.calculate_irrigation_schedule(test_data)
        summary = calculator.get_schedule_summary(schedule)
        
        print("\n=== Generated Schedule ===")
        print(f"Length: {len(schedule)} days")
        print(f"First day: {schedule[0] if schedule else 'No schedule'}")
        
        return jsonify({
            'success': True,
            'schedule_length': len(schedule),
            'summary': summary,
            'first_day': schedule[0] if schedule else None
        })
        
    except Exception as e:
        error_trace = traceback.format_exc()
        print(f"\n=== Error Details ===\n{error_trace}")
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': error_trace
        }), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
