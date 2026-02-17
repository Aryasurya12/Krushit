# 📋 Mock Data → Supabase Migration Checklist

## Overview

This checklist helps you replace all mock/hardcoded data with real Supabase database queries.

---

## ✅ Step-by-Step Migration

### 1. **Dashboard Page** (`/app/dashboard/page.tsx`)

**Current:** Mock data for summary cards

**Replace with:**
```typescript
import { cropsApi, iotSensorsApi, recommendationsApi } from '@/lib/api';
import { useEffect, useState } from 'react';

// Inside component:
const [crops, setCrops] = useState([]);
const [sensors, setSensors] = useState([]);
const [recommendations, setRecommendations] = useState([]);

useEffect(() => {
  async function fetchData() {
    const [cropsData, sensorsData, recsData] = await Promise.all([
      cropsApi.getAll(),
      iotSensorsApi.getLatest(),
      recommendationsApi.getActive(),
    ]);
    setCrops(cropsData);
    setSensors(sensorsData);
    setRecommendations(recsData);
  }
  fetchData();
}, []);
```

**Status:** ⏳ Pending

---

### 2. **Crops Page** (`/app/crops/page.tsx`)

**Current:** Hardcoded crops array

**Replace with:**
```typescript
import { cropsApi } from '@/lib/api';
import { useEffect, useState } from 'react';

const [crops, setCrops] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchCrops() {
    try {
      const data = await cropsApi.getAll();
      setCrops(data);
    } catch (error) {
      console.error('Error fetching crops:', error);
    } finally {
      setLoading(false);
    }
  }
  fetchCrops();
}, []);

// Add crop function
const handleAddCrop = async (cropData) => {
  try {
    const newCrop = await cropsApi.create(cropData);
    setCrops([newCrop, ...crops]);
  } catch (error) {
    console.error('Error adding crop:', error);
  }
};
```

**Status:** ⏳ Pending

---

### 3. **Disease/Scan Page** (`/app/disease/page.tsx`)

**Current:** Simulated AI analysis

**Replace with:**
```typescript
import { diseaseScansApi } from '@/lib/api';
import { useState } from 'react';

const [uploading, setUploading] = useState(false);

const handleImageUpload = async (file: File) => {
  try {
    setUploading(true);
    
    // Upload image to Supabase Storage
    const imageUrl = await diseaseScansApi.uploadImage(file);
    
    // TODO: Call your AI API here to analyze the image
    // const aiResult = await analyzeImage(imageUrl);
    
    // For now, create scan with mock AI result
    const scan = await diseaseScansApi.create({
      crop_id: selectedCropId, // from state
      image_url: imageUrl,
      disease_detected: 'Leaf Rust', // from AI
      confidence: 92, // from AI
      severity: 'medium', // from AI
      treatment: 'Apply fungicide', // from AI
    });
    
    setResult(scan);
  } catch (error) {
    console.error('Error uploading scan:', error);
  } finally {
    setUploading(false);
  }
};

// Fetch recent scans
useEffect(() => {
  async function fetchScans() {
    const scans = await diseaseScansApi.getAll();
    setRecentScans(scans);
  }
  fetchScans();
}, []);
```

**Status:** ⏳ Pending

---

### 4. **IoT/Water Advice Page** (`/app/iot/page.tsx`)

**Current:** Hardcoded sensor values

**Replace with:**
```typescript
import { iotSensorsApi } from '@/lib/api';
import { useEffect, useState } from 'react';

const [sensorData, setSensorData] = useState({
  soilMoisture: null,
  soilTemp: null,
  soilPH: null,
  npk: null,
  airTemp: null,
  humidity: null,
});

useEffect(() => {
  async function fetchSensorData() {
    try {
      const [moisture, temp, ph, npk, airTemp, humidity] = await Promise.all([
        iotSensorsApi.getByType('soil_moisture', selectedCropId),
        iotSensorsApi.getByType('soil_temperature', selectedCropId),
        iotSensorsApi.getByType('soil_ph', selectedCropId),
        iotSensorsApi.getByType('npk', selectedCropId),
        iotSensorsApi.getByType('air_temperature', selectedCropId),
        iotSensorsApi.getByType('humidity', selectedCropId),
      ]);

      setSensorData({
        soilMoisture: moisture[0]?.value || 0,
        soilTemp: temp[0]?.value || 0,
        soilPH: ph[0]?.value || 0,
        npk: npk[0]?.value || 0,
        airTemp: airTemp[0]?.value || 0,
        humidity: humidity[0]?.value || 0,
      });
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  }
  fetchSensorData();
  
  // Refresh every 30 seconds
  const interval = setInterval(fetchSensorData, 30000);
  return () => clearInterval(interval);
}, [selectedCropId]);
```

**Status:** ⏳ Pending

---

### 5. **Weather Page** (`/app/weather/page.tsx`)

**Current:** Hardcoded weather data

