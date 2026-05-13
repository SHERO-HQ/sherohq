#!/bin/bash
# Script to test WhatsApp template sending
# Usage: ./scripts/test-whatsapp-template.sh "+233XXXXXXXXX"

set -e

if [ -z "$1" ]; then
  echo "Usage: ./scripts/test-whatsapp-template.sh <phone>"
  echo "Example: ./scripts/test-whatsapp-template.sh '+233548711582'"
  exit 1
fi

RECIPIENT_PHONE="$1"

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

PHONE_NUMBER_ID="${WHATSAPP_PHONE_NUMBER_ID}"
ACCESS_TOKEN="${WHATSAPP_ACCESS_TOKEN}"
API_VERSION="v20.0"

if [ -z "$PHONE_NUMBER_ID" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Error: WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN must be set in .env.local"
  exit 1
fi

BASE_URL="https://graph.instagram.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages"

echo "📲 Sending test WhatsApp message to $RECIPIENT_PHONE..."
echo ""

RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"messaging_product\": \"whatsapp\",
    \"to\": \"$RECIPIENT_PHONE\",
    \"type\": \"template\",
    \"template\": {
      \"name\": \"verification_code\",
      \"language\": {
        \"code\": \"en\"
      },
      \"components\": [
        {
          \"type\": \"body\",
          \"parameters\": [
            {
              \"type\": \"text\",
              \"text\": \"123456\"
            }
          ]
        }
      ]
    }
  }")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
if echo "$RESPONSE" | grep -q '"messages"'; then
  echo "✅ Message sent successfully!"
else
  echo "❌ Failed to send message"
fi
