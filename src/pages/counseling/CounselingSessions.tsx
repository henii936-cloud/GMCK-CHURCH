import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Plus, X, Edit2, Trash2, Loader2, Search } from "lucide-react";
import { formatToEthiopian } from "../../utils/ethiopianDate";

const SESSION_STATUSES = ["Scheduled", "Completed", "Cancelled", "No-Show"];

const statusColor = {
  Scheduled: "bg-blue-500/10 text-blue-600",
  Completed: "bg-green-500/10 text-green-600",
  Cancelled: "bg-red-500/10 text-red-600",
  "No-Show": "bg-amber-500/10 text-amber-600",
};

const emptyForm = {
  session_date: "", location: "", notes: "", status: "Scheduled", follow_up_required: false,
};

export default function CounselingSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("counseling_sessions")
      .select("*")
      .order("session_date", { ascending: false });
    setSessions(data || []);
    setLoading(false);
  };

  const openNew = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (s) => { setEditItem(s); setForm({ ...s, session_date: s.session_date?.slice(0, 16) }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, counselor_id: user?.id };
    if (editItem) {
      await supabase.from("counseling_sessions").update(payload).eq("id", editItem.id);
    } else {
      await supabase.from("counseling_sessions").insert(payload);
    }
    setSaving(false);
    setShowModal(false);
    fetchSessions();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this session?")) return;
    await supabase.from("counseling_sessions").delete().eq("id", id);
    fetchSessions();
  };

  const filtered = sessions.filter(s =>
    s.location?.toLowerCase().includes(search.toLowerCase()) ||
    s.notes?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="display-sm text-primary">Counseling <span className="text-tertiary-fixed-dim italic">Sessions</span></h1>
          <p className="text-on-surface-variant text-sm mt-1">Schedule and manage counseling sessions</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
          <Plus size={16} /> Schedule Session
        </button>
      </div>

      <div className="relative mb-8 max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
        <input type="text" placeholder="Search sessions..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 h-12 rounded-xl bg-surface-container-low border border-outline-variant/10 text-sm text-primary outline-none focus:border-primary/30 transition-all" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <Loader2 size={36} className="text-primary" />
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-surface-container rounded-2xl p-6 border border-outline-variant/10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Calendar size={18} className="text-blue-500" />
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${statusColor[s.status]}`}>{s.status}</span>
              </div>
              <p className="font-black text-primary text-sm mb-1">{formatToEthiopian(s.session_date?.split("T")[0])}</p>
              <p className="text-xs text-on-surface-variant mb-1">{s.session_date?.slice(11, 16) || ""}</p>
              <p className="text-xs text-on-surface-variant/60 mb-3">{s.location || "Location TBD"}</p>
              {s.follow_up_required && (
                <span className="text-[10px] bg-amber-500/10 text-amber-600 font-black px-2 py-1 rounded-lg">Follow-up Required</span>
              )}
              <div className="flex gap-2 mt-4 pt-4 border-t border-outline-variant/10">
                <button onClick={() => openEdit(s)} className="flex-1 h-9 rounded-xl hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-all">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(s.id)} className="flex-1 h-9 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-on-surface-variant hover:text-red-500 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 text-on-surface-variant/40">
              <Calendar size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">No sessions found.</p>
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
                <h2 className="headline-sm font-black text-primary">{editItem ? "Edit Session" : "Schedule Session"}</h2>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-xl hover:bg-surface-container-high flex items-center justify-center">
                  <X size={18} className="text-on-surface-variant" />
                </button>
              </div>
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Date & Time *</label>
                  <input type="datetime-local" required value={form.session_date} onChange={e => setForm(f => ({ ...f, session_date: e.target.value }))}
                    className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none focus:border-primary/40 transition-all" />
                </div>
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Location</label>
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none focus:border-primary/40 transition-all" placeholder="Session location" />
                </div>
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Notes (Confidential)</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={3} className="w-full rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 py-3 text-sm text-primary outline-none focus:border-primary/40 transition-all resize-none" placeholder="Confidential session notes..." />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm text-primary outline-none">
                      {SESSION_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer mt-4">
                    <input type="checkbox" checked={form.follow_up_required}
                      onChange={e => setForm(f => ({ ...f, follow_up_required: e.target.checked }))}
                      className="w-5 h-5 rounded accent-primary" />
                    <span className="text-sm text-primary font-bold">Follow-up Required</span>
                  </label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 h-12 rounded-xl border border-outline-variant/20 text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-all">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50">
                    {saving ? "Saving..." : editItem ? "Update" : "Schedule"}
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
