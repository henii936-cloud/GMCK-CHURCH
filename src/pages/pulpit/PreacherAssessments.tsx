import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { Star, Plus, X, Edit2, Trash2, Loader2, Search } from "lucide-react";
import { formatToEthiopian } from "../../utils/ethiopianDate";

const emptyForm = {
  preacher_id: "", assignment_id: "",
  delivery_score: 3, content_score: 3, style_score: 3, engagement_score: 3,
  feedback: "", assessment_date: new Date().toISOString().split("T")[0],
};

const StarRating = ({ value, onChange, label }) => (
  <div>
    <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">{label}</label>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => onChange(s)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${s <= value ? "bg-amber-500/10 text-amber-500" : "bg-surface-container-low text-on-surface-variant/30 hover:text-amber-500/50"}`}>
          <Star size={18} className={s <= value ? "fill-amber-500" : ""} />
        </button>
      ))}
    </div>
  </div>
);

export default function PreacherAssessments() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
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
      supabase.from("preacher_assessments").select("*").order("assessment_date", { ascending: false }),
      supabase.from("preachers").select("id, full_name"),
    ]);
    setAssessments(aRes.data || []);
    setPreachers(pRes.data || []);
    setLoading(false);
  };

  const openNew = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (a) => { setEditItem(a); setForm({ ...a }); setShowModal(true); };
  const handleDelete = async (id) => {
    if (!confirm("Delete this assessment?")) return;
    await supabase.from("preacher_assessments").delete().eq("id", id);
    fetchData();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const overall = ((Number(form.delivery_score) + Number(form.content_score) + Number(form.style_score) + Number(form.engagement_score)) / 4).toFixed(1);
    const payload = { ...form, overall_score: overall, assessed_by: user?.id };
    if (editItem) { await supabase.from("preacher_assessments").update(payload).eq("id", editItem.id); }
    else { await supabase.from("preacher_assessments").insert(payload); }
    setSaving(false);
    setShowModal(false);
    fetchData();
  };

  const filtered = assessments.filter(a => {
    const preacher = preachers.find(p => p.id === a.preacher_id);
    return preacher?.full_name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="display-sm text-primary">Preacher <span className="text-tertiary-fixed-dim italic">Assessments</span></h1>
          <p className="text-on-surface-variant text-sm mt-1">Evaluate preacher performance, delivery style, and engagement</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
          <Plus size={16} /> New Assessment
        </button>
      </div>

      <div className="relative mb-8 max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
        <input type="text" placeholder="Search by preacher..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 h-12 rounded-xl bg-surface-container-low border border-outline-variant/10 text-sm text-primary outline-none focus:border-primary/30 transition-all" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <Loader2 size={36} className="text-primary" />
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((a, i) => {
            const preacher = preachers.find(p => p.id === a.preacher_id);
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-surface-container rounded-2xl p-6 border border-outline-variant/10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-black text-primary">{preacher?.full_name || "Unknown"}</p>
                    <p className="text-xs text-on-surface-variant">{formatToEthiopian(a.assessment_date)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-black text-amber-500">{a.overall_score}</p>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">Overall</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    ["Delivery", a.delivery_score],
                    ["Content", a.content_score],
                    ["Style", a.style_score],
                    ["Engagement", a.engagement_score],
                  ].map(([label, score]) => (
                    <div key={label} className="p-3 bg-surface-container-low rounded-xl">
                      <p className="text-[10px] font-black uppercase text-on-surface-variant mb-1">{label}</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={12} className={s <= score ? "text-amber-500 fill-amber-500" : "text-on-surface-variant/20"} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {a.feedback && <p className="text-xs text-on-surface-variant italic mb-4 line-clamp-2">"{a.feedback}"</p>}
                <div className="flex gap-2 pt-3 border-t border-outline-variant/10">
                  <button onClick={() => openEdit(a)} className="flex-1 h-9 rounded-xl hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-all gap-1 text-xs font-bold">
                    <Edit2 size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="flex-1 h-9 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-on-surface-variant hover:text-red-500 transition-all gap-1 text-xs font-bold">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 text-on-surface-variant/40">
              <Star size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">No assessments found.</p>
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
                <h2 className="headline-sm font-black text-primary">{editItem ? "Edit Assessment" : "New Assessment"}</h2>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-xl hover:bg-surface-container-high flex items-center justify-center"><X size={18} className="text-on-surface-variant" /></button>
              </div>
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Preacher *</label>
                  <select required value={form.preacher_id} onChange={e => setForm(f => ({ ...f, preacher_id: e.target.value }))}
                    className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none">
                    <option value="">-- Select Preacher --</option>
                    {preachers.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Assessment Date</label>
                  <input type="date" value={form.assessment_date} onChange={e => setForm(f => ({ ...f, assessment_date: e.target.value }))}
                    className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <StarRating label="Delivery" value={form.delivery_score} onChange={v => setForm(f => ({ ...f, delivery_score: v }))} />
                  <StarRating label="Content" value={form.content_score} onChange={v => setForm(f => ({ ...f, content_score: v }))} />
                  <StarRating label="Style" value={form.style_score} onChange={v => setForm(f => ({ ...f, style_score: v }))} />
                  <StarRating label="Engagement" value={form.engagement_score} onChange={v => setForm(f => ({ ...f, engagement_score: v }))} />
                </div>
                <div className="p-4 bg-amber-500/5 rounded-2xl text-center">
                  <p className="text-xs text-on-surface-variant font-black uppercase mb-1">Calculated Overall Score</p>
                  <p className="text-4xl font-black text-amber-500">
                    {((form.delivery_score + form.content_score + form.style_score + form.engagement_score) / 4).toFixed(1)}
                  </p>
                  <p className="text-xs text-on-surface-variant">out of 5</p>
                </div>
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Feedback / Notes</label>
                  <textarea value={form.feedback} onChange={e => setForm(f => ({ ...f, feedback: e.target.value }))} rows={3}
                    className="w-full rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 py-3 text-sm text-primary outline-none resize-none" placeholder="Observations about delivery, style, content quality..." />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 h-12 rounded-xl border border-outline-variant/20 text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-all">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50">
                    {saving ? "Saving..." : editItem ? "Update" : "Submit"}
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
