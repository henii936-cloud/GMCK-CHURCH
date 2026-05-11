import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Search, Calendar, X, Loader2, Edit2, Trash2, MapPin, Clock } from "lucide-react";
import { Button, Input, Card } from "../../components/common/UI";
import { formatToEthiopian } from "../../utils/ethiopianDate";

const BLANK = {
  title: "",
  description: "",
  date: "",
  event_time: "",
  location: "",
  status: "Upcoming",
};

export default function ShepherdEvents() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from("events").select("*").eq("category", "Shepherd").order("date", { ascending: false });
      setEvents(data || []);
    } catch (err) {
      console.error("Error loading shepherd events:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditId(null);
    setFormData(BLANK);
    setModalOpen(true);
  };

  const openEdit = (event) => {
    setEditId(event.id);
    setFormData({
      title: event.title || "",
      description: event.description || "",
      date: event.date ? event.date.split("T")[0] : "",
      event_time: event.event_time || "",
      location: event.location || "",
      status: event.status || "Upcoming",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData, category: "Shepherd" };
      if (editId) {
        await supabase.from("events").update(payload).eq("id", editId);
      } else {
        await supabase.from("events").insert([payload]);
      }
      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      console.error("Error saving shepherd event:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    try {
      await supabase.from("events").delete().eq("id", id);
      fetchEvents();
    } catch (err) {
      console.error("Error deleting shepherd event:", err);
    }
  };

  const filteredEvents = events.filter(evt => evt.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="display-md text-primary mb-2">Shepherd <span className="text-tertiary-fixed-dim italic">Events</span></h1>
          <p className="label-sm text-on-surface-variant tracking-widest">Plan shepherd-led ministry events and meetings.</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-on-primary border-none h-12 px-6">
          <Plus size={18} className="mr-2" /> Plan Event
        </Button>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
        <input
          type="text"
          placeholder="Search shepherd events..."
          className="editorial-input pl-12 w-full bg-surface-container-low"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={36} className="text-primary animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredEvents.map((evt, idx) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10 group hover:border-primary/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed-dim/10 flex items-center justify-center">
                  <Calendar size={22} className="text-tertiary-fixed-dim" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(evt)} className="p-3 rounded-2xl bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(evt.id)} className="p-3 rounded-2xl bg-surface-container-high text-on-surface-variant hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>

              <h3 className="font-black text-primary text-sm mb-2">{evt.title}</h3>
              {evt.description && <p className="text-xs text-on-surface-variant mb-4 line-clamp-2">{evt.description}</p>}

              <div className="space-y-1 mb-5 text-sm text-on-surface-variant">
                <p className="flex items-center gap-2"><Clock size={12} /> {evt.event_time || "Time not set"}</p>
                <p className="flex items-center gap-2"><MapPin size={12} /> {evt.location || "Location not set"}</p>
                <p>📅 {formatToEthiopian(evt.date)}</p>
                <span className="inline-flex px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-surface-container-high text-on-surface-variant">{evt.status || "Upcoming"}</span>
              </div>
            </motion.div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="col-span-full text-center py-20 text-on-surface-variant/50">
              <Calendar size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">No shepherd events yet. Start planning one now.</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-50" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
              <Card className="w-full max-w-2xl p-10 bg-surface-container border-none shadow-2xl relative my-4">
                <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-primary">
                  <X size={18} />
                </button>
                <h2 className="headline-sm text-primary font-black mb-8">{editId ? "Edit Shepherd Event" : "Create Shepherd Event"}</h2>
                <form onSubmit={handleSave} className="space-y-5">
                  <Input label="Event Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                  <Input label="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Event Date" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                    <Input label="Event Time" placeholder="e.g. 5:00 PM" value={formData.event_time} onChange={e => setFormData({ ...formData, event_time: e.target.value })} />
                  </div>
                  <Input label="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                  <div>
                    <label className="text-sm font-semibold text-on-surface">Event Status</label>
                    <select className="editorial-input w-full" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                      <option>Upcoming</option>
                      <option>Ongoing</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="rounded-2xl px-8 h-14">Close</Button>
                    <Button type="submit" loading={saving} className="rounded-2xl px-12 h-14 shadow-xl shadow-primary/20">{editId ? "Update Event" : "Create Event"}</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
