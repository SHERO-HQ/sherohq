#!/bin/bash

# 1. Login
echo "Logging in..."
LOGIN_RES=$(curl -v -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' http://localhost:5000/api/admin/login)
echo "Login Response: $LOGIN_RES"

TOKEN=$(echo $LOGIN_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get token"
  exit 1
fi

echo "Token: $TOKEN"

# 2. Fetch Orders
echo "Fetching Orders..."
curl -v -H "Authorization: Bearer $TOKEN" "http://localhost:5000/api/orders?limit=100"
