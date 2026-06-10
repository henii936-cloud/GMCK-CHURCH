import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { Mic2, Plus, X, Edit2, Trash2, Loader2, Search } from "lucide-react";

const emptyForm = {
  full_name: "", phone: "", email: "", church_affiliation: "",
  specialization: "", is_internal: false, notes: "",
};

export default function Preachers() {
  const { user } = useAuth();
  const [preachers, setPreachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("preachers").select("*").order("full_name", { ascending: true });
    setPreachers(data || []);
    setLoading(false);
  };

  const openNew = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p) => { setEditItem(p); setForm({ ...p }); setShowModal(true); };
  const handleDelete = async (id) => {
    if (!confirm("Remove this preacher?")) return;
    await supabase.from("preachers").delete().eq("id", id);
    fetchData();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (editItem) { await supabase.from("preachers").update(form).eq("id", editItem.id); }
    else { await supabase.from("preachers").insert(form); }
    setSaving(false);
    setShowModal(false);
    fetchData();
  };

  const filtered = preachers.filter(p => {
    const matchSearch = p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.church_affiliation?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All"
      || (filterType === "Internal" && p.is_internal)
      || (filterType === "Invited" && !p.is_internal);
    return matchSearch && matchType;
  });

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="display-sm text-primary">Preacher <span className="text-tertiary-fixed-dim italic">Registry</span></h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage internal and invited preachers, worship leaders, and singers</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
          <Plus size={16} /> Add Preacher
        </button>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
          <input type="text" placeholder="Search preachers..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 h-12 rounded-xl bg-surface-container-low border border-outline-variant/10 text-sm text-primary outline-none focus:border-primary/30 transition-all" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="h-12 px-4 rounded-xl bg-surface-container-low border border-outline-variant/10 text-sm text-primary outline-none">
          <option>All</option><option>Internal</option><option>Invited</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <Loader2 size={36} className="text-primary" />
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-surface-container rounded-2xl p-6 border border-outline-variant/10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-xl">
                  {p.full_name?.charAt(0)}
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${p.is_internal ? "bg-green-500/10 text-green-600" : "bg-blue-500/10 text-blue-600"}`}>
                  {p.is_internal ? "Internal" : "Invited"}
                </span>
              </div>
              <h3 className="font-black text-primary text-sm mb-1">{p.full_name}</h3>
              {p.church_affiliation && <p className="text-xs text-on-surface-variant mb-1">{p.church_affiliation}</p>}
              {p.specialization && <p className="text-xs text-primary/60 font-bold">{p.specialization}</p>}
              {p.phone && <p className="text-xs text-on-surface-variant/60 mt-2">{p.phone}</p>}
              <div className="flex gap-2 mt-4 pt-4 border-t border-outline-variant/10">
                <button onClick={() => openEdit(p)} className="flex-1 h-9 rounded-xl hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-all gap-1 text-xs font-bold">
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => handleDelete(p.id)} className="flex-1 h-9 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-on-surface-variant hover:text-red-500 transition-all gap-1 text-xs font-bold">
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 text-on-surface-variant/40">
              <Mic2 size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">No preachers found.</p>
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
                <h2 className="headline-sm font-black text-primary">{editItem ? "Edit Preacher" : "Add Preacher"}</h2>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-xl hover:bg-surface-container-high flex items-center justify-center"><X size={18} className="text-on-surface-variant" /></button>
              </div>
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Full Name *</label>
                  <input required value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none focus:border-primary/40 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Phone</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none" />
                  </div>
                  <div>
                    <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none" />
                  </div>
                </div>
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Church Affiliation</label>
                  <input value={form.church_affiliation} onChange={e => setForm(f => ({ ...f, church_affiliation: e.target.value }))}
                    className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none" placeholder="e.g. GMKC, Guest Church" />
                </div>
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Specialization / Style</label>
                  <input value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))}
                    className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none" placeholder="e.g. Expository, Evangelistic, Worship" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.is_internal} onChange={e => setForm(f => ({ ...f, is_internal: e.target.checked }))}
                    className="w-5 h-5 rounded accent-primary" />
                  <span className="text-sm text-primary font-bold">Internal Member (not invited guest)</span>
                </label>
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
                    {saving ? "Saving..." : editItem ? "Update" : "Add"}
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
