import { supabase } from './supabase';
import type { Database } from './supabase';

type Crop = Database['public']['Tables']['crops']['Row'];
type CropInsert = Database['public']['Tables']['crops']['Insert'];
type CropUpdate = Database['public']['Tables']['crops']['Update'];

// =====================================================
// CROPS API
// =====================================================

export const cropsApi = {
    // Get all crops for current user
    async getAll() {
        const { data, error } = await supabase
            .from('crops')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Crop[];
    },

    // Get single crop by ID
    async getById(id: string) {
        const { data, error } = await supabase
            .from('crops')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Crop;
    },

    // Create new crop
    async create(crop: CropInsert) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('crops')
            .insert({ ...crop, user_id: user.id })
            .select()
            .single();

        if (error) throw error;
        return data as Crop;
    },

    // Update crop
    async update(id: string, updates: CropUpdate) {
        const { data, error } = await supabase
            .from('crops')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Crop;
    },

    // Delete crop
    async delete(id: string) {
        const { error } = await supabase
            .from('crops')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Get crops by status
    async getByStatus(status: string) {
        const { data, error } = await supabase
            .from('crops')
            .select('*')
            .eq('health_status', status)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Crop[];
    },
};

// =====================================================
// DISEASE SCANS API
// =====================================================

type DiseaseScan = Database['public']['Tables']['disease_scans']['Row'];
type DiseaseScanInsert = Database['public']['Tables']['disease_scans']['Insert'];

export const diseaseScansApi = {
    // Get all scans for current user
    async getAll() {
        const { data, error } = await supabase
            .from('disease_scans')
            .select('*, crops(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get scans for specific crop
    async getByCropId(cropId: string) {
        const { data, error } = await supabase
            .from('disease_scans')
            .select('*')
            .eq('crop_id', cropId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as DiseaseScan[];
    },

    // Create new scan
    async create(scan: DiseaseScanInsert) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('disease_scans')
            .insert({ ...scan, user_id: user.id })
            .select()
            .single();

        if (error) throw error;
        return data as DiseaseScan;
    },

    // Upload image to storage
    async uploadImage(file: File) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error } = await supabase.storage
            .from('disease_scans')
            .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('disease_scans')
            .getPublicUrl(fileName);

        return publicUrl;
    },
};

// =====================================================
// IOT SENSORS API
// =====================================================

type IoTSensor = Database['public']['Tables']['iot_sensors']['Row'];
type IoTSensorInsert = Database['public']['Tables']['iot_sensors']['Insert'];

export const iotSensorsApi = {
    // Get latest sensor readings
    async getLatest(cropId?: string) {
        let query = supabase
            .from('iot_sensors')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(10);

        if (cropId) {
            query = query.eq('crop_id', cropId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as IoTSensor[];
    },

    // Get sensor data by type
    async getByType(sensorType: string, cropId?: string, limit = 50) {
        let query = supabase
            .from('iot_sensors')
            .select('*')
            .eq('sensor_type', sensorType)
            .order('timestamp', { ascending: false })
            .limit(limit);

        if (cropId) {
            query = query.eq('crop_id', cropId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as IoTSensor[];
    },

    // Add sensor reading
    async create(reading: IoTSensorInsert) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('iot_sensors')
            .insert({ ...reading, user_id: user.id })
            .select()
            .single();

        if (error) throw error;
        return data as IoTSensor;
    },
};

// =====================================================
// RECOMMENDATIONS API
// =====================================================

type Recommendation = Database['public']['Tables']['recommendations']['Row'];
type RecommendationInsert = Database['public']['Tables']['recommendations']['Insert'];


export const recommendationsApi = {
    // Get all recommendations
    async getAll(priority?: string) {
        let query = supabase
            .from('recommendations')
            .select('*, crops(*)')
            .order('created_at', { ascending: false });

        if (priority && priority !== 'all') {
            query = query.eq('priority', priority);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    },

    // Get active (not completed) recommendations
    async getActive() {
        const { data, error } = await supabase
            .from('recommendations')
            .select('*, crops(*)')
            .eq('is_completed', false)
            .order('priority', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Create recommendation
    async create(recommendation: RecommendationInsert) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('recommendations')
            .insert({ ...recommendation, user_id: user.id })
            .select()
            .single();

        if (error) throw error;
        return data as Recommendation;
    },

    // Mark as completed
    async markCompleted(id: string) {
        const { data, error } = await supabase
            .from('recommendations')
            .update({ is_completed: true })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Recommendation;
    },

    // Delete recommendation
    async delete(id: string) {
        const { error } = await supabase
            .from('recommendations')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// =====================================================
// USER PROFILE API
// =====================================================

type User = Database['public']['Tables']['users']['Row'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export const userApi = {
    // Get current user profile
    async getProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;
        return data as User;
    },

    // Update profile
    async updateProfile(updates: UserUpdate) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;
        return data as User;
    },
};
