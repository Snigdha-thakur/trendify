import requests, json

SUPABASE_URL = 'https://hzukzpxelruvdmporrak.supabase.co'
ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dWt6cHhlbHJ1dmRtcG9ycmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NjA5MjgsImV4cCI6MjA5NTMzNjkyOH0.9EQ7E6LKZc1lceSuy1h-jEX0QVkFifeBVjHqyHEAF3M'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dWt6cHhlbHJ1dmRtcG9ycmFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTc2MDkyOCwiZXhwIjoyMDk1MzM2OTI4fQ.nIQbtlsjgY45EXbZUTHuL0cjIPpwdzrT8bT0bGbm1EI'

# Test login
print("=== Testing login ===")
res = requests.post(
    f'{SUPABASE_URL}/auth/v1/token?grant_type=password',
    headers={'apikey': ANON_KEY, 'Content-Type': 'application/json'},
    json={'email': 'soumyaofficial2004@gmail.com', 'password': 'ARABINDA123'}
)
print("Status:", res.status_code)
print(json.dumps(res.json(), indent=2))

# Check auth user exists
print("\n=== Checking auth.users via admin API ===")
res2 = requests.get(
    f'{SUPABASE_URL}/auth/v1/admin/users',
    headers={'apikey': SERVICE_KEY, 'Authorization': f'Bearer {SERVICE_KEY}'}
)
print("Status:", res2.status_code)
data = res2.json()
for u in data.get('users', []):
    if 'soumya' in u.get('email','').lower():
        print("Found user:", json.dumps(u, indent=2))
