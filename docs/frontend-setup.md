# Frontend Setup Guide 🎨

This document covers the installation and development setup for the Krushit Frontend (Next.js PWA).

## Prerequisites
- Node.js 18+
- npm or yarn

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd agritech-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Configuration:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase, Weather API, and Gemini API keys.

## Development
Run the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Production
```bash
npm run build
```
This generates the `.next` folder and optimizes the PWA for deployment.
