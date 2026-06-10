import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Plus, X, Edit2, Trash2, Loader2, Search } from "lucide-react";

const STATUSES = ["Active", "Completed", "Upcoming", "Cancelled"];
const statusColor = {
  Active: "bg-green-500/10 text-green-600",
  Completed: "bg-surface-container-high text-on-surface-variant",
  Upcoming: "bg-blue-500/10 text-blue-600",
  Cancelled: "bg-red-500/10 text-red-600",
};

const emptyForm = {
  course_name: "", description: "", schedule: "", location: "",
  start_date: "", end_date: "", max_students: 30, status: "Active",
};

export default function EduCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [cRes, eRes] = await Promise.all([
      supabase.from("edu_courses").select("*").order("created_at", { ascending: false }),
      supabase.from("edu_enrollments").select("course_id, member_id"),
    ]);
    setCourses(cRes.data || []);
    setEnrollments(eRes.data || []);
    setLoading(false);
  };

  const openNew = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c) => { setEditItem(c); setForm({ ...c }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, max_students: Number(form.max_students), instructor_id: user?.id, created_by: user?.id };
    if (editItem) {
      await supabase.from("edu_courses").update(payload).eq("id", editItem.id);
    } else {
      await supabase.from("edu_courses").insert(payload);
    }
    setSaving(false);
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this course?")) return;
    await supabase.from("edu_courses").delete().eq("id", id);
    fetchData();
  };

  const filtered = courses.filter(c =>
    c.course_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="display-sm text-primary">Bible <span className="text-tertiary-fixed-dim italic">Courses</span></h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage Bible classes and training programs</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
          <Plus size={16} /> New Course
        </button>
      </div>

      <div className="relative mb-8 max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
        <input type="text" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 h-12 rounded-xl bg-surface-container-low border border-outline-variant/10 text-sm text-primary outline-none focus:border-primary/30 transition-all" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <Loader2 size={36} className="text-primary" />
          </motion.div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((c, i) => {
            const enrolled = enrollments.filter(e => e.course_id === c.id).length;
            const pct = c.max_students > 0 ? Math.round((enrolled / c.max_students) * 100) : 0;
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-surface-container rounded-2xl p-6 border border-outline-variant/10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen size={18} className="text-primary" />
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${statusColor[c.status]}`}>{c.status}</span>
                </div>
                <h3 className="font-black text-primary text-sm mb-1">{c.course_name}</h3>
                {c.description && <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">{c.description}</p>}
                <p className="text-xs text-on-surface-variant/60 mb-3">{c.schedule || "No schedule"} {c.location ? `· ${c.location}` : ""}</p>
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface-variant">Enrollment</span>
                    <span className="font-black text-primary">{enrolled}/{c.max_students}</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.3, duration: 0.8 }}
                      className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : 'bg-primary'}`} />
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-outline-variant/10 mt-3">
                  <button onClick={() => openEdit(c)} className="flex-1 h-9 rounded-xl hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-all gap-1 text-xs font-bold">
                    <Edit2 size={13} /> Edit
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="flex-1 h-9 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-on-surface-variant hover:text-red-500 transition-all gap-1 text-xs font-bold">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 text-on-surface-variant/40">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">No courses found.</p>
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
                <h2 className="headline-sm font-black text-primary">{editItem ? "Edit Course" : "New Course"}</h2>
                <button onClick={() => setShowModal(false)} className="w-9 h-9 rounded-xl hover:bg-surface-container-high flex items-center justify-center">
                  <X size={18} className="text-on-surface-variant" />
                </button>
              </div>
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Course Name *</label>
                  <input required value={form.course_name} onChange={e => setForm(f => ({ ...f, course_name: e.target.value }))}
                    className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none focus:border-primary/40 transition-all" placeholder="e.g. New Believers Class" />
                </div>
                <div>
                  <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                    className="w-full rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 py-3 text-sm text-primary outline-none resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Schedule</label>
                    <input value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))}
                      className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none" placeholder="Every Sunday 9am" />
                  </div>
                  <div>
                    <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Location</label>
                    <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                      className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none" placeholder="Room 3A" />
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-sm text-on-surface-variant font-black uppercase tracking-widest text-[10px] mb-2 block">Max Students</label>
                    <input type="number" min="1" value={form.max_students} onChange={e => setForm(f => ({ ...f, max_students: e.target.value }))}
                      className="w-full h-12 rounded-xl bg-surface-container-low border border-outline-variant/20 px-4 text-sm text-primary outline-none" />
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
