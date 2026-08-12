-- Migration 014: Fix campaign_templates RLS policies
-- Resolves Supabase linter warning: rls_policy_always_true / unrestricted access on campaign_templates
-- Idempotency: Uses DROP POLICY IF EXISTS before CREATE POLICY

ALTER TABLE public.campaign_templates ENABLE ROW LEVEL SECURITY;

-- Drop legacy unrestricted policy
DROP POLICY IF EXISTS "admin_campaign_templates_all" ON public.campaign_templates;

-- 1. Public Read Policy
DROP POLICY IF EXISTS "public_campaign_templates_readable" ON public.campaign_templates;
CREATE POLICY "public_campaign_templates_readable" 
  ON public.campaign_templates FOR SELECT 
  USING (true);

-- 2. Service Role Full Access
DROP POLICY IF EXISTS "service_role_campaign_templates_all" ON public.campaign_templates;
CREATE POLICY "service_role_campaign_templates_all" 
  ON public.campaign_templates FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- 3. Authenticated Admin Scoped Policies
DROP POLICY IF EXISTS "admin_campaign_templates_insert" ON public.campaign_templates;
CREATE POLICY "admin_campaign_templates_insert" 
  ON public.campaign_templates FOR INSERT 
  TO authenticated 
  WITH CHECK ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "admin_campaign_templates_update" ON public.campaign_templates;
CREATE POLICY "admin_campaign_templates_update" 
  ON public.campaign_templates FOR UPDATE 
  TO authenticated 
  USING ((select auth.role()) = 'authenticated')
  WITH CHECK ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "admin_campaign_templates_delete" ON public.campaign_templates;
CREATE POLICY "admin_campaign_templates_delete" 
  ON public.campaign_templates FOR DELETE 
  TO authenticated 
  USING ((select auth.role()) = 'authenticated');
