import tensorflow as tf
import os

APP_DIR = r"d:\Antigravity\AgriTech\agritech-app"
MODEL_PATH = os.path.join(APP_DIR, r"plant_disease_model.h5")

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    with open("model_info.txt", "w") as f:
        f.write(f"Input Shape: {model.input_shape}\n\n")
        for layer in model.layers:
            f.write(f"{layer.name} ({layer.__class__.__name__}): {layer.output_shape}\n")
    print("Success")
except Exception as e:
    with open("model_info.txt", "w") as f:
        f.write(f"Error: {str(e)}")
    print("Error")
