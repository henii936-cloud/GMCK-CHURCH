import EtDatePicker from "../../components/common/EtDatePicker";
import { formatToEthiopian } from "../../utils/ethiopianDate";
import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { Card, Button, Input } from "../../components/common/UI";
import {
  Calendar, MapPin, Clock, Plus, Search, Trash2, Edit2,
  XCircle, CheckCircle2, Users, Star, Smile, Heart, UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function KidsEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    event_time: "",
    location: "Main Sanctuary",
    category: "Sunday School"
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("events").select("*").eq("category", "Kids").order("date", { ascending: false });
      setEvents(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || "",
        date: event.date ? event.date.split('T')[0] : "",
        event_time: event.event_time || "",
        location: event.location || "Kids Hall",
        category: "Kids"
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: "",
        description: "",
        date: "",
        event_time: "",
        location: "Kids Hall",
        category: "Kids"
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...formData, category: "Kids" };
      if (editingEvent) {
        await supabase.from("events").update(payload).eq("id", editingEvent.id);
      } else {
        await supabase.from("events").insert(payload);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="display-md text-primary mb-2">Kids <span className="text-tertiary-fixed-dim italic">Events</span></h1>
          <p className="label-sm text-on-surface-variant tracking-widest">Sunday School, Camps & Special Programs</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Plus} className="rounded-full px-6 shadow-lg shadow-primary/20">
          Create Kids Event
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={48} className="text-primary animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {events.map((e, idx) => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className="bg-surface-container rounded-[2.5rem] p-8 border border-outline-variant/10 hover:border-primary/20 transition-all flex flex-col group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Smile size={120} />
              </div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary shadow-lg shadow-primary/20 grid place-items-center text-on-primary">
                  <Star size={28} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(e)} className="p-3 rounded-2xl bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"><Edit2 size={18} /></button>
                </div>
              </div>

              <h3 className="headline-sm text-primary font-black mb-3">{e.title}</h3>
              <p className="text-sm text-on-surface-variant mb-8 line-clamp-2">{e.description || "No description provided."}</p>

              <div className="mt-auto space-y-4">
                <div className="flex items-center gap-3 text-sm font-bold text-primary">
                  <Calendar size={18} className="text-tertiary-fixed-dim" />
                  {formatToEthiopian(e.date)}
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-on-surface-variant">
                  <Clock size={18} /> {e.event_time}
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-on-surface-variant">
                  <MapPin size={18} /> {e.location}
                </div>
              </div>
            </motion.div>
          ))}
          {events.length === 0 && (
            <div className="col-span-full text-center py-24 bg-surface-container-low rounded-[3rem] border border-dashed border-outline-variant/20">
              <Calendar size={64} className="mx-auto mb-6 opacity-20" />
              <p className="text-xl font-black text-primary/40 italic">Planning the next adventure...</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-surface border border-outline-variant/10 rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 border-b border-outline-variant/10 flex justify-between items-center bg-primary/5">
                <div>
                  <h2 className="headline-sm text-primary font-black">Plan Kids Event</h2>
                  <p className="text-xs font-bold text-tertiary-fixed-dim uppercase tracking-widest mt-1">Spreading Joy and Truth</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 rounded-2xl hover:bg-surface-container-high transition-colors"><XCircle size={32} className="text-primary/40 hover:text-primary" /></button>
              </div>
              <form onSubmit={handleSave} className="p-10 space-y-8">
                <Input label="Event Title" placeholder="e.g. Vacation Bible School 2026" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                <div className="grid grid-cols-2 gap-6">
                  <EtDatePicker label="Event Date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                  <Input label="Event Time" placeholder="e.g. 10:00 AM" value={formData.event_time} onChange={e => setFormData({ ...formData, event_time: e.target.value })} required />
                </div>
                <Input label="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface">Program Details</label>
                  <textarea className="w-full p-5 rounded-2xl border border-outline-variant/20 bg-surface-container-low text-on-surface min-h-[120px]"
                    placeholder="Theme, verse, activities..."
                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="rounded-2xl px-8 h-14">Close</Button>
                  <Button type="submit" loading={isSaving} className="rounded-2xl px-12 h-14 shadow-xl shadow-primary/20">Launch Event</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
