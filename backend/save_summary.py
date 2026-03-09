import tensorflow as tf
import os

MODEL_PATH = r"d:\Antigravity\AgriTech\agritech-app\plant_disease_model.h5"

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    with open("model_summary.txt", "w") as f:
        model.summary(print_fn=lambda x: f.write(x + "\n"))
    print("Success")
except Exception as e:
    with open("model_summary.txt", "w") as f:
        f.write(f"Error: {str(e)}")
    print("Error")
