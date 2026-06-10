import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion } from "motion/react";
import {
  Shield, Users, Heart, ClipboardList, Bell,
  Loader2, TrendingUp, CheckCircle, Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatToEthiopian } from "../../utils/ethiopianDate";

export default function DiaconateDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ assignments: [], welfare: [], loading: true });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [asnRes, welRes] = await Promise.all([
      supabase.from("deacon_assignments").select("*").order("service_date", { ascending: false }),
      supabase.from("welfare_activities").select("*").order("activity_date", { ascending: false }),
    ]);
    setData({ assignments: asnRes.data || [], welfare: welRes.data || [], loading: false });
  };

  if (data.loading) return (
    <div className="flex h-screen items-center justify-center bg-surface">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <Loader2 size={48} className="text-primary" />
      </motion.div>
    </div>
  );

  const assigned = data.assignments.filter(a => a.status === "Assigned").length;
  const completed = data.assignments.filter(a => a.status === "Completed").length;
  const totalAid = data.welfare.reduce((s, w) => s + Number(w.amount_given || 0), 0);

  const stats = [
    { label: "Total Assignments", value: data.assignments.length, icon: ClipboardList, color: "text-primary", bg: "bg-primary/10" },
    { label: "Active Assignments", value: assigned, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Completed", value: completed, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Welfare Activities", value: data.welfare.length, icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10" },
  ];

  const statusColor = {
    Assigned: "bg-blue-500/10 text-blue-600",
    Completed: "bg-green-500/10 text-green-600",
    Excused: "bg-amber-500/10 text-amber-600",
  };

  const activityColor = {
    Assistance: "bg-blue-500/10 text-blue-600",
    Charity: "bg-pink-500/10 text-pink-600",
    Food: "bg-amber-500/10 text-amber-600",
    Medical: "bg-red-500/10 text-red-600",
    Clothing: "bg-indigo-500/10 text-indigo-600",
    Other: "bg-surface-container text-on-surface-variant",
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div>
          <h1 className="display-lg text-primary mb-2">Diaconate <span className="text-tertiary-fixed-dim italic">Ministry</span></h1>
          <p className="label-sm text-tertiary-fixed-dim tracking-[0.3em]">DEACON SERVICE & WELFARE</p>
          <p className="text-on-surface-variant mt-3 font-medium">Shalom, {user?.full_name}. Oversee deacon assignments and welfare activities.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/diaconate/assignments" className="px-5 py-3 rounded-2xl bg-primary text-on-primary font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
            + Assign Deacon
          </Link>
          <Link to="/diaconate/welfare" className="px-5 py-3 rounded-2xl border border-outline-variant/20 text-primary font-black text-xs uppercase tracking-widest hover:bg-surface-container transition-all">
            + Welfare Activity
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
        {/* Recent Assignments */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="headline-sm text-primary font-black flex items-center gap-3"><Shield size={22} /> Recent Assignments</h2>
            <Link to="/diaconate/assignments" className="text-xs text-primary/60 hover:text-primary font-bold uppercase tracking-widest">View All →</Link>
          </div>
          <div className="space-y-3">
            {data.assignments.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield size={16} className="text-primary" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-sm text-primary truncate">{a.responsibility}</p>
                  <p className="text-xs text-on-surface-variant">{a.area || "—"} · {formatToEthiopian(a.service_date)}</p>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${statusColor[a.status]}`}>{a.status}</span>
              </div>
            ))}
            {data.assignments.length === 0 && <p className="text-center text-on-surface-variant/50 py-8 text-sm">No assignments yet.</p>}
          </div>
        </div>

        {/* Welfare Activities + Total Aid */}
        <div className="flex flex-col gap-6">
          <div className="bg-pink-500/5 border border-pink-500/10 rounded-3xl p-6">
            <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1">Total Aid Distributed</p>
            <p className="text-3xl font-black text-primary">ETB {totalAid.toLocaleString()}</p>
            <p className="text-xs text-on-surface-variant mt-1">{data.welfare.length} welfare activities recorded</p>
          </div>
          <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="headline-sm text-primary font-black flex items-center gap-3"><Heart size={20} className="text-pink-500" /> Welfare Activities</h2>
              <Link to="/diaconate/welfare" className="text-xs text-primary/60 hover:text-primary font-bold uppercase tracking-widest">View All →</Link>
            </div>
            <div className="space-y-3">
              {data.welfare.slice(0, 5).map(w => (
                <div key={w.id} className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${activityColor[w.activity_type]}`}>{w.activity_type}</span>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-primary truncate">{w.title}</p>
                    <p className="text-xs text-on-surface-variant">{w.beneficiary_name || "Anonymous"}</p>
                  </div>
                  {w.amount_given > 0 && <p className="text-xs font-black text-primary">ETB {Number(w.amount_given).toLocaleString()}</p>}
                </div>
              ))}
              {data.welfare.length === 0 && <p className="text-center text-on-surface-variant/50 py-4 text-xs">No welfare activities recorded.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
