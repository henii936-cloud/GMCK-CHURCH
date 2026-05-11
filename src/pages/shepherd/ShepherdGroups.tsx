import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion } from "motion/react";
import { Users, Loader2, Shield, CheckCircle, XCircle, MinusCircle } from "lucide-react";

export default function ShepherdGroupsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [groupDetails, setGroupDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: assigns } = await supabase
      .from("shepherd_assignments")
      .select("*, bible_study_groups(id, group_name, location, members_count)")
      .eq("shepherd_id", user?.id);

    const grps = assigns || [];
    const details = {};

    await Promise.all(grps.map(async (a) => {
      const gid = a.group_id;
      const [members, attendance, progress, leader] = await Promise.all([
        supabase.from("members").select("id, full_name, gender, phone, age_group").eq("group_id", gid),
        supabase.from("study_attendance").select("*").eq("group_id", gid).order("date", { ascending: false }).limit(50),
        supabase.from("study_progress").select("*").eq("group_id", gid).order("created_at", { ascending: false }).limit(5),
        supabase.from("group_leaders").select("profiles(full_name, role)").eq("group_id", gid).maybeSingle(),
      ]);
      details[gid] = {
        members: members.data || [],
        attendance: attendance.data || [],
        progress: progress.data || [],
        leader: leader.data?.profiles || null,
      };
    }));

    setAssignments(grps);
    setGroupDetails(details);
    setLoading(false);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-surface">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <Loader2 size={48} className="text-primary" />
      </motion.div>
    </div>
  );

  if (assignments.length === 0) return (
    <div className="text-center py-32">
      <Shield size={56} className="mx-auto mb-4 text-on-surface-variant/20" />
      <h2 className="headline-sm text-primary font-black mb-2">No Groups Assigned</h2>
      <p className="text-on-surface-variant/60 text-sm">Ask an administrator to assign you to groups.</p>
    </div>
  );

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="display-md text-primary mb-2">Assigned <span className="text-tertiary-fixed-dim italic">Groups</span></h1>
        <p className="label-sm text-on-surface-variant tracking-widest">{assignments.length} group{assignments.length !== 1 ? "s" : ""} under your oversight</p>
      </div>

      <div className="space-y-8">
        {assignments.map((a, i) => {
          const g = a.bible_study_groups;
          if (!g) return null;
          const detail = groupDetails[a.group_id] || {};
          const present = (detail.attendance || []).filter(at => at.status === "Present").length;
          const absent = (detail.attendance || []).filter(at => at.status === "Absent").length;
          const excused = (detail.attendance || []).filter(at => at.status === "Excused").length;
          const total = present + absent + excused;
          const rate = total > 0 ? Math.round((present / total) * 100) : 0;

          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10"
            >
              {/* Group Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="headline-sm text-primary font-black">{g.group_name}</h2>
                  {g.location && <p className="text-sm text-on-surface-variant">📍 {g.location}</p>}
                  {detail.leader && <p className="text-xs text-on-surface-variant mt-1">Leader: <span className="font-bold text-primary">{detail.leader.full_name}</span></p>}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-primary">{rate}%</p>
                  <p className="text-xs text-on-surface-variant">Attendance Rate</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Attendance Summary */}
                <div className="bg-surface-container-low rounded-2xl p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-4">Attendance Summary</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3"><CheckCircle size={16} className="text-green-500" /><span className="text-sm text-on-surface-variant">Present</span><span className="ml-auto font-black text-green-500">{present}</span></div>
                    <div className="flex items-center gap-3"><XCircle size={16} className="text-red-400" /><span className="text-sm text-on-surface-variant">Absent</span><span className="ml-auto font-black text-red-400">{absent}</span></div>
                    <div className="flex items-center gap-3"><MinusCircle size={16} className="text-orange-400" /><span className="text-sm text-on-surface-variant">Excused</span><span className="ml-auto font-black text-orange-400">{excused}</span></div>
                  </div>
                </div>

                {/* Members */}
                <div className="bg-surface-container-low rounded-2xl p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-4">Members ({(detail.members || []).length})</p>
                  <div className="space-y-2">
                    {(detail.members || []).slice(0, 5).map(m => (
                      <div key={m.id} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">{m.full_name?.charAt(0)}</div>
                        <p className="text-xs text-primary font-medium truncate">{m.full_name}</p>
                      </div>
                    ))}
                    {(detail.members || []).length > 5 && <p className="text-xs text-on-surface-variant/60">+{(detail.members || []).length - 5} more</p>}
                  </div>
                </div>

                {/* Study Progress */}
                <div className="bg-surface-container-low rounded-2xl p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-4">Recent Studies</p>
                  <div className="space-y-2">
                    {(detail.progress || []).map(p => (
                      <div key={p.id} className="p-2 rounded-xl bg-surface-container-lowest">
                        <p className="text-xs font-bold text-primary truncate">{p.study_topic}</p>
                        <p className="text-[10px] text-on-surface-variant">{p.completion_date}</p>
                      </div>
                    ))}
                    {(detail.progress || []).length === 0 && <p className="text-xs text-on-surface-variant/50">No studies recorded.</p>}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-on-surface-variant font-medium">Overall Attendance Progress</p>
                  <p className="text-xs font-black text-primary">{rate}%</p>
                </div>
                <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${rate}%` }} transition={{ delay: 0.5, duration: 1 }}
                    className={`h-full rounded-full ${rate >= 70 ? "bg-green-500" : rate >= 40 ? "bg-orange-400" : "bg-red-400"}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
