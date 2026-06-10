import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Plus, X, Edit2, Trash2, Loader2, Search } from "lucide-react";
import { formatToEthiopian } from "../../utils/ethiopianDate";

const AREAS = ["Ushering", "Communion", "Sound", "Offering", "Security", "Hospitality", "Other"];
const STATUSES = ["Assigned", "Completed", "Excused"];

const statusColor = {
  Assigned: "bg-blue-500/10 text-blue-600",
  Completed: "bg-green-500/10 text-green-600",
  Excused: "bg-amber-500/10 text-amber-600",
};

const emptyForm = { responsibility: "", area: "Ushering", service_date: "", status: "Assigned", notes: "" };

export default function DeaconAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("deacon_assignments").select("*").order("service_date", { ascending: false });
    setAssignments(data || []);
    setLoading(false);
  };

  const openNew = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (a) => { setEditItem(a); setForm({ ...a }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editItem) {
      await supabase.from("deacon_assignments").update(form).eq("id", editItem.id);
    } else {
      await supabase.from("deacon_assignments").insert({ ...form, deacon_id: user?.id });
    }
    setSaving(false);
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this assignment?")) return;
    await supabase.from("deacon_assignments").delete().eq("id", id);
    fetchData();
  };

  const filtered = assignments.filter(a =>
    a.responsibility?.toLowerCase().includes(search.toLowerCase()) ||
    a.area?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="display-sm text-primary">Deacon <span className="text-tertiary-fixed-dim italic">Assignments</span></h1>
          <p className="text-on-surface-variant text-sm mt-1">Assign service responsibilities to deacons</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
          <Plus size={16} /> New Assignment
        </button>
      </div>

      <div className="relative mb-8 max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
        <input type="text" placeholder="Search assignments..." value={search} onChange={e => setSearch(e.target.value)}
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
          {filtered.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-surface-container rounded-2xl p-5 border border-outline-variant/10 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield size={18} className="text-primary" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-bold text-sm text-primary">{a.responsibility}</p>
                <p className="text-xs text-on-surface-variant">{a.area} · {formatToEthiopian(a.service_date)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${statusColor[a.status]}`}>{a.status}</span>
                <button onClick={() => openEdit(a)} className="w-9 h-9 rounded-xl hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-all">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(a.id)} className="w-9 h-9 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-on-surface-variant hover:text-red-500 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-20 text-on-surface-variant/40">
              <Shield size={48} className="mx-auto mb-4 opacity-30" />
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
              className="bg-surface-container rounded-3xl p-8 w-full max-w-lg border border-outline-variant/10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="headline-sm font-black text-primary">{editItem ? "Edit Assignment" : "New Assignment"}</h2>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-xl hover:bg-surface-container-high flex items-center justify-center">
                  <X size={18} className="text-on-surface-variant" />
                </button>
              </div>
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Responsibility *</label>
                  <input required value={form.responsibility} onChange={e => setForm(f => ({ ...f, responsibility: e.target.value }))}
                    className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none focus:border-primary/40 transition-all" placeholder="e.g. Door usher for morning service" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Service Area</label>
                    <select value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                      className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none">
                      {AREAS.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none">
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Service Date</label>
                  <input type="date" value={form.service_date} onChange={e => setForm(f => ({ ...f, service_date: e.target.value }))}
                    className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none" />
                </div>
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                    className="w-full rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 py-3 text-sm text-primary outline-none resize-none" />
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
