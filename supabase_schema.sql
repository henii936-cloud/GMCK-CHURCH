-- =====================================================
-- CHURCH MANAGEMENT SYSTEM - PRODUCTION SCHEMA
-- SAFE TO RUN MULTIPLE TIMES
-- =====================================================

-- REQUIRED EXTENSION
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. PROFILES TABLE (Linked to Supabase Auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin','bible_leader')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- =====================================================
-- 2. BIBLE STUDY GROUPS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bible_study_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_name TEXT NOT NULL,
  leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by_admin UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- =====================================================
-- 3. MEMBERS (NO LOGIN USERS)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  gender TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  join_date DATE DEFAULT CURRENT_DATE,
  group_id UUID REFERENCES public.bible_study_groups(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- =====================================================
-- 4. STUDY ATTENDANCE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.study_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.bible_study_groups(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('present','absent')),
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- =====================================================
-- 5. STUDY PROGRESS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.study_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.bible_study_groups(id) ON DELETE CASCADE,
  leader_id UUID REFERENCES public.profiles(id),
  book TEXT NOT NULL,
  chapter TEXT NOT NULL,
  verse TEXT,
  topic TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- =====================================================
-- 6. EVENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- =====================================================
-- 7. FINANCE TRANSACTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('tithe','offering','donation','other')),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_leader(g_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.bible_study_groups
    WHERE id = g_id
    AND leader_id = auth.uid()
  );
$$;

-- AUTOMATIC PROFILE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''), 
    COALESCE(new.raw_user_meta_data->>'role', 'bible_leader')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger for profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select"
ON public.profiles
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- =====================================================
-- GROUP POLICIES
-- =====================================================
DROP POLICY IF EXISTS "groups_view_all" ON public.bible_study_groups;
CREATE POLICY "groups_view_all"
ON public.bible_study_groups
FOR SELECT USING (true);

DROP POLICY IF EXISTS "groups_admin_manage" ON public.bible_study_groups;
CREATE POLICY "groups_admin_manage"
ON public.bible_study_groups
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- MEMBERS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "members_admin_manage" ON public.members;
DROP POLICY IF EXISTS "members_admin_select" ON public.members;
DROP POLICY IF EXISTS "members_admin_insert" ON public.members;
DROP POLICY IF EXISTS "members_admin_update" ON public.members;
DROP POLICY IF EXISTS "members_admin_delete" ON public.members;

CREATE POLICY "members_admin_select" ON public.members FOR SELECT USING (public.is_admin());
CREATE POLICY "members_admin_insert" ON public.members FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "members_admin_update" ON public.members FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "members_admin_delete" ON public.members FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "leaders_view_members" ON public.members;
CREATE POLICY "leaders_view_members"
ON public.members
FOR SELECT
USING (public.is_group_leader(group_id));

-- =====================================================
-- ATTENDANCE POLICIES
-- =====================================================
DROP POLICY IF EXISTS "attendance_admin_view" ON public.study_attendance;
CREATE POLICY "attendance_admin_view"
ON public.study_attendance
FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "leaders_manage_attendance" ON public.study_attendance;
CREATE POLICY "leaders_manage_attendance"
ON public.study_attendance
FOR ALL
USING (public.is_group_leader(group_id))
WITH CHECK (public.is_group_leader(group_id));

-- =====================================================
-- PROGRESS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "progress_admin_view" ON public.study_progress;
CREATE POLICY "progress_admin_view"
ON public.study_progress
FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "leaders_manage_progress" ON public.study_progress;
CREATE POLICY "leaders_manage_progress"
ON public.study_progress
FOR ALL
USING (public.is_group_leader(group_id))
WITH CHECK (public.is_group_leader(group_id));

-- =====================================================
-- EVENTS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "events_view_all" ON public.events;
CREATE POLICY "events_view_all"
ON public.events
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "events_admin_manage" ON public.events;
CREATE POLICY "events_admin_manage"
ON public.events
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- TRANSACTIONS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "transactions_admin_manage" ON public.transactions;
CREATE POLICY "transactions_admin_manage"
ON public.transactions
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());