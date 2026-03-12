# Backend Setup Guide ⚙️

This document covers the installation and setup for the Krushit AI/ML Backend (FastAPI).

## Prerequisites
- Python 3.9+
- pip

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Environment Configuration:
   - Create a `.env` file based on the keys mentioned in the main README.
   - Required: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`.

## Database Migrations
Supabase handles the database schema. Ensure your Supabase project is set up with the required tables (Users, Crops, Scans, etc.).

## Running the API Server
```bash
python main.py
```
The server will start on `http://localhost:8001`. You can access the API documentation at `http://localhost:8001/docs`.
