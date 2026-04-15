import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print(f"URL: {SUPABASE_URL}")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Missing Supabase credentials")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    print("Fetching users...")
    # This might fail if RLS prevents listing 'users', but let's try
    res = supabase.table("users").select("id, email, role").limit(5).execute()
    print("Users found:", res.data)
except Exception as e:
    print(f"Error: {e}")
