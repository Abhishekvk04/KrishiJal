import numpy as np
import cv2
from PIL import Image
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import json
import os

class SoilImageClassifier:
    def __init__(self):
        self.model = None
        self.labels = None
        self.img_size = (224, 224)
        self.load_model()
    
    def load_model(self):
        """Load the trained soil classification model"""
        try:
            model_path = 'ml_models/soil_classifier.h5'
            labels_path = 'ml_models/soil_labels.json'
            
            if os.path.exists(model_path) and os.path.exists(labels_path):
                self.model = load_model(model_path)
                with open(labels_path, 'r') as f:
                    self.labels = json.load(f)
                print("Soil classification model loaded successfully")
            else:
                print("Soil classification model not found. Using fallback.")
                self.create_dummy_model()
        except Exception as e:
            print(f"Error loading soil model: {e}")
            self.create_dummy_model()
    
    def create_dummy_model(self):
        """Create a dummy model for testing purposes"""
        self.labels = {
            0: "Sandy",
            1: "Clay", 
            2: "Loam",
            3: "Sandy Loam"
        }
    
    def preprocess_image(self, image_path):
        """Preprocess image for model prediction"""
        try:
            # Load and resize image
            img = Image.open(image_path)
            img = img.convert('RGB')
            img = img.resize(self.img_size)
            
            # Convert to array and normalize
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = img_array / 255.0
            
            return img_array
        except Exception as e:
            print(f"Error preprocessing image: {e}")
            return None
    
    def predict_soil_type(self, image_path):
        """Predict soil type from image"""
        try:
            if self.model is None:
                return self.fallback_prediction(image_path)
            
            # Preprocess image
            processed_image = self.preprocess_image(image_path)
            if processed_image is None:
                return self.fallback_prediction(image_path)
            
            # Make prediction
            predictions = self.model.predict(processed_image)
            predicted_class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class_idx]) * 100
            
            predicted_soil_type = self.labels[predicted_class_idx]
            
            # Get alternative predictions
            alternatives = []
            sorted_indices = np.argsort(predictions[0])[::-1]
            for i, idx in enumerate(sorted_indices[1:3]):  # Top 2 alternatives
                alternatives.append({
                    'soil_type': self.labels[idx],
                    'confidence': round(float(predictions[0][idx]) * 100, 1)
                })
            
            return {
                'predicted_class': predicted_soil_type,
                'confidence': round(confidence, 1),
                'alternatives': alternatives,
                'method': 'cnn_prediction'
            }
            
        except Exception as e:
            print(f"Prediction error: {e}")
            return self.fallback_prediction(image_path)
    
    def fallback_prediction(self, image_path):
        """Fallback prediction using image analysis"""
        try:
            # Simple color-based classification as fallback
            img = cv2.imread(image_path)
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Calculate mean color values
            mean_color = np.mean(img_rgb, axis=(0, 1))
            brightness = np.mean(mean_color)
            
            # Simple heuristic classification
            if brightness > 140:
                predicted_type = "Sandy"
                confidence = 70.0
            elif brightness < 90:
                predicted_type = "Clay"
                confidence = 65.0
            elif mean_color[0] > mean_color[2]:  # More red than blue
                predicted_type = "Sandy Loam"
                confidence = 60.0
            else:
                predicted_type = "Loam"
                confidence = 68.0
            
            return {
                'predicted_class': predicted_type,
                'confidence': confidence,
                'alternatives': [
                    {'soil_type': 'Loam', 'confidence': 45.0},
                    {'soil_type': 'Sandy', 'confidence': 35.0}
                ],
                'method': 'color_analysis_fallback'
            }
            
        except Exception as e:
            print(f"Fallback prediction error: {e}")
            return {
                'predicted_class': 'Loam',
                'confidence': 50.0,
                'alternatives': [],
                'method': 'default_fallback'
            }

    def extract_soil_features(self, image_path):
        """Extract soil texture features from image"""
        try:
            img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
            
            # Calculate texture features
            # Variance (texture roughness)
            variance = np.var(img)
            
            # Local Binary Pattern approximation
            mean_intensity = np.mean(img)
            
            # Edge density
            edges = cv2.Canny(img, 50, 150)
            edge_density = np.sum(edges > 0) / (img.shape[0] * img.shape[1])
            
            return {
                'texture_variance': float(variance),
                'mean_intensity': float(mean_intensity),
                'edge_density': float(edge_density)
            }
        except:
            return None
