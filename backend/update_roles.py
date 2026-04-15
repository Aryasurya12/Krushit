import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Update trisha@krushit.com to admin
try:
    print("Updating trisha@krushit.com to farmer...")
    # Find user id first
    res = supabase.table("users").select("id").eq("email", "trisha@krushit.com").single().execute()
    if res.data:
        uid = res.data['id']
        supabase.table("users").update({"role": "farmer"}).eq("id", uid).execute()
        print(f"Updated {uid} to farmer")
    
    print("Updating admin@krushit.com to admin...")
    res = supabase.table("users").select("id").eq("email", "admin@krushit.com").single().execute()
    if res.data:
        uid = res.data['id']
        supabase.table("users").update({"role": "admin"}).eq("id", uid).execute()
        print(f"Updated {uid} to admin")

except Exception as e:
    print(f"Update failed: {e}")
