-- =====================================================
-- AgriTech Admin - Supabase Database Extensions
-- =====================================================

-- 1. Update Users Table to include is_admin
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Create IoT Devices Table for Monitoring
CREATE TABLE IF NOT EXISTS public.iot_devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  farm_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('online', 'offline', 'maintenance')) DEFAULT 'online',
  battery INTEGER DEFAULT 100,
  connectivity TEXT DEFAULT 'Stable',
  model TEXT DEFAULT 'KT-100 Series',
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for iot_devices
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;

-- Admins can view everything
CREATE POLICY "Admins can view all iot devices" ON public.iot_devices
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

-- 3. Create Complaints Table
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  farmer_name TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'resolved')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Admins can view/update all complaints
CREATE POLICY "Admins can view all complaints" ON public.complaints
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update all complaints" ON public.complaints
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );

-- Farmers can view/insert their own complaints
CREATE POLICY "Farmers can view own complaints" ON public.complaints
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Farmers can insert own complaints" ON public.complaints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- SEED DATA for Admin (Optional)
-- =====================================================
-- UPDATE public.users SET is_admin = true WHERE email = 'your-admin@email.com';
