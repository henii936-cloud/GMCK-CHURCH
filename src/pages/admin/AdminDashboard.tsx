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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    members: 0,
    groups: 0,
    leaders: 0,
    attendance: 0,
    finance: 0,
  });
  const [recentStudy, setRecentStudy] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [onlineElders, setOnlineElders] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchRecentData(),
      fetchPendingApprovals(),
    ]);
    setLoading(false);
  };

  const fetchStats = async () => {
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
        supabase.from("study_attendance").select("status"),
      ]);

      const totalFinance =
        financeData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      let attendanceRate = 0;
      if (attendanceData && attendanceData.length > 0) {
        const presentCount = attendanceData.filter(
          (a) => a.status === "Present",
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

  const fetchRecentData = async () => {
    try {
      const [studyData, eventsData, onlineData] = await Promise.all([
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
          .order("created_at", { ascending: false })
          .limit(5),
      ]);
      setRecentStudy(studyData.data || []);
      setUpcomingEvents(eventsData.data || []);
      setOnlineElders(onlineData.data || []);
      setActivityLogs([]); // Empty array since table doesn't exist
    } catch (err) {
      console.error("Error fetching recent data:", err);
    }
  };

  const fetchPendingApprovals = async () => {
    const { data } = await supabase
      .from("budgets")
      .select("*, approvals(*)")
      .in("status", ["Pending", "Partially Approved"])
      .order("created_at", { ascending: false })
      .limit(5);
    setPendingApprovals(data || []);
  };

  const statCards = [
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
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-on-surface-variant">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 shrink-0">
            <div className="max-w-2xl">
              <p className="label-sm text-tertiary-fixed-dim mb-2 tracking-[0.3em]">
                Administrative Oversight
              </p>
              <h1 className="display-lg text-primary mb-2">
                Admin{" "}
                <span className="text-tertiary-fixed-dim italic">
                  Dashboard
                </span>
              </h1>
              <p className="text-on-surface-variant font-medium tracking-wide leading-relaxed text-sm">
                Global overview of church operations and Bible study progress. A
                digital sanctuary for ministry management.
              </p>
            </div>
            <div className="flex items-center gap-6 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg signature-gradient">
                <Calendar size={20} className="text-on-primary" />
              </div>
              <div className="text-right">
                <p className="label-sm opacity-60 mb-1">Current Period</p>
                <p className="text-lg font-heading font-bold text-primary">
                  {formatToEthiopian(new Date())}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 shrink-0">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() =>
                  stat.label === "Group Leaders" && navigate("/admin/leaders")
                }
                className={`editorial-card group p-5 flex flex-col justify-between relative overflow-hidden ${stat.label === "Group Leaders" ? "cursor-pointer active:scale-95" : "cursor-default"}`}
                style={{
                  borderTop: `4px solid ${stat.color}`,
                  boxShadow: `0 8px 24px -8px color-mix(in srgb, ${stat.color} 30%, transparent)`,
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${stat.color}, transparent)`,
                  }}
                />
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 shadow-sm"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${stat.color} 15%, transparent)`,
                      color: stat.color,
                    }}
                  >
                    <stat.icon size={24} strokeWidth={2} />
                  </div>
                  <div
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${stat.color} 10%, transparent)`,
                      color: stat.color,
                    }}
                  >
                    <TrendingUp size={12} strokeWidth={2.5} />
                    <span>+12%</span>
                  </div>
                </div>

                <div className="relative z-10">
                  <p className="label-sm opacity-70 mb-1.5 text-[11px] tracking-[0.15em]">
                    {stat.label}
                  </p>
                  <h3
                    className="text-3xl font-heading font-bold"
                    style={{ color: stat.color }}
                  >
                    {loading ? "..." : stat.value}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 editorial-card flex flex-col p-6 min-h-[400px]">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="headline-sm text-primary text-xl">
                  Recent Study{" "}
                  <span className="text-tertiary-fixed-dim italic">
                    Progress
                  </span>
                </h3>
                <button className="label-sm text-primary hover:text-tertiary-fixed-dim transition-colors">
                  View All
                </button>
              </div>
              <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
                {recentStudy.length > 0 ? (
                  recentStudy.map((study) => (
                    <div
                      key={study.id}
                      className="ministry-feed-item group hover:bg-surface-container-low rounded-lg transition-all px-4 py-2"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all shrink-0">
                          <BookOpen size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate">
                            {study.bible_study_groups?.group_name}
                          </p>
                          <p className="text-xs text-on-surface-variant truncate">
                            {study.topic}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="label-sm opacity-60 text-xs">
                            {formatToEthiopian(study.date)}
                          </p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-primary">
                            Completed
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-on-surface-variant/40 font-medium text-sm">
                    No recent study progress recorded.
                  </p>
                )}
              </div>
            </div>

            <div className="editorial-card flex flex-col p-6 min-h-[400px]">
              <h3 className="headline-sm text-primary text-xl mb-4 shrink-0">
                Upcoming{" "}
                <span className="text-tertiary-fixed-dim italic">Events</span>
              </h3>
              <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => {
                    const date = new Date(event.date);
                    return (
                      <div
                        key={event.id}
                        className="flex gap-4 group items-center"
                      >
                        <div className="text-center min-w-[40px] shrink-0">
                          <p className="label-sm text-tertiary-fixed-dim text-xs">
                            {formatToEthiopian(date)}
                          </p>
                          <p className="text-xl font-heading font-bold text-primary leading-none">
                            {date.getDate()}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate">
                            {event.title}
                          </p>
                          <p className="label-sm opacity-60 mt-0.5 text-xs truncate">
                            {event.location} • {event.event_time}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-8 text-on-surface-variant/40 font-medium text-sm">
                    No upcoming events.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pb-6">
            <div className="space-y-8">
              <div className="bg-surface border border-outline-variant/10 rounded-[32px] p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-on-surface flex items-center gap-3">
                    <ShieldCheck className="text-primary" size={24} />
                    Pending <span className="text-primary">Approvals</span>
                  </h2>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full">
                    {pendingApprovals.length} ACTION ITEMS
                  </span>
                </div>
                <div className="space-y-4">
                  {pendingApprovals.length === 0 ? (
                    <div className="py-8 text-center bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/20">
                      <Activity
                        size={32}
                        className="mx-auto text-on-surface-variant/20 mb-2"
                      />
                      <p className="text-xs font-bold text-on-surface-variant/40 italic">
                        All caught up!
                      </p>
                    </div>
                  ) : (
                    pendingApprovals.map((budget) => (
                      <div
                        key={budget.id}
                        className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/5 hover:border-primary/20 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-sm font-black text-on-surface truncate pr-4">
                            {budget.name.split("::")[1] || budget.name}
                          </h3>
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                              budget.status === "Pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {budget.status === "Pending"
                              ? "Needs Justifier"
                              : "Needs Signer"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-black text-primary">
                            ${budget.amount?.toLocaleString()}
                          </p>
                          {budget.approvals && budget.approvals.length > 0 && (
                            <div className="flex items-center gap-1">
                              {budget.approvals.map((app) => (
                                <div
                                  key={app.id}
                                  title={`${app.approver_name} (${app.role})`}
                                  className={`w-5 h-5 rounded-full border-2 border-surface flex items-center justify-center text-[7px] font-black ${
                                    app.role === "justifier"
                                      ? "bg-emerald-500 text-white"
                                      : "bg-primary text-white"
                                  }`}
                                >
                                  {app.approver_name[0]}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-surface border border-outline-variant/10 rounded-[32px] p-8">
                <h2 className="text-xl font-black text-on-surface mb-6 flex items-center gap-3">
                  <Eye className="text-tertiary" size={24} />
                  Elders <span className="text-tertiary">Activity</span>
                </h2>
                <div className="space-y-4">
                  {onlineElders.map((elder) => {
                    const lastActive = new Date(elder.last_active);
                    const isOnline = new Date() - lastActive < 5 * 60 * 1000;
                    return (
                      <div
                        key={elder.id}
                        className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/5"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-black ${
                              isOnline
                                ? "bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/20"
                                : "bg-on-surface-variant/5 text-on-surface-variant"
                            }`}
                          >
                            {elder.full_name?.[0] || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-black text-on-surface">
                              {elder.full_name}
                            </p>
                            <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">
                              {elder.role}
                            </p>
                          </div>
                        </div>
                        {isOnline && (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase">
                              Live
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-surface border border-outline-variant/10 rounded-[32px] p-8">
              <h2 className="text-xl font-black text-on-surface mb-6 flex items-center gap-3">
                <Activity className="text-primary" size={24} />
                Multi-User <span className="text-primary">Audit Trail</span>
              </h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {activityLogs.length === 0 ? (
                  <p className="text-xs text-on-surface-variant/40 italic text-center py-4">
                    No recent system activity logs available.
                  </p>
                ) : (
                  activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/5 relative overflow-hidden group"
                    >
                      <div
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          log.action === "approve"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : log.action === "reject"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-primary/5 text-primary"
                        }`}
                      >
                        {log.action === "approve" ? (
                          <ShieldCheck size={14} />
                        ) : log.action === "reject" ? (
                          <AlertCircle size={14} />
                        ) : (
                          <Clock size={14} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-on-surface mb-1 leading-snug">
                          {log.description}
                        </p>
                        <p className="text-[10px] text-on-surface-variant/60 font-medium">
                          {new Date(log.created_at).toLocaleTimeString()} •{" "}
                          {formatToEthiopian(log.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
