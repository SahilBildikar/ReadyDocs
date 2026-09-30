-- ==============================================================================
-- ReadyDocs Migration: Align Tables with Supabase Auth (auth.users)
-- Migration File: supabase/migrations/20260930_auth_users_migration.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Step 1: Ensure pgcrypto extension is installed in the extensions schema
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- ------------------------------------------------------------------------------
-- Step 2: Remove old Foreign Key constraints referencing legacy public.users
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    -- profiles
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND constraint_name = 'profiles_user_id_fkey' 
          AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_id_fkey;
    END IF;

    -- checklists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
          AND table_name = 'checklists' 
          AND constraint_name = 'checklists_user_id_fkey' 
          AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE public.checklists DROP CONSTRAINT checklists_user_id_fkey;
    END IF;

    -- documents
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
          AND table_name = 'documents' 
          AND constraint_name = 'documents_user_id_fkey' 
          AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE public.documents DROP CONSTRAINT documents_user_id_fkey;
    END IF;

    -- ai_outputs
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
          AND table_name = 'ai_outputs' 
          AND constraint_name = 'ai_outputs_user_id_fkey' 
          AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE public.ai_outputs DROP CONSTRAINT ai_outputs_user_id_fkey;
    END IF;

    -- auto_fill_forms
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
          AND table_name = 'auto_fill_forms' 
          AND constraint_name = 'auto_fill_forms_user_id_fkey' 
          AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE public.auto_fill_forms DROP CONSTRAINT auto_fill_forms_user_id_fkey;
    END IF;

    -- feedback
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
          AND table_name = 'feedback' 
          AND constraint_name = 'feedback_user_id_fkey' 
          AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE public.feedback DROP CONSTRAINT feedback_user_id_fkey;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- Step 3: Add new Foreign Key constraints referencing auth.users(id)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.checklists
    ADD CONSTRAINT checklists_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.documents
    ADD CONSTRAINT documents_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.ai_outputs
    ADD CONSTRAINT ai_outputs_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.auto_fill_forms
    ADD CONSTRAINT auto_fill_forms_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.feedback
    ADD CONSTRAINT feedback_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ------------------------------------------------------------------------------
-- Step 4: Performance Indexes on user_id
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS checklists_user_id_idx ON public.checklists (user_id);
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents (user_id);
CREATE INDEX IF NOT EXISTS ai_outputs_user_id_idx ON public.ai_outputs (user_id);
CREATE INDEX IF NOT EXISTS auto_fill_forms_user_id_idx ON public.auto_fill_forms (user_id);
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON public.feedback (user_id);

