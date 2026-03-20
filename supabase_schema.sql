-- ⛪ COMPLETE CHURCH ERP SUPABASE SCHEMA (SQL)
-- Paste this into Supabase SQL Editor to set up your backend instantly.

-- 1. PROFILES TABLE (Linked to Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'bible_leader')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. BIBLE STUDY GROUPS TABLE
CREATE TABLE bible_study_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_name TEXT NOT NULL,
  leader_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by_admin UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. MEMBERS TABLE (Church Attendees - No Login)
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  gender TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  join_date DATE DEFAULT CURRENT_DATE,
  group_id UUID REFERENCES bible_study_groups(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. STUDY ATTENDANCE TABLE
CREATE TABLE study_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES bible_study_groups(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('present', 'absent')),
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. STUDY PROGRESS TABLE
CREATE TABLE study_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES bible_study_groups(id) ON DELETE CASCADE,
  leader_id UUID REFERENCES profiles(id),
  book TEXT NOT NULL,
  chapter TEXT NOT NULL,
  verse TEXT,
  topic TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. EVENTS TABLE
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. FINANCE TRANSACTIONS TABLE
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('tithe', 'offering', 'donation', 'other')),
  amount DECIMAL(12,2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. RLS POLICIES (Row Level Security)

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Admin: Full access to everything
-- (We'll use a helper function or check metadata in real app, but for SQL we can check role in profiles)

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is leader of a group
CREATE OR REPLACE FUNCTION is_group_leader(g_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM bible_study_groups WHERE id = g_id AND leader_id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER;

-- Members Policies
CREATE POLICY "Admins can manage members" ON members FOR ALL USING (is_admin());
CREATE POLICY "Leaders can view their group members" ON members FOR SELECT USING (is_group_leader(group_id));

-- Bible Study Groups Policies
CREATE POLICY "Admins can manage groups" ON bible_study_groups FOR ALL USING (is_admin());
CREATE POLICY "Everyone can view groups" ON bible_study_groups FOR SELECT USING (true);

-- Study Attendance Policies
CREATE POLICY "Admins can view attendance" ON study_attendance FOR SELECT USING (is_admin());
CREATE POLICY "Leaders can manage their group attendance" ON study_attendance FOR ALL USING (is_group_leader(group_id));

-- Study Progress Policies
CREATE POLICY "Admins can view progress" ON study_progress FOR SELECT USING (is_admin());
CREATE POLICY "Leaders can manage their group progress" ON study_progress FOR ALL USING (is_group_leader(group_id));

-- Events Policies
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (is_admin());
CREATE POLICY "Everyone can view events" ON events FOR SELECT USING (true);

-- Transactions Policies
CREATE POLICY "Admins can manage transactions" ON transactions FOR ALL USING (is_admin());
