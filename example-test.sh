#!/bin/bash

# Script de ejemplo para probar el servidor de webhooks directamente
# (sin usar Claude)

BASE_URL="http://localhost:3456"
TEST_ID="manual-test-$(date +%s)"

echo "==================================="
echo "Testing MCP Webhook Server"
echo "==================================="
echo ""
echo "Test ID: $TEST_ID"
echo "Webhook URL: $BASE_URL/webhook/$TEST_ID"
echo ""

# 1. Check health
echo "1. Checking server health..."
curl -s "$BASE_URL/health" | jq '.'
echo ""

# 2. Get webhook URL
echo "2. Getting webhook URL..."
curl -s "$BASE_URL/webhook-url/$TEST_ID" | jq '.'
echo ""

# 3. Simulate webhook arrival (wait 2 seconds)
echo "3. Simulating webhook arrival in 2 seconds..."
sleep 2

curl -X POST "$BASE_URL/webhook/$TEST_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "record_id": "12345",
    "record_type": "customrecord_tacl_travel",
    "status": "processed",
    "data": {
      "traveler": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  }' | jq '.'

echo ""
echo "==================================="
echo "Test completed!"
echo "==================================="
