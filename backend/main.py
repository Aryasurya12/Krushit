import os
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

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    # Use dynamically detected model (User has access to preview/experimental models)
    chat_ai = genai.GenerativeModel('models/gemini-2.5-flash')
else:
    chat_ai = None

class ChatRequest(BaseModel):
    message: str
    history: list = []
    language: str = "en"

# Internal imports
from models.disease_info import get_disease_details
from models.translations import get_local_translation
from utils.image_processing import preprocess_image

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agritech-ml-api")

# Load the ML model at startup
model_path = os.path.join("models", "model.h5")
print(f"⏳ Loading ML model from {os.path.abspath(model_path)}...")

try:
    if not os.path.exists(model_path):
        print(f"❌ Model file not found at {model_path}")
    ml_model = tf.keras.models.load_model(model_path)
    print("✅ ML model loaded successfully.")
except Exception as e:
    print(f"❌ Failed to load ML model: {str(e)}")
    ml_model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    print("👋 Shutting down ML API...")

# Create FastAPI app
app = FastAPI(
    title="AgriTech ML Disease Detection API",
    description="Backend API for predicting crop diseases using CNN model",
    version="1.0.0",
    lifespan=lifespan
)

# Attach model to app state
app.state.model = ml_model

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for development. Update with specific domains for production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "AgriTech ML API Running",
        "model_status": "Loaded" if ml_model is not None else "Not Loaded",
        "ai_chat_status": "Active" if chat_ai is not None else "Fallback Mode"
    }

@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    """
    Dynamic AI Chatbot endpoint using Gemini (with smart history and multi-lang fallback).
    """
    user_message = request.message
    lang = request.language
    
    # Process history for Gemini (fixed part handling)
    gemini_history = []
    for h in request.history:
        role = "user" if h.get("sender") == "user" else "model"
        text = h.get("text", "")
        gemini_history.append({"role": role, "parts": [text]})

    # SYSTEM PROMPT (Strict Localization)
    system_instruction = f"""
    You are 'AgriTech bot', a helpful farming expert from Maharashtra/India.
    MANDATORY: You MUST respond ONLY in the {lang} language. 
    Even if the user asks in English, translate your answer to {lang}.
    Goal: Provide specific, practical advice for crops, soil, pests, and weather.
    Keep it professional and concise (max 3 sentences).
    Current language set to: {lang}
    """

    # OPTION A: Use Real Gemini (with timeout protection)
    if chat_ai:
        try:
            import asyncio
            
            # Pass actual conversation history for true dynamic behavior
            chat = chat_ai.start_chat(history=gemini_history)
            
            # Add timeout to prevent hanging and use ASYNC call
            try:
                # Use send_message_async for non-blocking I/O
                response = await asyncio.wait_for(
                    chat.send_message_async(f"{system_instruction}\n\nUser Question: {user_message}"),
                    timeout=10.0
                )
                return {"response": response.text}
            except asyncio.TimeoutError:
                logger.warning(f"⚠️ Gemini API timed out.")
                return {"response": "[Error] AI took too long to respond. The server might be slow or the request was blocked."}
            except Exception as timeout_err:
                logger.warning(f"⚠️ Gemini error: {str(timeout_err)}")
                return {"response": f"[Gemini Error] {str(timeout_err)}"}
        except Exception as e:
            logger.error(f"❌ Gemini Setup Error: {str(e)}")
            return {"response": f"[System Error] Gemini could not start: {str(e)}"}

    # OPTION B: Smart Contextual Fallback
    # Better keyword matching (Expanded for natural language)
    keywords = {
        "water": ["पानी", "पाणी", "water", "irrigation", "सिंचाई", "सिंचन", "dry", "wet", "कोरडी", "ओली", "सुका", "geela", "sukha"],
        "pest": ["कीड़े", "कीटक", "pest", "insect", "worm", "कीड", "अळी", "kida", "ill", "attack"],
        "disease": ["रोग", "आजार", "disease", "sick", "yellow", "spots", "पिवळे", "पिवळा", "पिवळी", "डाग", "पीला", "पीले", "yellowing", "spot"],
        "crop": ["crop", "plant", "sugarcane", "wheat", "rice", "पिक", "फसल", "ऊस", "गहू", "तांदूळ", "गन्ना", "sheti", "farm", "kheti"],
        "fertilizer": ["khad", "khat", "fertilizer", "urea", "npk", "खत", "उर्वरक", "poshan", "nutrient", "vad"]
    }
    
    match = "general"
    lower_msg = user_message.lower()
    for category, kws in keywords.items():
        if any(kw in lower_msg for kw in kws):
            match = category
            break
            
    knowledge = {
        "water": {
            "en": "During the germination stage, keep the soil consistently moist but not waterlogged. Water every 2-3 days.",
            "hi": "अंकुरण के दौरान, मिट्टी को नम रखें लेकिन जलभराव न होने दें। हर 2-3 दिनों में पानी दें।",
            "mr": "उगवण अवस्थेत माती सतत ओलसर ठेवा पण पाणी साचू देऊ नका. दर 2-3 दिवसांनी पाणी द्या."
        },
        "pest": {
            "en": "Check the underside of leaves for tiny insects. Neem oil spray is a safe organic solution.",
            "hi": "पत्तियों के निचले हिस्से में छोटे कीटों की जांच करें। नीम के तेल का स्प्रे एक सुरक्षित समाधान है।",
            "mr": "पानांच्या खालच्या बाजूला लहान कीटकांची तपासणी करा. कडुलिंबाच्या तेलाची फवारणी हा एक सुरक्षित पर्याय आहे."
        },
        "disease": {
            "en": "Yellowing often indicates nutrient deficiency or overwatering. Check the roots for rot.",
            "hi": "पीलापन अक्सर पोषक तत्वों की कमी या अधिक पानी की ओर इशारा करता है। जड़ों की जांच करें।",
            "mr": "पिवळेपणा अनेकदा पोषक तत्वांची कमतरता किंवा जास्त पाणी दर्शवतो. मुळे कुजली आहेत का ते तपासा."
        },
        "crop": {
            "en": f"That's a good update about your crop. At this stage, ensure it gets enough sunlight and protection from direct wind.",
            "hi": "आपकी फसल के बारे में अच्छी जानकारी। इस स्तर पर, पर्याप्त धूप और हवा से सुरक्षा सुनिश्चित करें।",
            "mr": "तुमच्या पिकाबद्दल चांगली माहिती. या टप्प्यावर, पुरेशी सूर्यप्रकाश आणि वाऱ्यापासून संरक्षण मिळेल याची खात्री करा."
        },
        "general": {
            "en": "I'm here to help. Could you tell me if you've noticed any spots on leaves or changes in soil color?",
            "hi": "मैं मदद के लिए यहाँ हूँ। क्या आपने पत्तियों पर कोई धब्बे या मिट्टी के रंग में बदलाव देखा है?",
            "mr": "मी मदतीसाठी आहे. तुम्ही पानांवर काही डाग किंवा मातीच्या रंगात बदल पाहिला आहे का?"
        }
    }
    
    # Selection logic
    res_dict = knowledge.get(match, knowledge["general"])
    response_text = res_dict.get(lang, res_dict["en"])
    
    return {"response": f"[Smart Assistant] {response_text}"}

