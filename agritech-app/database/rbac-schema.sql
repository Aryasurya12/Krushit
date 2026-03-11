-- =====================================================
-- AgriTech Role-Based Access Control (RBAC) Migration
-- =====================================================

-- 1. Add 'role' column to users table
-- We check if it exists first. Default is 'farmer'.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('farmer', 'admin')) DEFAULT 'farmer';

-- 2. Migrate existing is_admin data to role
UPDATE public.users SET role = 'admin' WHERE is_admin = true;
UPDATE public.users SET role = 'farmer' WHERE is_admin = false OR is_admin IS NULL;

-- 3. Create a dedicated Admin account
-- Note: This requires manual creation in Supabase Auth or using auth.uid() 
-- For the public.users record:
-- INSERT INTO public.users (id, email, full_name, role)
-- VALUES ('<UUID>', 'admin@krushit.com', 'System Admin', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 4. Update Policies to use 'role' instead of 'is_admin'
-- (Updating existing policies from admin-schema.sql)

DROP POLICY IF EXISTS "Admins can view all iot devices" ON public.iot_devices;
CREATE POLICY "Admins can view all iot devices" ON public.iot_devices
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can view all complaints" ON public.complaints;
CREATE POLICY "Admins can view all complaints" ON public.complaints
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update all complaints" ON public.complaints;
CREATE POLICY "Admins can update all complaints" ON public.complaints
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
