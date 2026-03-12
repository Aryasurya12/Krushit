# Local Development Setup Guide 🚀

Follow these steps to set up the entire Krushit ecosystem on your local machine.

## Step 1: Clone and Install
Clone the repository and install dependencies for both frontend and backend.
Refer to [frontend-setup.md](./frontend-setup.md) and [backend-setup.md](./backend-setup.md).

## Step 2: Environment Variables
Ensure both `.env` (backend) and `.env.local` (frontend) are correctly configured with your API keys.

## Step 3: Run the Servers
You will need two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
python main.py
```

**Terminal 2 (Frontend):**
```bash
cd agritech-app
npm run dev
```

## Step 4: Verification
1. Access the UI at `http://localhost:3000`.
2. Access the API Docs at `http://localhost:8001/docs`.
3. Try switching languages and scanning a crop to verify end-to-end connectivity.
