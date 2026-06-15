#!/usr/bin/env python3
"""Simple creator flow test script.

Run this while the backend is running at http://localhost:8000.
It verifies:
- Creator registration via /api/auth/register
- Creator login via /api/auth/login
- Creator wallet balance via /api/wallets/balance
- Referral earnings via /api/wallets/referral-earnings
"""

import json
import random
import string
import sys
import requests

BASE_URL = "http://localhost:8000"
REGISTER_URL = f"{BASE_URL}/api/auth/register"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
BALANCE_URL = f"{BASE_URL}/api/wallets/balance"
REFERRAL_EARNINGS_URL = f"{BASE_URL}/api/wallets/referral-earnings"


def random_string(length=8):
    return "".join(random.choice(string.ascii_lowercase + string.digits) for _ in range(length))


def random_email():
    return f"creator_test_{random_string(6)}@example.com"


def request_json(method, url, token=None, payload=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    response = requests.request(method, url, json=payload, headers=headers, timeout=10)
    try:
        data = response.json()
    except ValueError:
        data = response.text

    return response.status_code, data


def fail(message):
    print(f"❌ {message}")
    sys.exit(1)


def main():
    email = random_email()
    password = "Creator123!"
    name = "Creator Test"
    phone = "9999999999"
    role = "creator"

    print("=== Creator Flow Test ===")
    print(f"Registering creator {email}")

    payload = {
        "email": email,
        "password": password,
        "name": name,
        "phone": phone,
        "role": role,
    }

    status, data = request_json("POST", REGISTER_URL, payload=payload)
    if status != 200:
        print(json.dumps(data, indent=2) if isinstance(data, dict) else data)
        fail("Creator registration failed")

    user = data.get("user") if isinstance(data, dict) else None
    if not user:
        fail("Register response did not include user payload")

    print("✅ Registered creator successfully")
    print(f"  id: {user.get('id')}")
    print(f"  email: {user.get('email')}")
    print(f"  role: {user.get('role')}")
    print(f"  referral_code: {user.get('referral_code')}")

    if user.get("role") != "creator":
        fail("Registered user is not marked as creator")

    print("Logging in as creator...")
    status, login_data = request_json("POST", LOGIN_URL, payload={"email": email, "password": password})
    if status != 200:
        print(json.dumps(login_data, indent=2) if isinstance(login_data, dict) else login_data)
        fail("Creator login failed")

    token = login_data.get("access_token")
    if not token:
        fail("Login response did not return access_token")

    print("✅ Creator login succeeded")

    print("Fetching wallet balance...")
    status, balance_data = request_json("GET", BALANCE_URL, token=token)
    if status != 200:
        print(json.dumps(balance_data, indent=2) if isinstance(balance_data, dict) else balance_data)
        fail("Wallet balance request failed")

    print("✅ Wallet balance retrieved")
    print(json.dumps(balance_data, indent=2))

    print("Fetching referral earnings...")
    status, referral_data = request_json("GET", REFERRAL_EARNINGS_URL, token=token)
    if status != 200:
        print(json.dumps(referral_data, indent=2) if isinstance(referral_data, dict) else referral_data)
        fail("Referral earnings request failed")

    print("✅ Referral earnings retrieved")
    print(json.dumps(referral_data, indent=2))
    print("\nAll creator flow checks passed.")


if __name__ == "__main__":
    main()
