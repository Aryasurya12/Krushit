import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ No API Key found in .env")
    exit()

genai.configure(api_key=api_key)

print(f"🔍 Checking available models for key ending in ...{api_key[-4:]}")

try:
    print("\n--- Available Chat Models ---")
    found = False
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"✅ Found: {m.name}")
            found = True
    
    if not found:
        print("❌ No models found that support generateContent.")
except Exception as e:
    print(f"❌ Error listing models: {e}")
