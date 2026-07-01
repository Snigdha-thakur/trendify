import requests, json

SUPABASE_URL = 'https://hzukzpxelruvdmporrak.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dWt6cHhlbHJ1dmRtcG9ycmFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTc2MDkyOCwiZXhwIjoyMDk1MzM2OTI4fQ.nIQbtlsjgY45EXbZUTHuL0cjIPpwdzrT8bT0bGbm1EI'

HEADERS = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type': 'application/json',
}

# Get all auth users and find ours
res = requests.get(f'{SUPABASE_URL}/auth/v1/admin/users?per_page=100', headers=HEADERS)
users = res.json().get('users', [])
print(f"Total auth users: {len(users)}")

user = next((u for u in users if u.get('email') == 'trendifytechnologies@gmail.com'), None)
if not user:
    print("User not found!")
    exit(1)

user_id = user['id']
print(f"Found user: {user_id} | confirmed: {user.get('email_confirmed_at')}")

# Reset password via Admin API
print("\nResetting password...")
res2 = requests.put(
    f'{SUPABASE_URL}/auth/v1/admin/users/{user_id}',
    headers=HEADERS,
    json={'password': 'ARABINDA123', 'email_confirm': True}
)
print("Status:", res2.status_code)
print(res2.text)

# Ensure public.users row exists with admin role
print("\nEnsuring public.users row...")
res3 = requests.post(
    f'{SUPABASE_URL}/rest/v1/users',
    headers={**HEADERS, 'Prefer': 'resolution=merge-duplicates'},
    json={
        'id': user_id,
        'email': 'trendifytechnologies@gmail.com',
        'name': 'Soumya Barddhan Panda',
        'role': 'admin',
        'status': 'active',
        'phone': '',
        'wallet_balance': 0,
        'referral_wallet_balance': 0,
    }
)
print("Status:", res3.status_code, res3.text)
print("\nDone! Try logging in now.")
