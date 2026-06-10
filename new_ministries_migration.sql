-- =====================================================
-- ⛪ NEW MINISTRY ROLES MIGRATION
-- Run this in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: Extend profiles role CHECK constraint
-- =====================================================

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'admin',
    'bible_leader',
    'finance',
    'management',
    'youth_ministry',
    'shepherd',
    'kids_ministry',
    -- NEW ROLES --
    'counseling_ministry',
    'church_development',
    'diaconate',
    'education_ministry',
    'evangelism_ministry',
    'pulpit_ministry'
  ));

-- =====================================================
-- STEP 2: COUNSELING MINISTRY TABLES
-- =====================================================

-- Counseling Requests
CREATE TABLE IF NOT EXISTS public.counseling_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  requester_name TEXT NOT NULL,
  phone TEXT,
  issue_summary TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed')),
  priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
  assigned_counselor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- Counseling Sessions
CREATE TABLE IF NOT EXISTS public.counseling_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.counseling_requests(id) ON DELETE CASCADE,
  counselor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  notes TEXT, -- Encrypted / confidential
  status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'No-Show')),
  follow_up_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- Counseling Follow-ups
CREATE TABLE IF NOT EXISTS public.counseling_followups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.counseling_sessions(id) ON DELETE CASCADE,
  follow_up_date DATE NOT NULL,
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- RLS for Counseling
ALTER TABLE public.counseling_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counseling_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counseling_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "counseling_admin_all" ON public.counseling_requests FOR ALL USING (public.is_admin());
CREATE POLICY "counseling_ministry_all" ON public.counseling_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counseling_ministry')
);

CREATE POLICY "counseling_sessions_admin" ON public.counseling_sessions FOR ALL USING (public.is_admin());
CREATE POLICY "counseling_sessions_ministry" ON public.counseling_sessions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counseling_ministry')
);

CREATE POLICY "counseling_followups_admin" ON public.counseling_followups FOR ALL USING (public.is_admin());
CREATE POLICY "counseling_followups_ministry" ON public.counseling_followups FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'counseling_ministry')
);

-- =====================================================
-- STEP 3: CHURCH DEVELOPMENT MINISTRY TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.development_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Construction' CHECK (category IN ('Construction', 'Renovation', 'Maintenance', 'Infrastructure', 'Other')),
  status TEXT DEFAULT 'Planning' CHECK (status IN ('Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled')),
  budget_allocated DECIMAL(12,2) DEFAULT 0,
  budget_spent DECIMAL(12,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  project_manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.development_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.development_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dev_projects_admin" ON public.development_projects FOR ALL USING (public.is_admin());
CREATE POLICY "dev_projects_ministry" ON public.development_projects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'church_development')
);
CREATE POLICY "dev_projects_view" ON public.development_projects FOR SELECT USING (true);

CREATE POLICY "milestones_admin" ON public.project_milestones FOR ALL USING (public.is_admin());
CREATE POLICY "milestones_ministry" ON public.project_milestones FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'church_development')
);

-- =====================================================
-- STEP 4: DIACONATE MINISTRY TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.deacon_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deacon_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  responsibility TEXT NOT NULL,
  area TEXT, -- e.g. "Ushering", "Communion", "Sound"
  service_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Assigned' CHECK (status IN ('Assigned', 'Completed', 'Excused')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.welfare_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  beneficiary_name TEXT,
  beneficiary_member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  activity_type TEXT DEFAULT 'Assistance' CHECK (activity_type IN ('Assistance', 'Charity', 'Food', 'Medical', 'Clothing', 'Other')),
  amount_given DECIMAL(12,2) DEFAULT 0,
  activity_date DATE DEFAULT CURRENT_DATE,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.deacon_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welfare_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deacon_assign_admin" ON public.deacon_assignments FOR ALL USING (public.is_admin());
CREATE POLICY "deacon_assign_ministry" ON public.deacon_assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'diaconate')
);

CREATE POLICY "welfare_admin" ON public.welfare_activities FOR ALL USING (public.is_admin());
CREATE POLICY "welfare_ministry" ON public.welfare_activities FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'diaconate')
);

-- =====================================================
-- STEP 5: EDUCATION MINISTRY TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.edu_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_name TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  schedule TEXT, -- e.g. "Every Sunday 9am"
  location TEXT,
  max_students INTEGER DEFAULT 30,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Upcoming', 'Cancelled')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.edu_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.edu_courses(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Dropped')),
  progress_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(course_id, member_id)
);

CREATE TABLE IF NOT EXISTS public.edu_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.edu_courses(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  session_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'Excused')),
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.edu_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "edu_courses_admin" ON public.edu_courses FOR ALL USING (public.is_admin());
CREATE POLICY "edu_courses_ministry" ON public.edu_courses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'education_ministry')
);
CREATE POLICY "edu_courses_view" ON public.edu_courses FOR SELECT USING (true);

