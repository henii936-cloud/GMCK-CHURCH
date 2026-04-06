import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion } from "motion/react";
import { Loader2, ClipboardList, CheckCircle, XCircle, MinusCircle, Shield } from "lucide-react";

export default function ShepherdReports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ assignments: [], attendance: [] });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: assigns } = await supabase
      .from("shepherd_assignments")
      .select("*, bible_study_groups(id, group_name, location)")
      .eq("shepherd_id", user?.id);

    const groupIds = (assigns || []).map(a => a.group_id);
    let attendance = { data: [] };
    if (groupIds.length > 0) {
      attendance = await supabase
        .from("study_attendance")
        .select("*, members(full_name), bible_study_groups(group_name)")
        .in("group_id", groupIds)
        .order("date", { ascending: false })
        .limit(100);
    }

    setData({ assignments: assigns || [], attendance: attendance.data || [] });
    setLoading(false);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <Loader2 size={48} className="text-primary" />
      </motion.div>
    </div>
  );

  const grouped = {};
  data.attendance.forEach(a => {
    const g = a.bible_study_groups?.group_name || "Unknown";
    if (!grouped[g]) grouped[g] = { present: 0, absent: 0, excused: 0, records: [] };
    grouped[g].records.push(a);
    if (a.status === "Present") grouped[g].present++;
    else if (a.status === "Absent") grouped[g].absent++;
    else grouped[g].excused++;
  });

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="display-md text-primary mb-2">Attendance <span className="text-tertiary-fixed-dim italic">Reports</span></h1>
        <p className="label-sm text-on-surface-variant tracking-widest">Read-only attendance data for your assigned groups</p>
      </div>

      {data.assignments.length === 0 && (
        <div className="text-center py-20">
          <Shield size={48} className="mx-auto mb-4 text-on-surface-variant/20" />
          <p className="text-on-surface-variant/60">No groups assigned. Ask an admin to assign you.</p>
        </div>
      )}

      <div className="space-y-8">
        {Object.entries(grouped).map(([groupName, d], i) => {
          const total = d.present + d.absent + d.excused;
          const rate = total > 0 ? Math.round((d.present / total) * 100) : 0;
          return (
            <motion.div key={groupName} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="headline-sm text-primary font-black">{groupName}</h2>
                  <p className="text-xs text-on-surface-variant">{total} recorded sessions</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-primary">{rate}%</p>
                  <p className="text-xs text-on-surface-variant">Attendance Rate</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-green-500/10 text-center">
                  <CheckCircle size={20} className="text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-black text-green-500">{d.present}</p>
                  <p className="text-xs text-on-surface-variant">Present</p>
                </div>
                <div className="p-4 rounded-2xl bg-red-400/10 text-center">
                  <XCircle size={20} className="text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-black text-red-400">{d.absent}</p>
                  <p className="text-xs text-on-surface-variant">Absent</p>
                </div>
                <div className="p-4 rounded-2xl bg-orange-400/10 text-center">
                  <MinusCircle size={20} className="text-orange-400 mx-auto mb-2" />
                  <p className="text-2xl font-black text-orange-400">{d.excused}</p>
                  <p className="text-xs text-on-surface-variant">Excused</p>
                </div>
              </div>

              <div className="h-2 rounded-full bg-surface-container-high overflow-hidden mb-6">
                <div className={`h-full rounded-full transition-all ${rate >= 70 ? "bg-green-500" : rate >= 40 ? "bg-orange-400" : "bg-red-400"}`} style={{ width: `${rate}%` }} />
              </div>

              {/* Recent records table */}
              <div className="space-y-2">
                {d.records.slice(0, 5).map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low text-sm">
                    <span className="text-primary font-medium">{r.members?.full_name || "—"}</span>
                    <span className="text-on-surface-variant text-xs">{r.date}</span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      r.status === "Present" ? "bg-green-500/10 text-green-500" :
                      r.status === "Absent" ? "bg-red-400/10 text-red-400" :
                      "bg-orange-400/10 text-orange-400"
                    }`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {Object.keys(grouped).length === 0 && data.assignments.length > 0 && (
          <div className="text-center py-20 text-on-surface-variant/50">
            <ClipboardList size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium">No attendance records found for your groups.</p>
          </div>
        )}
      </div>
    </div>
  );
}
