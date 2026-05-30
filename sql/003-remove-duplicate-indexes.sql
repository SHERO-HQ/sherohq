-- Remove Duplicate Indexes from newsletter_subscribers Table
-- Resolves: duplicate_index Supabase linter warnings
-- Impact: Improves database performance by removing redundant indexes

-- 1. Drop duplicate token index (keep idx_newsletter_subscribers_token)
DROP INDEX IF EXISTS public.idx_newsletter_token;

-- 2. Drop duplicate email index (keep idx_newsletter_subscribers_email)
DROP INDEX IF EXISTS public.idx_newsletter_email;

-- 3. Drop duplicate status index (keep idx_newsletter_subscribers_status)
DROP INDEX IF EXISTS public.idx_newsletter_status;

-- These operations:
-- - Reduce storage space (each index uses disk)
-- - Speed up INSERT/UPDATE/DELETE (fewer indexes to maintain)
-- - Queries still work (retained indexes cover the same columns)
-- - No data is lost
