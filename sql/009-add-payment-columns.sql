-- Migration 009: Add payment outcome columns to orders table
-- Run this against your Supabase / PostgreSQL DB before deploying the code changes.
-- Safe to re-run: all statements use IF NOT EXISTS / IS NULL guards.

-- 1. paymentStatus: canonical payment outcome column
--    Replaces the scattered activity_log sub-queries used across multiple routes.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT NOT NULL DEFAULT 'pending'
    CHECK ("paymentStatus" IN ('confirmed', 'failed', 'pending'));

-- 2. paymentMessage: human-readable outcome note from the provider
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS "paymentMessage" TEXT;

-- 3. clientReference: the exact reference sent to Hubtel / Paystack (e.g. "ORD-A1B2C3D4")
--    Enables safe, indexed exact-match lookups in the webhook route instead of
--    the fragile UUID LIKE prefix query that could match multiple orders.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS "clientReference" TEXT;

-- 4. Index for O(log n) webhook lookup by clientReference
CREATE INDEX IF NOT EXISTS idx_orders_client_reference
  ON orders ("clientReference");

-- 5. Backfill clientReference for all existing orders
--    Logic mirrors toReadableOrderId(): "ORD-" + first 8 hex chars of UUID (uppercased)
UPDATE orders
  SET "clientReference" = 'ORD-' || UPPER(SUBSTRING(REPLACE(id::text, '-', ''), 1, 8))
  WHERE "clientReference" IS NULL;
