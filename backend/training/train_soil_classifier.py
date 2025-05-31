import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.optimizers import Adam
import numpy as np
import json
import os

def create_soil_classifier_model(num_classes=4, input_shape=(224, 224, 3)):
    """Create CNN model for soil classification"""
    
    # Use MobileNetV2 as base model (transfer learning)
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=input_shape
    )
    
    # Freeze base model layers
    base_model.trainable = False
    
    # Add custom classification layers
    model = Sequential([
        base_model,
        tf.keras.layers.GlobalAveragePooling2D(),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(num_classes, activation='softmax')
    ])
    
    return model

def create_synthetic_soil_dataset():
    """Create synthetic soil dataset for training"""
    print("Creating synthetic soil dataset...")
    
    # Create directories
    dataset_dir = 'soil_dataset'
    soil_types = ['sandy', 'clay', 'loam', 'sandy_loam']
    
    for soil_type in soil_types:
        os.makedirs(f'{dataset_dir}/{soil_type}', exist_ok=True)
    
    # Generate synthetic images
    for soil_type in soil_types:
        for i in range(100):  # 100 images per class
            # Create synthetic soil texture
            if soil_type == 'sandy':
                # Light colored, granular texture
                img = np.random.randint(180, 255, (224, 224, 3))
                # Add some texture
                noise = np.random.randint(-30, 30, (224, 224, 3))
                img = np.clip(img + noise, 0, 255)
            
            elif soil_type == 'clay':
                # Dark colored, smooth texture
                img = np.random.randint(60, 120, (224, 224, 3))
                # Less texture variation
                noise = np.random.randint(-10, 10, (224, 224, 3))
                img = np.clip(img + noise, 0, 255)
            
            elif soil_type == 'loam':
                # Medium colored, balanced texture
                img = np.random.randint(100, 180, (224, 224, 3))
                noise = np.random.randint(-20, 20, (224, 224, 3))
                img = np.clip(img + noise, 0, 255)
            
            else:  # sandy_loam
                # Light-medium colored
                img = np.random.randint(140, 220, (224, 224, 3))
                noise = np.random.randint(-25, 25, (224, 224, 3))
                img = np.clip(img + noise, 0, 255)
            
            # Save image
            img_path = f'{dataset_dir}/{soil_type}/soil_{i:03d}.png'
            tf.keras.utils.save_img(img_path, img.astype(np.uint8))
    
    print(f"Created synthetic dataset with {len(soil_types) * 100} images")

def train_soil_classifier():
    """Train the soil classification model"""
    
    # Create synthetic dataset
    create_synthetic_soil_dataset()
    
    # Data generators
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        validation_split=0.2
    )
    
    # Load training data
    train_generator = train_datagen.flow_from_directory(
        'soil_dataset',
        target_size=(224, 224),
        batch_size=16,
        class_mode='categorical',
        subset='training'
    )
    
    validation_generator = train_datagen.flow_from_directory(
        'soil_dataset',
        target_size=(224, 224),
        batch_size=16,
        class_mode='categorical',
        subset='validation'
    )
    
    # Create model
    model = create_soil_classifier_model(num_classes=4)
    
    # Compile model
    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Train model
    print("Training soil classification model...")
    history = model.fit(
        train_generator,
        epochs=10,
        validation_data=validation_generator,
        verbose=1
    )
    
    # Save model
    os.makedirs('../ml_models', exist_ok=True)
    model.save('../ml_models/soil_classifier.h5')
    
    # Save class labels
    class_labels = {i: class_name for i, class_name in enumerate(train_generator.class_indices.keys())}
    with open('../ml_models/soil_labels.json', 'w') as f:
        json.dump(class_labels, f)
    
    print("Model training completed!")
    print(f"Final accuracy: {history.history['accuracy'][-1]:.3f}")
    print(f"Validation accuracy: {history.history['val_accuracy'][-1]:.3f}")
    
    return model

if __name__ == "__main__":
    train_soil_classifier()
