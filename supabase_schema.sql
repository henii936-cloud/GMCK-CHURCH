/*
GRACEFLOW CMS
Optimized Production Schema for Supabase
*/

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-------------------------------------------------
-- DROP TABLES
-------------------------------------------------

DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS bible_study_members CASCADE;
DROP TABLE IF EXISTS bible_study_groups CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-------------------------------------------------
-- PROFILES
-------------------------------------------------

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin','leader','finance')) DEFAULT 'leader',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-------------------------------------------------
-- BUDGETS
-------------------------------------------------

CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  ministry TEXT,
  amount NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  year INT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-------------------------------------------------
-- TRANSACTIONS
-------------------------------------------------

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  type TEXT CHECK (type IN ('tithe','offering','donation','expense')),
  amount NUMERIC NOT NULL,
  recorded_by UUID REFERENCES profiles(id),
  budget_id UUID REFERENCES budgets(id),
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-------------------------------------------------
-- MEMBERS
-------------------------------------------------

CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('Male','Female','Other')),
  date_of_birth DATE,
  phone_number TEXT,
  email TEXT,
  address TEXT,
  occupation TEXT,
  marital_status TEXT CHECK (marital_status IN ('Single','Married','Divorced','Widowed')),
  ministry TEXT,
  team TEXT,
  baptism_status BOOLEAN DEFAULT FALSE,
  membership_status TEXT CHECK (membership_status IN ('Active','Inactive')) DEFAULT 'Active',
  join_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-------------------------------------------------
-- BIBLE STUDY GROUPS
-------------------------------------------------

CREATE TABLE bible_study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  leader_profile_id UUID REFERENCES profiles(id),
  meeting_day TEXT,
  location TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-------------------------------------------------
-- GROUP MEMBERS
-------------------------------------------------

CREATE TABLE bible_study_members (
  group_id UUID REFERENCES bible_study_groups(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, member_id)
);

-------------------------------------------------
-- ATTENDANCE
-------------------------------------------------

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  group_id UUID REFERENCES bible_study_groups(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('Present','Absent')) DEFAULT 'Present',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-------------------------------------------------
-- PROGRAMS
-------------------------------------------------

CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT,
  description TEXT,
  responsible_ministry TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-------------------------------------------------
-- AUTO CREATE PROFILE
-------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'leader')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-------------------------------------------------
-- ENABLE RLS
-------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_study_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-------------------------------------------------
-- HELPER FUNCTIONS
-------------------------------------------------

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION is_finance()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND role = 'finance'
  );
$$;

-------------------------------------------------
-- BUDGETS POLICIES
-------------------------------------------------

CREATE POLICY "Admin manage all budgets"
ON budgets
FOR ALL
USING (is_admin());

CREATE POLICY "Finance view approved budgets"
ON budgets
FOR SELECT
USING (
  status = 'approved' AND is_finance()
);

-------------------------------------------------
-- TRANSACTIONS POLICIES
-------------------------------------------------

CREATE POLICY "Admin view all transactions"
ON transactions
FOR SELECT
USING (is_admin());

CREATE POLICY "Finance manage own transactions"
ON transactions
FOR ALL
USING (
  recorded_by = auth.uid() AND is_finance()
);

-------------------------------------------------
-- PROFILES POLICIES
-------------------------------------------------

CREATE POLICY "Users read own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-------------------------------------------------
-- MEMBERS POLICIES
-------------------------------------------------

CREATE POLICY "Admins manage members"
ON members
FOR ALL
USING (is_admin());

CREATE POLICY "Leaders view members"
ON members
FOR SELECT
TO authenticated
USING (true);

-------------------------------------------------
-- GROUP POLICIES
-------------------------------------------------

CREATE POLICY "Admins manage groups"
ON bible_study_groups
FOR ALL
USING (is_admin());

CREATE POLICY "Leaders manage their groups"
ON bible_study_groups
FOR ALL
USING (
  leader_profile_id = auth.uid()
);

CREATE POLICY "Users view groups"
ON bible_study_groups
FOR SELECT
TO authenticated
USING (true);

-------------------------------------------------
-- GROUP MEMBERS POLICIES
-------------------------------------------------

CREATE POLICY "Admins manage group members"
ON bible_study_members
FOR ALL
USING (is_admin());

CREATE POLICY "Leaders manage their group members"
ON bible_study_members
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM bible_study_groups g
    WHERE g.id = bible_study_members.group_id
    AND g.leader_profile_id = auth.uid()
  )
);

-------------------------------------------------
-- ATTENDANCE POLICIES
-------------------------------------------------

CREATE POLICY "Admins manage attendance"
ON attendance
FOR ALL
USING (is_admin());

CREATE POLICY "Leaders manage attendance"
ON attendance
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM bible_study_groups g
    WHERE g.id = attendance.group_id
    AND g.leader_profile_id = auth.uid()
  )
);

-------------------------------------------------
-- PROGRAM POLICIES
-------------------------------------------------

CREATE POLICY "Everyone view programs"
ON programs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins manage programs"
ON programs
FOR ALL
USING (is_admin());
