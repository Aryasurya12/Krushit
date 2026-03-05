"""Quick end-to-end test of the /predict endpoint."""
import requests
from PIL import Image
import io
import numpy as np

# Create a test image (128x128 green leaf-like image)
img_array = np.random.randint(50, 150, (128, 128, 3), dtype=np.uint8)
img_array[:, :, 1] = np.random.randint(100, 200, (128, 128))  # Make it greener
img = Image.fromarray(img_array)
buf = io.BytesIO()
img.save(buf, format="JPEG")
buf.seek(0)

print("Testing /predict endpoint...")
try:
    resp = requests.post(
        "http://127.0.0.1:8001/predict",
        files={"file": ("test.jpg", buf, "image/jpeg")},
        params={"language": "en"},
        timeout=15
    )
    print(f"Status: {resp.status_code}")
    data = resp.json()
    print("Response JSON:")
    for k, v in data.items():
        print(f"  {k}: {v}")
    
    # Verify all 7 fields present
    required = ["disease", "confidence", "severity", "cause", "treatment", "prevention", "fertilizer"]
    missing = [f for f in required if f not in data]
    if missing:
        print(f"\n❌ MISSING FIELDS: {missing}")
    else:
        print(f"\n✅ All 7 fields present!")
        print(f"✅ Disease: {data['disease']}")
        print(f"✅ Confidence: {data['confidence']}%")
        print(f"✅ Severity: {data['severity']}")
except Exception as e:
    print(f"Error: {e}")
