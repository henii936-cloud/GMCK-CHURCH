import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { HardHat, Plus, X, Edit2, Trash2, Loader2, Search } from "lucide-react";

const CATEGORIES = ["Construction", "Renovation", "Maintenance", "Infrastructure", "Other"];
const STATUSES = ["Planning", "In Progress", "On Hold", "Completed", "Cancelled"];

const statusColor = {
  Planning: "bg-surface-container-high text-on-surface-variant",
  "In Progress": "bg-blue-500/10 text-blue-600",
  "On Hold": "bg-amber-500/10 text-amber-600",
  Completed: "bg-green-500/10 text-green-600",
  Cancelled: "bg-red-500/10 text-red-600",
};

const emptyForm = {
  title: "", description: "", category: "Construction", status: "Planning",
  budget_allocated: "", budget_spent: "", start_date: "", end_date: "",
};

export default function DevProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data } = await supabase.from("development_projects").select("*").order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  const openNew = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p) => { setEditItem(p); setForm({ ...p }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      budget_allocated: Number(form.budget_allocated) || 0,
      budget_spent: Number(form.budget_spent) || 0,
      created_by: user?.id,
    };
    if (editItem) {
      await supabase.from("development_projects").update(payload).eq("id", editItem.id);
    } else {
      await supabase.from("development_projects").insert(payload);
    }
    setSaving(false);
    setShowModal(false);
    fetchProjects();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project?")) return;
    await supabase.from("development_projects").delete().eq("id", id);
    fetchProjects();
  };

  const filtered = projects.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="display-sm text-primary">Development <span className="text-tertiary-fixed-dim italic">Projects</span></h1>
          <p className="text-on-surface-variant text-sm mt-1">Plan and track church construction and maintenance projects</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
          <Plus size={16} /> New Project
        </button>
      </div>

      <div className="relative mb-8 max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
        <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 h-12 rounded-xl bg-surface-container-low border border-outline-variant/10 text-sm text-primary outline-none focus:border-primary/30 transition-all" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <Loader2 size={36} className="text-primary" />
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((p, i) => {
            const pct = p.budget_allocated > 0 ? Math.min((p.budget_spent / p.budget_allocated) * 100, 100) : 0;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-surface-container rounded-2xl p-6 border border-outline-variant/10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <HardHat size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-black text-primary text-sm">{p.title}</p>
                      <p className="text-xs text-on-surface-variant">{p.category}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${statusColor[p.status]}`}>{p.status}</span>
                </div>
                {p.description && <p className="text-xs text-on-surface-variant mb-4 line-clamp-2">{p.description}</p>}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                    <span>Budget Used</span>
                    <span className="font-black text-primary">{Math.round(pct)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.3, duration: 0.8 }}
                      className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : 'bg-primary'}`} />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-on-surface-variant">ETB {Number(p.budget_spent || 0).toLocaleString()} spent</span>
                    <span className="text-on-surface-variant">of ETB {Number(p.budget_allocated || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-outline-variant/10">
                  <button onClick={() => openEdit(p)} className="flex-1 h-9 rounded-xl hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-all gap-1 text-xs font-bold">
                    <Edit2 size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="flex-1 h-9 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-on-surface-variant hover:text-red-500 transition-all gap-1 text-xs font-bold">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 text-on-surface-variant/40">
              <HardHat size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">No projects found.</p>
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
                <h2 className="headline-sm font-black text-primary">{editItem ? "Edit Project" : "New Project"}</h2>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-xl hover:bg-surface-container-high flex items-center justify-center">
                  <X size={18} className="text-on-surface-variant" />
                </button>
              </div>
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                {[["title", "Project Title *", "text", true], ["description", "Description", "text", false]].map(([key, label, type, req]) => (
                  <div key={key}>
                    <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">{label}</label>
                    {key === "description"
                      ? <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} rows={2}
                          className="w-full rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 py-3 text-sm text-primary outline-none focus:border-primary/40 transition-all resize-none" />
                      : <input required={!!req} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                          className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none focus:border-primary/40 transition-all" />
                    }
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Budget Allocated (ETB)</label>
                    <input type="number" min="0" value={form.budget_allocated} onChange={e => setForm(f => ({ ...f, budget_allocated: e.target.value }))}
                      className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none focus:border-primary/40 transition-all" />
                  </div>
                  <div>
                    <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Budget Spent (ETB)</label>
                    <input type="number" min="0" value={form.budget_spent} onChange={e => setForm(f => ({ ...f, budget_spent: e.target.value }))}
                      className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none focus:border-primary/40 transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Start Date</label>
                    <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                      className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none" />
                  </div>
                  <div>
                    <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">End Date</label>
                    <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                      className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 h-12 rounded-xl border border-outline-variant/20 text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-all">Cancel</button>
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
