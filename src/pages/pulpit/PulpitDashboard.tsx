import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion } from "motion/react";
import {
  Mic2, Users, Calendar, Star, TrendingUp, CheckCircle, Bell, Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatToEthiopian } from "../../utils/ethiopianDate";

export default function PulpitDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ preachers: [], assignments: [], assessments: [], loading: true });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [pRes, aRes, assRes] = await Promise.all([
      supabase.from("preachers").select("*").order("created_at", { ascending: false }),
      supabase.from("pulpit_assignments").select("*").order("service_date", { ascending: false }),
      supabase.from("preacher_assessments").select("*").order("assessment_date", { ascending: false }),
    ]);
    setData({ preachers: pRes.data || [], assignments: aRes.data || [], assessments: assRes.data || [], loading: false });
  };

  if (data.loading) return (
    <div className="flex h-screen items-center justify-center bg-surface">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <Loader2 size={48} className="text-primary" />
      </motion.div>
    </div>
  );

  const upcoming = data.assignments.filter(a => a.status === "Scheduled" || a.status === "Confirmed").length;
  const avgScore = data.assessments.length > 0
    ? (data.assessments.reduce((s, a) => s + Number(a.overall_score || 0), 0) / data.assessments.length).toFixed(1)
    : "—";

  const stats = [
    { label: "Total Preachers", value: data.preachers.length, icon: Mic2, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Assignments", value: data.assignments.length, icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Upcoming", value: upcoming, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Avg Assessment", value: avgScore, icon: Star, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  const statusColor = {
    Scheduled: "bg-blue-500/10 text-blue-600",
    Confirmed: "bg-indigo-500/10 text-indigo-600",
    Completed: "bg-green-500/10 text-green-600",
    Cancelled: "bg-red-500/10 text-red-600",
  };

  const typeColor = {
    Preaching: "bg-primary/10 text-primary",
    "Worship Leading": "bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim",
    Singing: "bg-pink-500/10 text-pink-600",
    Prayer: "bg-indigo-500/10 text-indigo-600",
    Other: "bg-surface-container text-on-surface-variant",
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div>
          <h1 className="display-lg text-primary mb-2">Pulpit <span className="text-tertiary-fixed-dim italic">Ministry</span></h1>
          <p className="label-sm text-tertiary-fixed-dim tracking-[0.3em]">PREACHERS & WORSHIP COORDINATION</p>
          <p className="text-on-surface-variant mt-3 font-medium">Shalom, {user?.full_name}. Manage preachers, assignments and assessments.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/pulpit/preachers" className="px-5 py-3 rounded-2xl bg-primary text-on-primary font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
            + Add Preacher
          </Link>
          <Link to="/pulpit/assignments" className="px-5 py-3 rounded-2xl border border-outline-variant/20 text-primary font-black text-xs uppercase tracking-widest hover:bg-surface-container transition-all">
            + New Assignment
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Upcoming Assignments */}
        <div className="xl:col-span-2 bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="headline-sm text-primary font-black flex items-center gap-3"><Calendar size={22} /> Assignments</h2>
            <Link to="/pulpit/assignments" className="text-xs text-primary/60 hover:text-primary font-bold uppercase tracking-widest">View All →</Link>
          </div>
          <div className="space-y-3">
            {data.assignments.slice(0, 6).map(a => {
              const preacher = data.preachers.find(p => p.id === a.preacher_id);
              return (
                <div key={a.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 font-black text-primary">
                    {preacher?.full_name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm text-primary truncate">{preacher?.full_name || "Unknown Preacher"}</p>
                    <p className="text-xs text-on-surface-variant">{a.service_type} · {formatToEthiopian(a.service_date?.split("T")[0])}</p>
                    {a.topic && <p className="text-xs text-on-surface-variant/60 italic truncate">"{a.topic}"</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${typeColor[a.assignment_type]}`}>{a.assignment_type}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${statusColor[a.status]}`}>{a.status}</span>
                  </div>
                </div>
              );
            })}
            {data.assignments.length === 0 && <p className="text-center text-on-surface-variant/50 py-8 text-sm">No assignments yet.</p>}
          </div>
        </div>

        {/* Top Preachers & Recent Assessments */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10">
            <h2 className="headline-sm text-primary font-black mb-4 flex items-center gap-3"><Mic2 size={20} /> Preachers</h2>
            <div className="space-y-3">
              {data.preachers.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-sm">
                    {p.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-primary truncate">{p.full_name}</p>
                    <p className="text-xs text-on-surface-variant">{p.is_internal ? "Internal" : "Invited"} {p.specialization ? `· ${p.specialization}` : ""}</p>
                  </div>
                </div>
              ))}
              {data.preachers.length === 0 && <p className="text-center text-on-surface-variant/50 py-4 text-xs">No preachers added.</p>}
            </div>
            <Link to="/pulpit/preachers" className="mt-4 block text-center text-xs text-primary/60 hover:text-primary font-bold uppercase tracking-widest">
              View All →
            </Link>
          </div>

          <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10">
            <h2 className="headline-sm text-primary font-black mb-4 flex items-center gap-3"><Star size={20} className="text-amber-500" /> Recent Assessments</h2>
            <div className="space-y-3">
              {data.assessments.slice(0, 3).map(a => {
                const preacher = data.preachers.find(p => p.id === a.preacher_id);
                return (
                  <div key={a.id} className="p-3 rounded-2xl bg-surface-container-low">
                    <p className="text-sm font-bold text-primary">{preacher?.full_name || "Unknown"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={12} className={s <= Math.round(a.overall_score || 0) ? "text-amber-500 fill-amber-500" : "text-on-surface-variant/20"} />
                        ))}
                      </div>
                      <span className="text-xs font-black text-primary">{a.overall_score || "—"}/5</span>
                    </div>
                  </div>
                );
              })}
              {data.assessments.length === 0 && <p className="text-center text-on-surface-variant/50 py-4 text-xs">No assessments yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
