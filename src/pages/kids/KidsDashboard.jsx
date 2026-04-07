import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion } from "motion/react";
import { Baby, Users, Calendar, BarChart2, Bell, Search, Loader2, TrendingUp, Smile, Heart } from "lucide-react";

export default function KidsDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ kids: [], classes: [], attendance: [], loading: true });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [kidsRes, classesRes, attendanceRes] = await Promise.all([
        supabase.from("kids").select("*, kids_classes(class_name)"),
        supabase.from("kids_classes").select("*"),
        supabase.from("kids_attendance").select("*").order("date", { ascending: false }),
      ]);
      
      setData({
        kids: kidsRes.data || [],
        classes: classesRes.data || [],
        attendance: attendanceRes.data || [],
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
    { label: "Total Kids", value: data.kids.length, icon: Baby, color: "text-primary", bg: "bg-primary/10" },
    { label: "Active Classes", value: data.classes.length, icon: Users, color: "text-tertiary-fixed-dim", bg: "bg-tertiary-fixed-dim/10" },
    { label: "Attendance Rate", value: `${attendanceRate}%`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Birthdays Soon", value: 0, icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10" },
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div>
          <h1 className="display-lg text-primary mb-2">Kids <span className="text-tertiary-fixed-dim italic">Ministry</span></h1>
          <p className="label-sm text-tertiary-fixed-dim tracking-[0.3em]">Children's Spiritual Growth & Care</p>
          <p className="text-on-surface-variant mt-3 font-medium">Shalom, {user?.full_name}. Here is the overview of the Kids Department.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
            <input type="text" placeholder="Search kids..." className="editorial-input pl-10 w-56 bg-surface-container-low" />
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
        {/* Class Distribution */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
          <h2 className="headline-sm text-primary font-black mb-6 flex items-center gap-3">
            <Users size={24} /> Classes
          </h2>
          <div className="space-y-4">
            {data.classes.map((cls) => {
              const count = data.kids.filter(k => k.class_id === cls.id).length;
              const pct = data.kids.length > 0 ? Math.round((count / data.kids.length) * 100) : 0;
              return (
                <div key={cls.id}>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-bold text-primary">{cls.class_name}</p>
                    <p className="text-sm font-black text-primary">{count} kids</p>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.3, duration: 0.8 }}
                      className="h-full rounded-full bg-primary" />
                  </div>
                </div>
              );
            })}
            {data.classes.length === 0 && <p className="text-center text-on-surface-variant/50 py-8 text-sm">No classes found.</p>}
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
          <h2 className="headline-sm text-primary font-black mb-6 flex items-center gap-3">
            <TrendingUp size={24} /> Recent Trends
          </h2>
          <div className="space-y-3">
            {data.attendance.slice(0, 5).map((a, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low">
                <div className={`w-10 h-10 rounded-xl ${a.status === 'Present' ? 'bg-green-500/10' : 'bg-red-500/10'} flex items-center justify-center`}>
                  <Smile size={16} className={a.status === 'Present' ? 'text-green-500' : 'text-red-500'} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-primary truncate">Session: {new Date(a.date).toLocaleDateString()}</p>
                  <p className="text-xs text-on-surface-variant">{a.status}</p>
                </div>
              </div>
            ))}
            {data.attendance.length === 0 && <p className="text-center text-on-surface-variant/50 py-8 text-sm">No attendance records yet.</p>}
          </div>
        </div>

        {/* Birthday Reminders */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
          <h2 className="headline-sm text-primary font-black mb-6 flex items-center gap-3">
            <Heart size={24} /> Birthdays
          </h2>
          <div className="space-y-3">
            <p className="text-center text-on-surface-variant/50 py-8 text-sm">No birthdays this week.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
