import { createClient } from '@supabase/supabase-js';

// Use fallback values if env variables are not set (for development)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dyeeyrgeerhilwhmbgpw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5ZWV5cmdlZXJoaWx3aG1iZ3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzQwNzMsImV4cCI6MjA4NjY1MDA3M30.Z91x-15srKN0AE6FxEGew_41vhDxYMa84htUI2DWi5U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});

// Database types will be auto-generated from Supabase
export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string;
                    phone: string;
                    region: string;
                    language: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['users']['Insert']>;
            };
            crops: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    variety: string;
                    area: number;
                    sown_date: string;
                    expected_harvest_date: string;
                    current_stage: string;
                    health_status: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['crops']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['crops']['Insert']>;
            };
            disease_scans: {
                Row: {
                    id: string;
                    user_id: string;
                    crop_id: string;
                    image_url: string;
                    disease_detected: string;
                    confidence: number;
                    severity: string;
                    treatment: string;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['disease_scans']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['disease_scans']['Insert']>;
            };
            iot_sensors: {
                Row: {
                    id: string;
                    user_id: string;
                    crop_id: string;
                    sensor_type: string;
                    value: number;
                    unit: string;
                    timestamp: string;
                };
                Insert: Omit<Database['public']['Tables']['iot_sensors']['Row'], 'id'>;
                Update: Partial<Database['public']['Tables']['iot_sensors']['Insert']>;
            };
            recommendations: {
                Row: {
                    id: string;
                    user_id: string;
                    crop_id: string;
                    type: string;
                    priority: string;
                    title: string;
                    description: string;
                    action: string;
                    created_at: string;
                    is_completed: boolean;
                };
                Insert: Omit<Database['public']['Tables']['recommendations']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['recommendations']['Insert']>;
            };
        };
    };
};
