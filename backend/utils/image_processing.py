from PIL import Image
import numpy as np
import io

def preprocess_image(image_bytes, target_size=(224, 224)):
    """
    Preprocess the uploaded image for model prediction.
    - Resize to target size
    - Convert to RGB
    - Normalize pixels (0-1)
    - Expand dimensions for batch
    """
    try:
        # Load image from bytes
        img = Image.open(io.BytesIO(image_bytes))
        
        # Ensure RGB format
        if img.mode != 'RGB':
            img = img.convert('RGB')
            
        # Resize image
        img = img.resize(target_size)
        
        # Convert to numpy array
        img_array = np.array(img)
        
        # Normalize to [0, 1]
        img_array = img_array.astype('float32') / 255.0
        
        # Add batch dimension (1, 224, 224, 3)
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        raise ValueError(f"Error processing image: {str(e)}")
