import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Plus, X, Edit2, Trash2, Loader2, Search, ChevronDown } from "lucide-react";

const PRIORITIES = ["Low", "Normal", "High", "Urgent"];
const STATUSES = ["Pending", "Assigned", "In Progress", "Resolved", "Closed"];

const statusColor = {
  Pending: "bg-amber-500/10 text-amber-600",
  Assigned: "bg-blue-500/10 text-blue-600",
  "In Progress": "bg-indigo-500/10 text-indigo-600",
  Resolved: "bg-green-500/10 text-green-600",
  Closed: "bg-surface-container text-on-surface-variant",
};
const priorityColor = {
  Low: "bg-surface-container-high text-on-surface-variant",
  Normal: "bg-primary/10 text-primary",
  High: "bg-orange-500/10 text-orange-600",
  Urgent: "bg-red-500/10 text-red-600",
};

const emptyForm = {
  requester_name: "", phone: "", issue_summary: "",
  priority: "Normal", status: "Pending",
};

export default function CounselingRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("counseling_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setRequests(data || []);
    setLoading(false);
  };

  const openNew = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (r) => { setEditItem(r); setForm({ ...r }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, created_by: user?.id };
    if (editItem) {
      await supabase.from("counseling_requests").update(payload).eq("id", editItem.id);
    } else {
      await supabase.from("counseling_requests").insert(payload);
    }
    setSaving(false);
    setShowModal(false);
    fetchRequests();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this counseling request?")) return;
    await supabase.from("counseling_requests").delete().eq("id", id);
    fetchRequests();
  };

  const filtered = requests.filter(r => {
    const matchSearch = r.requester_name?.toLowerCase().includes(search.toLowerCase())
      || r.issue_summary?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="display-sm text-primary">Counseling <span className="text-tertiary-fixed-dim italic">Requests</span></h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage and assign incoming counseling requests</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
          <Plus size={16} /> New Request
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
          <input type="text" placeholder="Search requests..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-12 rounded-xl bg-surface-container-low border border-outline-variant/10 text-sm text-primary outline-none focus:border-primary/30 transition-all" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/10 text-sm text-primary outline-none">
          <option value="All">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <Loader2 size={36} className="text-primary" />
          </motion.div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-surface-container rounded-2xl p-5 border border-outline-variant/10 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Heart size={18} className="text-primary" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-bold text-sm text-primary">{r.requester_name}</p>
                <p className="text-xs text-on-surface-variant truncate">{r.issue_summary || "—"}</p>
                {r.phone && <p className="text-xs text-on-surface-variant/60 mt-0.5">{r.phone}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${priorityColor[r.priority]}`}>{r.priority}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${statusColor[r.status]}`}>{r.status}</span>
                <button onClick={() => openEdit(r)} className="w-9 h-9 rounded-xl hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-all">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(r.id)} className="w-9 h-9 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-on-surface-variant hover:text-red-500 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-20 text-on-surface-variant/40">
              <Heart size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">No requests found.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container rounded-3xl p-8 w-full max-w-lg border border-outline-variant/10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="headline-sm font-black text-primary">{editItem ? "Edit Request" : "New Counseling Request"}</h2>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-xl hover:bg-surface-container-high flex items-center justify-center">
                  <X size={18} className="text-on-surface-variant" />
                </button>
              </div>
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Full Name *</label>
                  <input required value={form.requester_name} onChange={e => setForm(f => ({ ...f, requester_name: e.target.value }))}
                    className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none focus:border-primary/40 transition-all" placeholder="Name of person seeking counseling" />
                </div>
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none focus:border-primary/40 transition-all" placeholder="+251..." />
                </div>
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Issue Summary</label>
                  <textarea value={form.issue_summary} onChange={e => setForm(f => ({ ...f, issue_summary: e.target.value }))}
                    rows={3} className="w-full rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 py-3 text-sm text-primary outline-none focus:border-primary/40 transition-all resize-none" placeholder="Brief description (confidential)..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Priority</label>
                    <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                      className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none">
                      {PRIORITIES.map(p => <option key={p}>{p}</option>)}
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
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 h-12 rounded-xl border border-outline-variant/20 text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50">
                    {saving ? "Saving..." : editItem ? "Update" : "Create"}
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
