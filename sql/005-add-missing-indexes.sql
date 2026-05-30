-- Add Missing Covering Indexes for Public Foreign Keys
-- Resolves Supabase database linter warning: unindexed_foreign_keys / missing_fk_index
-- Impact: Optimizes joins, updates, and cascading deletes across key relational tables

-- 1. public.expenses ("adminId" -> admin_users.id)
CREATE INDEX IF NOT EXISTS idx_expenses_adminId ON public.expenses("adminId");

-- 2. public.newsletter_campaigns ("createdBy" -> admin_users.id)
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_createdBy ON public.newsletter_campaigns("createdBy");

-- 3. public.sessions ("adminId" -> admin_users.id)
CREATE INDEX IF NOT EXISTS idx_sessions_adminId ON public.sessions("adminId");

-- 4. public.support_guides ("authorId" -> admin_users.id)
CREATE INDEX IF NOT EXISTS idx_support_guides_authorId ON public.support_guides("authorId");

-- 5. public.tickets ("productId" -> products.id)
CREATE INDEX IF NOT EXISTS idx_tickets_productId ON public.tickets("productId");

-- 6. public.user_sessions ("userId" -> users.id)
CREATE INDEX IF NOT EXISTS idx_user_sessions_userId ON public.user_sessions("userId");
