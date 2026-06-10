import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion } from "motion/react";
import {
  Globe, Users, Star, Calendar, TrendingUp, CheckCircle, Bell, Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatToEthiopian } from "../../utils/ethiopianDate";

export default function EvangelismDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ programs: [], converts: [], teams: [], loading: true });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [pRes, cRes, tRes] = await Promise.all([
      supabase.from("evangelism_programs").select("*").order("scheduled_date", { ascending: false }),
      supabase.from("new_converts").select("*").order("conversion_date", { ascending: false }),
      supabase.from("evangelism_teams").select("*"),
    ]);
    setData({ programs: pRes.data || [], converts: cRes.data || [], teams: tRes.data || [], loading: false });
  };

  if (data.loading) return (
    <div className="flex h-screen items-center justify-center bg-surface">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <Loader2 size={48} className="text-primary" />
      </motion.div>
    </div>
  );

  const completed = data.programs.filter(p => p.status === "Completed").length;
  const planned = data.programs.filter(p => p.status === "Planned").length;
  const pendingFollowup = data.converts.filter(c => c.follow_up_status === "Pending").length;

  const stats = [
    { label: "Total Programs", value: data.programs.length, icon: Globe, color: "text-primary", bg: "bg-primary/10" },
    { label: "New Converts", value: data.converts.length, icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Evangelism Teams", value: data.teams.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pending Follow-ups", value: pendingFollowup, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  const statusColor = {
    Planned: "bg-blue-500/10 text-blue-600",
    "In Progress": "bg-indigo-500/10 text-indigo-600",
    Completed: "bg-green-500/10 text-green-600",
    Cancelled: "bg-red-500/10 text-red-600",
  };

  const followupColor = {
    Pending: "bg-amber-500/10 text-amber-600",
    Contacted: "bg-blue-500/10 text-blue-600",
    Integrated: "bg-green-500/10 text-green-600",
    "Lost Contact": "bg-red-500/10 text-red-600",
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div>
          <h1 className="display-lg text-primary mb-2">Evangelism <span className="text-tertiary-fixed-dim italic">Ministry</span></h1>
          <p className="label-sm text-tertiary-fixed-dim tracking-[0.3em]">OUTREACH & MISSION</p>
          <p className="text-on-surface-variant mt-3 font-medium">Shalom, {user?.full_name}. Coordinate outreach missions and track converts.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/evangelism/programs" className="px-5 py-3 rounded-2xl bg-primary text-on-primary font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
            + New Program
          </Link>
          <Link to="/evangelism/converts" className="px-5 py-3 rounded-2xl border border-outline-variant/20 text-primary font-black text-xs uppercase tracking-widest hover:bg-surface-container transition-all">
            + Add Convert
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
        {/* Recent Programs */}
        <div className="xl:col-span-2 bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="headline-sm text-primary font-black flex items-center gap-3"><Globe size={22} /> Recent Programs</h2>
            <Link to="/evangelism/programs" className="text-xs text-primary/60 hover:text-primary font-bold uppercase tracking-widest">View All →</Link>
          </div>
          <div className="space-y-3">
            {data.programs.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Globe size={16} className="text-primary" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-sm text-primary truncate">{p.title}</p>
                  <p className="text-xs text-on-surface-variant">{p.program_type} {p.scheduled_date ? `· ${formatToEthiopian(p.scheduled_date?.split("T")[0])}` : ""}</p>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${statusColor[p.status]}`}>{p.status}</span>
              </div>
            ))}
            {data.programs.length === 0 && <p className="text-center text-on-surface-variant/50 py-8 text-sm">No programs yet.</p>}
          </div>
        </div>

        {/* Recent Converts */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="headline-sm text-primary font-black flex items-center gap-3"><Star size={20} className="text-amber-500" /> New Converts</h2>
            <Link to="/evangelism/converts" className="text-xs text-primary/60 hover:text-primary font-bold uppercase tracking-widest">View All →</Link>
          </div>
          <div className="space-y-3">
            {data.converts.slice(0, 6).map(c => (
              <div key={c.id} className="p-3 rounded-2xl bg-surface-container-low">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-sm text-primary truncate">{c.full_name}</p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${followupColor[c.follow_up_status]}`}>{c.follow_up_status}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">{formatToEthiopian(c.conversion_date)}</p>
              </div>
            ))}
            {data.converts.length === 0 && <p className="text-center text-on-surface-variant/50 py-8 text-xs">No converts recorded yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
