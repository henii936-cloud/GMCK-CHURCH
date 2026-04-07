import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { motion } from "motion/react";
import { Loader2, ClipboardList, CheckCircle, XCircle, MinusCircle, Baby, TrendingUp, AlertTriangle } from "lucide-react";

export default function KidsReports() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ kids: [], attendance: [], classes: [] });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [kidsRes, attendanceRes, classesRes] = await Promise.all([
        supabase.from("kids").select("*"),
        supabase.from("kids_attendance").select("*, kids(full_name), kids_classes(class_name)").order("date", { ascending: false }),
        supabase.from("kids_classes").select("*")
      ]);
      setData({ kids: kidsRes.data || [], attendance: attendanceRes.data || [], classes: classesRes.data || [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <Loader2 size={48} className="text-primary" />
      </motion.div>
    </div>
  );

  const groupedByClass = {};
  data.classes.forEach(cls => {
    const classAttendance = data.attendance.filter(a => a.class_id === cls.id);
    const present = classAttendance.filter(a => a.status === "Present").length;
    const total = classAttendance.length;
    groupedByClass[cls.class_name] = {
      present,
      total,
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
      records: classAttendance.slice(0, 10)
    };
  });

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="display-md text-primary mb-2">Kids Department <span className="text-tertiary-fixed-dim italic">Analytics</span></h1>
        <p className="label-sm text-on-surface-variant tracking-widest">Growth tracking and attendance trends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Attendance Summary */}
        <div className="bg-surface-container rounded-[2.5rem] p-10 border border-outline-variant/10">
          <h2 className="headline-sm text-primary font-black mb-8 flex items-center gap-4">
            <TrendingUp size={28} /> Performance Overview
          </h2>
          <div className="space-y-6">
            {Object.entries(groupedByClass).map(([className, d]) => (
              <div key={className}>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-bold text-primary">{className}</p>
                  <p className="text-sm font-black text-primary">{d.rate}%</p>
                </div>
                <div className="h-3 rounded-full bg-surface-container-high overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${d.rate}%` }} transition={{ duration: 1 }}
                    className={`h-full rounded-full ${d.rate >= 70 ? "bg-emerald-500" : d.rate >= 40 ? "bg-amber-500" : "bg-red-500"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Alerts */}
        <div className="bg-surface-container rounded-[2.5rem] p-10 border border-outline-variant/10">
          <h2 className="headline-sm text-primary font-black mb-8 flex items-center gap-4">
            <AlertTriangle size={28} /> Attention Needed
          </h2>
          <div className="space-y-4">
            {/* Find kids with multiple absences in recent records */}
            {data.kids.slice(0, 5).map(k => {
              const absences = data.attendance.filter(a => a.kid_id === k.id && a.status === 'Absent').length;
              if (absences >= 2) return (
                <div key={k.id} className="flex items-center justify-between p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 font-black">
                      {k.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">{k.full_name}</p>
                      <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">{absences} Missed Sessions</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-black uppercase text-tertiary-fixed-dim hover:underline tracking-widest">Call Parent</button>
                </div>
              );
              return null;
            })}
            <p className="text-center text-on-surface-variant/40 text-xs italic py-4">Proactive alerts for children's spiritual consistency</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {Object.entries(groupedByClass).map(([className, d], i) => (
          <motion.div key={className} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-surface-container rounded-[2.5rem] p-10 border border-outline-variant/10"
          >
            <h2 className="headline-sm text-primary font-black mb-6">{className} - Recent Sessions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-outline-variant/10 text-[10px] uppercase font-black tracking-widest text-on-surface-variant/50">
                    <th className="pb-4">Child</th>
                    <th className="pb-4">Date</th>
                    <th className="pb-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {d.records.map(r => (
                    <tr key={r.id} className="group hover:bg-surface-container-low transition-colors">
                      <td className="py-4 text-sm font-bold text-primary">{r.kids?.full_name}</td>
                      <td className="py-4 text-xs text-on-surface-variant">{new Date(r.date).toLocaleDateString()}</td>
                      <td className="py-4 text-right">
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${r.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {d.records.length === 0 && (
                    <tr><td colSpan="3" className="py-12 text-center text-on-surface-variant/30 italic">No attendance history yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
