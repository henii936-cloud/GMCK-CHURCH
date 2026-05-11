import { formatToEthiopian } from "../../utils/ethiopianDate";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  MapPin,
  ShieldCheck,
  ClipboardList,
  BookOpen,
  Activity,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Eye,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "../../services/supabaseClient";
import { Card } from "../../components/common/UI";

// =========================
// Types
// =========================

interface Stats {
  members: number;
  groups: number;
  leaders: number;
  attendance: number;
  finance: number;
}

interface StudyGroup {
  group_name: string;
}

interface StudyProgress {
  id: string;
  topic: string;
  date: string;
  created_at: string;
  bible_study_groups?: StudyGroup;
}

interface EventItem {
  id: string;
  title: string;
  location: string;
  event_time: string;
  date: string;
}

interface Profile {
  id: string;
  full_name: string;
  role: string;
  last_active: string;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  created_at: string;
  profiles?: {
    full_name: string;
    role: string;
  };
}

interface Approval {
  id: string;
  approver_name: string;
  role: string;
}

interface Budget {
  id: string;
  name: string;
  amount: number;
  status: string;
  approvals?: Approval[];
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

export default function AdminDashboard(): JSX.Element {
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats>({
    members: 0,
    groups: 0,
    leaders: 0,
    attendance: 0,
    finance: 0,
  });

  const [recentStudy, setRecentStudy] = useState<StudyProgress[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [onlineElders, setOnlineElders] = useState<Profile[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (): Promise<void> => {
    setLoading(true);

    await Promise.all([
      fetchStats(),
      fetchRecentData(),
      fetchPendingApprovals(),
    ]);

    setLoading(false);
  };

  const fetchStats = async (): Promise<void> => {
    try {
      const [
        { count: membersCount },
        { count: groupsCount },
        { count: leadersCount },
        { data: financeData },
        { data: attendanceData },
      ] = await Promise.all([
        supabase.from("members").select("*", { count: "exact", head: true }),

        supabase
          .from("bible_study_groups")
          .select("*", { count: "exact", head: true }),

        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "bible_leader"),

        supabase.from("transactions").select("amount"),

        supabase.from("attendance").select("status"),
      ]);

      const totalFinance =
        financeData?.reduce(
          (sum: number, t: { amount: number | string }) =>
            sum + Number(t.amount),
          0,
        ) || 0;

      let attendanceRate = 0;

      if (attendanceData && attendanceData.length > 0) {
        const presentCount = attendanceData.filter(
          (a: { status: string }) => a.status === "Present",
        ).length;

        attendanceRate = Math.round(
          (presentCount / attendanceData.length) * 100,
        );
      }

      setStats({
        members: membersCount || 0,
        groups: groupsCount || 0,
        leaders: leadersCount || 0,
        attendance: attendanceRate,
        finance: totalFinance,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchRecentData = async (): Promise<void> => {
    try {
      const [studyData, eventsData, onlineData, activityData] =
        await Promise.all([
          supabase
            .from("study_progress")
            .select("*, bible_study_groups(group_name)")
            .order("created_at", { ascending: false })
            .limit(5),

          supabase
            .from("events")
            .select("*")
            .gte("date", new Date().toISOString().split("T")[0])
            .order("date", { ascending: true })
            .limit(3),

          supabase
            .from("profiles")
            .select("*")
            .order("last_active", { ascending: false })
            .limit(5),

          supabase
            .from("activity_logs")
            .select("*, profiles(full_name, role)")
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

      setRecentStudy((studyData.data as StudyProgress[]) || []);
      setUpcomingEvents((eventsData.data as EventItem[]) || []);
      setOnlineElders((onlineData.data as Profile[]) || []);
      setActivityLogs((activityData.data as ActivityLog[]) || []);
    } catch (err) {
      console.error("Error fetching recent data:", err);
    }
  };

  const fetchPendingApprovals = async (): Promise<void> => {
    const { data } = await supabase
      .from("budgets")
      .select("*, approvals(*)")
      .in("status", ["Pending", "Partially Approved"])
      .order("created_at", { ascending: false })
      .limit(5);

    setPendingApprovals((data as Budget[]) || []);
  };

  const statCards: StatCard[] = [
    {
      label: "Total Members",
      value: stats.members,
      icon: Users,
      color: "var(--color-premium-sapphire)",
    },
    {
      label: "Bible Study Groups",
      value: stats.groups,
      icon: MapPin,
      color: "var(--color-premium-emerald)",
    },
    {
      label: "Group Leaders",
      value: stats.leaders,
      icon: ShieldCheck,
      color: "var(--color-premium-gold)",
    },
    {
      label: "Weekly Attendance",
      value: `${stats.attendance}%`,
      icon: ClipboardList,
      color: "var(--color-premium-ruby)",
    },
    {
      label: "Total Finance",
      value: `$${stats.finance.toLocaleString()}`,
      icon: DollarSign,
      color: "var(--color-premium-amethyst)",
    },
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto h-[calc(100vh-11rem)] flex flex-col">
      {/* Your JSX remains exactly the same */}
    </div>
  );
}
