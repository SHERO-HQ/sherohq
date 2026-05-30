-- Create WhatsApp messages table for storing incoming messages and delivery status
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id VARCHAR PRIMARY KEY,                    -- WhatsApp message ID from Meta
  campaign_id UUID,                          -- Foreign key to newsletter_campaigns (nullable for customer-initiated)
  phone_number_id VARCHAR NOT NULL,          -- Our WhatsApp phone number ID
  sender_wa_id VARCHAR NOT NULL,             -- Customer's WhatsApp ID
  message_type VARCHAR NOT NULL,             -- 'text', 'image', 'document', 'audio', 'video', etc.
  content TEXT,                              -- Message body (for text messages)
  status VARCHAR NOT NULL DEFAULT 'received', -- 'received', 'sent', 'delivered', 'read', 'failed'
  direction VARCHAR NOT NULL,                -- 'inbound' or 'outbound'
  error_code VARCHAR,                        -- WhatsApp error code (if failed)
  error_message TEXT,                        -- Error details (if failed)
  metadata JSONB,                            -- Additional WhatsApp metadata
  processed_at TIMESTAMP,                    -- When we processed it
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_campaign_id 
  ON whatsapp_messages(campaign_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_sender_wa_id 
  ON whatsapp_messages(sender_wa_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status 
  ON whatsapp_messages(status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_direction 
  ON whatsapp_messages(direction);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at 
  ON whatsapp_messages(created_at DESC);

-- Update newsletter_campaigns table to add WhatsApp delivery tracking
-- (these columns already exist, this is just for reference)
-- ALTER TABLE newsletter_campaigns ADD COLUMN IF NOT EXISTS whatsapp_delivery_status VARCHAR;
