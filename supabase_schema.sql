-- =====================================================
-- ⛪ CHURCH MANAGEMENT SYSTEM - PRODUCTION SCHEMA
-- =====================================================

-- REQUIRED EXTENSION
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. TABLES DEFINITION (Idempotent)
-- =====================================================

-- PROFILES: Linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'bible_leader', 'finance')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- BIBLE STUDY GROUPS
CREATE TABLE IF NOT EXISTS public.bible_study_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_name TEXT NOT NULL,
  leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Deprecated in favor of group_leaders table
  location TEXT,
  members_count INTEGER DEFAULT 0,
  created_by_admin UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- MAPPING TABLE (Refined Design)
CREATE TABLE IF NOT EXISTS public.group_leaders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.bible_study_groups(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(user_id) -- Ensures one leader = one group
);

-- RLS for group_leaders
ALTER TABLE public.group_leaders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_access_group_leaders" ON public.group_leaders 
FOR ALL USING (public.is_admin());

CREATE POLICY "leaders_view_own_group_leaders" ON public.group_leaders 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "leaders_join_group_group_leaders" ON public.group_leaders 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- MEMBERS: Church Attendees (No Login)
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

-- STUDY ATTENDANCE
CREATE TABLE IF NOT EXISTS public.study_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.bible_study_groups(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('Present', 'Absent', 'Excused')),
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- STUDY PROGRESS
CREATE TABLE IF NOT EXISTS public.study_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.bible_study_groups(id) ON DELETE CASCADE,
  leader_id UUID REFERENCES public.profiles(id),
  study_topic TEXT NOT NULL,
  topic_or_book TEXT,
  chapter TEXT,
  notes TEXT,
  completion_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- EVENTS
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  event_time TEXT,
  location TEXT,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- FINANCE TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  budget_id UUID, -- Added for budget allocation
  type TEXT CHECK (type IN ('tithe', 'offering', 'donation', 'other', 'Income', 'Expense')),
  category TEXT,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  transaction_date DATE DEFAULT CURRENT_DATE,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- BUDGETS TABLE (Added as it was missing from schema but referenced in app)
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- =====================================================
-- 2. HELPER FUNCTIONS & AUTOMATION
-- =====================================================

-- Check if user is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is Leader of a specific group
CREATE OR REPLACE FUNCTION public.is_group_leader(g_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_leaders
    WHERE group_id = g_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Automatically create a profile when a new user signs up
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

-- Ensure the trigger is clean before creating
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bible_study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "profiles_view_all" ON public.profiles;
CREATE POLICY "profiles_view_all" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- BIBLE STUDY GROUPS POLICIES
DROP POLICY IF EXISTS "groups_view_all" ON public.bible_study_groups;
CREATE POLICY "groups_view_all" ON public.bible_study_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "groups_admin_manage" ON public.bible_study_groups;
CREATE POLICY "groups_admin_manage" ON public.bible_study_groups FOR ALL USING (public.is_admin());

-- MEMBERS POLICIES (FINAL FIX)
DROP POLICY IF EXISTS "members_admin_all" ON public.members;
DROP POLICY IF EXISTS "members_admin_manage" ON public.members;
DROP POLICY IF EXISTS "members_view" ON public.members;
DROP POLICY IF EXISTS "members_insert" ON public.members;
DROP POLICY IF EXISTS "members_update" ON public.members;
DROP POLICY IF EXISTS "leaders_view_members" ON public.members;
DROP POLICY IF EXISTS "leaders_manage_members" ON public.members;
DROP POLICY IF EXISTS "leaders_insert_members" ON public.members;
DROP POLICY IF EXISTS "leaders_update_members" ON public.members;

-- Remove old separate admin policies if they exist from previous runs
DROP POLICY IF EXISTS "members_admin_select" ON public.members;
DROP POLICY IF EXISTS "members_admin_insert" ON public.members;
DROP POLICY IF EXISTS "members_admin_update" ON public.members;
DROP POLICY IF EXISTS "members_admin_delete" ON public.members;

------------------------------------------------
-- ADMIN FULL ACCESS
------------------------------------------------
CREATE POLICY members_admin_manage
ON public.members
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

------------------------------------------------
-- VIEW PERMISSIONS
------------------------------------------------
CREATE POLICY members_view
ON public.members
FOR SELECT
USING (
  public.is_admin()
  OR public.is_group_leader(group_id)
);

------------------------------------------------
-- INSERT FIX (Ensures group_id ownership)
------------------------------------------------
CREATE POLICY members_insert
ON public.members
FOR INSERT
WITH CHECK (
  public.is_admin()
  OR (
    group_id IS NOT NULL
    AND public.is_group_leader(group_id)
  )
);

------------------------------------------------
-- UPDATE FIX
------------------------------------------------
CREATE POLICY members_update
ON public.members
FOR UPDATE
USING (
  public.is_admin()
  OR public.is_group_leader(group_id)
)
WITH CHECK (
  public.is_admin()
  OR public.is_group_leader(group_id)
);

-- STUDY ATTENDANCE POLICIES
DROP POLICY IF EXISTS "attendance_admin_view" ON public.study_attendance;
CREATE POLICY "attendance_admin_view" ON public.study_attendance FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "leaders_manage_attendance" ON public.study_attendance;
CREATE POLICY "leaders_manage_attendance" ON public.study_attendance FOR ALL USING (public.is_group_leader(group_id));

-- STUDY PROGRESS POLICIES
DROP POLICY IF EXISTS "progress_admin_view" ON public.study_progress;
CREATE POLICY "progress_admin_view" ON public.study_progress FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "leaders_manage_progress" ON public.study_progress;
CREATE POLICY "leaders_manage_progress" ON public.study_progress FOR ALL USING (public.is_group_leader(group_id));

-- EVENTS POLICIES
DROP POLICY IF EXISTS "events_view_all" ON public.events;
CREATE POLICY "events_view_all" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "events_admin_manage" ON public.events;
CREATE POLICY "events_admin_manage" ON public.events FOR ALL USING (public.is_admin());

-- TRANSACTIONS POLICIES
DROP POLICY IF EXISTS "transactions_admin_manage" ON public.transactions;
CREATE POLICY "transactions_admin_manage" ON public.transactions FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "transactions_finance_manage" ON public.transactions;
CREATE POLICY "transactions_finance_manage" ON public.transactions FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'finance'
  )
);

-- BUDGETS POLICIES
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "budgets_admin_manage" ON public.budgets;
CREATE POLICY "budgets_admin_manage" ON public.budgets FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "budgets_view_all" ON public.budgets;
CREATE POLICY "budgets_view_all" ON public.budgets FOR SELECT USING (true);

DROP POLICY IF EXISTS "budgets_finance_manage" ON public.budgets;
CREATE POLICY "budgets_finance_manage" ON public.budgets FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'finance'
  )
);

-- Error Saving Attendacne ---
/* -- Drop the old constraint and recreate it with the correct values
ALTER TABLE public.study_attendance DROP CONSTRAINT IF EXISTS study_attendance_status_check;
ALTER TABLE public.study_attendance ADD CONSTRAINT study_attendance_status_check 
  CHECK (status IN ('Present', 'Absent', 'Excused'));
*/


-- Error Saving Study Progress --
/*
-- Drop the old constraint
ALTER TABLE public.study_progress DROP CONSTRAINT IF EXISTS study_progress_status_check;

-- Add the new constraint with the correct values
ALTER TABLE public.study_progress ADD CONSTRAINT study_progress_status_check 
  CHECK (status IN ('Completed', 'In Progress', 'Not Started'));
*/
