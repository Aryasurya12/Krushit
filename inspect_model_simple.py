import tensorflow as tf
import os

model_path = "backend/models/model.h5"
try:
    model = tf.keras.models.load_model(model_path, compile=False)
    print(f"INPUT_SHAPE: {model.input_shape}")
    for i, layer in enumerate(model.layers):
        print(f"LAYER_{i}: {layer.name} | {layer.__class__.__name__} | Input: {layer.input_shape} | Output: {layer.output_shape}")
        if i > 10: break # Just the first few
except Exception as e:
    print(f"ERROR: {e}")
