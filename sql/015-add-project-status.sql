-- Migration 015: projects can be marked as in development
-- Additive and idempotent: existing rows become 'live', nothing is deleted.

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'live';
