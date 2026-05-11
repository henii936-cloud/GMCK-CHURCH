import { formatToEthiopian } from "../../utils/ethiopianDate";
import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Card, Button } from "../../components/common/UI";
import { ClipboardList, Users, Check, X, Search, Loader2, Calendar, Smile, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function KidsAttendance() {
  const { user } = useAuth();
  const [kids, setKids] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [attendance, setAttendance] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("take");
  const [message, setMessage] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [kidsRes, classesRes, historyRes] = await Promise.all([
        supabase.from("kids").select("*").order("full_name"),
        supabase.from("kids_classes").select("*").order("class_name"),
        supabase.from("kids_attendance").select("*, kids(full_name), kids_classes(class_name)").order("date", { ascending: false })
      ]);
      setKids(kidsRes.data || []);
      setClasses(classesRes.data || []);
      setHistory(historyRes.data || []);
      
      if (classesRes.data?.length > 0) {
        setSelectedClass(classesRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      const filtered = kids.filter(k => k.class_id === selectedClass);
      const initial = {};
      filtered.forEach(k => initial[k.id] = 'Present');
      setAttendance(initial);
    }
  }, [selectedClass, kids]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const filteredKids = kids.filter(k => k.class_id === selectedClass);
      const records = filteredKids.map(k => ({
        kid_id: k.id,
        class_id: selectedClass,
        status: attendance[k.id] || 'Present',
        recorded_by: user.id,
        date: new Date().toISOString().split('T')[0]
      }));

      const { error } = await supabase.from("kids_attendance").insert(records);
      if (error) throw error;

      setMessage("Attendance recorded successfully!");
      loadData();
      setTimeout(() => {
        setMessage("");
        setActiveTab("history");
      }, 1500);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredKids = kids.filter(k => k.class_id === selectedClass);
  const presentCount = Object.values(attendance).filter(s => s === 'Present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'Absent').length;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="display-md text-primary mb-2">Kids <span className="text-tertiary-fixed-dim italic">Attendance</span></h1>
          <p className="label-sm text-on-surface-variant tracking-widest">Weekly record keeping for children's classes</p>
        </div>
        <div className="bg-surface-container-low px-6 py-3 rounded-2xl border border-outline-variant/10 text-primary font-bold">
          {formatToEthiopian(new Date())}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button onClick={() => setActiveTab('take')} 
          className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all ${activeTab === 'take' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
          <ClipboardList size={16} /> Take Attendance
        </button>
        <button onClick={() => setActiveTab('history')} 
          className={`px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all ${activeTab === 'history' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
          <Calendar size={16} /> View History
        </button>
      </div>

      <Card className="!p-0 overflow-hidden bg-surface-container border-outline-variant/10">
        {activeTab === 'take' ? (
          <>
            <div className="p-8 border-b border-outline-variant/10 bg-surface-container-low flex items-center gap-6">
              <div className="relative flex-1 max-w-sm">
                <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-50" />
                <select className="w-full h-14 pl-12 pr-10 rounded-2xl border border-outline-variant/20 bg-surface text-on-surface appearance-none font-bold"
                  value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-wider">{presentCount} Present</span>
                <span className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-xs font-black uppercase tracking-wider">{absentCount} Absent</span>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredKids.map((k) => (
                <div key={k.id} className={`p-6 rounded-[2rem] border transition-all ${attendance[k.id] === 'Present' ? 'bg-emerald-500/5 border-emerald-500/20' : attendance[k.id] === 'Absent' ? 'bg-red-500/5 border-red-500/20' : 'bg-surface-container-low border-outline-variant/10'}`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center font-black text-primary border border-outline-variant/10">
                      {k.full_name.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-black text-primary truncate">{k.full_name}</p>
                      <p className="text-[10px] uppercase font-black tracking-widest opacity-40">{attendance[k.id]}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setAttendance(prev => ({ ...prev, [k.id]: 'Present' }))}
                      className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-black uppercase text-[9px] tracking-wider transition-all ${attendance[k.id] === 'Present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-surface-container-high text-on-surface-variant hover:bg-emerald-500/10 hover:text-emerald-500'}`}>
                      <Check size={14} /> Present
                    </button>
                    <button onClick={() => setAttendance(prev => ({ ...prev, [k.id]: 'Absent' }))}
                      className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-black uppercase text-[9px] tracking-wider transition-all ${attendance[k.id] === 'Absent' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-surface-container-high text-on-surface-variant hover:bg-red-500/10 hover:text-red-500'}`}>
                      <X size={14} /> Absent
                    </button>
                  </div>
                </div>
              ))}
              {filteredKids.length === 0 && (
                <div className="col-span-full text-center py-20 text-on-surface-variant/50">
                  <Smile size={64} className="mx-auto mb-4 opacity-20" />
                  <p className="text-lg">No kids assigned to this class yet.</p>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-outline-variant/10 bg-surface-container-low">
              {message && (
                <div className={`mb-6 p-4 rounded-2xl text-center text-sm font-bold flex items-center justify-center gap-3 ${message.includes('Error') ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {message.includes('Error') ? <AlertCircle size={20} /> : <Check size={20} />}
                  {message}
                </div>
              )}
              <Button onClick={handleSave} loading={saving} disabled={filteredKids.length === 0} className="w-full h-16 rounded-2xl shadow-xl shadow-primary/20">
                Finalize Attendance <Check size={20} className="ml-3" />
              </Button>
            </div>
          </>
        ) : (
          <div className="p-8">
            <div className="space-y-4">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-surface-container-low border border-outline-variant/10">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="font-black text-primary">{formatToEthiopian(h.date)}</p>
                      <p className="text-xs text-on-surface-variant">{h.kids_classes?.class_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">{h.kids?.full_name}</p>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${h.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {h.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {history.length === 0 && <p className="text-center py-20 opacity-30 italic">No attendance history found.</p>}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
