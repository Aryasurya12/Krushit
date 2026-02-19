import os
import json
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agritech-ml-api")

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    chat_ai = genai.GenerativeModel('models/gemini-2.5-flash')
else:
    chat_ai = None

class ChatRequest(BaseModel):
    message: str
    history: list = []
    language: str = "en"

# Internal imports
from models.translations import get_local_translation
from utils.image_processing import preprocess_image

# ──────────────────────────────────────────────────────────────────────────────
# 1. Model + class_names paths
#    The real model and class_names live in agritech-app/ (sibling of backend/)
# ──────────────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))          # .../backend
APP_DIR    = os.path.join(BASE_DIR, "..", "agritech-app")         # .../agritech-app
MODEL_PATH = os.path.join(APP_DIR, "plant_disease_model.h5")
CLASS_PATH = os.path.join(APP_DIR, "class_names.json")

# ──────────────────────────────────────────────────────────────────────────────
# 2. Load class names
# ──────────────────────────────────────────────────────────────────────────────
print(f"⏳ Loading class names from {os.path.abspath(CLASS_PATH)}...")
try:
    with open(CLASS_PATH, "r") as f:
        raw = json.load(f)
    # raw is {"0": "Corn___Common_Rust", "1": ..., ...}
    # Build an ordered list by integer key
    class_names = [raw[str(i)] for i in range(len(raw))]
    print(f"✅ Loaded {len(class_names)} class names: {class_names}")
except Exception as e:
    print(f"❌ Failed to load class names: {e}")
    class_names = []

# ──────────────────────────────────────────────────────────────────────────────
# 3. Load ML model once at startup
#    Model input: (None, 128, 128, 3)  →  Flatten(25088)  →  Dense(512)  →  Dense(22)
# ──────────────────────────────────────────────────────────────────────────────
print(f"⏳ Loading ML model from {os.path.abspath(MODEL_PATH)}...")
try:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
    ml_model = tf.keras.models.load_model(MODEL_PATH)
    print(f"✅ ML model loaded. Input shape: {ml_model.input_shape}")
except Exception as e:
    print(f"❌ Failed to load ML model: {e}")
    ml_model = None