**Replace with:**
```typescript
// Option 1: Use external weather API (OpenWeatherMap, WeatherAPI, etc.)
const fetchWeather = async (region: string) => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${region}&appid=YOUR_API_KEY`
  );
  const data = await response.json();
  return data;
};

// Option 2: Cache weather data in Supabase
const { data, error } = await supabase
  .from('weather_data')
  .select('*')
  .eq('region', userRegion)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();
```

**Status:** ⏳ Pending

---

### 6. **Recommendations/Farm Health Page** (`/app/recommendations/page.tsx`)

**Current:** Hardcoded recommendations

**Replace with:**
```typescript
import { recommendationsApi } from '@/lib/api';
import { useEffect, useState } from 'react';

const [recommendations, setRecommendations] = useState([]);
const [filter, setFilter] = useState('all');

useEffect(() => {
  async function fetchRecommendations() {
    try {
      const data = await recommendationsApi.getAll(filter);
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  }
  fetchRecommendations();
}, [filter]);

// Mark recommendation as completed
const handleComplete = async (id: string) => {
  try {
    await recommendationsApi.markCompleted(id);
    setRecommendations(recommendations.map(rec => 
      rec.id === id ? { ...rec, is_completed: true } : rec
    ));
  } catch (error) {
    console.error('Error completing recommendation:', error);
  }
};
```

**Status:** ⏳ Pending

---

### 7. **Settings Page** (`/app/settings/page.tsx`)

**Current:** No data persistence

**Replace with:**
```typescript
import { userApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

const { user } = useAuth();
const [profile, setProfile] = useState(null);

useEffect(() => {
  async function fetchProfile() {
    try {
      const data = await userApi.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }
  fetchProfile();
}, []);

const handleSave = async (formData) => {
  try {
    const updated = await userApi.updateProfile({
      full_name: formData.fullName,
      phone: formData.phone,
      region: formData.region,
      language: formData.language,
    });
    setProfile(updated);
    alert('Profile updated!');
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};
```

**Status:** ⏳ Pending

---

## 🔄 Real-time Updates (Optional)

Add real-time subscriptions for live data updates:

### Example: Real-time IoT Sensor Updates

```typescript
import { supabase } from '@/lib/supabase';

useEffect(() => {
  // Subscribe to new sensor readings
  const subscription = supabase
    .channel('iot_sensors')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'iot_sensors',
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        console.log('New sensor reading:', payload.new);
        // Update state with new reading
        setSensorData(prev => [...prev, payload.new]);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [user]);
```

---

## 📝 Testing Checklist

After each migration, test:

- [ ] **Data loads correctly** on page load
- [ ] **Loading states** show while fetching
- [ ] **Error handling** works (try disconnecting internet)
- [ ] **Create operations** work (add new items)
- [ ] **Update operations** work (edit items)
- [ ] **Delete operations** work (remove items)
- [ ] **Filters work** (if applicable)
- [ ] **Pagination works** (if applicable)
- [ ] **Real-time updates** work (if implemented)

---

## 🎯 Priority Order

Recommended migration order:

1. **Settings Page** (easiest, good for testing)
2. **Crops Page** (core functionality)
3. **Dashboard Page** (depends on crops)
4. **Recommendations Page** (important for farmers)
5. **IoT/Water Advice Page** (sensor integration)
6. **Disease/Scan Page** (requires AI integration)
7. **Weather Page** (requires external API)

---

## 🚨 Common Issues & Solutions

### Issue: "Not authenticated" error
**Solution:** Make sure user is logged in. Add auth check:
```typescript
const { user } = useAuth();
if (!user) return <div>Please log in</div>;
```

### Issue: "Row Level Security policy violation"
**Solution:** Check RLS policies in Supabase Dashboard. Make sure user_id matches.

### Issue: Data not updating after create/update
**Solution:** Refresh data after mutation:
```typescript
await cropsApi.create(data);
const updated = await cropsApi.getAll();
setCrops(updated);
```

### Issue: Images not uploading
**Solution:** Check storage bucket exists and policies are set up.

---

## 📊 Progress Tracker

| Page | Mock Data | Supabase | Status |
|------|-----------|----------|--------|
| Dashboard | ✅ | ⏳ | Not Started |
| Crops | ✅ | ⏳ | Not Started |
| Disease/Scan | ✅ | ⏳ | Not Started |
| IoT/Water | ✅ | ⏳ | Not Started |
| Weather | ✅ | ⏳ | Not Started |
| Recommendations | ✅ | ⏳ | Not Started |
| Settings | ⏳ | ⏳ | Not Started |

**Legend:**
- ✅ Complete
- ⏳ Pending
- 🚧 In Progress
- ❌ Blocked

---

## 🎊 When You're Done

After migrating all pages:

1. **Test entire app** with real user flow
2. **Remove all mock data** from codebase
3. **Update documentation** with new data flow
4. **Deploy to production** with confidence!

---

**Your AgriTech PWA will be fully powered by Supabase!** 🚀
