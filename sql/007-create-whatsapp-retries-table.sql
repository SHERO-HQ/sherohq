-- Create table for tracking WhatsApp message retries
CREATE TABLE IF NOT EXISTS whatsapp_message_retries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id VARCHAR NOT NULL UNIQUE,
  campaign_id UUID NOT NULL REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
  recipient_phone VARCHAR NOT NULL,
  content TEXT,
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  status VARCHAR DEFAULT 'pending', -- 'pending', 'completed', 'cancelled', 'failed'
  next_retry_at TIMESTAMP,
  last_error TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_whatsapp_message_retries_status 
  ON whatsapp_message_retries(status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_message_retries_next_retry_at 
  ON whatsapp_message_retries(next_retry_at);

CREATE INDEX IF NOT EXISTS idx_whatsapp_message_retries_campaign_id 
  ON whatsapp_message_retries(campaign_id);

-- Add whatsapp_message_id column to consultations table if it doesn't exist
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS whatsapp_message_id VARCHAR,
ADD COLUMN IF NOT EXISTS priority VARCHAR DEFAULT 'medium';

-- Add index for whatsapp message tracking
CREATE INDEX IF NOT EXISTS idx_consultations_whatsapp_message_id 
  ON consultations(whatsapp_message_id);