# ──────────────────────────────────────────────────────────────────────────────
# 4. Disease info database — all 22 classes from class_names.json
# ──────────────────────────────────────────────────────────────────────────────
DISEASE_DB = {
    "Corn___Common_Rust": {
        "cause":      "Caused by the fungus Puccinia sorghi, spread by windborne spores in cool, moist conditions.",
        "treatment":  "Apply fungicides (azoxystrobin, propiconazole) at first sign of pustules. Spray every 10–14 days.",
        "prevention": "Plant resistant hybrids. Scout fields regularly from early season.",
        "fertilizer": "Ensure adequate Potassium and balanced NPK to strengthen plant immunity."
    },
    "Corn___Gray_Leaf_Spot": {
        "cause":      "Caused by Cercospora zeae-maydis fungus; thrives in warm, humid, and cloudy conditions.",
        "treatment":  "Apply foliar fungicides (strobilurin or triazole) when disease appears on lower leaves.",
        "prevention": "Crop rotation with non-host crops. Manage crop residue by tillage.",
        "fertilizer": "Optimize Potassium levels to help plant manage drought and disease stress."
    },
    "Corn___Healthy": {
        "cause":      "No disease detected. Plant appears healthy.",
        "treatment":  "No treatment required. Continue regular monitoring.",
        "prevention": "Maintain consistent irrigation and pest scouting to keep crop healthy.",
        "fertilizer": "Apply Nitrogen in split applications for sustained growth."
    },
    "Corn___Northern_Leaf_Blight": {
        "cause":      "Caused by Exserohilum turcicum fungus. Favored by moderate temperatures and leaf wetness.",
        "treatment":  "Apply fungicides if disease appears early on upper leaves. Foliar sprays help reduce spread.",
        "prevention": "Crop rotation and tillage to bury infected residue. Use resistant hybrids.",
        "fertilizer": "Balanced nutrition program improves overall plant health and resistance."
    },
    "Jowar___Healthy": {
        "cause":      "No disease detected. Plant appears healthy.",
        "treatment":  "No treatment required. Continue regular monitoring.",
        "prevention": "Practice good field sanitation and proper spacing to maintain airflow.",
        "fertilizer": "Apply NPK based on soil test. Phosphorus promotes strong root development."
    },
    "Jowar___Rust": {
        "cause":      "Caused by Puccinia purpurea fungus; spreads rapidly via wind in warm, humid weather.",
        "treatment":  "Apply contact or systemic fungicides (mancozeb, propiconazole) at early infection stage.",
        "prevention": "Use rust-resistant varieties. Remove infected plant debris after harvest.",
        "fertilizer": "Ensure adequate Potassium to boost natural disease resistance."
    },
    "Mango___Anthracnose": {
        "cause":      "Caused by Colletotrichum gloeosporioides; infects during wet and humid conditions.",
        "treatment":  "Spray copper-based fungicides or carbendazim. Apply pre- and post-harvest treatment.",
        "prevention": "Prune for better airflow. Avoid overhead irrigation. Collect and destroy fallen fruits.",
        "fertilizer": "Balanced fertilization with adequate Calcium strengthens fruit cell walls."
    },
    "Mango___Healthy": {
        "cause":      "No disease detected. Plant appears healthy.",
        "treatment":  "No treatment required. Continue regular orchard management.",
        "prevention": "Regular pruning for light penetration and airflow. Monitor for pests.",
        "fertilizer": "Apply balanced NPK fertilizer in spring before flowering."
    },
    "Mango___Powdery_Mildew": {
        "cause":      "Caused by Oidium mangiferae; favors dry weather with cool nights and warm days.",
        "treatment":  "Apply sulfur dust or systemic fungicides (triadimefon, hexaconazole) on affected parts.",
        "prevention": "Avoid planting in areas with poor air circulation. Prune congested branches.",
        "fertilizer": "Avoid over-fertilizing with Nitrogen, which creates lush susceptible tissue."
    },
    "Potato___Early_Blight": {
        "cause":      "Caused by Alternaria solani; older leaves infected first during warm, wet periods.",
        "treatment":  "Apply fungicides containing chlorothalonil or mancozeb. Rotate with legumes or grains.",
        "prevention": "Manage irrigation to keep foliage dry. Destroy volunteer potato plants.",
        "fertilizer": "Increase Potassium and Phosphorus if soil test indicates deficiency."
    },
    "Potato___Healthy": {
        "cause":      "No disease detected. Plant appears healthy.",
        "treatment":  "No treatment required. Continue regular monitoring.",
        "prevention": "Practice 3-year crop rotation. Use certified seed potatoes.",
        "fertilizer": "Sufficient Nitrogen early in growth; moderate Potassium throughout season."
    },
    "Potato___Late_Blight": {
        "cause":      "Caused by Phytophthora infestans (oomycete); spreads rapidly in cool, wet conditions. Highly destructive.",
        "treatment":  "URGENT: Use systemic fungicides (metalaxyl, cymoxanil). Destroy infected plants immediately.",
        "prevention": "Use certified seed tubers. Avoid cull piles. Apply preventive fungicide sprays.",
        "fertilizer": "Avoid over-fertilizing with Nitrogen late in the season."
    },
    "Rice___Brown_Spot": {
        "cause":      "Caused by Helminthosporium oryzae; associated with poor soil nutrition and drought stress.",
        "treatment":  "Apply fungicides (tricyclazole, propiconazole). Ensure proper water management.",
        "prevention": "Use disease-free seeds. Treat seeds with fungicide before planting.",
        "fertilizer": "Apply balanced fertilizer. Potassium and Silicon nutrition reduce susceptibility."
    },
    "Rice___Healthy": {
        "cause":      "No disease detected. Plant appears healthy.",
        "treatment":  "No treatment required. Continue regular field monitoring.",
        "prevention": "Maintain proper water levels and field sanitation throughout the season.",
        "fertilizer": "Split Nitrogen applications to support tillering and grain filling."
    },
    "Rice___Leaf_Blast": {
        "cause":      "Caused by Magnaporthe oryzae; favored by high humidity, heavy dew, and warm nights.",
        "treatment":  "Apply tricyclazole or isoprothiolane fungicide immediately at first signs.",
        "prevention": "Use resistant varieties. Avoid excessive Nitrogen. Ensure proper plant spacing.",
        "fertilizer": "Reduce Nitrogen application — excess Nitrogen increases blast susceptibility."
    },
    "Rice___Neck_Blast": {
        "cause":      "Caused by Magnaporthe oryzae attacking the neck node; occurs at panicle emergence stage.",
        "treatment":  "Apply tricyclazole at panicle initiation and heading stage for protection.",
        "prevention": "Time planting to avoid panicle emergence during high-risk periods. Use resistant varieties.",
        "fertilizer": "Balanced NPK; avoid late high-Nitrogen applications which increase severity."
    },
    "Sugarcane_Bacterial Blight": {
        "cause":      "Caused by Xanthomonas albilineans; spreads through infected cuttings and contaminated tools.",
        "treatment":  "No chemical cure. Rogue out infected stools. Use disease-free planting material.",
        "prevention": "Use certified disease-free seed setts. Disinfect cutting tools with bleach solution.",
        "fertilizer": "Balanced NPK to maintain vigorous growth. Avoid stress conditions."
    },
    "Sugarcane_Healthy": {
        "cause":      "No disease detected. Plant appears healthy.",
        "treatment":  "No treatment required. Continue regular monitoring.",
        "prevention": "Practice proper field sanitation and use disease-free planting material.",
        "fertilizer": "Apply Nitrogen in split doses. Ensure adequate Phosphorus and Potassium."
    },
    "Sugarcane_Red Rot": {
        "cause":      "Caused by Colletotrichum falcatum; enters through wounds; spreads in waterlogged soils.",
        "treatment":  "Remove and destroy affected stools. Treat setts with carbendazim solution before planting.",
        "prevention": "Use resistant varieties. Ensure good field drainage. Avoid waterlogging.",
        "fertilizer": "Maintain soil health with organic matter. Avoid excessive Nitrogen."
    },
    "Wheat___Brown_Rust": {
        "cause":      "Caused by Puccinia triticina; wind-dispersed spores; favors mild temperatures and moisture.",
        "treatment":  "Apply triazole or strobilurin fungicide at flag leaf stage for best results.",
        "prevention": "Grow resistant varieties. Avoid late sowing to reduce disease risk window.",
        "fertilizer": "Balanced Nitrogen application; avoid over-application which increases susceptibility."
    },
    "Wheat___Healthy": {
        "cause":      "No disease detected. Plant appears healthy.",
        "treatment":  "No treatment required. Continue regular field monitoring.",
        "prevention": "Use certified seeds, proper crop rotation, and balanced nutrition.",
        "fertilizer": "Apply Nitrogen in 2–3 splits. Ensure adequate Phosphorus at sowing."
    },
    "Wheat___Yellow_Rust": {
        "cause":      "Caused by Puccinia striiformis; favors cool, moist conditions. Highly contagious via wind.",
        "treatment":  "Apply propiconazole or tebuconazole fungicide immediately at first sign of yellowing stripes.",
        "prevention": "Grow resistant varieties. Avoid late sowing. Monitor fields from tillering stage.",
        "fertilizer": "Ensure adequate Potassium. Avoid excess Nitrogen in the growing season."
    }
}

