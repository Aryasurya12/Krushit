-- =====================================================
-- AgriTech PWA - Supabase Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- =====================================================
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  region TEXT,
  language TEXT DEFAULT 'hi',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Trigger to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone, region, language)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'region',
    COALESCE(NEW.raw_user_meta_data->>'language', 'hi')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. CROPS TABLE
-- =====================================================
CREATE TABLE public.crops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  variety TEXT,
  area DECIMAL(10, 2), -- in acres
  sown_date DATE,
  expected_harvest_date DATE,
  current_stage TEXT CHECK (current_stage IN ('planning', 'vegetative', 'flowering', 'ripening', 'harvested')),
  health_status TEXT CHECK (health_status IN ('healthy', 'warning', 'danger')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own crops" ON public.crops
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own crops" ON public.crops
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own crops" ON public.crops
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own crops" ON public.crops
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 3. DISEASE SCANS TABLE
-- =====================================================
CREATE TABLE public.disease_scans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  disease_detected TEXT,
  confidence DECIMAL(5, 2), -- percentage
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  treatment TEXT,
  prevention TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.disease_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scans" ON public.disease_scans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans" ON public.disease_scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans" ON public.disease_scans
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 4. IOT SENSORS TABLE
-- =====================================================
CREATE TABLE public.iot_sensors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
  sensor_type TEXT CHECK (sensor_type IN ('soil_moisture', 'soil_temperature', 'soil_ph', 'npk', 'air_temperature', 'humidity')),
  value DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.iot_sensors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sensor data" ON public.iot_sensors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sensor data" ON public.iot_sensors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 5. RECOMMENDATIONS TABLE
-- =====================================================
CREATE TABLE public.recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('water', 'fertilizer', 'pest', 'disease', 'harvest', 'general')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations" ON public.recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations" ON public.recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations" ON public.recommendations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations" ON public.recommendations
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 6. WEATHER DATA TABLE (cached from API)
-- =====================================================
CREATE TABLE public.weather_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  region TEXT NOT NULL,
  temperature DECIMAL(5, 2),
  feels_like DECIMAL(5, 2),
  humidity INTEGER,
  wind_speed DECIMAL(5, 2),
  uv_index INTEGER,
  condition TEXT,
  forecast JSONB, -- 7-day forecast
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(region, created_at)
);

-- Public read access for weather data
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view weather data" ON public.weather_data
  FOR SELECT TO authenticated USING (true);

-- =====================================================
-- 7. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('disease', 'weather', 'irrigation', 'harvest', 'general')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES for Performance
-- =====================================================
CREATE INDEX idx_crops_user_id ON public.crops(user_id);
CREATE INDEX idx_disease_scans_user_id ON public.disease_scans(user_id);
CREATE INDEX idx_disease_scans_crop_id ON public.disease_scans(crop_id);
CREATE INDEX idx_iot_sensors_user_id ON public.iot_sensors(user_id);
CREATE INDEX idx_iot_sensors_crop_id ON public.iot_sensors(crop_id);
CREATE INDEX idx_iot_sensors_timestamp ON public.iot_sensors(timestamp DESC);
CREATE INDEX idx_recommendations_user_id ON public.recommendations(user_id);
CREATE INDEX idx_recommendations_crop_id ON public.recommendations(crop_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON public.crops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORAGE BUCKETS (for images)
-- =====================================================
-- Run these in Supabase Dashboard > Storage

-- CREATE BUCKET crop_images (public: true)
-- CREATE BUCKET disease_scans (public: true)
-- CREATE BUCKET user_avatars (public: true)

-- Storage policies will be created in Supabase Dashboard
