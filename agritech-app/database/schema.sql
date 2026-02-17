-- AgriTech Database Schema
-- PostgreSQL/MySQL Compatible

-- Farmers Table
CREATE TABLE farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    language VARCHAR(10) DEFAULT 'en',
    region VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farms Table
CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_address TEXT,
    farm_size DECIMAL(10, 2),
    farm_size_unit VARCHAR(20) DEFAULT 'acre',
    soil_type VARCHAR(100),
    irrigation_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crops Table
CREATE TABLE crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    crop_type VARCHAR(100) NOT NULL,
    crop_variety VARCHAR(100),
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE,
    current_stage VARCHAR(50),
    stage_progress INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Growth Stages Table
CREATE TABLE growth_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
    stage_name VARCHAR(100) NOT NULL,
    stage_order INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    expected_duration_days INTEGER,
    guidance JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disease Scans Table
CREATE TABLE disease_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
    image_url TEXT,
    image_local_path TEXT,
    scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    disease_detected VARCHAR(255),
    confidence_score DECIMAL(5, 2),
    severity VARCHAR(50),
    treatment_advice TEXT,
    fertilizer_recommendation TEXT,
    irrigation_recommendation TEXT,
    synced BOOLEAN DEFAULT FALSE,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weather Logs Table
CREATE TABLE weather_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    temperature DECIMAL(5, 2),
    humidity DECIMAL(5, 2),
    rainfall DECIMAL(5, 2),
    wind_speed DECIMAL(5, 2),
    weather_condition VARCHAR(100),
    forecast_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- IoT Sensor Logs Table
CREATE TABLE sensor_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    sensor_type VARCHAR(100) NOT NULL,
    sensor_value DECIMAL(10, 2),
    unit VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Sensor Mapping Table
CREATE TABLE sensor_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    sensor_id VARCHAR(255) UNIQUE NOT NULL,
    sensor_type VARCHAR(100) NOT NULL,
    sensor_name VARCHAR(255),
    api_endpoint TEXT,
    mqtt_topic VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Advisory History Table
CREATE TABLE advisory_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
    advisory_type VARCHAR(100) NOT NULL,
    advisory_text TEXT NOT NULL,
    reasoning TEXT,
    priority VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community Disease Records Table
CREATE TABLE community_disease_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disease_name VARCHAR(255) NOT NULL,
    crop_type VARCHAR(100) NOT NULL,
    location_lat DECIMAL(10, 8) NOT NULL,
    location_lng DECIMAL(11, 8) NOT NULL,
    region VARCHAR(100),
    severity VARCHAR(50),
    reported_date DATE NOT NULL,
    is_anonymous BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Irrigation Decisions Table
CREATE TABLE irrigation_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID REFERENCES crops(id) ON DELETE CASCADE,
    decision_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    irrigation_score INTEGER,
    recommendation TEXT,
    factors JSONB,
    action_taken VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voice Interactions Table
CREATE TABLE voice_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES farmers(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    language VARCHAR(10),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_farms_farmer ON farms(farmer_id);
CREATE INDEX idx_crops_farm ON crops(farm_id);
CREATE INDEX idx_disease_scans_crop ON disease_scans(crop_id);
CREATE INDEX idx_weather_logs_farm_date ON weather_logs(farm_id, date);
CREATE INDEX idx_sensor_logs_farm_timestamp ON sensor_logs(farm_id, timestamp);
CREATE INDEX idx_advisory_history_crop ON advisory_history(crop_id);
CREATE INDEX idx_community_disease_location ON community_disease_records(location_lat, location_lng);
