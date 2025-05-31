import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_absolute_error, r2_score
import joblib
import os

def train_irrigation_models():
    """Train ML models for irrigation prediction"""
    
    # Load training data
    df = pd.read_csv('training_data.csv')
    print(f"Loaded {len(df)} training samples")
    
    # Prepare features
    feature_columns = [
        'soil_moisture_percent', 'temp_max', 'temp_min', 'temp_avg',
        'humidity', 'wind_speed', 'days_since_irrigation', 
        'growth_stage', 'soil_type_encoded', 'day_of_year'
    ]
    
    X = df[feature_columns]
    y_classification = df['need_irrigation']
    y_regression = df['irrigation_amount_mm']
    
    # Split data - IMPORTANT: Use same random_state and indices for both targets
    X_train, X_test, y_class_train, y_class_test = train_test_split(
        X, y_classification, test_size=0.2, random_state=42, stratify=y_classification
    )
    
    # Use the SAME indices for regression target
    y_reg_train = y_regression.loc[y_class_train.index]
    y_reg_test = y_regression.loc[y_class_test.index]
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train classification model (irrigation need)
    print("Training irrigation need classifier...")
    classifier = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        class_weight='balanced'
    )
    classifier.fit(X_train_scaled, y_class_train)
    
    # Train regression model (irrigation amount)
    print("Training irrigation amount regressor...")
    regressor = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42
    )
    
    # Only train on samples where irrigation is needed
    irrigation_mask = y_class_train == True
    X_train_irr = X_train_scaled[irrigation_mask]
    y_reg_train_irr = y_reg_train[irrigation_mask]
    
    if len(X_train_irr) > 0:
        regressor.fit(X_train_irr, y_reg_train_irr)
        print(f"Trained regressor on {len(X_train_irr)} irrigation samples")
    else:
        print("No irrigation samples found for training regressor!")
        return
    
    # Evaluate models
    print("\n=== Classification Results ===")
    y_class_pred = classifier.predict(X_test_scaled)
    print(classification_report(y_class_test, y_class_pred))
    
    print("\n=== Regression Results ===")
    irrigation_test_mask = y_class_test == True
    X_test_irr = X_test_scaled[irrigation_test_mask]
    y_reg_test_irr = y_reg_test[irrigation_test_mask]
    
    if len(X_test_irr) > 0:
        y_reg_pred = regressor.predict(X_test_irr)
        mae = mean_absolute_error(y_reg_test_irr, y_reg_pred)
        r2 = r2_score(y_reg_test_irr, y_reg_pred)
        print(f"Mean Absolute Error: {mae:.2f} mm")
        print(f"R² Score: {r2:.3f}")
        print(f"Evaluated on {len(X_test_irr)} irrigation test samples")
    else:
        print("No irrigation samples in test set for regression evaluation")
    
    # Feature importance
    print("\n=== Feature Importance (Classification) ===")
    feature_importance = pd.DataFrame({
        'feature': feature_columns,
        'importance': classifier.feature_importances_
    }).sort_values('importance', ascending=False)
    print(feature_importance)
    
    # Save models
    os.makedirs('../ml_models', exist_ok=True)
    
    joblib.dump(classifier, '../ml_models/irrigation_classifier.pkl')
    joblib.dump(regressor, '../ml_models/irrigation_regressor.pkl')
    joblib.dump(scaler, '../ml_models/feature_scaler.pkl')
    
    print("\nModels saved successfully!")
    print("- irrigation_classifier.pkl")
    print("- irrigation_regressor.pkl") 
    print("- feature_scaler.pkl")
    
    # Print some statistics
    print(f"\nDataset Statistics:")
    print(f"Total samples: {len(df)}")
    print(f"Irrigation needed: {y_classification.sum()} ({y_classification.mean()*100:.1f}%)")
    print(f"Training samples: {len(X_train)}")
    print(f"Test samples: {len(X_test)}")

if __name__ == "__main__":
    train_irrigation_models()
