import EtDatePicker from "../../components/common/EtDatePicker";
import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Search, Edit2, Trash2, UserCheck, UserX, DollarSign, X, Loader2, Briefcase } from "lucide-react";
import { Button, Input, Card } from "../../components/common/UI";

const BLANK = { full_name: "", position: "", department: "", phone: "", email: "", monthly_salary: "", status: "Active", hired_date: "" };

export default function WorkersPage() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from("church_workers").select("*").order("full_name");
    setWorkers(data || []);
    setLoading(false);
  };

  const openAdd = () => { setForm(BLANK); setEditId(null); setModal(true); };
  const openEdit = (w) => { setForm({ ...w, monthly_salary: w.monthly_salary || "" }); setEditId(w.id); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, monthly_salary: parseFloat(form.monthly_salary) || 0, created_by: user?.id };
      if (editId) {
        await supabase.from("church_workers").update(payload).eq("id", editId);
      } else {
        await supabase.from("church_workers").insert([payload]);
      }
      setModal(false);
      fetch();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this worker?")) return;
    await supabase.from("church_workers").delete().eq("id", id);
    fetch();
  };

  const filtered = workers.filter(w => w.full_name?.toLowerCase().includes(search.toLowerCase()) || w.position?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="display-md text-primary mb-2">Church <span className="text-tertiary-fixed-dim italic">Workers</span></h1>
          <p className="label-sm text-on-surface-variant tracking-widest">{workers.length} registered staff members</p>
        </div>
        <Button onClick={openAdd} className="bg-primary text-on-primary border-none h-12 px-6">
          <Plus size={18} className="mr-2" /> Add Worker
        </Button>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
        <input type="text" placeholder="Search workers by name or position..." className="editorial-input pl-12 w-full bg-surface-container-low" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={36} className="text-primary animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((w, i) => (
            <motion.div key={w.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10 group hover:border-primary/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-lg">
                    {w.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-primary text-sm">{w.full_name}</p>
                    <p className="text-xs text-on-surface-variant">{w.position || "Staff"} {w.department ? `• ${w.department}` : ""}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${w.status === "Active" ? "bg-green-500/10 text-green-500" : "bg-orange-400/10 text-orange-400"}`}>
                  {w.status}
                </span>
              </div>
              <div className="space-y-2 mb-5">
                {w.phone && <p className="text-xs text-on-surface-variant">📞 {w.phone}</p>}
                {w.email && <p className="text-xs text-on-surface-variant">✉️ {w.email}</p>}
                <div className="flex items-center gap-2 mt-3">
                  <DollarSign size={14} className="text-green-500" />
                  <p className="text-sm font-black text-green-500">${parseFloat(w.monthly_salary || 0).toLocaleString()}<span className="text-xs text-on-surface-variant font-medium">/month</span></p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(w)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-container-low hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all text-xs font-black uppercase tracking-wider">
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => handleDelete(w.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-container-low hover:bg-red-400/10 text-on-surface-variant hover:text-red-400 transition-all text-xs font-black uppercase tracking-wider">
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 text-on-surface-variant/50">
              <Briefcase size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">No workers found.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-50" onClick={() => setModal(false)} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            >
              <Card className="w-full max-w-lg p-10 bg-surface-container border-none shadow-2xl relative">
                <button onClick={() => setModal(false)} className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-primary cursor-pointer">
                  <X size={18} />
                </button>
                <h2 className="headline-sm text-primary font-black mb-8">{editId ? "Edit Worker" : "Add New Worker"}</h2>
                <form onSubmit={handleSave} className="space-y-5">
                  <Input label="Full Name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Position" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
                    <Input label="Department" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Monthly Salary ($)" type="number" value={form.monthly_salary} onChange={e => setForm({ ...form, monthly_salary: e.target.value })} />
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Status</label>
                      <select className="editorial-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                        <option>Active</option>
                        <option>Inactive</option>
                        <option>On Leave</option>
                      </select>
                    </div>
                  </div>
                  <EtDatePicker label="Hired Date" value={form.hired_date} onChange={e => setForm({ ...form, hired_date: e.target.value })} />
                  <Button type="submit" loading={saving} className="w-full h-12 bg-primary text-on-primary border-none">
                    {editId ? "Update Worker" : "Add Worker"}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
