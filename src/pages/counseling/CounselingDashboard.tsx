import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion } from "motion/react";
import {
  Heart, Users, Calendar, ClipboardList, Bell,
  Loader2, TrendingUp, CheckCircle, AlertCircle, Clock
} from "lucide-react";
import { formatToEthiopian } from "../../utils/ethiopianDate";
import { Link } from "react-router-dom";

export default function CounselingDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    requests: [], sessions: [], followups: [], loading: true
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [reqRes, sessRes, followRes] = await Promise.all([
        supabase.from("counseling_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("counseling_sessions").select("*").order("session_date", { ascending: false }),
        supabase.from("counseling_followups").select("*").eq("completed", false),
      ]);
      setData({
        requests: reqRes.data || [],
        sessions: sessRes.data || [],
        followups: followRes.data || [],
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

  const pending = data.requests.filter(r => r.status === "Pending").length;
  const inProgress = data.requests.filter(r => r.status === "In Progress").length;
  const resolved = data.requests.filter(r => r.status === "Resolved").length;
  const upcoming = data.sessions.filter(s => s.status === "Scheduled").length;

  const stats = [
    { label: "Total Requests", value: data.requests.length, icon: ClipboardList, color: "text-primary", bg: "bg-primary/10" },
    { label: "Pending", value: pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "In Progress", value: inProgress, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Resolved", value: resolved, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  const statusColor = {
    Pending: "bg-amber-500/10 text-amber-600",
    Assigned: "bg-blue-500/10 text-blue-600",
    "In Progress": "bg-indigo-500/10 text-indigo-600",
    Resolved: "bg-green-500/10 text-green-600",
    Closed: "bg-surface-container text-on-surface-variant",
  };

  const priorityColor = {
    Low: "bg-surface-container text-on-surface-variant",
    Normal: "bg-primary/10 text-primary",
    High: "bg-orange-500/10 text-orange-600",
    Urgent: "bg-red-500/10 text-red-600",
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div>
          <h1 className="display-lg text-primary mb-2">
            Counseling <span className="text-tertiary-fixed-dim italic">Ministry</span>
          </h1>
          <p className="label-sm text-tertiary-fixed-dim tracking-[0.3em]">PASTORAL CARE & SUPPORT</p>
          <p className="text-on-surface-variant mt-3 font-medium">
            Shalom, {user?.full_name}. Manage counseling requests and sessions below.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/counseling/requests"
            className="px-6 py-3 rounded-2xl bg-primary text-on-primary font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
            + New Request
          </Link>
          <button className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center relative hover:bg-surface-container transition-all border border-outline-variant/10">
            <Bell size={20} className="text-on-surface-variant" />
            {pending > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full" />}
          </button>
        </div>
      </div>

      {/* Stats */}
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
        {/* Recent Requests */}
        <div className="xl:col-span-2 bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="headline-sm text-primary font-black flex items-center gap-3">
              <ClipboardList size={24} /> Recent Requests
            </h2>
            <Link to="/counseling/requests" className="text-xs text-primary/60 hover:text-primary font-bold uppercase tracking-widest">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {data.requests.slice(0, 6).map((req) => (
              <div key={req.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Heart size={16} className="text-primary" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-primary truncate">{req.requester_name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{req.issue_summary || "No summary"}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${priorityColor[req.priority] || ""}`}>
                    {req.priority}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${statusColor[req.status] || ""}`}>
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
            {data.requests.length === 0 && (
              <div className="text-center py-12 text-on-surface-variant/50">
                <Heart size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No counseling requests yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Sessions + Follow-ups */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10">
            <h2 className="headline-sm text-primary font-black mb-4 flex items-center gap-3">
              <Calendar size={20} /> Upcoming Sessions
            </h2>
            <div className="space-y-3">
              {data.sessions.filter(s => s.status === "Scheduled").slice(0, 4).map((s) => (
                <div key={s.id} className="p-3 rounded-2xl bg-surface-container-low">
                  <p className="text-sm font-bold text-primary">{formatToEthiopian(s.session_date?.split("T")[0])}</p>
                  <p className="text-xs text-on-surface-variant">{s.location || "No location set"}</p>
                </div>
              ))}
              {upcoming === 0 && (
                <p className="text-center text-on-surface-variant/50 py-4 text-xs">No upcoming sessions.</p>
              )}
            </div>
          </div>

          <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10">
            <h2 className="headline-sm text-primary font-black mb-4 flex items-center gap-3">
              <AlertCircle size={20} className="text-amber-500" /> Pending Follow-ups
            </h2>
            <div className="space-y-3">
              {data.followups.slice(0, 4).map((f) => (
                <div key={f.id} className="flex items-center gap-3 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                  <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-primary">Due: {formatToEthiopian(f.follow_up_date)}</p>
                    <p className="text-xs text-on-surface-variant truncate">{f.notes || "Follow-up required"}</p>
                  </div>
                </div>
              ))}
              {data.followups.length === 0 && (
                <p className="text-center text-on-surface-variant/50 py-4 text-xs">No pending follow-ups.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
