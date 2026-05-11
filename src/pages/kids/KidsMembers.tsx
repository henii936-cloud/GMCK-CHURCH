import EtDatePicker from "../../components/common/EtDatePicker";
import { formatToEthiopian } from "../../utils/ethiopianDate";
import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { Card, Button, Input } from "../../components/common/UI";
import {
  Users, Search, Filter, Loader2, Plus, X,
  Baby, Smile, Heart, Calendar, User, MoreVertical, Edit2, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function KidsMembers() {
  const [kids, setKids] = useState([]);
  const [parents, setParents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingKid, setEditingKid] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    gender: "Male",
    birth_date: "",
    parent_id: "",
    class_id: "",
    growth_notes: "",
    image_url: ""
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [kidsRes, parentsRes, classesRes] = await Promise.all([
        supabase.from("kids").select("*, kids_classes(class_name), members(full_name)").order("full_name"),
        supabase.from("members").select("id, full_name").order("full_name"),
        supabase.from("kids_classes").select("*").order("class_name")
      ]);
      setKids(kidsRes.data || []);
      setParents(parentsRes.data || []);
      setClasses(classesRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (kid = null) => {
    if (kid) {
      setEditingKid(kid);
      setFormData({
        full_name: kid.full_name,
        gender: kid.gender || "Male",
        birth_date: kid.birth_date || "",
        parent_id: kid.parent_id || "",
        class_id: kid.class_id || "",
        growth_notes: kid.growth_notes || "",
        image_url: kid.image_url || ""
      });
    } else {
      setEditingKid(null);
      setFormData({
        full_name: "",
        gender: "Male",
        birth_date: "",
        parent_id: "",
        class_id: "",
        growth_notes: "",
        image_url: ""
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...formData };
      if (!payload.parent_id) payload.parent_id = null;
      if (!payload.class_id) payload.class_id = null;

      if (editingKid) {
        await supabase.from("kids").update(payload).eq("id", editingKid.id);
      } else {
        await supabase.from("kids").insert(payload);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      await supabase.from("kids").delete().eq("id", id);
      loadData();
    }
  };

  const filteredKids = kids.filter(k => {
    const matchSearch = k.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = selectedClass === "All" || k.class_id === selectedClass;
    return matchSearch && matchClass;
  });

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="display-md text-primary mb-2">Kids <span className="text-tertiary-fixed-dim italic">Management</span></h1>
          <p className="label-sm text-on-surface-variant tracking-widest">{kids.length} children registered</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Plus} className="rounded-full px-6 shadow-lg shadow-primary/20">
          Register Child
        </Button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
          <input
            type="text"
            placeholder="Search children by name..."
            className="editorial-input pl-12 w-full bg-surface-container-low"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative md:w-64">
          <select
            className="w-full h-14 pl-4 pr-10 rounded-2xl border border-outline-variant/10 bg-surface-container-low text-on-surface focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="All">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={48} className="text-primary animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredKids.map((k) => (
            <motion.div key={k.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10 hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-2xl">
                  {k.image_url ? <img src={k.image_url} alt={k.full_name} className="w-full h-full object-cover rounded-2xl" /> : k.full_name.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-black text-primary text-base truncate">{k.full_name}</p>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1">
                    <Baby size={12} /> {k.kids_classes?.class_name || "Unassigned"}
                  </p>
                </div>
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(k)} className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-primary"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(k.id)} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Parent/Guardian</span>
                  <span className="font-bold text-primary">{k.members?.full_name || "—"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Birth Date</span>
                  <span className="font-bold text-primary">{k.birth_date ? formatToEthiopian(k.birth_date) : "—"}</span>
                </div>
                {k.growth_notes && (
                  <div className="mt-4 p-3 rounded-xl bg-surface-container-low border border-outline-variant/5">
                    <p className="text-[10px] font-bold text-tertiary-fixed-dim uppercase tracking-wider mb-1">Growth Notes</p>
                    <p className="text-xs text-on-surface-variant italic">{k.growth_notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {filteredKids.length === 0 && (
            <div className="col-span-full text-center py-20 text-on-surface-variant/50">
              <Baby size={64} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium text-lg">No records found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal for Add/Edit */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-surface border border-outline-variant/10 rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
                <h2 className="headline-sm text-primary font-black">{editingKid ? "Edit Child" : "Register Child"}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-surface-container-high transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Full Name" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} required />
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface pl-1">Gender</label>
                    <select className="w-full h-14 px-4 rounded-xl border border-outline-variant/20 bg-surface-container-low text-on-surface appearance-none"
                      value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <EtDatePicker label="Birth Date" value={formData.birth_date} onChange={e => setFormData({ ...formData, birth_date: e.target.value })} />
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface pl-1">Parent / Guardian</label>
                    <select className="w-full h-14 px-4 rounded-xl border border-outline-variant/20 bg-surface-container-low text-on-surface appearance-none"
                      value={formData.parent_id} onChange={e => setFormData({ ...formData, parent_id: e.target.value })}>
                      <option value="">Select Parent</option>
                      {parents.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface pl-1">Class Assignment</label>
                    <select className="w-full h-14 px-4 rounded-xl border border-outline-variant/20 bg-surface-container-low text-on-surface appearance-none"
                      value={formData.class_id} onChange={e => setFormData({ ...formData, class_id: e.target.value })}>
                      <option value="">No Class</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface pl-1">Growth & Safety Notes</label>
                  <textarea className="w-full p-4 rounded-xl border border-outline-variant/20 bg-surface-container-low text-on-surface min-h-[100px]"
                    placeholder="Growth tracking, allergies, or safety requirements..."
                    value={formData.growth_notes} onChange={e => setFormData({ ...formData, growth_notes: e.target.value })} />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="rounded-xl px-6">Cancel</Button>
                  <Button type="submit" loading={isSaving} className="rounded-xl px-8 shadow-lg shadow-primary/20">Save Record</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
