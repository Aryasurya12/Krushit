from PIL import Image, ImageOps
import numpy as np
import io
import logging

logger = logging.getLogger(__name__)

def preprocess_image(image_bytes, target_size=(224, 224)):
    """
    Enhanced preprocessing for model prediction.
    - Handles EXIF orientation (crucial for phone photos)
    - Aspect-aware center cropping
    - High-quality Lanczos resampling
    - Standard normalization
    """
    try:
        # Load image
        img = Image.open(io.BytesIO(image_bytes))
        
        # 1. Fix EXIF orientation
        img = ImageOps.exif_transpose(img)
        
        # 2. Ensure RGB format
        if img.mode != 'RGB':
            img = img.convert('RGB')
            
        # 3. Aspect-aware resize and center crop
        # Using ImageOps.fit ensures the image isn't squashed
        img = ImageOps.fit(img, target_size, Image.Resampling.LANCZOS)
        
        # 4. Convert to numpy array
        img_array = np.array(img).astype('float32')
        
        # 5. Normalization (0-1)
        # Most custom CNNs in Keras are trained with 1./255 rescaling
        img_array /= 255.0
        
        # 6. Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        logger.info(f"Image preprocessed to shape: {img_array.shape}, mean: {np.mean(img_array):.4f}")
        return img_array
    except Exception as e:
        logger.error(f"Preprocessing error: {e}")
        raise ValueError(f"Error processing image: {str(e)}")
