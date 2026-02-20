# Krushit: Precision Farming & AI-Powered Disease Detection 🌾🚀

**Krushit** is an end-to-end intelligent agricultural ecosystem designed to bridge the gap between traditional farming methods and modern technology. Developed to support rural and small-scale farmers, the platform leverages **Artificial Intelligence (CNNs)**, **Generative AI (LLMs)**, and **IoT Real-time Monitoring** to maximize crop yields, reduce chemical wastage, and provide expert guidance in local languages.

---

## 🌟 Core Pillars of the Platform

### 1. Intelligent Disease Diagnosis (Computer Vision)
At the heart of Krushit is a custom-trained **Convolutional Neural Network (CNN)**. 
- **High Resolution Analysis**: Uses a Sequential CNN model trained on specific Indian crop datasets.
- **22-Class Coverage**: Detects diseases across major crops including **Corn, Jowar, Mango, Potato, Rice, Sugarcane, and Wheat**.
- **Instant Analysis**: High-speed inference using FastAPI returns results in under 2 seconds.
- **Comprehensive Reports**: Provides Diagnosis (Cause), Severity (Low/Medium/High), Treatment Plans, Prevention Tips, and Fertilizer Recommendations.
- **Exportable Data**: Farmers can save their diagnosis as a professional PDF report.

### 2. Multi-Agent AI Assistance (Google Gemini)
The platform integrates **Google Gemini (Flash 2.5)** as a hyper-localized farming consultant.
- **Context-Aware Chatting**: Remembers previous farm health data to provide relevant advice.
- **Multilingual Support**: Fluently responds in **Marathi, Hindi, and English**, ensuring the AI feels like a local expert.
- **Smart Fallback**: Includes a rule-based localized engine that works even without an active LLM connection.

### 3. Precision Farming & Dashboard
- **Real-time Monitoring**: Visualizes soil moisture, temperature, and humidity through an intuitive dashboard.
- **IoT-Ready Architecture**: Built to consume real-time sensor data via Supabase.
- **Weather Integration**: Provides specialized advisories based on localized weather patterns.

---

## 🛠️ Technical Stack

### **Frontend (AgriTech App)**
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS & Framer Motion (Animations)
- **State & Data**: React Hooks, Context API, Supabase Client
- **Utilities**: jsPDF (Report generation), Lucide React (Iconography), i18next (Localization)

### **AI Backend Service**
- **Framework**: FastAPI (Asynchronous Python)
- **ML Engine**: TensorFlow 2.18 / Keras
- **Model Architecture**: Sequential CNN, **128x128 RGB Input**
- **Hosting Port**: 8001 (Default)

### **Database & Cloud**
- **Supabase**: PostgreSQL database for user profiles, scan history, and real-time tracking.
- **LFS Support**: Large model files (`plant_disease_model.h5`) managed via Git LFS.

---

## 📦 Installation & Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*Note: Ensure `plant_disease_model.h5` and `class_names.json` are present in the `agritech-app` folder (the backend reads from there).*

### 2. Frontend Setup
```bash
cd agritech-app
npm install
npm run dev
```

### 3. Environment Configuration
- **Backend**: Configure `GEMINI_API_KEY` in `backend/.env`.
- **Frontend**: Configure Supabase URL and Anon Key in `agritech-app/.env.local`.

---

## 🚀 Key Recent Improvements
- ✅ **Optimized ML Integration**: Fixed input shape mismatch (128x128) for high-accuracy predictions.
- ✅ **Dynamic Class Mapping**: Integrated `class_names.json` for real-time label resolution.
- ✅ **Server-Side Severity Logic**: Automatic classification of disease severity based on confidence scores.
- ✅ **Refined UI Feedback**: Real-time response mapping for treatment, prevention, and fertilizer advice.

---

### **Author**
Developed by **GEONIX** 
*Helping build a more sustainable and tech-forward future for agriculture.*