@app.post("/predict")
async def predict_disease(file: UploadFile = File(...), language: str = "en"):
    """
    Endpoint to receive an image and return disease prediction with localization.
    """
    # 1. Check if model is loaded
    if ml_model is None:
        print("❌ Prediction attempted but model is not loaded.")
        raise HTTPException(
            status_code=503, 
            detail="Machine learning model is not available. Please check server logs."
        )

    # 2. Check file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, 
            detail="Uploaded file is not an image."
        )

    try:
        # 3. Read image bytes
        image_bytes = await file.read()
        print(f"DEBUG: Received file {file.filename}, size {len(image_bytes)} bytes")
        
        if len(image_bytes) == 0:
            raise ValueError("Empty image file received.")
        
        # 4. Preprocess image
        processed_image = preprocess_image(image_bytes, target_size=(128, 128))
        
        # 5. Run prediction
        predictions = ml_model.predict(processed_image, verbose=0)
        
        # 6. Post-process results
        class_index = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0])) * 100
        
        # 7. Get structured disease info from mapping (English base)
        details = get_disease_details(int(class_index))
        
        disease_name = details["disease"]
        solution = details["solution"]
        prevention = details["prevention"]
        fertilizer = details["fertilizer_advice"]

        # 7.5 Check local translation FIRST (Robustness for MVP)
        local_trans = get_local_translation(int(class_index), language)
        if local_trans:
            print(f"✅ Using local translation for {language}")
            disease_name = local_trans["disease"]
            solution = local_trans["solution"]
            prevention = local_trans["prevention"]
            fertilizer = local_trans["fertilizer_advice"]
        
        # 8. Try to localize using Gemini if available AND no local translation found
        elif chat_ai and language != "en":
            try:
                prompt = f"""
                Translate the following agricultural diagnosis to {language}. 
                Keep it professional and helpful.
                
                Disease Name: {disease_name}
                Cause: Leaf pattern match.
                Treatment: {solution}
                Prevention: {prevention}
                Fertilizer: {fertilizer}
                
                Format as JSON: 
                {{"disease": "...", "solution": "...", "prevention": "...", "fertilizer": "..."}}
                """
                response = chat_ai.generate_content(prompt)
                import json
                # Try to extract JSON from response text
                text = response.text.strip()
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0].strip()
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0].strip()
                
                translated = json.loads(text)
                disease_name = translated.get("disease", disease_name)
                solution = translated.get("solution", solution)
                prevention = translated.get("prevention", prevention)
                fertilizer = translated.get("fertilizer", fertilizer)
            except Exception as e:
                logger.error(f"⚠️ Translation failed, using English fallback: {e}")

        print(f"🔮 Predicted: {disease_name} with {confidence:.2f}% confidence")
        
        # 9. Return structured response
        return {
            "disease": disease_name,
            "confidence": round(confidence, 2),
            "solution": solution,
            "prevention": prevention,
            "fertilizer_advice": fertilizer
        }

    except ValueError as ve:
        logger.error(f"❌ Image processing error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"❌ Prediction error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="An error occurred during disease prediction."
        )

if __name__ == "__main__":
    import uvicorn
    # FIXED: Using Port 8001 to avoid conflicts with old ghost processes
    print("🚀 Starting AgriTech AI Backend on http://0.0.0.0:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)
