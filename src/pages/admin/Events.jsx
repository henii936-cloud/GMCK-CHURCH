import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { Card, Button, Input, Modal } from "../../components/common/UI";
import { Calendar, MapPin, Clock, Plus, Filter, Search, Trash2, Edit2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    event_time: "",
    location: "",
    category: "General"
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase
          .from('events')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('events')
          .insert([formData]);
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      setFormData({ title: "", description: "", date: "", event_time: "", location: "", category: "General" });
      setEditingId(null);
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      description: event.description || "",
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : "",
      event_time: event.event_time,
      location: event.location || "",
      category: event.category || "General"
    });
    setEditingId(event.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Church Events</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage upcoming services, meetings, and special events</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '44px', width: '250px' }}
            />
          </div>
          <Button icon={Plus} onClick={() => { setEditingId(null); setFormData({ name: "", description: "", event_date: "", event_time: "", location: "", category: "General" }); setIsModalOpen(true); }}>
            New Event
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading Events...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ 
                    padding: '6px 12px', borderRadius: '100px', 
                    background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', 
                    fontSize: '0.75rem', fontWeight: '800' 
                  }}>
                    {event.category || 'General'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEdit(event)} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer' }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(event.id)} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '12px' }}>{event.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', flex: 1 }}>{event.description}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Calendar size={14} />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Clock size={14} />
                    <span>{event.event_time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <MapPin size={14} />
                    <span>{event.location || 'Church Main Hall'}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Event" : "Create New Event"}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input label="Event Name" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="input-field" style={{ minHeight: '100px' }} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Date" type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
            <Input label="Time" type="time" required value={formData.event_time} onChange={(e) => setFormData({...formData, event_time: e.target.value})} />
          </div>
          <Input label="Location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="input-field" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
              <option value="General">General</option>
              <option value="Service">Service</option>
              <option value="Meeting">Meeting</option>
              <option value="Youth">Youth</option>
              <option value="Bible Study">Bible Study</option>
              <option value="Community">Community</option>
            </select>
          </div>
          <Button type="submit" style={{ marginTop: '12px' }}>{editingId ? "Update Event" : "Create Event"}</Button>
        </form>
      </Modal>
    </div>
  );
}
