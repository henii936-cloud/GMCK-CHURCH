import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { Card, Button, Input } from "../../components/common/UI";
import {
  Calendar, MapPin, Clock, Plus, Search, Trash2, Edit2,
  XCircle, CheckCircle2, Users, ChevronDown, AlertCircle,
  CalendarDays, CalendarCheck, Tag, FileText, Eye,
  Mic, Music, UserCheck, StickyNote, Zap, Mic2, Star
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const CATEGORIES = [
  { value: "General", color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
  { value: "Service", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  { value: "Meeting", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  { value: "Youth", color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  { value: "Bible Study", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  { value: "Community", color: "#ec4899", bg: "rgba(236,72,153,0.1)" },
  { value: "Prayer", color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
  { value: "Celebration", color: "#eab308", bg: "rgba(234,179,8,0.1)" },
];

const getCategoryStyle = (cat) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[0];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterTime, setFilterTime] = useState("all"); // all, upcoming, past
  const [showModal, setShowModal] = useState(false);
  const [viewEvent, setViewEvent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // PLANNER STATES
  const [activeTab, setActiveTab] = useState("events");
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    type: "Sunday Service", date: "", time: "",
    preacher: "", worshipLeader: "", theme: "", program: "Weekly"
  });
  const [programPlans, setProgramPlans] = useState([
    { id: 1, type: "Sunday Service", date: "2026-03-22", time: "10:00 AM", preacher: "Rev. Samuel Johnson", worshipLeader: "Sarah Miller & Team", theme: "The Grace of Giving", program: "Weekly" },
    { id: 2, type: "Tuesday Morning Program", date: "2026-03-24", time: "06:00 AM", preacher: "Pastor Daniel Okoro", worshipLeader: "David King", theme: "Morning Devotion", program: "Weekly" },
    { id: 3, type: "Wednesday Night Program", date: "2026-03-25", time: "07:00 PM", preacher: "Evang. Grace Temi", worshipLeader: "Instrumentalists Only", theme: "Warfare Prayers", program: "Weekly" }
  ]);

  const handleAddPlan = (e) => {
    e.preventDefault();
    setProgramPlans([{ ...newPlan, id: Date.now() }, ...programPlans]);
    setShowPlannerModal(false);
    setNewPlan({ type: "Sunday Service", date: "", time: "", preacher: "", worshipLeader: "", theme: "", program: "Weekly" });
  };

  const getServiceColor = (type) => {
    if (type.includes("Sunday")) return "#6366f1";
    if (type.includes("Tuesday")) return "#10b981";
    if (type.includes("Wednesday")) return "#f59e0b";
    return "#ec4899";
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    end_date: "",
    event_time: "",
    end_time: "",
    location: "",
    category: "General",
    status: "Upcoming",
    preacher: "",
    worship_leader: "",
    mc: "",
    notes: "",
  });

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
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (event = null) => {
    if (event) {
      setEditingId(event.id);
      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: event.date ? event.date.split('T')[0] : "",
        end_date: event.end_date ? event.end_date.split('T')[0] : "",
        event_time: event.event_time || "",
        end_time: event.end_time || "",
        location: event.location || "",
        category: event.category || "General",
        status: event.status || "Upcoming",
        preacher: event.preacher || "",
        worship_leader: event.worship_leader || "",
        mc: event.mc || "",
        notes: event.notes || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "", description: "", date: "", end_date: "",
        event_time: "", end_time: "", location: "",
        category: "General", status: "Upcoming",
        preacher: "", worship_leader: "", mc: "", notes: "",
      });
    }
    setShowModal(true);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      const payload = { ...formData };
      // Clean empty optional fields
      if (!payload.end_date) payload.end_date = null;
      if (!payload.end_time) payload.end_time = null;

      if (editingId) {
        const { error: err } = await supabase.from('events').update(payload).eq('id', editingId);
        if (err) throw err;
        setSuccess("Event updated successfully");
      } else {
        const { error: err } = await supabase.from('events').insert([payload]);
        if (err) throw err;
        setSuccess("Event created successfully");
      }
      setShowModal(false);
      setEditingId(null);
      fetchEvents();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving event:", err);
      setError(err.message || "Failed to save event");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error: err } = await supabase.from('events').delete().eq('id', id);
      if (err) throw err;
      setDeleteId(null);
      setSuccess("Event deleted");
      fetchEvents();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const filteredEvents = events.filter(e => {
    const term = searchTerm.toLowerCase();
    const searchMatch = e.title?.toLowerCase().includes(term) ||
      e.location?.toLowerCase().includes(term) ||
      e.description?.toLowerCase().includes(term);
    const catMatch = filterCategory === "All" || e.category === filterCategory;
    const timeMatch = filterTime === "all" ||
      (filterTime === "upcoming" && e.date >= today) ||
      (filterTime === "past" && e.date < today);
    return searchMatch && catMatch && timeMatch;
  });

  const stats = {
    total: events.length,
    upcoming: events.filter(e => e.date >= today).length,
    past: events.filter(e => e.date < today).length,
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return { day: '', month: '' };
    const [y, m, d] = dateStr.split('-');
    const date = new Date(y, m - 1, d);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' })
    };
  };

  const isUpcoming = (dateStr) => dateStr >= today;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-on-surface">
            Church <span className="text-primary">Events</span>
          </h1>
          <p className="text-on-surface-variant font-medium mt-1">Plan, organize, and track all church activities</p>
        </div>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '6px' }}>
          <button onClick={() => setActiveTab("events")} style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '700', background: activeTab === 'events' ? 'var(--primary)' : 'transparent', color: activeTab === 'events' ? 'white' : 'var(--text-muted)', transition: '0.3s', border: 'none', cursor: 'pointer' }}>
            Event Directory
          </button>
          <button onClick={() => setActiveTab("planner")} style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '700', background: activeTab === 'planner' ? 'var(--primary)' : 'transparent', color: activeTab === 'planner' ? 'white' : 'var(--text-muted)', transition: '0.3s', border: 'none', cursor: 'pointer' }}>
            Program Planner
          </button>
        </div>
        {activeTab === 'events' && (
          <Button
            onClick={() => openModal()}
            icon={Plus}
            className="rounded-full px-6 shadow-lg shadow-primary/20 pulse-animation"
          >
            Create Event
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'events' && (
          <motion.div key="events" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-2xl bg-primary p-5 text-on-primary shadow-md shadow-primary/20"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-black/10 rounded-full blur-lg" />
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <CalendarDays size={20} className="text-white" />
              </div>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-semibold backdrop-blur-sm">Total</span>
            </div>
            <div>
              <p className="text-[#e9ecef] text-xs font-bold uppercase tracking-wider mb-0.5">All Events</p>
              <h2 className="text-3xl font-black tracking-tight">{stats.total}</h2>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl bg-surface border border-outline-variant/20 p-5 shadow-sm flex flex-col justify-between gap-4"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
              <CalendarCheck size={20} />
            </div>
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-0.5">Upcoming</p>
            <div className="flex items-end gap-2">
              <h2 className="text-2xl font-black text-on-surface tracking-tight">{stats.upcoming}</h2>
              <span className="text-xs font-medium text-on-surface-variant mb-0.5">
                {stats.total > 0 ? Math.round((stats.upcoming / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-1 bg-surface-container-high rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.total > 0 ? (stats.upcoming / stats.total) * 100 : 0}%` }} />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl bg-surface border border-outline-variant/20 p-5 shadow-sm flex flex-col justify-between gap-4"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600">
              <Calendar size={20} />
            </div>
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-0.5">Past Events</p>
            <div className="flex items-end gap-2">
              <h2 className="text-2xl font-black text-on-surface tracking-tight">{stats.past}</h2>
              <span className="text-xs font-medium text-on-surface-variant mb-0.5">
                {stats.total > 0 ? Math.round((stats.past / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-1 bg-surface-container-high rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${stats.total > 0 ? (stats.past / stats.total) * 100 : 0}%` }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search events by name, location, or description..."
            className="w-full pl-12 pr-4 h-14 rounded-2xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative md:w-52">
          <select
            className="w-full h-14 pl-4 pr-10 rounded-2xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={18} />
        </div>
        <div className="flex rounded-2xl overflow-hidden border border-outline-variant/20">
          {[
            { key: "all", label: "All" },
            { key: "upcoming", label: "Upcoming" },
            { key: "past", label: "Past" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setFilterTime(t.key)}
              className={`px-5 h-14 text-sm font-bold transition-all cursor-pointer ${
                filterTime === t.key
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-surface-container-low border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-on-surface-variant font-medium">Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-20">
          <CalendarDays size={48} className="mx-auto text-on-surface-variant/20 mb-4" />
          <p className="text-on-surface-variant font-medium">No events found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => {
            const catStyle = getCategoryStyle(event.category);
            const dateInfo = formatDateShort(event.date);
            const upcoming = isUpcoming(event.date);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ y: -4 }}
                className={`relative rounded-2xl bg-surface border overflow-hidden shadow-sm transition-all group cursor-pointer ${
                  upcoming ? 'border-outline-variant/20 hover:shadow-lg hover:shadow-primary/5' : 'border-outline-variant/10 opacity-75 hover:opacity-100'
                }`}
                onClick={() => setViewEvent(event)}
              >
                {/* Date strip on left */}
                <div className="flex">
                  <div className="w-20 shrink-0 flex flex-col items-center justify-center py-6" style={{ background: catStyle.bg }}>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: catStyle.color }}>{dateInfo.month}</span>
                    <span className="text-3xl font-black" style={{ color: catStyle.color }}>{dateInfo.day}</span>
                    <span className="text-[10px] font-bold opacity-60" style={{ color: catStyle.color }}>{dateInfo.weekday}</span>
                  </div>

                  <div className="flex-1 p-5 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-2"
                          style={{ background: catStyle.bg, color: catStyle.color }}
                        >
                          {event.category || 'General'}
                        </span>
                        <h3 className="text-lg font-black text-on-surface truncate group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                      </div>
                      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => openModal(event)}
                          className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-all cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(event.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-on-surface-variant hover:text-red-500 transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {event.description && (
                      <p className="text-sm text-on-surface-variant mb-3 line-clamp-2">{event.description}</p>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                      {event.event_time && (
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                          <Clock size={12} className="opacity-50" />
                          <span className="font-medium">
                            {event.event_time}{event.end_time ? ` – ${event.end_time}` : ''}
                          </span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                          <MapPin size={12} className="opacity-50" />
                          <span className="font-medium truncate max-w-[140px]">{event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* People */}
                    {(event.preacher || event.worship_leader || event.mc) && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1">
                        {event.preacher && (
                          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                            <Mic size={12} className="opacity-50" />
                            <span className="font-medium">{event.preacher}</span>
                          </div>
                        )}
                        {event.worship_leader && (
                          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                            <Music size={12} className="opacity-50" />
                            <span className="font-medium">{event.worship_leader}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="mt-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        upcoming
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-on-surface-variant/10 text-on-surface-variant'
                      }`}>
                        {upcoming ? 'Upcoming' : 'Completed'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-surface border border-outline-variant/20 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface/80 backdrop-blur-md">
                <div>
                  <h2 className="text-2xl font-bold text-primary">
                    {editingId ? 'Edit Event' : 'Create New Event'}
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Fill in the details for your church event
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <form id="event-form" onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface">Event Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sunday Worship Service"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface">Description</label>
                    <textarea
                      placeholder="Add event details, agenda, or notes..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    />
                  </div>

                  {/* Date & Time Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-on-surface">Start Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-on-surface">End Date</label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-on-surface">Start Time *</label>
                      <input
                        type="time"
                        required
                        value={formData.event_time}
                        onChange={e => setFormData({ ...formData, event_time: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-on-surface">End Time</label>
                      <input
                        type="time"
                        value={formData.end_time}
                        onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface">Location</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                      <input
                        type="text"
                        placeholder="e.g. Church Main Hall"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Category & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-on-surface">Category</label>
                      <div className="relative">
                        <select
                          className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                          value={formData.category}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={18} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-on-surface">Status</label>
                      <div className="relative">
                        <select
                          className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                          value={formData.status}
                          onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                          {['Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={18} />
                      </div>
                    </div>
                  </div>

                  {/* Service Team Section */}
                  <div className="pt-2">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Users size={14} className="text-primary" />
                      Service Team
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-on-surface">Preacher</label>
                        <div className="relative">
                          <Mic size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                          <input
                            type="text"
                            placeholder="e.g. Pastor John"
                            value={formData.preacher}
                            onChange={e => setFormData({ ...formData, preacher: e.target.value })}
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-on-surface">Worship Leader</label>
                        <div className="relative">
                          <Music size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                          <input
                            type="text"
                            placeholder="e.g. Sister Mary"
                            value={formData.worship_leader}
                            onChange={e => setFormData({ ...formData, worship_leader: e.target.value })}
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-on-surface">MC / Host</label>
                        <div className="relative">
                          <UserCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                          <input
                            type="text"
                            placeholder="e.g. Brother James"
                            value={formData.mc}
                            onChange={e => setFormData({ ...formData, mc: e.target.value })}
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface">Additional Notes</label>
                    <textarea
                      placeholder="Any extra details, reminders, or instructions..."
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    />
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-error/10 text-error flex items-center gap-3 border border-error/20">
                      <AlertCircle size={20} />
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  )}
                </form>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 border-t border-outline-variant/10 bg-surface-container-lowest flex gap-4 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  className="px-8"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="event-form"
                  className="px-8"
                  loading={isSaving}
                >
                  {editingId ? 'Save Changes' : 'Create Event'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Event Detail Modal */}
      <AnimatePresence>
        {viewEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm" onClick={() => setViewEvent(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-surface border border-outline-variant/20 rounded-[2rem] shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                const catStyle = getCategoryStyle(viewEvent.category);
                const upcoming = isUpcoming(viewEvent.date);
                return (
                  <>
                    {/* Colored header */}
                    <div className="p-8 text-center" style={{ background: catStyle.bg }}>
                      <span
                        className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3"
                        style={{ background: `${catStyle.color}20`, color: catStyle.color }}
                      >
                        {viewEvent.category || 'General'}
                      </span>
                      <h2 className="text-2xl font-black text-on-surface mb-2">{viewEvent.title}</h2>
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        upcoming ? 'bg-emerald-500/10 text-emerald-600' : 'bg-on-surface-variant/10 text-on-surface-variant'
                      }`}>
                        {upcoming ? 'Upcoming' : 'Completed'}
                      </span>
                    </div>

                    <div className="p-8 space-y-5">
                      {viewEvent.description && (
                        <div className="flex gap-3">
                          <FileText size={18} className="text-on-surface-variant/50 shrink-0 mt-0.5" />
                          <p className="text-sm text-on-surface-variant leading-relaxed">{viewEvent.description}</p>
                        </div>
                      )}

                      <div className="flex gap-3 items-center">
                        <Calendar size={18} className="text-on-surface-variant/50 shrink-0" />
                        <span className="text-sm font-semibold text-on-surface">
                          {formatDate(viewEvent.date)}
                          {viewEvent.end_date && viewEvent.end_date !== viewEvent.date ? ` – ${formatDate(viewEvent.end_date)}` : ''}
                        </span>
                      </div>

                      {viewEvent.event_time && (
                        <div className="flex gap-3 items-center">
                          <Clock size={18} className="text-on-surface-variant/50 shrink-0" />
                          <span className="text-sm font-semibold text-on-surface">
                            {viewEvent.event_time}{viewEvent.end_time ? ` – ${viewEvent.end_time}` : ''}
                          </span>
                        </div>
                      )}

                      {viewEvent.location && (
                        <div className="flex gap-3 items-center">
                          <MapPin size={18} className="text-on-surface-variant/50 shrink-0" />
                          <span className="text-sm font-semibold text-on-surface">{viewEvent.location}</span>
                        </div>
                      )}

                      {/* Service Team */}
                      {(viewEvent.preacher || viewEvent.worship_leader || viewEvent.mc) && (
                        <div className="pt-3 border-t border-outline-variant/10">
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Service Team</p>
                          <div className="space-y-2.5">
                            {viewEvent.preacher && (
                              <div className="flex gap-3 items-center">
                                <Mic size={16} className="text-primary/60 shrink-0" />
                                <div>
                                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Preacher</p>
                                  <p className="text-sm font-semibold text-on-surface">{viewEvent.preacher}</p>
                                </div>
                              </div>
                            )}
                            {viewEvent.worship_leader && (
                              <div className="flex gap-3 items-center">
                                <Music size={16} className="text-primary/60 shrink-0" />
                                <div>
                                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Worship Leader</p>
                                  <p className="text-sm font-semibold text-on-surface">{viewEvent.worship_leader}</p>
                                </div>
                              </div>
                            )}
                            {viewEvent.mc && (
                              <div className="flex gap-3 items-center">
                                <UserCheck size={16} className="text-primary/60 shrink-0" />
                                <div>
                                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">MC / Host</p>
                                  <p className="text-sm font-semibold text-on-surface">{viewEvent.mc}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {viewEvent.notes && (
                        <div className="flex gap-3 pt-3 border-t border-outline-variant/10">
                          <StickyNote size={16} className="text-on-surface-variant/50 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Notes</p>
                            <p className="text-sm text-on-surface-variant leading-relaxed">{viewEvent.notes}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="secondary"
                          onClick={() => { setViewEvent(null); openModal(viewEvent); }}
                          className="flex-1"
                          icon={Edit2}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => setViewEvent(null)}
                          className="flex-1"
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}

        {/* END SECTION FOR TAB EVENTS */}
        </motion.div>
        )}

        {/* START SECTION FOR PLANNER */}
        {activeTab === 'planner' && (
          <motion.div key="planner" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <Button icon={Plus} style={{ flex: 1 }} onClick={() => setShowPlannerModal(true)}>Schedule New Program</Button>
              <Button variant="secondary" icon={CalendarDays} style={{ flex: 1 }}>View Monthly Calendar</Button>
              <Button variant="secondary" icon={Star} style={{ flex: 1 }}>Yearly Outlook</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
              {programPlans.map((plan, i) => (
                <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card style={{ padding: '0', overflow: 'hidden', borderLeft: `6px solid ${getServiceColor(plan.type)}` }}>
                    <div style={{ padding: '28px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ padding: '5px 12px', borderRadius: '8px', background: `${getServiceColor(plan.type)}22`, color: getServiceColor(plan.type), fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
                          {plan.type}
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>{plan.program}</span>
                      </div>

                      <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '16px' }}>"{plan.theme || 'Untitled Program'}"</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center' }}>
                            <Mic2 size={18} color="var(--primary)" />
                          </div>
                          <div>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Preacher</p>
                            <p style={{ fontWeight: '700', fontSize: '1rem' }}>{plan.preacher || 'TBA'}</p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center' }}>
                            <Music size={18} color="#ec4899" />
                          </div>
                          <div>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Worship Leader</p>
                            <p style={{ fontWeight: '700', fontSize: '1rem' }}>{plan.worshipLeader || 'TBA'}</p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center' }}>
                            <Calendar size={18} color="var(--text-muted)" />
                          </div>
                          <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                            {plan.date ? (() => {
                              const [y, m, d] = plan.date.split('-');
                              return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                            })() : 'Set Date'} @ {plan.time || 'Set Time'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 28px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                      <button style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer' }}><Zap size={14} /> Edit</button>
                      <button style={{ color: '#ef4444', fontSize: '0.825rem', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>Postpone</button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PLANNER MODAL */}
      {showPlannerModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '40px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '24px' }}>Strategic <span style={{ color: 'var(--primary)' }}>Planner</span></h2>
            <form onSubmit={handleAddPlan} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <Input label="Program Theme" placeholder="e.g. Divine Restoration" value={newPlan.theme} onChange={e => setNewPlan({...newPlan, theme: e.target.value})} required />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)' }}>Service Category</label>
                <select className="input-field" value={newPlan.type} onChange={e => setNewPlan({...newPlan, type: e.target.value})}>
                  <option>Sunday Service</option>
                  <option>Tuesday Morning Program</option>
                  <option>Wednesday Night Program</option>
                  <option>Special Event</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)' }}>Cycle</label>
                <select className="input-field" value={newPlan.program} onChange={e => setNewPlan({...newPlan, program: e.target.value})}>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Annual</option>
                </select>
              </div>
              <Input label="Preacher" placeholder="Enter name" value={newPlan.preacher} onChange={e => setNewPlan({...newPlan, preacher: e.target.value})} />
              <Input label="Worship Leader" placeholder="Enter name" value={newPlan.worshipLeader} onChange={e => setNewPlan({...newPlan, worshipLeader: e.target.value})} />
              <Input type="date" label="Date" value={newPlan.date} onChange={e => setNewPlan({...newPlan, date: e.target.value})} />
              <Input type="time" label="Start Time" value={newPlan.time} onChange={e => setNewPlan({...newPlan, time: e.target.value})} />
              
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '12px' }}>
                <Button type="submit" style={{ flex: 1 }}>Publish Program</Button>
                <Button variant="secondary" onClick={() => setShowPlannerModal(false)}>Cancel</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-surface border border-outline-variant/20 rounded-[2rem] shadow-2xl p-10 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 grid place-items-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-black text-on-surface mb-3">Delete Event?</h3>
              <p className="text-sm text-on-surface-variant mb-8">This action cannot be undone. The event will be permanently removed.</p>
              <div className="flex gap-3">
                <Button onClick={() => handleDelete(deleteId)} style={{ flex: 1, background: '#ef4444' }}>Delete</Button>
                <Button variant="secondary" onClick={() => setDeleteId(null)} style={{ flex: 1 }}>Cancel</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', bottom: '40px', right: '40px',
              background: 'var(--secondary)', color: 'white', padding: '16px 24px',
              borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1100
            }}
          >
            <CheckCircle2 size={24} /> {success}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
