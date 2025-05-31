from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import json
from utils.json_encoder import NpEncoder

db = SQLAlchemy()

class Report(db.Model):
    __tablename__ = 'report'
    
    id = db.Column(db.String(36), primary_key=True)
    phone_number = db.Column(db.String(20), nullable=False)
    report_data = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime)

    def __repr__(self):
        return f'<Report {self.id} for {self.phone_number}>'
    
    def to_dict(self):
        """Convert model to dictionary with proper type handling"""
        return {
            'id': self.id,
            'phone_number': self.phone_number,
            'report_data': json.loads(
                json.dumps(self.report_data, cls=NpEncoder)
            ),
            'created_at': self.created_at.isoformat(),
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }

class RetentionSetting(db.Model):
    __tablename__ = 'retention_setting'
    
    id = db.Column(db.Integer, primary_key=True)
    retention_days = db.Column(db.Integer, default=30)

    def __repr__(self):
        return f'<RetentionSetting {self.retention_days} days>'

def init_app(app):
    """Initialize database with Flask app"""
    db.init_app(app)
    with app.app_context():
        db.create_all()
        if not RetentionSetting.query.first():
            default_setting = RetentionSetting(retention_days=30)
            db.session.add(default_setting)
            db.session.commit()
