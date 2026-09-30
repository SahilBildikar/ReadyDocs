-- ==============================================================================
-- ReadyDocs Patch: Fix public.handle_new_user() Trigger Function
-- File: supabase/migrations/20260930_fix_handle_new_user.sql
-- ==============================================================================

-- 1. Ensure is_active column exists on public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;

-- 2. Replace handle_new_user function with corrected SQL syntax
-- Note: COALESCE is a SQL keyword / syntactic construct, not a pg_catalog function.
-- pg_catalog.gen_random_uuid() is the core built-in UUID function in PostgreSQL 13+.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    user_id,
    profile_name,
    full_name,
    email,
    is_active,
    is_archived
  )
  VALUES (
    pg_catalog.gen_random_uuid(),
    NEW.id,
    'Primary Profile',
    COALESCE(
      NEW.raw_user_meta_data ->> 'name',
      NEW.raw_user_meta_data ->> 'full_name',
      pg_catalog.nullif(pg_catalog.split_part(NEW.email, '@', 1), ''),
      'Primary User'
    ),
    NEW.email,
    TRUE,
    FALSE
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- 3. Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
