-- =====================================================
-- AgriTech PWA - Dummy Data Set (Demo & Test)
-- =====================================================

-- 1. CLEANUP (Optional: Remove existing dummy data to avoid duplicates)
-- DELETE FROM public.users WHERE id = 'demo-user-123';

-- 2. CREATE DEMO USER PROFILE
-- This matches the ID used in AuthContext.tsx for the 'Demo Mode'
INSERT INTO public.users (id, email, full_name, phone, region, language)
VALUES (
    'demo-user-123', 
    'demo@agritech.com',
    'Demo Farmer (Patil)',
    '+91 98765 43210',
    'Pune, Maharashtra',
    'hi'
) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    region = EXCLUDED.region,
    language = EXCLUDED.language;

-- 3. DUMMY CROPS FOR DEMO USER
INSERT INTO public.crops (id, user_id, name, variety, area, sown_date, expected_harvest_date, current_stage, health_status)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'demo-user-123', 'Soybean', 'JS 335', 5.5, CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE + INTERVAL '60 days', 'vegetative', 'healthy'),
    ('c2222222-2222-2222-2222-222222222222', 'demo-user-123', 'Cotton', 'BT Cotton', 3.0, CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '120 days', 'vegetative', 'warning'),
    ('c3333333-3333-3333-3333-333333333333', 'demo-user-123', 'Wheat', 'Lokwan', 2.0, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '90 days', 'planning', 'healthy')
ON CONFLICT (id) DO NOTHING;

-- 4. DUMMY IOT SENSOR DATA
INSERT INTO public.iot_sensors (user_id, crop_id, sensor_type, value, unit)
VALUES 
    ('demo-user-123', 'c1111111-1111-1111-1111-111111111111', 'soil_moisture', 38.4, '%'),
    ('demo-user-123', 'c1111111-1111-1111-1111-111111111111', 'soil_temperature', 26.5, '°C'),
    ('demo-user-123', 'c1111111-1111-1111-1111-111111111111', 'air_temperature', 29.2, '°C'),
    ('demo-user-123', 'c1111111-1111-1111-1111-111111111111', 'humidity', 62.0, '%'),
    ('demo-user-123', 'c2222222-2222-2222-2222-222222222222', 'soil_moisture', 22.1, '%'),
    ('demo-user-123', 'c2222222-2222-2222-2222-222222222222', 'soil_ph', 6.8, 'pH');

-- 5. DUMMY DISEASE SCANS
INSERT INTO public.disease_scans (user_id, crop_id, image_url, disease_detected, confidence, severity, treatment, prevention)
VALUES 
    ('demo-user-123', 'c1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1599839620453-9ef210550d2d', 'Soybean Rust', 92.5, 'medium', 'Apply Triazole fungicide', 'Rotate crops and use resistant varieties'),
    ('demo-user-123', 'c2222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1596755094514-f87e34085b3c', 'Spotted Bollworm', 85.0, 'high', 'Use Neem oil or chemical spray', 'Pheromone traps');

-- 6. DUMMY RECOMMENDATIONS
INSERT INTO public.recommendations (user_id, crop_id, type, priority, title, description, action)
VALUES 
    ('demo-user-123', 'c1111111-1111-1111-1111-111111111111', 'water', 'high', 'Watering Required', 'Soil moisture in Soybean field is low (38%). Irrigation starting soon.', 'Check Pump'),
    ('demo-user-123', 'c2222222-2222-2222-2222-222222222222', 'pest', 'medium', 'Pest Observation', 'Unusual insect activity in Cotton field. Inspect today.', 'View Guide'),
    ('demo-user-123', NULL, 'general', 'low', 'Seed Subsidy Available', 'Apply for the new government seed subsidy before next Friday.', 'Apply Now');

-- 7. DUMMY NOTIFICATIONS
INSERT INTO public.notifications (user_id, type, title, message)
VALUES 
    ('demo-user-123', 'disease', 'Disease Detected', 'Your recent Soybean scan confirms Soybean Rust (Medium Severity).'),
    ('demo-user-123', 'weather', 'Rain Likely', 'Light rain expected today. Fertilizer application may be postponed.'),
    ('demo-user-123', 'irrigation', 'Irrigation Complete', 'Planned irrigation for Plot B cycle finished successfully.');

-- 8. GLOBAL WEATHER DATA
INSERT INTO public.weather_data (region, temperature, feels_like, humidity, wind_speed, uv_index, condition, forecast)
VALUES 
    ('Pune, Maharashtra', 31.0, 33.5, 55, 10, 7, 'Sunny', '{"daily": [{"temp": 31, "condition": "Sunny"}]}')
ON CONFLICT (region, created_at) DO NOTHING;
