import tensorflow as tf
import os
import json

MODEL_PATH = r"d:\Antigravity\AgriTech\agritech-app\plant_disease_model.h5"

try:
    # Use h5py to look deep into the file metadata if keras doesn't show it
    import h5py
    with h5py.File(MODEL_PATH, 'r') as f:
        # Keras models usually save class names in 'model_config' or attributes
        if 'model_config' in f.attrs:
            config = json.loads(f.attrs['model_config'])
            print("Model Config found.")
        
        # Check for any 'class_names' dataset
        def find_classes(name, obj):
            if 'class' in name.lower() or 'label' in name.lower():
                print(f"Potential dataset: {name}")
        f.visititems(find_classes)

    # Also check via Keras
    model = tf.keras.models.load_model(MODEL_PATH)
    if hasattr(model, 'class_names'):
        print(f"Found model.class_names: {model.class_names}")
    
except Exception as e:
    print(f"Error: {e}")
