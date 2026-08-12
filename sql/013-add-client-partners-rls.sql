-- Migration 013: Add RLS policies for client_partners table
-- Resolves Supabase linter warning: rls_enabled_no_policy on public.client_partners
-- Idempotency: Uses DROP POLICY IF EXISTS before CREATE POLICY

ALTER TABLE public.client_partners ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policy: Allow all users to read active client partner logos
DROP POLICY IF EXISTS "public_client_partners_readable" ON public.client_partners;
CREATE POLICY "public_client_partners_readable" 
  ON public.client_partners FOR SELECT 
  USING (true);

-- 2. Service Role Policy: Full access for server-side operations
DROP POLICY IF EXISTS "service_role_client_partners_all" ON public.client_partners;
CREATE POLICY "service_role_client_partners_all" 
  ON public.client_partners FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- 3. Authenticated Admin Policies: Manage partners from dashboard
DROP POLICY IF EXISTS "admin_client_partners_insert" ON public.client_partners;
CREATE POLICY "admin_client_partners_insert" 
  ON public.client_partners FOR INSERT 
  TO authenticated 
  WITH CHECK ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "admin_client_partners_update" ON public.client_partners;
CREATE POLICY "admin_client_partners_update" 
  ON public.client_partners FOR UPDATE 
  TO authenticated 
  USING ((select auth.role()) = 'authenticated')
  WITH CHECK ((select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "admin_client_partners_delete" ON public.client_partners;
CREATE POLICY "admin_client_partners_delete" 
  ON public.client_partners FOR DELETE 
  TO authenticated 
  USING ((select auth.role()) = 'authenticated');
