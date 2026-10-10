-- Migration 016: Work entries get a type ('client' or 'product').
-- Additive; nothing is deleted. The one-off data update below runs only the
-- first time (when the column is created), so later edits in the admin are
-- never overwritten on a redeploy.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'type'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN "type" TEXT NOT NULL DEFAULT 'client';

    -- Client work that is live
    UPDATE public.projects
       SET "type" = 'client', "status" = 'live'
     WHERE lower(title)  ~ '(trustcircle|tastea|dajrim)'
        OR lower(coalesce(client, '')) ~ '(trustcircle|tastea|dajrim)';

    -- SHERO's own product
    UPDATE public.projects
       SET "type" = 'product', "status" = 'in_development'
     WHERE lower(title) LIKE 'merchander%';
  END IF;
END $$;