CREATE POLICY "edu_enroll_admin" ON public.edu_enrollments FOR ALL USING (public.is_admin());
CREATE POLICY "edu_enroll_ministry" ON public.edu_enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'education_ministry')
);

CREATE POLICY "edu_attend_admin" ON public.edu_attendance FOR ALL USING (public.is_admin());
CREATE POLICY "edu_attend_ministry" ON public.edu_attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'education_ministry')
);

-- =====================================================
-- STEP 6: EVANGELISM MINISTRY TABLES (Standalone)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.evangelism_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  program_type TEXT DEFAULT 'Outreach' CHECK (program_type IN ('Outreach', 'Preaching', 'Door-to-Door', 'Event', 'Mission', 'Other')),
  location TEXT,
  scheduled_date TIMESTAMPTZ,
  status TEXT DEFAULT 'Planned' CHECK (status IN ('Planned', 'In Progress', 'Completed', 'Cancelled')),
  team_lead_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.new_converts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  gender TEXT,
  program_id UUID REFERENCES public.evangelism_programs(id) ON DELETE SET NULL,
  conversion_date DATE DEFAULT CURRENT_DATE,
  follow_up_status TEXT DEFAULT 'Pending' CHECK (follow_up_status IN ('Pending', 'Contacted', 'Integrated', 'Lost Contact')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.evangelism_teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_name TEXT NOT NULL,
  leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.evangelism_team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.evangelism_teams(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(team_id, member_id)
);

ALTER TABLE public.evangelism_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.new_converts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evangelism_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evangelism_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evang_programs_admin" ON public.evangelism_programs FOR ALL USING (public.is_admin());
CREATE POLICY "evang_programs_ministry" ON public.evangelism_programs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('evangelism_ministry', 'shepherd'))
);

CREATE POLICY "converts_admin" ON public.new_converts FOR ALL USING (public.is_admin());
CREATE POLICY "converts_ministry" ON public.new_converts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('evangelism_ministry', 'shepherd'))
);

CREATE POLICY "evang_teams_admin" ON public.evangelism_teams FOR ALL USING (public.is_admin());
CREATE POLICY "evang_teams_ministry" ON public.evangelism_teams FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('evangelism_ministry', 'shepherd'))
);

CREATE POLICY "evang_team_members_admin" ON public.evangelism_team_members FOR ALL USING (public.is_admin());
CREATE POLICY "evang_team_members_ministry" ON public.evangelism_team_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('evangelism_ministry', 'shepherd'))
);

-- =====================================================
-- STEP 7: PULPIT MINISTRY TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.preachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  church_affiliation TEXT,
  specialization TEXT, -- e.g. "Expository", "Evangelistic"
  is_internal BOOLEAN DEFAULT FALSE, -- Internal vs invited
  profile_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.pulpit_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  preacher_id UUID REFERENCES public.preachers(id) ON DELETE CASCADE,
  assignment_type TEXT DEFAULT 'Preaching' CHECK (assignment_type IN ('Preaching', 'Worship Leading', 'Singing', 'Prayer', 'Other')),
  service_date TIMESTAMPTZ NOT NULL,
  service_type TEXT DEFAULT 'Sunday Service' CHECK (service_type IN ('Sunday Service', 'Midweek', 'Special Event', 'Youth Service', 'Other')),
  topic TEXT,
  status TEXT DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Confirmed', 'Completed', 'Cancelled')),
  assigned_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.preacher_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  preacher_id UUID REFERENCES public.preachers(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.pulpit_assignments(id) ON DELETE SET NULL,
  assessed_by UUID REFERENCES public.profiles(id),
  delivery_score INTEGER CHECK (delivery_score BETWEEN 1 AND 5),
  content_score INTEGER CHECK (content_score BETWEEN 1 AND 5),
  style_score INTEGER CHECK (style_score BETWEEN 1 AND 5),
  engagement_score INTEGER CHECK (engagement_score BETWEEN 1 AND 5),
  overall_score DECIMAL(3,1),
  feedback TEXT,
  assessment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.preachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulpit_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preacher_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "preachers_admin" ON public.preachers FOR ALL USING (public.is_admin());
CREATE POLICY "preachers_ministry" ON public.preachers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'pulpit_ministry')
);
CREATE POLICY "preachers_view" ON public.preachers FOR SELECT USING (true);

CREATE POLICY "pulpit_assign_admin" ON public.pulpit_assignments FOR ALL USING (public.is_admin());
CREATE POLICY "pulpit_assign_ministry" ON public.pulpit_assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'pulpit_ministry')
);
CREATE POLICY "pulpit_assign_view" ON public.pulpit_assignments FOR SELECT USING (true);

CREATE POLICY "preacher_assess_admin" ON public.preacher_assessments FOR ALL USING (public.is_admin());
CREATE POLICY "preacher_assess_ministry" ON public.preacher_assessments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'pulpit_ministry')
);

-- =====================================================
-- DONE ✅
-- =====================================================
