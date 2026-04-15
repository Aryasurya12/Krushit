
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dyeeyrgeerhilwhmbgpw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5ZWV5cmdlZXJoaWx3aG1iZ3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzQwNzMsImV4cCI6MjA4NjY1MDA3M30.Z91x-15srKN0AE6FxEGew_41vhDxYMa84htUI2DWi5U';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listUsers() {
    const { data: users, error } = await supabase
        .from('users')
        .select('id, email, full_name, role');
    
    if (error) {
        console.error('Error fetching users:', error);
        return;
    }
    
    console.log('--- Users in public.users ---');
    console.table(users);
}

listUsers();
