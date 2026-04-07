import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { Card, Button, Input } from "../../components/common/UI";
import {
  Layers, Users, Plus, Search, Trash2, Edit2, X, AlertCircle, Baby, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function KidsClasses() {
  const [classes, setClasses] = useState([]);
  const [kids, setKids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    class_name: "",
    min_age: "",
    max_age: ""
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [classesRes, kidsRes] = await Promise.all([
        supabase.from("kids_classes").select("*").order("class_name"),
        supabase.from("kids").select("id, class_id")
      ]);
      setClasses(classesRes.data || []);
      setKids(kidsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cls = null) => {
    if (cls) {
      setEditingClass(cls);
      setFormData({
        class_name: cls.class_name,
        min_age: cls.min_age || "",
        max_age: cls.max_age || ""
      });
    } else {
      setEditingClass(null);
      setFormData({
        class_name: "",
        min_age: "",
        max_age: ""
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        class_name: formData.class_name,
        min_age: formData.min_age ? parseInt(formData.min_age) : null,
        max_age: formData.max_age ? parseInt(formData.max_age) : null
      };

      if (editingClass) {
        await supabase.from("kids_classes").update(payload).eq("id", editingClass.id);
      } else {
        await supabase.from("kids_classes").insert(payload);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This will unassign kids in this class.")) {
      await supabase.from("kids_classes").delete().eq("id", id);
      loadData();
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="display-md text-primary mb-2">Class <span className="text-tertiary-fixed-dim italic">Management</span></h1>
          <p className="label-sm text-on-surface-variant tracking-widest">Organize kids by age groups and classes</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Plus} className="rounded-full px-6 shadow-lg shadow-primary/20">
          Create Class
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={48} className="text-primary animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const kidsInClass = kids.filter(k => k.class_id === cls.id).length;
            return (
              <motion.div key={cls.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-surface-container rounded-[2rem] p-8 border border-outline-variant/10 hover:border-primary/20 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Layers size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(cls)} className="p-2 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(cls.id)} className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>

                <h3 className="headline-sm text-primary font-black mb-2">{cls.class_name}</h3>
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-3 py-1 rounded-full bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim text-[10px] font-black uppercase tracking-wider border border-tertiary-fixed-dim/20">
                    Ages {cls.min_age || 0} – {cls.max_age || "∞"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-outline-variant/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Baby size={16} className="text-primary" />
                    </div>
                    <span className="text-sm font-bold text-on-surface">Kids Registered</span>
                  </div>
                  <span className="text-xl font-black text-primary">{kidsInClass}</span>
                </div>
              </motion.div>
            );
          })}
          {classes.length === 0 && (
            <div className="col-span-full text-center py-20 text-on-surface-variant/50">
              <Layers size={64} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium text-lg">No classes created yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal for Add/Edit Class */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-surface border border-outline-variant/10 rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center bg-primary/5">
                <h2 className="headline-sm text-primary font-black">{editingClass ? "Update Class" : "New Class"}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-surface-container-high transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={handleSave} className="p-8 space-y-6">
                <Input label="Class Name" placeholder="e.g. Beginners (Ages 3-5)" value={formData.class_name} onChange={e => setFormData({ ...formData, class_name: e.target.value })} required />
                <div className="grid grid-cols-2 gap-6">
                  <Input label="Minimum Age" type="number" value={formData.min_age} onChange={e => setFormData({ ...formData, min_age: e.target.value })} />
                  <Input label="Maximum Age" type="number" value={formData.max_age} onChange={e => setFormData({ ...formData, max_age: e.target.value })} />
                </div>
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 text-red-500 flex items-center gap-2 text-xs font-bold border border-red-500/20">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="rounded-xl px-6">Cancel</Button>
                  <Button type="submit" loading={isSaving} className="rounded-xl px-8 shadow-lg shadow-primary/20">Save Class</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
