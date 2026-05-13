#!/bin/bash
# Script to create WhatsApp templates via Meta Graph API
# Usage: ./scripts/create-whatsapp-template.sh

set -e

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

BASE_URL="https://graph.instagram.com/${API_VERSION}/${PHONE_NUMBER_ID}/message_templates"

# Template 1: Verification Code
echo "📱 Creating verification_code template..."
curl -X POST "$BASE_URL" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "name=verification_code" \
  -F "language=en" \
  -F "category=TRANSACTIONAL" \
  -F "components=[{\"type\":\"BODY\",\"text\":\"Your SHERO verification code is {{1}}. It expires in 30 minutes.\"}]" \
  -w "\nStatus: %{http_code}\n"

echo ""
echo "✅ Template creation submitted!"
echo ""
echo "Next steps:"
echo "1. Check approval status in Meta Business Manager → WhatsApp → Templates"
echo "2. Templates typically take 24-48 hours for approval"
echo "3. After approval, test with: ./scripts/test-whatsapp-template.sh"
echo ""
echo "View all templates:"
echo "curl 'https://graph.instagram.com/${API_VERSION}/${PHONE_NUMBER_ID}/message_templates' \\"
echo "  -H 'Authorization: Bearer $ACCESS_TOKEN'"
