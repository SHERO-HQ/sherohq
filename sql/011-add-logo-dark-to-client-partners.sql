-- 011-add-logo-dark-to-client-partners.sql
-- Add logo_dark column to client_partners table for dark mode logo variant

ALTER TABLE client_partners ADD COLUMN IF NOT EXISTS logo_dark text;
