import tensorflow as tf
import json

model = tf.keras.models.load_model(r"d:\New folder\AgriTech\agritech-app\plant_disease_model.h5")
print("=== MODEL SUMMARY ===")
model.summary()
print("\n=== INPUT SHAPE ===", model.input_shape)
print("=== OUTPUT SHAPE ===", model.output_shape)

with open(r"d:\New folder\AgriTech\agritech-app\class_names.json") as f:
    class_names = json.load(f)
print("\n=== CLASS NAMES ===", class_names)
print("Total classes:", len(class_names))
