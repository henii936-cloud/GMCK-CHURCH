import { formatToEthiopian } from "../../utils/ethiopianDate";
import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion } from "motion/react";
import { Zap, Users, Calendar, BarChart2, Bell, Search, Loader2, TrendingUp } from "lucide-react";

export default function YouthDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ youthMembers: [], events: [], notifications: [], attendance: [], loading: true });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [members, events, notifs, attendance] = await Promise.all([
        supabase.from("members").select("*").in("age_group", ["Youth", "Teen", "Young Adult"]),
        supabase.from("youth_events").select("*").order("event_date", { ascending: false }),
        supabase.from("youth_notifications").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("youth_attendance").select("*"),
      ]);
      setData({
        youthMembers: members.data || [],
        events: events.data || [],
        notifications: notifs.data || [],
        attendance: attendance.data || [],
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

  const upcomingEvents = data.events.filter(e => e.status === "Upcoming").length;
  const presentCount = data.attendance.filter(a => a.status === "Present").length;
  const attendanceRate = data.attendance.length > 0 ? Math.round((presentCount / data.attendance.length) * 100) : 0;

  const ageGroup = (ag) => data.youthMembers.filter(m => m.age_group === ag).length;

  const stats = [
    { label: "Youth Members", value: data.youthMembers.length, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Upcoming Events", value: upcomingEvents, icon: Calendar, color: "text-tertiary-fixed-dim", bg: "bg-tertiary-fixed-dim/10" },
    { label: "Attendance Rate", value: `${attendanceRate}%`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Notifications Sent", value: data.notifications.length, icon: Bell, color: "text-orange-400", bg: "bg-orange-400/10" },
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div>
          <h1 className="display-lg text-primary mb-2">Youth <span className="text-tertiary-fixed-dim italic">Ministry</span></h1>
          <p className="label-sm text-tertiary-fixed-dim tracking-[0.3em]">Youth Engagement, Events & Analytics</p>
          <p className="text-on-surface-variant mt-3 font-medium">Welcome, {user?.full_name}. Manage youth programs and monitor engagement.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
            <input type="text" placeholder="Search youth members..." className="editorial-input pl-10 w-56 bg-surface-container-low" />
          </div>
          <button className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center relative hover:bg-surface-container transition-all border border-outline-variant/10">
            <Bell size={20} className="text-on-surface-variant" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-tertiary-fixed-dim rounded-full" />
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Age Distribution */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
          <h2 className="headline-sm text-primary font-black mb-6">Age Distribution</h2>
          <div className="space-y-4">
            {[["Teen", "13-17"], ["Youth", "18-25"], ["Young Adult", "26-35"]].map(([group, range]) => {
              const count = ageGroup(group);
              const pct = data.youthMembers.length > 0 ? Math.round((count / data.youthMembers.length) * 100) : 0;
              return (
                <div key={group}>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-bold text-primary">{group} <span className="text-on-surface-variant font-normal text-xs">({range})</span></p>
                    <p className="text-sm font-black text-primary">{count}</p>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.3, duration: 0.8 }}
                      className="h-full rounded-full bg-primary" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
          <h2 className="headline-sm text-primary font-black mb-6">Events</h2>
          <div className="space-y-3">
            {data.events.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-start gap-3 p-3 rounded-2xl bg-surface-container-low">
                <div className="w-10 h-10 rounded-xl bg-tertiary-fixed-dim/10 flex items-center justify-center flex-shrink-0">
                  <Calendar size={16} className="text-tertiary-fixed-dim" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-primary truncate">{e.title}</p>
                  <p className="text-xs text-on-surface-variant">{formatToEthiopian(e.event_date)}</p>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${e.status === "Upcoming" ? "bg-green-500/10 text-green-500" : "bg-orange-400/10 text-orange-400"}`}>
                    {e.status}
                  </span>
                </div>
              </div>
            ))}
            {data.events.length === 0 && <p className="text-center text-on-surface-variant/50 py-8 text-sm">No events yet.</p>}
          </div>
        </div>

        {/* Recent Youth Members */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
          <h2 className="headline-sm text-primary font-black mb-6">Youth Members</h2>
          <div className="space-y-3">
            {data.youthMembers.slice(0, 6).map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-sm">
                  {m.full_name?.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-primary truncate">{m.full_name}</p>
                  <p className="text-xs text-on-surface-variant">{m.age_group} • {m.gender || "—"}</p>
                </div>
              </div>
            ))}
            {data.youthMembers.length === 0 && <p className="text-center text-on-surface-variant/50 py-8 text-sm">No youth members found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
