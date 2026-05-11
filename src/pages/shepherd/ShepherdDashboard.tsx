import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion } from "motion/react";
import { Eye, Users, BookOpen, BarChart2, TrendingUp, Loader2, Shield, Bell, Search } from "lucide-react";

export default function ShepherdDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    assignments: [],
    groups: [],
    attendance: [],
    progress: [],
    members: [],
    loading: true,
  });

  useEffect(() => { 
    if (user?.id) loadData(); 
  }, [user?.id]);

  const loadData = async () => {
    try {
      const [assignments, attendance, progress] = await Promise.all([
        supabase.from("shepherd_assignments").select("*, bible_study_groups(id, group_name, location)").eq("shepherd_id", user?.id),
        supabase.from("study_attendance").select("*"),
        supabase.from("study_progress").select("*").order("created_at", { ascending: false }).limit(20),
      ]);

      const assignedGroupIds = (assignments.data || []).map(a => a.group_id);
      let members = { data: [] };
      if (assignedGroupIds.length > 0) {
        members = await supabase.from("members").select("*").in("group_id", assignedGroupIds);
      }

      setData({
        assignments: assignments.data || [],
        groups: (assignments.data || []).map(a => a.bible_study_groups).filter(Boolean),
        attendance: attendance.data || [],
        progress: progress.data || [],
        members: members.data || [],
        loading: false,
      });
    } catch (err) {
      console.error(err);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  if (data.loading) return (
    <div className="flex h-screen items-center justify-center bg-surface">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <Loader2 size={48} className="text-primary" />
      </motion.div>
    </div>
  );

  const presentCount = data.attendance.filter(a => a.status === "Present").length;
  const attendanceRate = data.attendance.length > 0 ? Math.round((presentCount / data.attendance.length) * 100) : 0;

  const stats = [
    { label: "Assigned Groups", value: data.groups.length, icon: Shield, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Members", value: data.members.length, icon: Users, color: "text-tertiary-fixed-dim", bg: "bg-tertiary-fixed-dim/10" },
    { label: "Attendance Rate", value: `${attendanceRate}%`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Study Sessions", value: data.progress.length, icon: BookOpen, color: "text-orange-400", bg: "bg-orange-400/10" },
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div>
          <h1 className="display-lg text-primary mb-2">Shepherd <span className="text-tertiary-fixed-dim italic">Overview</span></h1>
          <p className="label-sm text-tertiary-fixed-dim tracking-[0.3em]">Group Oversight & Supervisory Dashboard</p>
          <p className="text-on-surface-variant mt-3 font-medium">Welcome, {user?.full_name}. Monitor your assigned groups and leader performance.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
            <input type="text" placeholder="Search groups..." className="editorial-input pl-10 w-56 bg-surface-container-low" />
          </div>
          <button className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center relative hover:bg-surface-container transition-all border border-outline-variant/10">
            <Bell size={20} className="text-on-surface-variant" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10"
          >
            <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-4`}>
              <s.icon size={22} className={s.color} />
            </div>
            <p className="text-on-surface-variant text-sm font-medium mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Assigned Groups */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="headline-sm text-primary font-black">Assigned Groups</h2>
            <span className="label-sm text-primary/50">{data.groups.length} groups</span>
          </div>
          {data.groups.length === 0 ? (
            <div className="text-center py-12">
              <Shield size={36} className="mx-auto mb-3 text-on-surface-variant/30" />
              <p className="text-sm text-on-surface-variant/50">No groups assigned yet.</p>
              <p className="text-xs text-on-surface-variant/40 mt-1">Ask an admin to assign you to groups.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.groups.map((g, i) => {
                const groupMembers = data.members.filter(m => m.group_id === g.id);
                const groupAttendance = data.attendance.filter(a => a.group_id === g.id);
                const groupPresent = groupAttendance.filter(a => a.status === "Present").length;
                const rate = groupAttendance.length > 0 ? Math.round((groupPresent / groupAttendance.length) * 100) : 0;
                return (
                  <motion.div key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                    className="p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container-high transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-black text-primary text-sm">{g.group_name}</p>
                        {g.location && <p className="text-xs text-on-surface-variant">📍 {g.location}</p>}
                      </div>
                      <span className="text-[10px] font-black px-2 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                        {groupMembers.length} members
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs text-on-surface-variant">Attendance Rate</p>
                        <p className="text-xs font-black text-green-500">{rate}%</p>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                        <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${rate}%` }} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Study Progress */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="headline-sm text-primary font-black">Study Progress</h2>
            <span className="label-sm text-primary/50">Read-only</span>
          </div>
          <div className="space-y-3">
            {data.progress.slice(0, 8).map((p) => (
              <div key={p.id} className="flex items-start gap-3 p-4 rounded-2xl bg-surface-container-low">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={16} className="text-primary" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-primary truncate">{p.study_topic}</p>
                  {p.topic_or_book && <p className="text-xs text-on-surface-variant">{p.topic_or_book} {p.chapter ? `• Ch. ${p.chapter}` : ""}</p>}
                  <p className="text-xs text-on-surface-variant/60">{p.completion_date || "—"}</p>
                </div>
              </div>
            ))}
            {data.progress.length === 0 && (
              <p className="text-center text-on-surface-variant/50 py-8 text-sm">No study records found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
