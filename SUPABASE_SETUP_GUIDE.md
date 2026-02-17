# 🚀 Supabase Integration Guide for AgriTech PWA

## ✅ What Has Been Done

Your AgriTech PWA is now configured to use **Supabase** as the backend! Here's what was implemented:

### 1. **Installed Dependencies** ✅
- `@supabase/supabase-js` - Supabase JavaScript client
- `@supabase/auth-helpers-nextjs` - Next.js auth helpers
- `@supabase/auth-ui-react` - Pre-built auth UI components
- `@supabase/auth-ui-shared` - Shared auth UI utilities

### 2. **Created Files** ✅
- `/lib/supabase.ts` - Supabase client configuration with TypeScript types
- `/contexts/AuthContext.tsx` - Authentication context provider
- `/lib/api.ts` - API helper functions for all database operations
- `/database/supabase-schema.sql` - Complete database schema
- `/.env.local.example` - Environment variables template

### 3. **Updated Files** ✅
- `/app/layout.tsx` - Added AuthProvider wrapper
- `/components/FarmerDashboardLayout.tsx` - Integrated auth with logout button

---

## 📋 Setup Instructions

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"New Project"**
3. Fill in project details:
   - **Name**: AgriTech PWA
   - **Database Password**: (create a strong password - save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to be ready

### Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

### Step 3: Configure Environment Variables

1. Create `.env.local` file in your project root:

```bash
# In d:/New folder/AgriTech/agritech-app/
touch .env.local
```

2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ IMPORTANT**: Replace `your-project-id`, `your-anon-key-here`, and `your-service-role-key-here` with your actual values from Step 2!

### Step 4: Set Up Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy the entire contents of `/database/supabase-schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** or press `Ctrl+Enter`
6. You should see: **"Success. No rows returned"**

This creates:
- ✅ All tables (users, crops, disease_scans, iot_sensors, recommendations, etc.)
- ✅ Row Level Security (RLS) policies
- ✅ Triggers and functions
- ✅ Indexes for performance

### Step 5: Set Up Storage Buckets

1. In Supabase Dashboard, go to **Storage**
2. Click **"New bucket"**
3. Create these buckets:

**Bucket 1: crop_images**
- Name: `crop_images`
- Public: ✅ Yes
- Click **"Create bucket"**

**Bucket 2: disease_scans**
- Name: `disease_scans`
- Public: ✅ Yes
- Click **"Create bucket"**

**Bucket 3: user_avatars**
- Name: `user_avatars`
- Public: ✅ Yes
- Click **"Create bucket"**

4. For each bucket, set up policies:
   - Go to **Policies** tab
   - Click **"New policy"**
   - Select **"For full customization"**
   - Add these policies:

**SELECT (Read) Policy:**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'crop_images' );
```

**INSERT (Upload) Policy:**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'crop_images' AND auth.role() = 'authenticated' );
```

**DELETE Policy:**
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING ( bucket_id = 'crop_images' AND auth.uid()::text = (storage.foldername(name))[1] );
```

Repeat for `disease_scans` and `user_avatars` buckets.

### Step 6: Configure Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Optional: Enable other providers (Google, Facebook, etc.)

**Email Settings:**
1. Go to **Authentication** → **Email Templates**
2. Customize email templates (optional)
3. Set **Site URL**: `http://localhost:3000` (for development)
4. Set **Redirect URLs**: 
   - `http://localhost:3000/**`
   - Add your production URL later

### Step 7: Test the Integration

1. **Restart your dev server**:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

2. **Check for errors**:
   - Open browser console (F12)
   - Look for any Supabase connection errors
   - If you see errors about missing env variables, check Step 3

3. **Test Authentication** (you'll need to create login page - see below)

---

## 🔐 How Authentication Works

### Current Setup:

1. **AuthProvider** wraps your entire app (`/app/layout.tsx`)
2. **useAuth()** hook is available in all components
3. **Logout button** is integrated in sidebar
4. **User profile** displays authenticated user's name/email

### Available Auth Functions:

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, session, loading, signIn, signUp, signOut, updateProfile } = useAuth();

  // Check if user is logged in
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;

  // User is authenticated
  return <div>Welcome, {user.email}!</div>;
}
```

---

## 📊 How to Use the Database API

### Example: Fetch Crops

```typescript
import { cropsApi } from '@/lib/api';

