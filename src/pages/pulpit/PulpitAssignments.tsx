import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Plus, X, Edit2, Trash2, Loader2, Search } from "lucide-react";
import { formatToEthiopian } from "../../utils/ethiopianDate";

const ASSIGN_TYPES = ["Preaching", "Worship Leading", "Singing", "Prayer", "Other"];
const SERVICE_TYPES = ["Sunday Service", "Midweek", "Special Event", "Youth Service", "Other"];
const STATUSES = ["Scheduled", "Confirmed", "Completed", "Cancelled"];

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

const emptyForm = { preacher_id: "", assignment_type: "Preaching", service_date: "", service_type: "Sunday Service", topic: "", status: "Scheduled", notes: "" };

export default function PulpitAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [preachers, setPreachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [aRes, pRes] = await Promise.all([
      supabase.from("pulpit_assignments").select("*").order("service_date", { ascending: false }),
      supabase.from("preachers").select("id, full_name").order("full_name"),
    ]);
    setAssignments(aRes.data || []);
    setPreachers(pRes.data || []);
    setLoading(false);
  };

  const openNew = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (a) => { setEditItem(a); setForm({ ...a, service_date: a.service_date?.slice(0, 16) }); setShowModal(true); };
  const handleDelete = async (id) => {
    if (!confirm("Delete this assignment?")) return;
    await supabase.from("pulpit_assignments").delete().eq("id", id);
    fetchData();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, assigned_by: user?.id };
    if (editItem) { await supabase.from("pulpit_assignments").update(payload).eq("id", editItem.id); }
    else { await supabase.from("pulpit_assignments").insert(payload); }
    setSaving(false);
    setShowModal(false);
    fetchData();
  };

  const filtered = assignments.filter(a => {
    const preacher = preachers.find(p => p.id === a.preacher_id);
    return preacher?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.topic?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="display-sm text-primary">Pulpit <span className="text-tertiary-fixed-dim italic">Assignments</span></h1>
          <p className="text-on-surface-variant text-sm mt-1">Schedule preachers, worship leaders, and singers for services</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
          <Plus size={16} /> New Assignment
        </button>
      </div>

      <div className="relative mb-8 max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
        <input type="text" placeholder="Search by preacher or topic..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 h-12 rounded-xl bg-surface-container-low border border-outline-variant/10 text-sm text-primary outline-none focus:border-primary/30 transition-all" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <Loader2 size={36} className="text-primary" />
          </motion.div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a, i) => {
            const preacher = preachers.find(p => p.id === a.preacher_id);
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-surface-container rounded-2xl p-5 border border-outline-variant/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 font-black text-primary text-lg">
                  {preacher?.full_name?.charAt(0) || "?"}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-sm text-primary">{preacher?.full_name || "Unknown"}</p>
                  <p className="text-xs text-on-surface-variant">{a.service_type} · {formatToEthiopian(a.service_date?.split("T")[0])}</p>
                  {a.topic && <p className="text-xs text-on-surface-variant/60 italic">"{a.topic}"</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${typeColor[a.assignment_type]}`}>{a.assignment_type}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${statusColor[a.status]}`}>{a.status}</span>
                  <button onClick={() => openEdit(a)} className="w-9 h-9 rounded-xl hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-all"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(a.id)} className="w-9 h-9 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-on-surface-variant hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-20 text-on-surface-variant/40">
              <Calendar size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">No assignments found.</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container rounded-3xl p-8 w-full max-w-lg border border-outline-variant/10 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="headline-sm font-black text-primary">{editItem ? "Edit Assignment" : "New Assignment"}</h2>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-xl hover:bg-surface-container-high flex items-center justify-center"><X size={18} className="text-on-surface-variant" /></button>
              </div>
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Preacher / Assignee *</label>
                  <select required value={form.preacher_id} onChange={e => setForm(f => ({ ...f, preacher_id: e.target.value }))}
                    className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none">
                    <option value="">-- Select Preacher --</option>
                    {preachers.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Assignment Type</label>
                    <select value={form.assignment_type} onChange={e => setForm(f => ({ ...f, assignment_type: e.target.value }))}
                      className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none">
                      {ASSIGN_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Service Type</label>
                    <select value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}
                      className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none">
                      {SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Service Date & Time *</label>
                  <input type="datetime-local" required value={form.service_date} onChange={e => setForm(f => ({ ...f, service_date: e.target.value }))}
                    className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none" />
                </div>
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Topic / Message Title</label>
                  <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                    className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none" placeholder="e.g. Walking by Faith" />
                </div>
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none">
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 h-12 rounded-xl border border-outline-variant/20 text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-all">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50">
                    {saving ? "Saving..." : editItem ? "Update" : "Assign"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
