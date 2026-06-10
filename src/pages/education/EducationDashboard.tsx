import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion } from "motion/react";
import { BookOpen, Users, ClipboardList, TrendingUp, CheckCircle, Bell, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function EducationDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ courses: [], enrollments: [], attendance: [], loading: true });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [cRes, eRes, aRes] = await Promise.all([
      supabase.from("edu_courses").select("*").order("created_at", { ascending: false }),
      supabase.from("edu_enrollments").select("*"),
      supabase.from("edu_attendance").select("*"),
    ]);
    setData({ courses: cRes.data || [], enrollments: eRes.data || [], attendance: aRes.data || [], loading: false });
  };

  if (data.loading) return (
    <div className="flex h-screen items-center justify-center bg-surface">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <Loader2 size={48} className="text-primary" />
      </motion.div>
    </div>
  );

  const activeCourses = data.courses.filter(c => c.status === "Active").length;
  const totalStudents = [...new Set(data.enrollments.map(e => e.member_id))].length;
  const presentCount = data.attendance.filter(a => a.status === "Present").length;
  const attendanceRate = data.attendance.length > 0 ? Math.round((presentCount / data.attendance.length) * 100) : 0;

  const stats = [
    { label: "Total Courses", value: data.courses.length, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
    { label: "Active Courses", value: activeCourses, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Students", value: totalStudents, icon: Users, color: "text-tertiary-fixed-dim", bg: "bg-tertiary-fixed-dim/10" },
    { label: "Attendance Rate", value: `${attendanceRate}%`, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  const statusColor = {
    Active: "bg-green-500/10 text-green-600",
    Completed: "bg-surface-container-high text-on-surface-variant",
    Upcoming: "bg-blue-500/10 text-blue-600",
    Cancelled: "bg-red-500/10 text-red-600",
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div>
          <h1 className="display-lg text-primary mb-2">Education <span className="text-tertiary-fixed-dim italic">Ministry</span></h1>
          <p className="label-sm text-tertiary-fixed-dim tracking-[0.3em]">BIBLE CLASSES & TRAINING</p>
          <p className="text-on-surface-variant mt-3 font-medium">Shalom, {user?.full_name}. Manage courses and learning programs.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/education/courses" className="px-5 py-3 rounded-2xl bg-primary text-on-primary font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
            + New Course
          </Link>
          <Link to="/education/students" className="px-5 py-3 rounded-2xl border border-outline-variant/20 text-primary font-black text-xs uppercase tracking-widest hover:bg-surface-container transition-all">
            Register Student
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10">
            <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-4`}>
              <s.icon size={22} className={s.color} />
            </div>
            <p className="text-on-surface-variant text-sm font-medium mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Courses */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="headline-sm text-primary font-black flex items-center gap-3"><BookOpen size={22} /> Courses</h2>
            <Link to="/education/courses" className="text-xs text-primary/60 hover:text-primary font-bold uppercase tracking-widest">View All →</Link>
          </div>
          <div className="space-y-3">
            {data.courses.slice(0, 5).map(c => {
              const enrolled = data.enrollments.filter(e => e.course_id === c.id).length;
              return (
                <div key={c.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm text-primary truncate">{c.course_name}</p>
                    <p className="text-xs text-on-surface-variant">{enrolled} students · {c.schedule || "No schedule"}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${statusColor[c.status]}`}>{c.status}</span>
                </div>
              );
            })}
            {data.courses.length === 0 && <p className="text-center text-on-surface-variant/50 py-8 text-sm">No courses created yet.</p>}
          </div>
        </div>

        {/* Attendance Rate by Course */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
          <h2 className="headline-sm text-primary font-black mb-6 flex items-center gap-3"><TrendingUp size={22} /> Attendance by Course</h2>
          <div className="space-y-4">
            {data.courses.slice(0, 5).map(c => {
              const courseAtt = data.attendance.filter(a => a.course_id === c.id);
              const present = courseAtt.filter(a => a.status === "Present").length;
              const rate = courseAtt.length > 0 ? Math.round((present / courseAtt.length) * 100) : 0;
              return (
                <div key={c.id}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-bold text-primary truncate max-w-[60%]">{c.course_name}</p>
                    <p className="text-sm font-black text-primary">{rate}%</p>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${rate}%` }} transition={{ delay: 0.3, duration: 0.8 }}
                      className="h-full rounded-full bg-primary" />
                  </div>
                </div>
              );
            })}
            {data.courses.length === 0 && <p className="text-center text-on-surface-variant/50 py-8 text-sm">No attendance data.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
