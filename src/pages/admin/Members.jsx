import { useState, useEffect } from "react";
import { memberService, groupService } from "../../services/api";
import { Card, Button, Input } from "../../components/common/UI";
import { 
  Users, UserPlus, Search, Filter, Mail, Phone, 
  MoreVertical, Edit2, Trash2, CheckCircle2, 
  XCircle, FilterX, UserCheck, MapPin, 
  Calendar, CreditCard, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    marital_status: "Single",
    group_id: "",
    status: "Active",
    address: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersData, groupsData] = await Promise.all([
        memberService.getMembers(),
        groupService.getGroups()
      ]);
      setMembers(membersData || []);
      setGroups(groupsData || []);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Synchronisation failed. Re-connecting...");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        phone: member.phone || "",
        email: member.email || "",
        marital_status: member.marital_status || "Single",
        group_id: member.group_id || "",
        status: member.status || "Active",
        address: member.address || ""
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: "",
        phone: "",
        email: "",
        marital_status: "Single",
        group_id: "",
        status: "Active",
        address: ""
      });
    }
    setShowModal(true);
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const payload = { ...formData };
      if (!payload.group_id) payload.group_id = null;

      if (editingMember) {
        await memberService.updateMember(editingMember.id, payload);
        setSuccess("Profile updated successfully");
      } else {
        await memberService.createMember(payload);
        setSuccess("New member registered!");
      }
      
      setShowModal(false);
      loadData();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "Security access denied for this operation.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await memberService.deleteMember(id);
      setDeleteId(null);
      setSuccess("Record permanently deleted");
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to delete. Restricted row.");
    }
  };

  const filteredMembers = members.filter(m => {
    const term = searchTerm.toLowerCase();
    const searchMatch = m.name.toLowerCase().includes(term) || 
                       (m.email && m.email.toLowerCase().includes(term)) ||
                       (m.phone && m.phone.includes(term));
    const groupMatch = selectedGroup === "All" || m.group_id === selectedGroup;
    return searchMatch && groupMatch;
  });

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'Active').length,
    inGroups: members.filter(m => m.group_id).length
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.04em' }}>
            Church <span style={{ color: 'var(--primary)' }}>Membership</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Directory management and engagement oversight</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={UserPlus} className="pulse-animation">
          Register Member
        </Button>
      </div>

      {/* Modern Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        {[
          { label: "Total Congregation", val: stats.total, icon: Users, color: 'var(--primary)', bg: 'rgba(99,102,241,0.1)' },
          { label: "Active Status", val: stats.active, icon: UserCheck, color: 'var(--secondary)', bg: 'rgba(16,185,129,0.1)' },
          { label: "Assigned to Groups", val: stats.inGroups, icon: Filter, color: 'var(--tertiary)', bg: 'rgba(245,158,11,0.1)' }
        ].map((s, i) => (
          <Card key={i} style={{ border: `1px solid ${s.color}22`, background: `linear-gradient(135deg, ${s.bg} 0%, transparent 100%)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: s.color, display: 'grid', placeItems: 'center', boxShadow: `0 8px 20px ${s.color}33` }}>
                <s.icon color="white" size={30} />
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{s.label}</p>
                <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>{s.val}</h2>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Control Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={22} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Filter by name, identifier or contact info..." 
            className="input-field" 
            style={{ paddingLeft: '56px', height: '56px', fontSize: '1rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="input-field" 
          style={{ width: '250px', height: '56px', cursor: 'pointer' }}
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="All">All Congregational Groups</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <Button variant="secondary" onClick={() => { setSearchTerm(""); setSelectedGroup("All"); }} icon={FilterX} style={{ height: '56px' }}>
          Reset Filters
        </Button>
      </div>

      {/* Main Table Card */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Participant Profile</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Contact Info</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Active Status</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Study Unit</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Health Index</th>
                <th style={{ padding: '20px 24px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--primary)', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 'bold' }}>
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: '700', margin: 0 }}>{m.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{m.marital_status}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{m.email || '--'}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.phone || '--'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800',
                      background: m.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: m.status === 'Active' ? '#10b981' : '#ef4444',
                      border: `1px solid ${m.status === 'Active' ? '#10b981' : '#ef4444'}22`
                    }}>
                      • {m.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>{m.groups?.name || 'Unassigned'}</p>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, minWidth: '80px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                        <div style={{ width: `${m.engagement_score || 0}%`, height: '100%', background: 'var(--primary)' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{m.engagement_score || 0}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => handleOpenModal(m)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                      <button onClick={() => setDeleteId(m.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Editor Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ maxWidth: '750px', width: '100%', padding: '48px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '8px' }}>
              {editingMember ? 'Update Profile' : 'New Registration'}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
              Maintain accurate records for church planning and outreach.
            </p>
            
            <form onSubmit={handleSaveMember} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <Input label="Full Legal Name" placeholder="e.g. Johnathan Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              
              <Input label="Email Interface" placeholder="member@domain.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} icon={Mail} />
              <Input label="Direct Line" placeholder="+234 ..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} icon={Phone} />
              
              <div className="form-group">
                <label className="form-label">Marital Status</label>
                <select className="input-field" value={formData.marital_status} onChange={e => setFormData({...formData, marital_status: e.target.value})}>
                  {['Single', 'Married', 'Widowed', 'Divorced'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Bible Study Unit</label>
                <select className="input-field" value={formData.group_id} onChange={e => setFormData({...formData, group_id: e.target.value})}>
                  <option value="">Unassigned (General Pool)</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <Input label="Residential Locality" placeholder="Home address details" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} icon={MapPin} />
              </div>
              
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '16px', marginTop: '12px' }}>
                <Button type="submit" style={{ flex: 1, height: '56px' }}>
                  {editingMember ? 'Apply Updates' : 'Commit Registration'}
                </Button>
                <Button variant="secondary" onClick={() => setShowModal(false)} style={{ height: '56px', flex: 1 }}>Discard</Button>
              </div>
            </form>
            {error && <div style={{ marginTop: '16px', color: '#ef4444' }}><XCircle size={18} /> {error}</div>}
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'grid', placeItems: 'center', margin: '0 auto 24px' }}>
              <Trash2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px' }}>Confirm Excision</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Are you absolutely sure you want to remove this record? This action is irreversible.</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button onClick={() => handleDelete(deleteId)} style={{ flex: 1, background: '#ef4444' }}>Exterminate</Button>
              <Button variant="secondary" onClick={() => setDeleteId(null)} style={{ flex: 1 }}>Safe Harbor</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast */}
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
