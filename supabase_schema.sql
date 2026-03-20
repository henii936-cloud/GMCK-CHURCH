
-- =========================================
-- 🔥 RESET
-- =========================================
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.study_progress CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.budgets CASCADE;
DROP TABLE IF EXISTS public.member_history CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- 👤 PROFILES (NO TRIGGER)
-- =========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY, -- MUST match auth.users.id
  email TEXT UNIQUE,
  name TEXT,
  role TEXT CHECK (role IN ('admin','leader','finance')) DEFAULT 'leader',
  group_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 👥 GROUPS
-- =========================================
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT,
  capacity INT,
  leader_id UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles
ADD CONSTRAINT fk_profiles_group
FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE SET NULL;

-- =========================================
-- 👨👩👧 MEMBERS
-- =========================================
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT UNIQUE,
  address TEXT,
  marital_status TEXT DEFAULT 'Single',
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Active',
  engagement_score INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 📊 ATTENDANCE
-- =========================================
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  present BOOLEAN DEFAULT TRUE,
  taken_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 📖 STUDY
-- =========================================
CREATE TABLE public.study_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  leader_id UUID,
  topic TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 💰 BUDGETS
-- =========================================
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  amount NUMERIC,
  used_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 💳 TRANSACTIONS
-- =========================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT CHECK (type IN ('tithe','offering','donation','expense')),
  amount NUMERIC,
  budget_id UUID REFERENCES public.budgets(id),
  recorded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 📜 ACTIVITIES
-- =========================================
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES public.groups(id),
  leader_id UUID REFERENCES public.profiles(id),
  type TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================
-- 🔐 ENABLE RLS
-- =========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 🧠 HELPER FUNCTIONS
-- =========================================
DROP FUNCTION IF EXISTS public.get_user_role();
DROP FUNCTION IF EXISTS public.get_user_role(UUID);

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_admin(UUID);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =========================================
-- 🔐 RLS POLICIES
-- =========================================

-- PROFILES
CREATE POLICY "Insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND id = auth.uid()
);

CREATE POLICY "View profiles"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "Update own profile"
ON public.profiles
FOR UPDATE
USING (id = auth.uid());

-- GROUPS
CREATE POLICY "View groups"
ON public.groups FOR SELECT USING (true);

CREATE POLICY "Admin manage groups"
ON public.groups FOR ALL USING (is_admin());

-- MEMBERS
CREATE POLICY "Leader manage members"
ON public.members
FOR ALL
USING (
  group_id = (SELECT group_id FROM public.profiles WHERE id = auth.uid())
);

-- ATTENDANCE
CREATE POLICY "Leader manage attendance"
ON public.attendance
FOR ALL
USING (
  group_id = (SELECT group_id FROM public.profiles WHERE id = auth.uid())
);

-- STUDY
CREATE POLICY "Leader manage study"
ON public.study_progress
FOR ALL
USING (
  group_id = (SELECT group_id FROM public.profiles WHERE id = auth.uid())
);

-- TRANSACTIONS
CREATE POLICY "Finance manage transactions"
ON public.transactions
FOR ALL
USING (
  get_user_role() = 'finance' OR is_admin()
);

-- BUDGETS
CREATE POLICY "Finance view budgets"
ON public.budgets
FOR SELECT
USING (
  get_user_role() = 'finance' OR is_admin()
);

-- ACTIVITIES
CREATE POLICY "View activities"
ON public.activities FOR SELECT USING (true);

-- =========================================
-- 🔓 GRANTS
-- =========================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- =========================================
-- 🚀 SECURE INITIALIZATION (ZERO-TRIGGER)
-- =========================================
CREATE OR REPLACE FUNCTION public.initialize_new_profile(
  p_id UUID, 
  p_email TEXT, 
  p_name TEXT, 
  p_role TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (p_id, p_email, p_name, p_role)
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =========================================
-- ⚡ ATOMIC UTILITIES
-- =========================================
CREATE OR REPLACE FUNCTION public.increment_budget_usage(b_id UUID, amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE public.budgets
  SET used_amount = used_amount + amount
  WHERE id = b_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