async function fetchCrops() {
  try {
    const crops = await cropsApi.getAll();
    console.log(crops);
  } catch (error) {
    console.error('Error fetching crops:', error);
  }
}
```

### Example: Create New Crop

```typescript
import { cropsApi } from '@/lib/api';

async function addCrop() {
  try {
    const newCrop = await cropsApi.create({
      name: 'Wheat',
      variety: 'HD-2967',
      area: 2.5,
      sown_date: '2024-01-15',
      expected_harvest_date: '2024-05-15',
      current_stage: 'vegetative',
      health_status: 'healthy',
    });
    console.log('Crop created:', newCrop);
  } catch (error) {
    console.error('Error creating crop:', error);
  }
}
```

### Example: Upload Disease Scan Image

```typescript
import { diseaseScansApi } from '@/lib/api';

async function uploadScan(file: File, cropId: string) {
  try {
    // Upload image to storage
    const imageUrl = await diseaseScansApi.uploadImage(file);
    
    // Create scan record
    const scan = await diseaseScansApi.create({
      crop_id: cropId,
      image_url: imageUrl,
      disease_detected: 'Leaf Rust',
      confidence: 92,
      severity: 'medium',
      treatment: 'Apply fungicide',
    });
    
    console.log('Scan created:', scan);
  } catch (error) {
    console.error('Error uploading scan:', error);
  }
}
```

### Example: Get IoT Sensor Data

```typescript
import { iotSensorsApi } from '@/lib/api';

async function getSensorData() {
  try {
    const soilMoisture = await iotSensorsApi.getByType('soil_moisture');
    console.log('Soil moisture readings:', soilMoisture);
  } catch (error) {
    console.error('Error fetching sensor data:', error);
  }
}
```

---

## 🔄 Next Steps

### 1. Create Login/Signup Pages

You need to create authentication pages. Here's a quick example:

**Create `/app/login/page.tsx`:**

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn(email, password);
    if (error) {
      alert(error.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="card max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-glass w-full mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-glass w-full mb-4"
        />
        <button type="submit" className="btn-primary w-full">
          Login
        </button>
      </form>
    </div>
  );
}
```

### 2. Protect Routes

Add authentication checks to your pages:

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Dashboard content...</div>;
}
```

### 3. Update Existing Pages to Use Real Data

Replace mock data with Supabase queries:

**Example: Update `/app/crops/page.tsx`:**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { cropsApi } from '@/lib/api';

export default function CropsPage() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCrops() {
      try {
        const data = await cropsApi.getAll();
        setCrops(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCrops();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {crops.map(crop => (
        <div key={crop.id}>{crop.name}</div>
      ))}
    </div>
  );
}
```

---

## 🔍 Troubleshooting

### Error: "Invalid API key"
- Check your `.env.local` file
- Make sure you copied the correct keys from Supabase Dashboard
- Restart dev server after changing `.env.local`

### Error: "Row Level Security policy violation"
- Make sure you ran the schema SQL (Step 4)
- Check that RLS policies are enabled
- Verify user is authenticated

### Error: "relation does not exist"
- Database schema not created
- Go back to Step 4 and run the SQL

### Images not uploading
- Check storage buckets are created (Step 5)
- Verify storage policies are set up
- Check file size limits

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

## ✅ Checklist

- [ ] Created Supabase project
- [ ] Got API keys
- [ ] Created `.env.local` file
- [ ] Added environment variables
- [ ] Ran database schema SQL
- [ ] Created storage buckets
- [ ] Set up storage policies
- [ ] Configured authentication
- [ ] Restarted dev server
- [ ] Tested connection (no errors in console)
- [ ] Created login/signup pages
- [ ] Updated pages to use real data

---

**Your AgriTech PWA is now powered by Supabase!** 🎉

All authentication, database, and storage operations are ready to use. Just follow the steps above to complete the setup!
