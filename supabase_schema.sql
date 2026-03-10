/*
  GRACEFLOW CMS - SUPABASE SQL SCHEMA
  
  Run this in your Supabase SQL Editor to set up the database.
*/

-- 1. Create Profiles Table (Linked to Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'leader')) DEFAULT 'leader',
  group_id UUID, -- For leaders, which group they manage
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Members Table
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  date_of_birth DATE,
  phone_number TEXT,
  email TEXT,
  address TEXT,
  occupation TEXT,
  marital_status TEXT CHECK (marital_status IN ('Single', 'Married', 'Divorced', 'Widowed')),
  ministry TEXT,
  baptism_status BOOLEAN DEFAULT FALSE,
  membership_status TEXT CHECK (membership_status IN ('Active', 'Inactive')) DEFAULT 'Active',
  join_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Bible Study Groups Table
CREATE TABLE bible_study_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  leader_id UUID REFERENCES profiles(id),
  meeting_day TEXT,
  location TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Bible Study Group Members (Many-to-Many)
CREATE TABLE bible_study_members (
  group_id UUID REFERENCES bible_study_groups(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, member_id)
);

-- 5. Create Attendance Table
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  group_id UUID REFERENCES bible_study_groups(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('Present', 'Absent')) DEFAULT 'Present',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Programs Table
CREATE TABLE programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT,
  description TEXT,
  responsible_ministry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS)

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_study_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Members: Admins see all, Leaders see their group members
CREATE POLICY "Admins full access members" ON members FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Leaders view group members" ON members FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM bible_study_members bsm
    JOIN bible_study_groups bsg ON bsm.group_id = bsg.id
    WHERE bsm.member_id = members.id AND bsg.leader_id = auth.uid()
  )
);

-- Attendance: Leaders manage their group attendance
CREATE POLICY "Leaders manage group attendance" ON attendance FOR ALL USING (
  EXISTS (
    SELECT 1 FROM bible_study_groups bsg
    WHERE bsg.id = attendance.group_id AND bsg.leader_id = auth.uid()
  )
);
CREATE POLICY "Admins full access attendance" ON attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Programs: Everyone can view, only admins manage
CREATE POLICY "Everyone view programs" ON programs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage programs" ON programs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
