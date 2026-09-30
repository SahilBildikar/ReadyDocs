-- ==============================================================================
-- ReadyDocs Database Schema & Security Policies
-- Compatible with Supabase PostgreSQL SQL Editor
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. AUTOMATIC updated_at TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. HELPER FUNCTION TO RESOLVE CURRENT USER ID FROM SUPABASE AUTH OR CUSTOM JWT
CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS UUID AS $$
BEGIN
    -- Checks standard auth.uid() OR custom JWT claims sub field
    RETURN COALESCE(
        auth.uid(),
        NULLIF(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::UUID
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ==============================================================================
-- TABLES
-- ==============================================================================

-- A. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. PROFILES TABLE (Multi-profile: Self, Father, Student, etc.)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    profile_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pin_code VARCHAR(20),
    education_details TEXT,
    language VARCHAR(50) DEFAULT 'english',
    is_active BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. CHECKLISTS TABLE
CREATE TABLE IF NOT EXISTS public.checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    service_type VARCHAR(100) NOT NULL, -- 'sbi_savings' | 'sppu_admission' | 'insurance_claim'
    institution_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'in_progress', -- 'ready' | 'needs_attention' | 'incomplete'
    result_json JSONB NOT NULL,
    source_url TEXT,
    source_checked_at TIMESTAMPTZ DEFAULT NOW(),
    archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. DOCUMENTS TABLE (Metadata & safe extraction only; Max 10MB, allowed types only)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    checklist_id UUID REFERENCES public.checklists(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path_or_url TEXT,
    ai_classification_json JSONB,
    matched_checklist_item VARCHAR(255),
    status VARCHAR(50) DEFAULT 'uploaded', -- 'uploaded' | 'verified' | 'mismatched'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: Only PDF, JPG, JPEG, and PNG files
    CONSTRAINT chk_document_file_type CHECK (
        LOWER(file_type) IN ('pdf', 'jpg', 'jpeg', 'png', 'application/pdf', 'image/jpeg', 'image/png', 'image/jpg')
    ),
    
    -- Constraint: Maximum 10 MB (10 * 1024 * 1024 = 10,485,760 bytes)
    CONSTRAINT chk_document_file_size CHECK (
        file_size > 0 AND file_size <= 10485760
    )
);

-- E. AI OUTPUTS TABLE
CREATE TABLE IF NOT EXISTS public.ai_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    checklist_id UUID REFERENCES public.checklists(id) ON DELETE SET NULL,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    prompt_type VARCHAR(100) NOT NULL,
    response_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- F. AUTO-FILL FORMS TABLE
CREATE TABLE IF NOT EXISTS public.auto_fill_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    form_url TEXT NOT NULL,
    form_title VARCHAR(255) NOT NULL,
    matched_fields JSONB NOT NULL,
    filled_fields JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- G. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: Rating between 1 and 5
    CONSTRAINT chk_feedback_rating CHECK (rating >= 1 AND rating <= 5)
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_checklists_user_id ON public.checklists(user_id);
CREATE INDEX IF NOT EXISTS idx_checklists_service_type ON public.checklists(service_type);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_checklist_id ON public.documents(checklist_id);
CREATE INDEX IF NOT EXISTS idx_ai_outputs_user_id ON public.ai_outputs(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_fill_forms_user_id ON public.auto_fill_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);

-- ==============================================================================
-- AUTOMATIC updated_at TRIGGERS
-- ==============================================================================
DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_checklists_updated_at ON public.checklists;
CREATE TRIGGER trg_checklists_updated_at
BEFORE UPDATE ON public.checklists
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_documents_updated_at ON public.documents;
CREATE TRIGGER trg_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_ai_outputs_updated_at ON public.ai_outputs;
CREATE TRIGGER trg_ai_outputs_updated_at
BEFORE UPDATE ON public.ai_outputs
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_auto_fill_forms_updated_at ON public.auto_fill_forms;
CREATE TRIGGER trg_auto_fill_forms_updated_at
BEFORE UPDATE ON public.auto_fill_forms
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_feedback_updated_at ON public.feedback;
CREATE TRIGGER trg_feedback_updated_at
BEFORE UPDATE ON public.feedback
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_fill_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 1. USERS POLICIES
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
FOR SELECT USING (id = public.current_app_user_id());

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
FOR UPDATE USING (id = public.current_app_user_id());

-- 2. PROFILES POLICIES
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT USING (user_id = public.current_app_user_id());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT WITH CHECK (user_id = public.current_app_user_id());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE USING (user_id = public.current_app_user_id());

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles
FOR DELETE USING (user_id = public.current_app_user_id());

-- 3. CHECKLISTS POLICIES
DROP POLICY IF EXISTS "checklists_select_own" ON public.checklists;
CREATE POLICY "checklists_select_own" ON public.checklists
FOR SELECT USING (user_id = public.current_app_user_id());

DROP POLICY IF EXISTS "checklists_insert_own" ON public.checklists;
CREATE POLICY "checklists_insert_own" ON public.checklists
FOR INSERT WITH CHECK (user_id = public.current_app_user_id());

DROP POLICY IF EXISTS "checklists_update_own" ON public.checklists;
CREATE POLICY "checklists_update_own" ON public.checklists
FOR UPDATE USING (user_id = public.current_app_user_id());

DROP POLICY IF EXISTS "checklists_delete_own" ON public.checklists;
CREATE POLICY "checklists_delete_own" ON public.checklists
FOR DELETE USING (user_id = public.current_app_user_id());

-- 4. DOCUMENTS POLICIES
DROP POLICY IF EXISTS "documents_select_own" ON public.documents;
CREATE POLICY "documents_select_own" ON public.documents
FOR SELECT USING (user_id = public.current_app_user_id());

DROP POLICY IF EXISTS "documents_insert_own" ON public.documents;
CREATE POLICY "documents_insert_own" ON public.documents
FOR INSERT WITH CHECK (user_id = public.current_app_user_id());

DROP POLICY IF EXISTS "documents_update_own" ON public.documents;
CREATE POLICY "documents_update_own" ON public.documents
FOR UPDATE USING (user_id = public.current_app_user_id());

DROP POLICY IF EXISTS "documents_delete_own" ON public.documents;
CREATE POLICY "documents_delete_own" ON public.documents
FOR DELETE USING (user_id = public.current_app_user_id());

-- 5. AI OUTPUTS POLICIES
DROP POLICY IF EXISTS "ai_outputs_select_own" ON public.ai_outputs;
CREATE POLICY "ai_outputs_select_own" ON public.ai_outputs
FOR SELECT USING (user_id = public.current_app_user_id());

DROP POLICY IF EXISTS "ai_outputs_insert_own" ON public.ai_outputs;
CREATE POLICY "ai_outputs_insert_own" ON public.ai_outputs
FOR INSERT WITH CHECK (user_id = public.current_app_user_id());

DROP POLICY IF EXISTS "ai_outputs_delete_own" ON public.ai_outputs;
CREATE POLICY "ai_outputs_delete_own" ON public.ai_outputs
FOR DELETE USING (user_id = public.current_app_user_id());

-- 6. AUTO-FILL FORMS POLICIES
DROP POLICY IF EXISTS "auto_fill_forms_select_own" ON public.auto_fill_forms;
CREATE POLICY "auto_fill_forms_select_own" ON public.auto_fill_forms
FOR SELECT USING (user_id = public.current_app_user_id());

DROP POLICY IF EXISTS "auto_fill_forms_insert_own" ON public.auto_fill_forms;
CREATE POLICY "auto_fill_forms_insert_own" ON public.auto_fill_forms
FOR INSERT WITH CHECK (user_id = public.current_app_user_id());

DROP POLICY IF EXISTS "auto_fill_forms_update_own" ON public.auto_fill_forms;
CREATE POLICY "auto_fill_forms_update_own" ON public.auto_fill_forms
FOR UPDATE USING (user_id = public.current_app_user_id());

DROP POLICY IF EXISTS "auto_fill_forms_delete_own" ON public.auto_fill_forms;
CREATE POLICY "auto_fill_forms_delete_own" ON public.auto_fill_forms
FOR DELETE USING (user_id = public.current_app_user_id());

-- 7. FEEDBACK POLICIES
DROP POLICY IF EXISTS "feedback_insert_policy" ON public.feedback;
CREATE POLICY "feedback_insert_policy" ON public.feedback
FOR INSERT WITH CHECK (
    user_id IS NULL OR user_id = public.current_app_user_id()
);

DROP POLICY IF EXISTS "feedback_select_policy" ON public.feedback;
CREATE POLICY "feedback_select_policy" ON public.feedback
FOR SELECT USING (
    user_id = public.current_app_user_id()
);
