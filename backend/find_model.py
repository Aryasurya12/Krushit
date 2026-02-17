import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model_name = "gemini-pro" # Fallback default
found_models = []

try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            found_models.append(m.name)
            
    # Priority selection
    priority = [
        "models/gemini-1.5-flash",
        "models/gemini-1.5-pro",
        "models/gemini-pro",
        "models/gemini-1.0-pro"
    ]
    
    selected = None
    for p in priority:
        if p in found_models:
            selected = p
            break
            
    if not selected and found_models:
        # Pick the first one that looks like Gemini
        for m in found_models:
            if "gemini" in m:
                selected = m
                break
        if not selected:
             selected = found_models[0] # Pick ANYTHING

    if selected:
        print(f"SELECTED_MODEL:{selected}")
        with open("working_model.txt", "w") as f:
            f.write(selected)
    else:
        print("NO_MODELS_FOUND")

except Exception as e:
    print(f"ERROR: {e}")
