-- Migration 008: Add Newsletter Scheduler Indexes
-- Optimizes processDueNewsletterCampaign and fetchAudience queries

-- 1. Index for checking scheduled campaigns due to send
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status_scheduledAt
ON public.newsletter_campaigns (status, "scheduledAt")
WHERE status = 'scheduled';

-- 2. Index for checking active sending campaigns that need progress updates or retry
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status_updatedAt
ON public.newsletter_campaigns (status, "updatedAt")
WHERE status = 'sending';

-- 3. Index for sorting/polling campaign records by status and updatedAt
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status_order
ON public.newsletter_campaigns (status, "updatedAt" ASC NULLS FIRST);

-- 4. Index for audience query on newsletter_subscribers status and subscribedAt
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status_subscribedAt
ON public.newsletter_subscribers (status, "subscribedAt" ASC);
