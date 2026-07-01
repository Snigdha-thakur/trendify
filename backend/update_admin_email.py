import requests, json

SUPABASE_URL = 'https://hzukzpxelruvdmporrak.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dWt6cHhlbHJ1dmRtcG9ycmFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTc2MDkyOCwiZXhwIjoyMDk1MzM2OTI4fQ.nIQbtlsjgY45EXbZUTHuL0cjIPpwdzrT8bT0bGbm1EI'

HEADERS = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type': 'application/json',
}

OLD_EMAIL = 'soumyaofficial2004@gmail.com'
NEW_EMAIL = 'trendifytechnologies@gmail.com'

# Step 1: Find the user in auth.users
print("Fetching auth users...")
res = requests.get(f'{SUPABASE_URL}/auth/v1/admin/users?per_page=100', headers=HEADERS)
users = res.json().get('users', [])
print(f"Total auth users: {len(users)}")

user = next((u for u in users if u.get('email') == OLD_EMAIL), None)
if not user:
    print(f"User with {OLD_EMAIL} not found in auth.users!")
    exit(1)

user_id = user['id']
print(f"Found user: {user_id}")

# Step 2: Update email in auth.users
print(f"\nUpdating auth.users email to {NEW_EMAIL}...")
res2 = requests.put(
    f'{SUPABASE_URL}/auth/v1/admin/users/{user_id}',
    headers=HEADERS,
    json={'email': NEW_EMAIL, 'email_confirm': True}
)
print("Status:", res2.status_code)
print(res2.text)

# Step 3: Update email in public.users
print(f"\nUpdating public.users email to {NEW_EMAIL}...")
res3 = requests.patch(
    f'{SUPABASE_URL}/rest/v1/users?id=eq.{user_id}',
    headers=HEADERS,
    json={'email': NEW_EMAIL}
)
print("Status:", res3.status_code)
print(res3.text if res3.text else "OK")

print("\nDone!")
