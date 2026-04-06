
-- Remove deposits from realtime to prevent data leak
-- First check if it exists, use DO block
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.deposits;
EXCEPTION WHEN undefined_object THEN
  -- Table not in publication, nothing to do
  NULL;
END;
$$;