-- ------------------------------------------------------------------------------
-- Step 5: Secure Auth Signup Trigger Function
-- Uses SECURITY DEFINER, SET search_path = '', and fully qualified schema identifiers
-- ------------------------------------------------------------------------------
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
    extensions.gen_random_uuid(),
    NEW.id,
    'Primary Profile',
    pg_catalog.coalesce(
      NEW.raw_user_meta_data ->> 'name',
      NEW.raw_user_meta_data ->> 'full_name',
      pg_catalog.split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    TRUE,
    FALSE
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- Step 6: Enable Row Level Security (RLS) on All User-Owned Tables
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_fill_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Step 7: Explicit Table Grants and Revokes
-- ------------------------------------------------------------------------------

-- 7.1 Profiles
REVOKE ALL ON TABLE public.profiles FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;

-- 7.2 Checklists
REVOKE ALL ON TABLE public.checklists FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.checklists TO authenticated;
GRANT ALL ON TABLE public.checklists TO service_role;

-- 7.3 Documents
REVOKE ALL ON TABLE public.documents FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.documents TO authenticated;
GRANT ALL ON TABLE public.documents TO service_role;

-- 7.4 AI Outputs
REVOKE ALL ON TABLE public.ai_outputs FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ai_outputs TO authenticated;
GRANT ALL ON TABLE public.ai_outputs TO service_role;

-- 7.5 Auto-Fill Forms
REVOKE ALL ON TABLE public.auto_fill_forms FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.auto_fill_forms TO authenticated;
GRANT ALL ON TABLE public.auto_fill_forms TO service_role;

-- 7.6 Feedback
-- Documentation & Architectural Decision:
-- Anonymous feedback IS required so citizens can submit ratings/feedback without needing to sign up or log in first.
-- - anon: Granted ONLY INSERT (cannot read, modify, or delete any feedback).
-- - authenticated: Granted SELECT, INSERT, UPDATE, DELETE (restricted to their own records via RLS).
-- - service_role: Granted ALL (for internal admin/support moderation and metrics).
REVOKE ALL ON TABLE public.feedback FROM anon, authenticated;
GRANT INSERT ON TABLE public.feedback TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.feedback TO authenticated;
GRANT ALL ON TABLE public.feedback TO service_role;

-- ------------------------------------------------------------------------------
-- Step 8: RLS Policies with High-Performance ((SELECT auth.uid()) = user_id)
-- ------------------------------------------------------------------------------

-- 8.1 PROFILES POLICIES
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "profiles_delete_own" ON public.profiles
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- 8.2 CHECKLISTS POLICIES
DROP POLICY IF EXISTS "checklists_select_own" ON public.checklists;
DROP POLICY IF EXISTS "checklists_insert_own" ON public.checklists;
DROP POLICY IF EXISTS "checklists_update_own" ON public.checklists;
DROP POLICY IF EXISTS "checklists_delete_own" ON public.checklists;

CREATE POLICY "checklists_select_own" ON public.checklists
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "checklists_insert_own" ON public.checklists
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "checklists_update_own" ON public.checklists
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "checklists_delete_own" ON public.checklists
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- 8.3 DOCUMENTS POLICIES
DROP POLICY IF EXISTS "documents_select_own" ON public.documents;
DROP POLICY IF EXISTS "documents_insert_own" ON public.documents;
DROP POLICY IF EXISTS "documents_update_own" ON public.documents;
DROP POLICY IF EXISTS "documents_delete_own" ON public.documents;

CREATE POLICY "documents_select_own" ON public.documents
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "documents_insert_own" ON public.documents
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "documents_update_own" ON public.documents
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "documents_delete_own" ON public.documents
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- 8.4 AI OUTPUTS POLICIES (Full CRUD including UPDATE)
DROP POLICY IF EXISTS "ai_outputs_select_own" ON public.ai_outputs;
DROP POLICY IF EXISTS "ai_outputs_insert_own" ON public.ai_outputs;
DROP POLICY IF EXISTS "ai_outputs_update_own" ON public.ai_outputs;
DROP POLICY IF EXISTS "ai_outputs_delete_own" ON public.ai_outputs;

CREATE POLICY "ai_outputs_select_own" ON public.ai_outputs
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "ai_outputs_insert_own" ON public.ai_outputs
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "ai_outputs_update_own" ON public.ai_outputs
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "ai_outputs_delete_own" ON public.ai_outputs
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- 8.5 AUTO-FILL FORMS POLICIES
DROP POLICY IF EXISTS "auto_fill_forms_select_own" ON public.auto_fill_forms;
DROP POLICY IF EXISTS "auto_fill_forms_insert_own" ON public.auto_fill_forms;
DROP POLICY IF EXISTS "auto_fill_forms_update_own" ON public.auto_fill_forms;
DROP POLICY IF EXISTS "auto_fill_forms_delete_own" ON public.auto_fill_forms;

CREATE POLICY "auto_fill_forms_select_own" ON public.auto_fill_forms
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "auto_fill_forms_insert_own" ON public.auto_fill_forms
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "auto_fill_forms_update_own" ON public.auto_fill_forms
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "auto_fill_forms_delete_own" ON public.auto_fill_forms
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- 8.6 FEEDBACK POLICIES (Anonymous insert strictly user_id IS NULL; authenticated insert & CRUD owner-only)
DROP POLICY IF EXISTS "feedback_insert_policy" ON public.feedback;
DROP POLICY IF EXISTS "feedback_insert_anonymous" ON public.feedback;
DROP POLICY IF EXISTS "feedback_insert_authenticated" ON public.feedback;
DROP POLICY IF EXISTS "feedback_select_policy" ON public.feedback;
DROP POLICY IF EXISTS "feedback_update_policy" ON public.feedback;
DROP POLICY IF EXISTS "feedback_delete_policy" ON public.feedback;

CREATE POLICY "feedback_insert_anonymous" ON public.feedback
    FOR INSERT
    TO anon
    WITH CHECK (user_id IS NULL);

CREATE POLICY "feedback_insert_authenticated" ON public.feedback
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id IS NULL OR ((SELECT auth.uid()) = user_id));

CREATE POLICY "feedback_select_policy" ON public.feedback
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "feedback_update_policy" ON public.feedback
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "feedback_delete_policy" ON public.feedback
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- ------------------------------------------------------------------------------
-- Step 9: Preserve Legacy public.users Table Intact (No Drop)
-- ------------------------------------------------------------------------------
COMMENT ON TABLE public.users IS 'Legacy custom auth table - Supabase Auth (auth.users) is the active authoritative source.';

-- ==============================================================================
-- READ-ONLY VERIFICATION QUERIES (Safe to run in Supabase SQL Editor)
-- ==============================================================================

-- 1. Count auth.users
SELECT COUNT(*) AS total_auth_users FROM auth.users;

-- 2. Count public.profiles
SELECT COUNT(*) AS total_profiles FROM public.profiles;

-- 3. Verify Foreign Keys pointing to auth.users(id)
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'users'
    AND ccu.table_schema = 'auth'
ORDER BY tc.table_name;

-- 4. List all active RLS policies for changed tables
SELECT
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'checklists', 'documents', 'ai_outputs', 'auto_fill_forms', 'feedback')
ORDER BY tablename, cmd;

-- 5. Verify trigger on auth.users
SELECT
    trigger_name,
    event_manipulation,
    event_object_schema,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 6. Verify handle_new_user function (SECURITY DEFINER and search_path)
SELECT
    proname,
    prosecdef AS is_security_definer,
    proconfig AS search_path_config
FROM pg_proc
WHERE proname = 'handle_new_user';

