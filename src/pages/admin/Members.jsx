import { useState, useEffect } from "react";
import { memberService, groupService } from "../../services/api";
import { Card, Button, Input } from "../../components/common/UI";
import { 
  Users, UserPlus, Search, Filter, Mail, Phone, 
  MoreVertical, Edit2, Trash2, CheckCircle2, 
  XCircle, FilterX, UserCheck, MapPin, 
  Calendar, CreditCard, ChevronDown, BookOpen
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
    full_name: "",
    phone: "",
    email: "",
    gender: "Male",
    group_id: "",
    address: "",
    ministry: "",
    join_date: new Date().toISOString().split('T')[0]
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
        full_name: member.full_name,
        phone: member.phone || "",
        email: member.email || "",
        gender: member.gender || "Male",
        group_id: member.group_id || "",
        address: member.address || "",
        ministry: member.ministry || "",
        join_date: member.join_date || new Date().toISOString().split('T')[0]
      });
    } else {
      setEditingMember(null);
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        gender: "Male",
        group_id: "",
        address: "",
        ministry: "",
        join_date: new Date().toISOString().split('T')[0]
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
    const searchMatch = m.full_name.toLowerCase().includes(term) || 
                       (m.email && m.email.toLowerCase().includes(term)) ||
                       (m.phone && m.phone.includes(term));
    const groupMatch = selectedGroup === "All" || m.group_id === selectedGroup;
    return searchMatch && groupMatch;
  });

  const stats = {
    total: members.length,
    male: members.filter(m => m.gender === 'Male').length,
    female: members.filter(m => m.gender === 'Female').length
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
            { label: "Male Members", val: stats.male, icon: UserCheck, color: 'var(--secondary)', bg: 'rgba(16,185,129,0.1)' },
            { label: "Female Members", val: stats.female, icon: Filter, color: 'var(--tertiary)', bg: 'rgba(245,158,11,0.1)' }
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
          {groups.map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
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
                <th style={{ padding: '20px 24px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Unit/Group</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Ministry</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Joined</th>
                <th style={{ padding: '20px 24px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--primary)', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 'bold' }}>
                        {m.full_name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: '700', margin: 0 }}>{m.full_name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{m.address}</p>
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
                      background: 'rgba(99,102,241,0.1)',
                      color: 'var(--primary)',
                      border: '1px solid var(--primary)22'
                    }}>
                      {m.gender.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>{m.bible_study_groups?.group_name || 'Unassigned'}</p>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{m.ministry || 'N/A'}</span>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {new Date(m.join_date).toLocaleDateString()}
                    </span>
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
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 border-b border-border bg-muted/30 flex justify-between items-center sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {editingMember ? 'Update Profile' : 'New Registration'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Maintain accurate records for church planning and outreach.
                  </p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <form id="member-form" onSubmit={handleSaveMember} className="space-y-8">
                  
                  {/* Personal Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <UserCheck size={20} className="text-primary" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Input 
                          label="Full Legal Name" 
                          placeholder="e.g. Johnathan Doe" 
                          value={formData.full_name} 
                          onChange={e => setFormData({...formData, full_name: e.target.value})} 
                          required 
                        />
                      </div>
                      
                      <Input 
                        label="Email Address" 
                        placeholder="member@domain.com" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        icon={Mail} 
                      />
                      <Input 
                        label="Phone Number" 
                        placeholder="+1 (555) 000-0000" 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                        icon={Phone} 
                      />
                      
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Gender</label>
                        <div className="relative">
                          <select 
                            className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none" 
                            value={formData.gender} 
                            onChange={e => setFormData({...formData, gender: e.target.value})}
                          >
                            {['Male', 'Female', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
                        </div>
                      </div>

                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                          label="Residential Address" 
                          placeholder="Home address details" 
                          value={formData.address || ""} 
                          onChange={e => setFormData({...formData, address: e.target.value})}
                          icon={MapPin}
                        />
                        <Input 
                          label="Ministry / Department" 
                          placeholder="e.g. Worship, Ushering" 
                          value={formData.ministry || ""} 
                          onChange={e => setFormData({...formData, ministry: e.target.value})}
                          icon={ShieldCheck}
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-border" />

                  {/* Church Details Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <BookOpen size={20} className="text-primary" />
                      Church Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Bible Study Unit</label>
                        <div className="relative">
                          <select 
                            className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none" 
                            value={formData.group_id} 
                            onChange={e => setFormData({...formData, group_id: e.target.value})}
                          >
                            <option value="">Unassigned (General Pool)</option>
                            {groups.map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
                        </div>
                      </div>

                      <Input 
                        label="Join Date" 
                        type="date" 
                        value={formData.join_date} 
                        onChange={e => setFormData({...formData, join_date: e.target.value})} 
                        icon={Calendar} 
                      />
                    </div>
                  </div>
                </form>

                {error && (
                  <div className="mt-6 p-4 rounded-xl bg-destructive/10 text-destructive flex items-center gap-3 border border-destructive/20">
                    <XCircle size={20} /> 
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}
              </div>

              <div className="px-8 py-6 border-t border-border bg-muted/10 flex gap-4 justify-end sticky bottom-0 z-10">
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
                  form="member-form"
                  className="px-8"
                  loading={isSaving}
                >
                  {editingMember ? 'Save Changes' : 'Register Member'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
