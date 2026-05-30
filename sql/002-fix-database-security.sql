-- Fix Supabase Database Linter Security Warnings
-- Resolves: extension_in_public, anon_security_definer_function_executable, authenticated_security_definer_function_executable

-- 1. Move pg_trgm extension from public schema to extensions schema
-- This prevents extension objects from polluting the public schema
DROP EXTENSION IF EXISTS pg_trgm CASCADE;
CREATE SCHEMA IF NOT EXISTS extensions AUTHORIZATION postgres;
CREATE EXTENSION pg_trgm WITH SCHEMA extensions;

-- 2. Fix rls_auto_enable() function security exposure
-- Revoke execute permissions from anonymous and authenticated roles
-- Only service_role should be able to call this internal function
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated;

-- Alternatively, if this function needs to be callable by authenticated users,
-- switch it to SECURITY INVOKER instead of SECURITY DEFINER:
-- ALTER FUNCTION public.rls_auto_enable() SECURITY INVOKER;
-- GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO authenticated;
