import tensorflow as tf
import os

APP_DIR = r"d:\Antigravity\AgriTech\agritech-app"
MODEL_PATH = os.path.join(APP_DIR, "plant_disease_model.h5")

try:
    if not os.path.exists(MODEL_PATH):
        print(f"Model file not found at {MODEL_PATH}")
    else:
        model = tf.keras.models.load_model(MODEL_PATH)
        print("\n=== Model Summary ===")
        model.summary()
        print("\n=== Input Shape ===")
        print(model.input_shape)
        
        # Check first dense layer after flatten
        for layer in model.layers:
            if isinstance(layer, tf.keras.layers.Dense):
                print(f"\nFirst Dense Layer: {layer.name}")
                print(f"Weights shape: {layer.get_weights()[0].shape}")
                break
except Exception as e:
    print(f"Error inspecting model: {e}")
