# AgriTech (Krushit Pro): The Future of Precision Farming 🌾🚀

**AgriTech** is an end-to-end intelligent agricultural ecosystem designed to bridge the gap between traditional farming methods and modern technology. Developed to support rural and small-scale farmers, the platform leverages **Artificial Intelligence (CNNs)**, **Generative AI (LLMs)**, and **IoT Real-time Monitoring** to maximize crop yields, reduce chemical wastage, and provide expert guidance in local languages.

---

## 🌟 Core Pillars of the Platform

### 1. Intelligent Disease Diagnosis (Computer Vision)
At the heart of AgriTech is a custom-trained **Convolutional Neural Network (CNN)**. 
- **High Recall Model**: Specifically tuned to detect subtle patterns in early-stage leaf diseases (Rust, Blasts, Aphids).
- **Instant Analysis**: Farmers upload a leaf photograph and receive a diagnosis in under 2 seconds.
- **Actionable Treatment**: Not just a name—the system provides organic and chemical treatment protocols, localized by region.

### 2. Multi-Agent AI Assistance (Google Gemini)
The platform integrates **Google Gemini (Flash 2.5)** as a hyper-localized farming consultant.
- **Context-Aware Chatting**: Remembers previous farm health data to give advice like *"Since your soil moisture was low yesterday, try [specific technique] today."*
- **Multilingual Support**: Uses advanced prompt engineering to respond fluently in **Marathi, Hindi, and English**, ensuring the AI feels like a local expert.
- **Voice-First Navigation**: Incorporates Browser Speech APIs for hands-free field use.

### 3. Precision Farming & IoT Integration
AgriTech moves beyond static advice by processing live data from the ground.
- **Real-time Monitoring**: Visualizes soil moisture, temperature, and humidity through an intuitive "Stat Card" system.
- **Smart Irrigation Scheduling**: Uses weather forecast data merged with soil sensor readings to suggest precise watering windows, potentially saving up to 30% water.
- **Weather Resilience**: Provides specialized farming advisories based on upcoming 7-day weather events (e.g., *"Delay fertilizer application due to expected rain in 48 hours"*).

### 4. Community-Driven Outbreak Mapping
- **Crowdsourced Intelligence**: Users anonymously report disease sightings which are aggregated into a **Disease Heatmap**.
- **Early Warning System**: Farmers receive alerts when a specific pest or disease is detected within a 5-10km radius of their mapped farm.

---

## 🛠️ Technical Deep Dive

### **Frontend Architecture**
- **Next.js 15 (App Router)**: Hybrid Server/Client rendering for performance.
- **Framer Motion**: State-of-the-art animations for a premium, responsive feel.
- **i18next**: Complex internationalization framework for deep-level localization.
- **Responsive 3D Hero**: Uses Three.js/Three-Fiber for high-engagement landing page visuals.

### **AI Backend Service**
- **FastAPI**: Asynchronous Python backend for low-latency ML inference.
- **TensorFlow/Keras**: Serving a pre-trained CNN model optimized for edge/mobile-compatible inference.
- **Robust Fallback**: Custom localized knowledge engine that provides basic advice even if the Gemini API is offline.

### **Database & Security**
- **Supabase**: Real-time Postgres database for user profiles, crop history, and iot_tracking.
- **Row Level Security (RLS)**: Ensuring farmer data privacy and secure session management.

---

## 📦 Installation & Setup

### Frontend (`agritech-app`)
1. Install dependencies: `npm install`
2. Set up environment variables in `.env.local` (Supabase keys)
3. Start dev server: `npm run dev`

### Backend (`backend`)
1. Create virtual environment: `python -m venv venv`
2. Install dependencies: `pip install -r requirements.txt`
3. Set up environment variables in `.env` (Gemini API key)
4. Start API: `python main.py`

---

### **Author**
Developed by **Arya Surya** 
*Helping build a more sustainable and tech-forward future for agriculture.*
