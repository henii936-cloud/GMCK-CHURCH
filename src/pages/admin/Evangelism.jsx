import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { Card, Button, Input } from "../../components/common/UI";
import {
  Heart, Users, UserPlus, BookOpen, Plus, Search,
  Trash2, Edit2, XCircle, CheckCircle2, ChevronDown,
  AlertCircle, TrendingUp, Target, Handshake, Calendar,
  MapPin, User, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";

const STATUS_CONFIG = {
  "Heard Gospel": { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: Heart },
  "Convert": { color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: UserPlus },
  "Discipleship": { color: "#6366f1", bg: "rgba(99,102,241,0.1)", icon: BookOpen },
  "Baptized": { color: "#06b6d4", bg: "rgba(6,182,212,0.1)", icon: Handshake },
};

export default function Evangelism({ viewOnly = false }) {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [deleteId, setDeleteId] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    gender: "Male",
    status: "Heard Gospel",
    date_reached: new Date().toISOString().split('T')[0],
    reached_by: "",
    follow_up_date: "",
    notes: "",
  });

  useEffect(() => {
    if (user?.id) fetchRecords();
  }, [user?.id]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('evangelism')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error("Error fetching evangelism records:", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      setFormData({
        full_name: record.full_name || "",
        phone: record.phone || "",
        address: record.address || "",
        gender: record.gender || "Male",
        status: record.status || "Heard Gospel",
        date_reached: record.date_reached ? record.date_reached.split('T')[0] : new Date().toISOString().split('T')[0],
        reached_by: record.reached_by || "",
        follow_up_date: record.follow_up_date ? record.follow_up_date.split('T')[0] : "",
        notes: record.notes || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        full_name: "", phone: "", address: "", gender: "Male",
        status: "Heard Gospel",
        date_reached: new Date().toISOString().split('T')[0],
        reached_by: "", follow_up_date: "", notes: "",
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
      if (!payload.follow_up_date) payload.follow_up_date = null;

      if (editingId) {
        const { error: err } = await supabase.from('evangelism').update(payload).eq('id', editingId);
        if (err) throw err;
        setSuccess("Record updated successfully");
      } else {
        const { error: err } = await supabase.from('evangelism').insert([payload]);
        if (err) throw err;
        setSuccess("Person added successfully");
      }
      setShowModal(false);
      setEditingId(null);
      fetchRecords();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving:", err);
      setError(err.message || "Failed to save record");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error: err } = await supabase.from('evangelism').delete().eq('id', id);
      if (err) throw err;
      setDeleteId(null);
      setSuccess("Record deleted");
      fetchRecords();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const handleStatusUpdate = async (record, newStatus) => {
    try {
      const { error: err } = await supabase
        .from('evangelism')
        .update({ status: newStatus })
        .eq('id', record.id);
      if (err) throw err;
      setSuccess(`Status updated to ${newStatus}`);
      fetchRecords();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const filteredRecords = records.filter(r => {
    const term = searchTerm.toLowerCase();
    const searchMatch = r.full_name?.toLowerCase().includes(term) ||
      r.phone?.includes(term) ||
      r.reached_by?.toLowerCase().includes(term);
    const statusMatch = filterStatus === "All" || r.status === filterStatus;
    return searchMatch && statusMatch;
  });

  const stats = {
    total: records.length,
    heard: records.filter(r => r.status === "Heard Gospel").length,
    converts: records.filter(r => r.status === "Convert").length,
    discipleship: records.filter(r => r.status === "Discipleship").length,
    baptized: records.filter(r => r.status === "Baptized").length,
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-on-surface">
            Evangelism <span className="text-primary">Tracker</span>
          </h1>
          <p className="text-on-surface-variant font-medium mt-1">Track souls reached, converts, and discipleship progress</p>
        </div>
        {!viewOnly && (
          <Button
            onClick={() => openModal()}
            icon={Plus}
            className="rounded-full px-6 shadow-lg shadow-primary/20"
          >
            Add Person
          </Button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Heard Gospel */}
        <motion.div
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-2xl p-5 shadow-sm border"
          style={{ background: STATUS_CONFIG["Heard Gospel"].bg, borderColor: `${STATUS_CONFIG["Heard Gospel"].color}22` }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl" style={{ background: `${STATUS_CONFIG["Heard Gospel"].color}20` }}>
              <Heart size={20} style={{ color: STATUS_CONFIG["Heard Gospel"].color }} />
            </div>
            <span className="text-3xl font-black" style={{ color: STATUS_CONFIG["Heard Gospel"].color }}>{stats.heard}</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: STATUS_CONFIG["Heard Gospel"].color }}>
            Heard Gospel
          </p>
          <div className="w-full h-1 rounded-full mt-3 overflow-hidden" style={{ background: `${STATUS_CONFIG["Heard Gospel"].color}15` }}>
            <div className="h-full rounded-full" style={{ background: STATUS_CONFIG["Heard Gospel"].color, width: `${stats.total > 0 ? (stats.heard / stats.total) * 100 : 0}%` }} />
          </div>
        </motion.div>

        {/* Converts */}
        <motion.div
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-2xl p-5 shadow-sm border"
          style={{ background: STATUS_CONFIG["Convert"].bg, borderColor: `${STATUS_CONFIG["Convert"].color}22` }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl" style={{ background: `${STATUS_CONFIG["Convert"].color}20` }}>
              <UserPlus size={20} style={{ color: STATUS_CONFIG["Convert"].color }} />
            </div>
            <span className="text-3xl font-black" style={{ color: STATUS_CONFIG["Convert"].color }}>{stats.converts}</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: STATUS_CONFIG["Convert"].color }}>
            Converts
          </p>
          <div className="w-full h-1 rounded-full mt-3 overflow-hidden" style={{ background: `${STATUS_CONFIG["Convert"].color}15` }}>
            <div className="h-full rounded-full" style={{ background: STATUS_CONFIG["Convert"].color, width: `${stats.total > 0 ? (stats.converts / stats.total) * 100 : 0}%` }} />
          </div>
        </motion.div>

        {/* Discipleship */}
        <motion.div
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-2xl p-5 shadow-sm border"
          style={{ background: STATUS_CONFIG["Discipleship"].bg, borderColor: `${STATUS_CONFIG["Discipleship"].color}22` }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl" style={{ background: `${STATUS_CONFIG["Discipleship"].color}20` }}>
              <BookOpen size={20} style={{ color: STATUS_CONFIG["Discipleship"].color }} />
            </div>
            <span className="text-3xl font-black" style={{ color: STATUS_CONFIG["Discipleship"].color }}>{stats.discipleship}</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: STATUS_CONFIG["Discipleship"].color }}>
            In Discipleship
          </p>
          <div className="w-full h-1 rounded-full mt-3 overflow-hidden" style={{ background: `${STATUS_CONFIG["Discipleship"].color}15` }}>
            <div className="h-full rounded-full" style={{ background: STATUS_CONFIG["Discipleship"].color, width: `${stats.total > 0 ? (stats.discipleship / stats.total) * 100 : 0}%` }} />
          </div>
        </motion.div>

        {/* Baptized */}
        <motion.div
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-2xl p-5 shadow-sm border"
          style={{ background: STATUS_CONFIG["Baptized"].bg, borderColor: `${STATUS_CONFIG["Baptized"].color}22` }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl" style={{ background: `${STATUS_CONFIG["Baptized"].color}20` }}>
              <Handshake size={20} style={{ color: STATUS_CONFIG["Baptized"].color }} />
            </div>
            <span className="text-3xl font-black" style={{ color: STATUS_CONFIG["Baptized"].color }}>{stats.baptized}</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: STATUS_CONFIG["Baptized"].color }}>
            Baptized
          </p>
          <div className="w-full h-1 rounded-full mt-3 overflow-hidden" style={{ background: `${STATUS_CONFIG["Baptized"].color}15` }}>
            <div className="h-full rounded-full" style={{ background: STATUS_CONFIG["Baptized"].color, width: `${stats.total > 0 ? (stats.baptized / stats.total) * 100 : 0}%` }} />
          </div>
        </motion.div>
      </div>

      {/* Conversion Funnel */}
      <Card className="mb-8 !p-6">
        <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-5 flex items-center gap-2">
          <TrendingUp size={16} className="text-primary" /> Evangelism Funnel
        </h3>
        <div className="flex items-center gap-2">
          {[
            { label: "Heard Gospel", count: stats.heard, color: STATUS_CONFIG["Heard Gospel"].color },
            { label: "Converts", count: stats.converts, color: STATUS_CONFIG["Convert"].color },
            { label: "Discipleship", count: stats.discipleship, color: STATUS_CONFIG["Discipleship"].color },
            { label: "Baptized", count: stats.baptized, color: STATUS_CONFIG["Baptized"].color },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center gap-2 flex-1">
              <div className="flex-1 text-center p-3 rounded-xl" style={{ background: step.color + '12' }}>
                <div className="text-2xl font-black" style={{ color: step.color }}>{step.count}</div>
                <div className="text-[9px] font-bold uppercase tracking-wider mt-1" style={{ color: step.color }}>{step.label}</div>
              </div>
              {i < arr.length - 1 && (
                <div className="text-on-surface-variant/20 shrink-0">
                  <ChevronDown size={16} className="rotate-[-90deg]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search by name, phone, or who reached them..."
            className="w-full pl-12 pr-4 h-14 rounded-2xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex rounded-2xl overflow-hidden border border-outline-variant/20">
          {["All", "Heard Gospel", "Convert", "Discipleship", "Baptized"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 h-14 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === s
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Records Table */}
      <Card className="!p-0 overflow-hidden">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-surface-container-low border-t-primary animate-spin mx-auto mb-4" />
            <p className="text-on-surface-variant font-medium">Loading records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={48} className="mx-auto text-on-surface-variant/20 mb-4" />
            <p className="text-on-surface-variant font-medium">No evangelism records found</p>
            <p className="text-xs text-on-surface-variant/50 mt-1">Click "Add Person" to start tracking</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Person</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Contact</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Reached By</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => {
                  const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG["Heard Gospel"];
                  return (
                    <tr key={r.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setViewRecord(r)}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: cfg.bg, color: cfg.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: '800', fontSize: '0.9rem'
                          }}>
                            {r.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontWeight: '700', margin: 0 }}>{r.full_name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{r.gender || '--'}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{r.phone || '--'}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.address || '--'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800',
                          background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}22`
                        }}>
                          {r.status?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{r.reached_by || '--'}</span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                          {r.date_reached ? new Date(r.date_reached).toLocaleDateString() : '--'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }} onClick={e => e.stopPropagation()}>
                          {!viewOnly && (
                            <>
                              {/* Quick status progression */}
                              {r.status === "Heard Gospel" && (
                                <button onClick={() => handleStatusUpdate(r, "Convert")} title="Mark as Convert"
                                  style={{ background: STATUS_CONFIG["Convert"].bg, border: `1px solid ${STATUS_CONFIG["Convert"].color}22`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: '800', color: STATUS_CONFIG["Convert"].color }}>
                                  → Convert
                                </button>
                              )}
                              {r.status === "Convert" && (
                                <button onClick={() => handleStatusUpdate(r, "Discipleship")} title="Move to Discipleship"
                                  style={{ background: STATUS_CONFIG["Discipleship"].bg, border: `1px solid ${STATUS_CONFIG["Discipleship"].color}22`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: '800', color: STATUS_CONFIG["Discipleship"].color }}>
                                  → Disciple
                                </button>
                              )}
                              {r.status === "Discipleship" && (
                                <button onClick={() => handleStatusUpdate(r, "Baptized")} title="Mark as Baptized"
                                  style={{ background: STATUS_CONFIG["Baptized"].bg, border: `1px solid ${STATUS_CONFIG["Baptized"].color}22`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: '800', color: STATUS_CONFIG["Baptized"].color }}>
                                  → Baptized
                                </button>
                              )}
                              <button onClick={() => openModal(r)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Edit2 size={15} /></button>
                              <button onClick={() => setDeleteId(r.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={15} /></button>
                            </>
                          )}
                          {viewOnly && (
                            <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest px-2">View Only</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

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
              <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-primary">
                    {editingId ? 'Edit Record' : 'Add New Person'}
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1">Track a person reached through evangelism</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer">
                  <XCircle size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <form id="evangelism-form" onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-on-surface">Full Name *</label>
                      <input type="text" required placeholder="Person's name" value={formData.full_name}
                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-on-surface">Phone</label>
                      <input type="text" placeholder="Phone number" value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface">Address</label>
                    <input type="text" placeholder="Where they live" value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-on-surface">Gender</label>
                      <div className="relative">
                        <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none">
                          {['Male', 'Female'].map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={18} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-on-surface">Status *</label>
                      <div className="relative">
                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                          className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none">
                          {Object.keys(STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={18} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-on-surface">Date Reached *</label>
                      <input type="date" required value={formData.date_reached}
                        onChange={e => setFormData({ ...formData, date_reached: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-on-surface">Follow-up Date</label>
                      <input type="date" value={formData.follow_up_date}
                        onChange={e => setFormData({ ...formData, follow_up_date: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface">Reached By</label>
                    <input type="text" placeholder="Name of the person who reached them" value={formData.reached_by}
                      onChange={e => setFormData({ ...formData, reached_by: e.target.value })}
                      className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface">Notes</label>
                    <textarea placeholder="Additional details about their spiritual journey..." value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-error/10 text-error flex items-center gap-3 border border-error/20">
                      <AlertCircle size={20} />
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  )}
                </form>
              </div>

              <div className="px-8 py-6 border-t border-outline-variant/10 bg-surface-container-lowest flex gap-4 justify-end">
                <Button variant="secondary" onClick={() => setShowModal(false)} className="px-8" disabled={isSaving}>Cancel</Button>
                <Button type="submit" form="evangelism-form" className="px-8" loading={isSaving}>
                  {editingId ? 'Save Changes' : 'Add Person'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Detail Modal */}
      <AnimatePresence>
        {viewRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm" onClick={() => setViewRecord(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-surface border border-outline-variant/20 rounded-[2rem] shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                const cfg = STATUS_CONFIG[viewRecord.status] || STATUS_CONFIG["Heard Gospel"];
                return (
                  <>
                    <div className="p-8 text-center" style={{ background: cfg.bg }}>
                      <div style={{
                        width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
                        background: `${cfg.color}20`, color: cfg.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.8rem', fontWeight: '800',
                      }}>
                        {viewRecord.full_name?.charAt(0)}
                      </div>
                      <h2 className="text-2xl font-black text-on-surface mb-2">{viewRecord.full_name}</h2>
                      <span style={{
                        padding: '5px 16px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800',
                        background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}22`
                      }}>
                        {viewRecord.status?.toUpperCase()}
                      </span>
                    </div>
                    <div className="p-8 space-y-4">
                      {viewRecord.phone && (
                        <div className="flex items-center gap-3">
                          <User size={16} className="text-on-surface-variant/50 shrink-0" />
                          <span className="text-sm font-medium">{viewRecord.phone}</span>
                        </div>
                      )}
                      {viewRecord.address && (
                        <div className="flex items-center gap-3">
                          <MapPin size={16} className="text-on-surface-variant/50 shrink-0" />
                          <span className="text-sm font-medium">{viewRecord.address}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-on-surface-variant/50 shrink-0" />
                        <span className="text-sm font-medium">Reached: {viewRecord.date_reached ? new Date(viewRecord.date_reached).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '--'}</span>
                      </div>
                      {viewRecord.reached_by && (
                        <div className="flex items-center gap-3">
                          <Handshake size={16} className="text-on-surface-variant/50 shrink-0" />
                          <span className="text-sm font-medium">By: {viewRecord.reached_by}</span>
                        </div>
                      )}
                      {viewRecord.follow_up_date && (
                        <div className="flex items-center gap-3">
                          <Target size={16} className="text-on-surface-variant/50 shrink-0" />
                          <span className="text-sm font-medium">Follow-up: {new Date(viewRecord.follow_up_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {viewRecord.notes && (
                        <div className="pt-3 border-t border-outline-variant/10">
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Notes</p>
                          <p className="text-sm text-on-surface-variant leading-relaxed">{viewRecord.notes}</p>
                        </div>
                      )}
                      <div className="flex gap-3 pt-3">
                        <Button variant="secondary" onClick={() => { setViewRecord(null); openModal(viewRecord); }} className="flex-1" icon={Edit2}>Edit</Button>
                        <Button onClick={() => setViewRecord(null)} className="flex-1">Close</Button>
                      </div>
                    </div>
                  </>
                );
              })()}
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
              <h3 className="text-xl font-black text-on-surface mb-3">Delete Record?</h3>
              <p className="text-sm text-on-surface-variant mb-8">This action cannot be undone.</p>
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
