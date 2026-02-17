import tensorflow as tf
import os

model_path = "backend/models/model.h5"
if not os.path.exists(model_path):
    print(f"Model not found at {model_path}")
else:
    try:
        model = tf.keras.models.load_model(model_path)
        print("Model Summary:")
        model.summary()
        print("\nInput Shape:", model.input_shape)
        
        # Check specific layers if needed
        for layer in model.layers:
            if 'dense' in layer.name.lower():
                print(f"Layer {layer.name} input shape: {layer.input_shape}")
    except Exception as e:
        print(f"Error: {e}")
