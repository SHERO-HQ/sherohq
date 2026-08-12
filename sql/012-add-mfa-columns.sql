-- Migration 012: Add MFA columns to admin_users and users tables
-- Resolves relational query errors in authentication routes
-- Idempotency: Uses ADD COLUMN IF NOT EXISTS

ALTER TABLE public.admin_users 
  ADD COLUMN IF NOT EXISTS "mfaRecoveryCodes" JSONB;

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS "mfaEnabled" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "mfaSecret" TEXT,
  ADD COLUMN IF NOT EXISTS "mfaRecoveryCodes" JSONB;
