import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion } from "motion/react";
import {
  HardHat, TrendingUp, CheckCircle, Clock, DollarSign,
  Plus, X, Edit2, Trash2, Loader2, Search, BarChart2
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { formatToEthiopian } from "../../utils/ethiopianDate";
import { Link } from "react-router-dom";

export default function DevDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [projRes, mileRes] = await Promise.all([
      supabase.from("development_projects").select("*").order("created_at", { ascending: false }),
      supabase.from("project_milestones").select("*").eq("completed", false).order("due_date", { ascending: true }),
    ]);
    setProjects(projRes.data || []);
    setMilestones(mileRes.data || []);
    setLoading(false);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-surface">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <Loader2 size={48} className="text-primary" />
      </motion.div>
    </div>
  );

  const active = projects.filter(p => p.status === "In Progress").length;
  const completed = projects.filter(p => p.status === "Completed").length;
  const totalBudget = projects.reduce((s, p) => s + Number(p.budget_allocated || 0), 0);
  const totalSpent = projects.reduce((s, p) => s + Number(p.budget_spent || 0), 0);

  const stats = [
    { label: "Total Projects", value: projects.length, icon: HardHat, color: "text-primary", bg: "bg-primary/10" },
    { label: "Active", value: active, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Completed", value: completed, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Pending Milestones", value: milestones.length, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const statusColor = {
    Planning: "bg-surface-container-high text-on-surface-variant",
    "In Progress": "bg-blue-500/10 text-blue-600",
    "On Hold": "bg-amber-500/10 text-amber-600",
    Completed: "bg-green-500/10 text-green-600",
    Cancelled: "bg-red-500/10 text-red-600",
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div>
          <h1 className="display-lg text-primary mb-2">Church <span className="text-tertiary-fixed-dim italic">Development</span></h1>
          <p className="label-sm text-tertiary-fixed-dim tracking-[0.3em]">INFRASTRUCTURE & PROJECTS</p>
          <p className="text-on-surface-variant mt-3 font-medium">Shalom, {user?.full_name}. Track all development projects below.</p>
        </div>
        <Link to="/church-development/projects"
          className="px-6 py-3 rounded-2xl bg-primary text-on-primary font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
          + New Project
        </Link>
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

      {/* Budget Overview */}
      <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10 mb-8">
        <h2 className="headline-sm text-primary font-black mb-6 flex items-center gap-3">
          <DollarSign size={22} /> Budget Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-primary/5 rounded-2xl">
            <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">Total Allocated</p>
            <p className="text-2xl font-black text-primary">ETB {totalBudget.toLocaleString()}</p>
          </div>
          <div className="p-5 bg-red-500/5 rounded-2xl">
            <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">Total Spent</p>
            <p className="text-2xl font-black text-red-500">ETB {totalSpent.toLocaleString()}</p>
          </div>
          <div className="p-5 bg-green-500/5 rounded-2xl">
            <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">Remaining</p>
            <p className="text-2xl font-black text-green-500">ETB {(totalBudget - totalSpent).toLocaleString()}</p>
          </div>
        </div>
        {totalBudget > 0 && (
          <div className="mt-6">
            <div className="flex justify-between text-xs text-on-surface-variant mb-2">
              <span>Budget Used</span>
              <span className="font-black text-primary">{Math.round((totalSpent / totalBudget) * 100)}%</span>
            </div>
            <div className="h-3 rounded-full bg-surface-container-high overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
                transition={{ delay: 0.3, duration: 1 }} className="h-full rounded-full bg-primary" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Projects List */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="headline-sm text-primary font-black flex items-center gap-3"><HardHat size={22} /> Projects</h2>
            <Link to="/church-development/projects" className="text-xs text-primary/60 hover:text-primary font-bold uppercase tracking-widest">View All →</Link>
          </div>
          <div className="space-y-3">
            {projects.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low">
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-sm text-primary truncate">{p.title}</p>
                  <p className="text-xs text-on-surface-variant">{p.category}</p>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${statusColor[p.status]}`}>{p.status}</span>
              </div>
            ))}
            {projects.length === 0 && <p className="text-center text-on-surface-variant/50 py-8 text-sm">No projects yet.</p>}
          </div>
        </div>

        {/* Upcoming Milestones */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
          <h2 className="headline-sm text-primary font-black mb-6 flex items-center gap-3"><Clock size={22} className="text-amber-500" /> Upcoming Milestones</h2>
          <div className="space-y-3">
            {milestones.slice(0, 5).map(m => (
              <div key={m.id} className="flex items-center gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <Clock size={16} className="text-amber-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-sm text-primary">{m.title}</p>
                  <p className="text-xs text-on-surface-variant">Due: {formatToEthiopian(m.due_date)}</p>
                </div>
              </div>
            ))}
            {milestones.length === 0 && <p className="text-center text-on-surface-variant/50 py-8 text-sm">No pending milestones.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