def get_disease_info(class_label: str) -> dict:
    """Return disease details from DB. Normalise underscores/spaces for lookup."""
    if class_label in DISEASE_DB:
        return DISEASE_DB[class_label]
    # Fallback — try replacing triple-underscore with space
    normalised = class_label.replace("___", " ").replace("_", " ")
    for key, val in DISEASE_DB.items():
        if key.replace("___", " ").replace("_", " ").lower() == normalised.lower():
            return val
    return {
        "cause":      "Leaf pattern analysis detected an anomaly. Consult a local agricultural expert.",
        "treatment":  "Consult with a local agricultural expert for correct diagnosis and treatment.",
        "prevention": "Practice good crop rotation and field sanitation.",
        "fertilizer": "Maintain balanced soil nutrition based on a recent soil test."
    }

# ──────────────────────────────────────────────────────────────────────────────
# 5. FastAPI app
# ──────────────────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    print("👋 Shutting down ML API...")

app = FastAPI(
    title="AgriTech ML Disease Detection API",
    description="Backend API for predicting crop diseases using CNN model",
    version="2.0.0",
    lifespan=lifespan
)

app.state.model = ml_model

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────────────────────────────────────
# 6. Endpoints
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/")
async def health_check():
    return {
        "status":         "AgriTech ML API Running",
        "model_status":   "Loaded" if ml_model is not None else "Not Loaded",
        "model_classes":  len(class_names),
        "ai_chat_status": "Active" if chat_ai is not None else "Fallback Mode"
    }


