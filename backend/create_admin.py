import requests, json

SUPABASE_URL = 'https://hzukzpxelruvdmporrak.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dWt6cHhlbHJ1dmRtcG9ycmFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTc2MDkyOCwiZXhwIjoyMDk1MzM2OTI4fQ.nIQbtlsjgY45EXbZUTHuL0cjIPpwdzrT8bT0bGbm1EI'

HEADERS = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type': 'application/json',
}

# Step 1: Create auth user via Admin API
print("Creating auth user...")
res = requests.post(
    f'{SUPABASE_URL}/auth/v1/admin/users',
    headers=HEADERS,
    json={
        'email': 'soumyaofficial2004@gmail.com',
        'password': 'ARABINDA123',
        'email_confirm': True,
        'user_metadata': {'name': 'Soumya Barddhan Panda'}
    }
)
print("Status:", res.status_code)
data = res.json()
print(json.dumps(data, indent=2))

user_id = data.get('id')
if not user_id:
    print("Failed to create user")
    exit(1)

print(f"\nAuth user created: {user_id}")

# Step 2: Insert/update public.users
print("\nInserting into public.users...")
res2 = requests.post(
    f'{SUPABASE_URL}/rest/v1/users',
    headers={**HEADERS, 'Prefer': 'resolution=merge-duplicates'},
    json={
        'id': user_id,
        'email': 'soumyaofficial2004@gmail.com',
        'name': 'Soumya Barddhan Panda',
        'role': 'admin',
        'status': 'active',
        'phone': '',
        'wallet_balance': 0,
        'referral_wallet_balance': 0,
    }
)
print("Status:", res2.status_code)
print(res2.text)
print("\nDone! Try logging in now.")
