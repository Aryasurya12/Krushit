
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './agritech-app/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
    console.log("Testing Supabase Connection...");
    console.log("URL:", supabaseUrl);
    
    // Attempt to fetch public data to verify connection
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, email, role')
        .limit(5);

    if (userError) {
        console.error("Error fetching users (might be RLS):", userError.message);
    } else {
        console.log("Fetched users successfully:", users);
    }

    // Try a dummy login
    console.log("\nAttempting dummy login (expect failure)...");
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: "nonexistent@test.com",
        password: "wrongpassword"
    });
    
    console.log("Login Outcome:", loginError ? loginError.message : "Success?");
}

testAuth();
