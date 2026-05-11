import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Search, Calendar, X, Loader2, Edit2, Trash2, MapPin, Clock } from "lucide-react";
import { Button, Input, Card } from "../../components/common/UI";

const BLANK = { title: "", description: "", event_date: "", event_time: "", location: "", target_age_min: 13, target_age_max: 35, max_participants: "", status: "Upcoming" };

export default function YouthEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase.from("youth_events").select("*").order("event_date", { ascending: false });
    setEvents(data || []);
    setLoading(false);
  };

  const openCreate = () => { setForm(BLANK); setEditId(null); setModal(true); };
  const openEdit = (e) => { setForm({ ...e, event_date: e.event_date?.slice(0, 16) }); setEditId(e.id); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, target_age_min: parseInt(form.target_age_min), target_age_max: parseInt(form.target_age_max), leader_id: user?.id, created_by: user?.id };
      if (editId) {
        await supabase.from("youth_events").update(payload).eq("id", editId);
      } else {
        await supabase.from("youth_events").insert([payload]);
      }
      setModal(false);
      fetchEvents();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) return;
    await supabase.from("youth_events").delete().eq("id", id);
    fetchEvents();
  };

  const statusColor = { Upcoming: "bg-green-500/10 text-green-500", Ongoing: "bg-blue-400/10 text-blue-400", Completed: "bg-on-surface-variant/10 text-on-surface-variant", Cancelled: "bg-red-400/10 text-red-400" };
  const filtered = events.filter(e => e.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="display-md text-primary mb-2">Youth <span className="text-tertiary-fixed-dim italic">Events</span></h1>
          <p className="label-sm text-on-surface-variant tracking-widest">{events.length} events scheduled</p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-on-primary border-none h-12 px-6">
          <Plus size={18} className="mr-2" /> Create Event
        </Button>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
        <input type="text" placeholder="Search events..." className="editorial-input pl-12 w-full bg-surface-container-low" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={36} className="text-primary animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((evt, i) => (
            <motion.div key={evt.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10 group hover:border-primary/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed-dim/10 flex items-center justify-center">
                  <Calendar size={22} className="text-tertiary-fixed-dim" />
                </div>
                <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${statusColor[evt.status] || ""}`}>{evt.status}</span>
              </div>
              <h3 className="font-black text-primary text-sm mb-2">{evt.title}</h3>
              {evt.description && <p className="text-xs text-on-surface-variant mb-4 line-clamp-2">{evt.description}</p>}
              <div className="space-y-1 mb-5">
                <p className="text-xs text-on-surface-variant flex items-center gap-2"><Clock size={12} /> {new Date(evt.event_date).toLocaleString()}</p>
                {evt.location && <p className="text-xs text-on-surface-variant flex items-center gap-2"><MapPin size={12} /> {evt.location}</p>}
                <p className="text-xs text-on-surface-variant">🎯 Ages {evt.target_age_min}–{evt.target_age_max}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(evt)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-container-low hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all text-xs font-black uppercase tracking-wider">
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => handleDelete(evt.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-container-low hover:bg-red-400/10 text-on-surface-variant hover:text-red-400 transition-all text-xs font-black uppercase tracking-wider">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-20 text-on-surface-variant/50">
              <Calendar size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">No events found.</p>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-50" onClick={() => setModal(false)} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
              <Card className="w-full max-w-lg p-10 bg-surface-container border-none shadow-2xl relative my-4">
                <button onClick={() => setModal(false)} className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-primary cursor-pointer">
                  <X size={18} />
                </button>
                <h2 className="headline-sm text-primary font-black mb-8">{editId ? "Edit Event" : "Create Youth Event"}</h2>
                <form onSubmit={handleSave} className="space-y-5">
                  <Input label="Event Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                  <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Date & Time" type="datetime-local" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} required />
                    <Input label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Min Age" type="number" value={form.target_age_min} onChange={e => setForm({ ...form, target_age_min: e.target.value })} />
                    <Input label="Max Age" type="number" value={form.target_age_max} onChange={e => setForm({ ...form, target_age_max: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Max Participants" type="number" value={form.max_participants} onChange={e => setForm({ ...form, max_participants: e.target.value })} />
                    <div>
                      <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2 block">Status</label>
                      <select className="editorial-input w-full" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                        <option>Upcoming</option><option>Ongoing</option><option>Completed</option><option>Cancelled</option>
                      </select>
                    </div>
                  </div>
                  <Button type="submit" loading={saving} className="w-full h-12 bg-primary text-on-primary border-none">
                    {editId ? "Update Event" : "Create Event"}
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