@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """Dynamic AI Chatbot endpoint using Gemini (with smart history and multi-lang fallback)."""
    user_message = request.message
    lang = request.language

    gemini_history = []
    for h in request.history:
        role = "user" if h.get("sender") == "user" else "model"
        text = h.get("text", "")
        gemini_history.append({"role": role, "parts": [text]})

    system_instruction = f"""
    You are 'AgriTech bot', a helpful farming expert from Maharashtra/India.
    MANDATORY: You MUST respond ONLY in the {lang} language.
    Even if the user asks in English, translate your answer to {lang}.
    Goal: Provide specific, practical advice for crops, soil, pests, and weather.
    Keep it professional and concise (max 3 sentences).
    Current language set to: {lang}
    """

    if chat_ai:
        try:
            import asyncio
            chat = chat_ai.start_chat(history=gemini_history)
            try:
                response = await asyncio.wait_for(
                    chat.send_message_async(f"{system_instruction}\n\nUser Question: {user_message}"),
                    timeout=10.0
                )
                return {"response": response.text}
            except asyncio.TimeoutError:
                return {"response": "[Error] AI took too long to respond."}
            except Exception as timeout_err:
                return {"response": f"[Gemini Error] {str(timeout_err)}"}
        except Exception as e:
            return {"response": f"[System Error] Gemini could not start: {str(e)}"}

    # Smart Contextual Fallback
    keywords = {
        "water":      ["पानी", "पाणी", "water", "irrigation", "सिंचाई", "सिंचन", "dry", "wet"],
        "pest":       ["कीड़े", "कीटक", "pest", "insect", "worm", "कीड", "अळी"],
        "disease":    ["रोग", "आजार", "disease", "sick", "yellow", "spots", "पिवळे", "डाग"],
        "crop":       ["crop", "plant", "sugarcane", "wheat", "rice", "पिक", "फसल"],
        "fertilizer": ["khad", "fertilizer", "urea", "npk", "खत", "उर्वरक"]
    }
    match = "general"
    lower_msg = user_message.lower()
    for category, kws in keywords.items():
        if any(kw in lower_msg for kw in kws):
            match = category
            break

    knowledge = {
        "water":      {"en": "During germination, keep soil moist but not waterlogged. Water every 2-3 days."},
        "pest":       {"en": "Check underside of leaves for insects. Neem oil spray is a safe organic solution."},
        "disease":    {"en": "Yellowing often indicates nutrient deficiency or overwatering. Check roots for rot."},
        "crop":       {"en": "Ensure your crop gets enough sunlight and protection from direct wind."},
        "general":    {"en": "I'm here to help. Could you tell me if you noticed spots on leaves or soil color changes?"}
    }
    res_dict = knowledge.get(match, knowledge["general"])
    response_text = res_dict.get(lang, res_dict["en"])
    return {"response": f"[Smart Assistant] {response_text}"}


@app.post("/predict")
async def predict_disease(file: UploadFile = File(...), language: str = "en"):
    """
    Receive an image, preprocess to 128x128, run model prediction, return structured JSON.
    Response fields: disease, confidence, severity, cause, treatment, prevention, fertilizer
    """
    # 1. Check model
    if ml_model is None:
        raise HTTPException(status_code=503, detail="ML model is not loaded. Check server logs.")

    # 2. Check class names loaded
    if not class_names:
        raise HTTPException(status_code=503, detail="Class names not loaded. Check server logs.")

    # 3. Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not an image.")

    try:
        # 4. Read image bytes
        image_bytes = await file.read()
        logger.info(f"📸 Received: {file.filename} ({len(image_bytes)} bytes)")

        if len(image_bytes) == 0:
            raise ValueError("Empty image file received.")

        # 5. Preprocess — model input is (None, 128, 128, 3)
        processed_image = preprocess_image(image_bytes, target_size=(128, 128))
        logger.info(f"🔧 Preprocessed shape: {processed_image.shape}")

        # 6. Predict
        predictions = ml_model.predict(processed_image, verbose=0)
        logger.info(f"📊 Raw predictions shape: {predictions.shape}, values: {predictions[0][:5]}...")

        # 7. Extract result
        class_index = int(np.argmax(predictions[0]))
        confidence  = float(np.max(predictions[0])) * 100
        class_label = class_names[class_index]

        # 8. Severity
        if confidence >= 80:
            severity = "High"
        elif confidence >= 50:
            severity = "Medium"
        else:
            severity = "Low"

        # 9. Get disease info
        info = get_disease_info(class_label)

        # 10. Format disease name for display (e.g. "Potato___Early_Blight" → "Potato Early Blight")
        display_name = class_label.replace("___", " ").replace("_", " ")

        logger.info(f"🔮 Predicted: {display_name} | Confidence: {confidence:.2f}% | Severity: {severity}")

        # 11. Return — exact fields the frontend expects
        return {
            "disease":    display_name,
            "confidence": round(confidence, 2),
            "severity":   severity,
            "cause":      info["cause"],
            "treatment":  info["treatment"],
            "prevention": info["prevention"],
            "fertilizer": info["fertilizer"]
        }

    except ValueError as ve:
        logger.error(f"❌ Image error: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"❌ Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting AgriTech AI Backend on http://0.0.0.0:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)
