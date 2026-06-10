import requests
import json
import sys

# Test the backend login endpoint
test_data = {
    'email': 'soumyaofficial2004@gmail.com',
    'password': 'ARABINDA123'
}

print("Testing backend login endpoint...")
print(f"Email: {test_data['email']}")
print(f"URL: http://localhost:8000/api/auth/login")

try:
    response = requests.post('http://localhost:8000/api/auth/login', 
                           json=test_data, 
                           headers={'Content-Type': 'application/json'},
                           timeout=5)
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Success! Token received: {data.get('access_token', '')[:50]}...")
    elif response.status_code == 401:
        print(f"Unauthorized: {response.text}")
    elif response.status_code >= 500:
        print(f"Server Error: {response.text}")
    else:
        print(f"Unexpected response: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("ERROR: Could not connect to backend. Is it running?")
    print("Start backend with: cd backend && run.bat")
except requests.exceptions.Timeout:
    print("ERROR: Request timed out")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {str(e)}")

print("\nAlso testing health endpoint:")
try:
    health_response = requests.get('http://localhost:8000/health', timeout=5)
    print(f"Health Status: {health_response.status_code} - {health_response.text}")
except Exception as e:
    print(f"Health check failed: {e}")