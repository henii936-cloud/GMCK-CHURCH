import { useState, useEffect } from "react";
import { memberService, groupService, ministryService } from "../../services/api";
import { supabase } from "../../services/supabaseClient";
import { Card, Button, Input } from "../../components/common/UI";
import {
  Users, UserPlus, Search, Filter, Mail, Phone,
  MoreVertical, Edit2, Trash2, CheckCircle2,
  XCircle, FilterX, UserCheck, MapPin,
  Calendar, CreditCard, ChevronDown, BookOpen,
  Camera, Upload, Plus, X, Eye, Heart, User
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
  const [imageFile, setImageFile] = useState(null);
  const [viewMember, setViewMember] = useState(null);
  const [availableMinistries, setAvailableMinistries] = useState([]);
  const [newMinistryName, setNewMinistryName] = useState("");
  const [isAddingMinistry, setIsAddingMinistry] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    gender: "Male",
    address: "",
    date_of_birth: "",
    emergency_contact: "",
    
    marital_status: "Unmarried",
    spouse_name: "",
    children_count: 0,
    family_id: "",
    
    group_id: "",
    leave_status: "Active",
    join_date: new Date().toISOString().split('T')[0],
    join_type: "Baptized Here",
    baptism_status: false,
    tithe_participation: false,
    giving_frequency: "Monthly",
    notes: "",
    image_url: "",
    age_group: "Adult",
    ministries: []
  });

  useEffect(() => {
    loadData();
  }, []);

  // Scroll to top of modal content when step changes
  useEffect(() => {
    const modalContent = document.getElementById('registration-modal-content');
    if (modalContent) {
      modalContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersData, groupsData, ministriesData] = await Promise.all([
        memberService.getMembers(),
        groupService.getGroups(),
        ministryService.getMinistries()
      ]);
      setMembers(membersData || []);
      setGroups(groupsData || []);
      setAvailableMinistries(ministriesData || []);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Synchronisation failed. Re-connecting...");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (member = null) => {
    setCurrentStep(1);
    if (member) {
      setEditingMember(member);
      setFormData({
        full_name: member.full_name || "",
        phone: member.phone || "",
        email: member.email || "",
        gender: member.gender || "Male",
        address: member.address || "",
        date_of_birth: member.date_of_birth || "",
        emergency_contact: member.emergency_contact || "",
        
        marital_status: member.marital_status || "Unmarried",
        spouse_name: member.spouse_name || "",
        children_count: member.children_count || 0,
        family_id: member.family_id || "",
        
        group_id: member.group_id || "",
        leave_status: member.leave_status || "Active",
        join_date: member.join_date || new Date().toISOString().split('T')[0],
        join_type: member.join_type || "Baptized Here",
        baptism_status: member.baptism_status || false,
        tithe_participation: member.tithe_participation || false,
        giving_frequency: member.giving_frequency || "Monthly",
        notes: member.notes || "",
        image_url: member.image_url || "",
        age_group: member.age_group || "Adult",
        ministries: member.ministries || []
      });
      setNewMinistryName("");
    } else {
      setEditingMember(null);
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        gender: "Male",
        address: "",
        date_of_birth: "",
        emergency_contact: "",
        
        marital_status: "Unmarried",
        spouse_name: "",
        children_count: 0,
        family_id: "",
        
        group_id: "",
        leave_status: "Active",
        join_date: new Date().toISOString().split('T')[0],
        join_type: "Baptized Here",
        baptism_status: false,
        tithe_participation: false,
        giving_frequency: "Monthly",
        notes: "",
        image_url: "",
        age_group: "Adult",
        ministries: []
      });
      setNewMinistryName("");
    }
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      // Store the file for upload, and show a local preview
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFormData({ ...formData, image_url: previewUrl });
    }
  };

  const uploadImage = async (file) => {
    const ext = file.name.split('.').pop();
    const fileName = `member-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('member-photos')
      .upload(fileName, file, { upsert: true, contentType: file.type });
    if (error) throw error;
    const { data: publicData } = supabase.storage
      .from('member-photos')
      .getPublicUrl(fileName);
    return publicData.publicUrl;
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

      // If there's a new image file selected, try to upload it to Storage
      if (imageFile) {
        try {
          const uploadedUrl = await uploadImage(imageFile);
          payload.image_url = uploadedUrl;
        } catch (uploadErr) {
          console.warn("Image upload failed, saving member without photo:", uploadErr);
          payload.image_url = null;
        }
        setImageFile(null);
      }

      // Never send blob: URLs to the database
      if (payload.image_url && payload.image_url.startsWith('blob:')) {
        payload.image_url = null;
      }

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
      setError(err.message || "Failed to save. Check your connection or image upload.");
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

  const handleToggleStatus = async (member) => {
    try {
      const newStatus = member.status === "Active" ? "Inactive" : "Active";
      await memberService.updateMember(member.id, { status: newStatus });
      setSuccess(`Member marked as ${newStatus}`);
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Toggle status error:", err);
      setError("Failed to update status.");
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-on-surface">
            Church <span className="text-primary">Membership</span>
          </h1>
          <p className="text-on-surface-variant font-medium mt-1">Directory management and engagement oversight</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={UserPlus} className="rounded-full px-6 shadow-lg shadow-primary/20 pulse-animation">
          Register Member
        </Button>
      </div>

      {/* Modern Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Total Card - Featured */}
        <motion.div
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-2xl bg-primary p-5 text-on-primary shadow-md shadow-primary/20"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-black/10 rounded-full blur-lg"></div>
          <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users size={20} className="text-white" />
              </div>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-semibold backdrop-blur-sm">Total</span>
            </div>
            <div>
              <p className="text-[#e9ecef] text-xs font-bold uppercase tracking-wider mb-0.5">Total Congregation</p>
              <h2 className="text-3xl font-black tracking-tight">{stats.total}</h2>
            </div>
          </div>
        </motion.div>

        {/* Male Members */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl bg-surface border border-outline-variant/20 p-5 shadow-sm flex flex-col justify-between gap-4"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
              <UserCheck size={20} />
            </div>
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-0.5">Male Members</p>
            <div className="flex items-end gap-2">
              <h2 className="text-2xl font-black text-on-surface tracking-tight">{stats.male}</h2>
              <span className="text-xs font-medium text-on-surface-variant mb-0.5">
                {stats.total > 0 ? Math.round((stats.male / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-1 bg-surface-container-high rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.total > 0 ? (stats.male / stats.total) * 100 : 0}%` }}></div>
            </div>
          </div>
        </motion.div>

        {/* Female Members */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl bg-surface border border-outline-variant/20 p-5 shadow-sm flex flex-col justify-between gap-4"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-pink-500/10 rounded-xl text-pink-600">
              <Filter size={20} />
            </div>
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-0.5">Female Members</p>
            <div className="flex items-end gap-2">
              <h2 className="text-2xl font-black text-on-surface tracking-tight">{stats.female}</h2>
              <span className="text-xs font-medium text-on-surface-variant mb-0.5">
                {stats.total > 0 ? Math.round((stats.female / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="w-full h-1 bg-surface-container-high rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-pink-500 rounded-full" style={{ width: `${stats.total > 0 ? (stats.female / stats.total) * 100 : 0}%` }}></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Filter by name, identifier or contact info..."
            className="w-full pl-12 pr-4 h-14 rounded-2xl border border-[#181717] bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative md:w-64">
          <select
            className="w-full h-14 pl-4 pr-10 rounded-2xl border border-[#0e0d0d] bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="All">All Congregational Groups</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={18} />
        </div>
        <Button variant="secondary" onClick={() => { setSearchTerm(""); setSelectedGroup("All"); }} icon={FilterX} className="h-14 rounded-2xl px-6">
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
                <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Age Group</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Leave</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Marital</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Ministry</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Study Unit</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Join Date</th>
                <th style={{ padding: '20px 24px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setViewMember(m)}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {m.image_url ? (
                        <img
                          src={m.image_url}
                          alt={m.full_name}
                          referrerPolicy="no-referrer"
                          style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)22' }}
                        />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--primary)', color: 'white', display: 'grid', placeItems: 'center', fontWeight: 'bold' }}>
                          {m.full_name.charAt(0)}
                        </div>
                      )}
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
                    {(() => {
                      const colors = { Kids: '#ec4899', Teenage: '#f97316', Youth: '#06b6d4', Adult: '#3b82f6', Senior: '#8b5cf6' };
                      const c = colors[m.age_group] || '#3b82f6';
                      return (
                        <span style={{
                          padding: '4px 12px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800',
                          background: `${c}18`, color: c, border: `1px solid ${c}22`
                        }}>
                          {m.age_group?.toUpperCase() || 'ADULT'}
                        </span>
                      );
                    })()}
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800',
                      background: m.leave_status === 'Active' ? 'rgba(16,185,129,0.1)' : m.leave_status === 'Inactive' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                      color: m.leave_status === 'Active' ? '#10b981' : m.leave_status === 'Inactive' ? '#ef4444' : '#f59e0b',
                      border: `1px solid ${m.leave_status === 'Active' ? '#10b981' : m.leave_status === 'Inactive' ? '#ef4444' : '#f59e0b'}22`
                    }}>
                      {m.leave_status?.toUpperCase() || 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800',
                      background: m.marital_status === 'Married' ? 'rgba(16,185,129,0.1)' : m.marital_status === 'Widow' ? 'rgba(139,92,246,0.1)' : 'rgba(244,63,94,0.1)',
                      color: m.marital_status === 'Married' ? '#10b981' : m.marital_status === 'Widow' ? '#8b5cf6' : '#f43f5e',
                      border: `1px solid ${m.marital_status === 'Married' ? '#10b981' : m.marital_status === 'Widow' ? '#8b5cf6' : '#f43f5e'}22`
                    }}>
                      {m.marital_status?.toUpperCase() || 'UNMARRIED'}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '180px' }}>
                      {(m.ministries && m.ministries.length > 0) ? m.ministries.map((min, i) => (
                        <span key={i} style={{
                          padding: '2px 8px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: '700',
                          background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.15)'
                        }}>
                          {min}
                        </span>
                      )) : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>--</span>}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>{m.bible_study_groups?.group_name || 'Unassigned'}</p>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {new Date(m.join_date).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => setViewMember(m)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Eye size={16} /></button>
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

      {/* Member Profile View Modal */}
      <AnimatePresence>
        {viewMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm" onClick={() => setViewMember(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-surface border border-outline-variant/20 rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Profile Header */}
              <div className="bg-primary/5 px-8 pt-8 pb-6 text-center border-b border-outline-variant/10 shrink-0">
                {viewMember.image_url ? (
                  <img
                    src={viewMember.image_url}
                    alt={viewMember.full_name}
                    referrerPolicy="no-referrer"
                    className="w-28 h-28 rounded-full object-cover border-4 border-surface shadow-xl mx-auto mb-4"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-black border-4 border-surface shadow-xl mx-auto mb-4">
                    {viewMember.full_name?.charAt(0)}
                  </div>
                )}
                <h2 className="text-2xl font-black text-on-surface">{viewMember.full_name}</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {(() => {
                    const colors = { Active: '#10b981', Inactive: '#ef4444', Moved: '#f59e0b' };
                    const c = colors[viewMember.leave_status] || '#10b981';
                    return (
                      <span style={{
                        padding: '4px 14px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800',
                        background: `${c}18`, color: c, border: `1px solid ${c}22`
                      }}>
                        {viewMember.leave_status?.toUpperCase() || 'ACTIVE'}
                      </span>
                    );
                  })()}
                  {(() => {
                    const colors = { Kids: '#ec4899', Teenage: '#f97316', Youth: '#06b6d4', Adult: '#3b82f6', Senior: '#8b5cf6' };
                    const c = colors[viewMember.age_group] || '#3b82f6';
                    return (
                      <span style={{
                        padding: '4px 14px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: '800',
                        background: `${c}18`, color: c, border: `1px solid ${c}22`
                      }}>
                        {viewMember.age_group?.toUpperCase() || 'ADULT'}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Profile Body */}
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-5">
                  {/* Contact Info */}
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-2">
                      <User size={12} /> Contact Information
                    </p>
                    <div className="space-y-3 pl-1">
                      {viewMember.email && (
                        <div className="flex items-center gap-3">
                          <Mail size={16} className="text-primary/50 shrink-0" />
                          <span className="text-sm font-medium text-on-surface">{viewMember.email}</span>
                        </div>
                      )}
                      {viewMember.phone && (
                        <div className="flex items-center gap-3">
                          <Phone size={16} className="text-primary/50 shrink-0" />
                          <span className="text-sm font-medium text-on-surface">{viewMember.phone}</span>
                        </div>
                      )}
                      {viewMember.address && (
                        <div className="flex items-center gap-3">
                          <MapPin size={16} className="text-primary/50 shrink-0" />
                          <span className="text-sm font-medium text-on-surface">{viewMember.address}</span>
                        </div>
                      )}
                      {!viewMember.email && !viewMember.phone && !viewMember.address && (
                        <p className="text-sm text-on-surface-variant/50 italic">No contact info provided</p>
                      )}
                    </div>
                  </div>

                  <hr className="border-outline-variant/10" />

                  {/* Personal Details */}
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Heart size={12} /> Personal Details
                    </p>
                    <div className="grid grid-cols-2 gap-4 pl-1 text-xs">
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Gender</p>
                        <p className="font-semibold text-on-surface mt-0.5">{viewMember.gender || '--'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Birth Date</p>
                        <p className="font-semibold text-on-surface mt-0.5">{viewMember.date_of_birth || '--'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Emergency Contact</p>
                        <p className="font-semibold text-on-surface mt-0.5">{viewMember.emergency_contact || '--'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Marital Status</p>
                        <p className="font-semibold text-on-surface mt-0.5">{viewMember.marital_status || '--'}</p>
                      </div>
                      {viewMember.marital_status === 'Married' && (
                        <div className="col-span-2">
                          <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Spouse Name</p>
                          <p className="font-semibold text-on-surface mt-0.5">{viewMember.spouse_name || '--'}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Children</p>
                        <p className="font-semibold text-on-surface mt-0.5">{viewMember.children_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Family ID</p>
                        <p className="font-semibold text-on-surface mt-0.5">{viewMember.family_id || '--'}</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-outline-variant/10" />

                  {/* Church Details */}
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-2">
                      <BookOpen size={12} /> Church & Ministry
                    </p>
                    <div className="grid grid-cols-2 gap-4 pl-1 text-xs">
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Join Type</p>
                        <p className="font-semibold text-on-surface mt-0.5">{viewMember.join_type || '--'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Join Date</p>
                        <p className="font-semibold text-on-surface mt-0.5">{viewMember.join_date || '--'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Baptism Status</p>
                        <p className="font-semibold text-on-surface mt-0.5">{viewMember.baptism_status ? 'Baptized' : 'Not Baptized'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Study Unit</p>
                        <p className="font-semibold text-on-surface mt-0.5">{viewMember.bible_study_groups?.group_name || 'Unassigned'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Tithe Participant</p>
                        <p className="font-semibold text-on-surface mt-0.5">{viewMember.tithe_participation ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Giving Frequency</p>
                        <p className="font-semibold text-on-surface mt-0.5">{viewMember.giving_frequency || '--'}</p>
                      </div>
                    </div>
                  </div>

                  {viewMember.notes && (
                    <>
                      <hr className="border-outline-variant/10" />
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Notes</p>
                        <p className="text-sm text-on-surface bg-surface-container-low p-3 rounded-xl border border-outline-variant/10 whitespace-pre-wrap">
                          {viewMember.notes}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Ministries */}
                  {viewMember.ministries && viewMember.ministries.length > 0 && (
                    <>
                      <hr className="border-outline-variant/10" />
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Ministries</p>
                        <div className="flex flex-wrap gap-2 pl-1">
                          {viewMember.ministries.map((min, i) => (
                            <span
                              key={i}
                              style={{
                                padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '700',
                                background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.15)'
                              }}
                            >
                              {min}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-outline-variant/10 bg-surface-container-lowest flex gap-3 shrink-0">
                <button
                  onClick={() => { setViewMember(null); handleOpenModal(viewMember); }}
                  className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <Edit2 size={16} /> Edit Profile
                </button>
                <button
                  onClick={() => setViewMember(null)}
                  className="flex-1 h-12 rounded-xl bg-surface-container-low text-on-surface-variant font-bold flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Editor Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-4xl bg-surface border border-outline-variant/20 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Left Side: Photo & Summary */}
              <div className="md:w-1/3 bg-surface-container-low p-8 flex flex-col items-center border-r border-outline-variant/10">
                <div className="w-full flex justify-between items-start mb-8 md:hidden">
                  <h2 className="text-xl font-bold text-primary">
                    {editingMember ? 'Update Profile' : 'New Registration'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant">
                    <XCircle size={24} />
                  </button>
                </div>

                <div className="relative group mb-6">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-surface bg-surface-container flex items-center justify-center shadow-xl transition-all group-hover:border-primary/20">
                    {formData.image_url ? (
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Users size={64} className="text-on-surface-variant/50" />
                    )}
                  </div>
                  <label
                    htmlFor="image-upload"
                    className="absolute bottom-2 right-2 p-3 bg-primary text-on-primary rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform"
                  >
                    <Camera size={20} />
                    <input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <h3 className="text-lg font-bold text-on-surface text-center mb-2">
                  {formData.full_name || "New Member"}
                </h3>
                <p className="text-sm text-on-surface-variant text-center mb-8">
                  {formData.email || "No email provided"}
                </p>

                <div className="w-full space-y-4 mt-auto hidden md:block">
                  <div className="p-4 rounded-2xl bg-surface border border-outline-variant/10">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Age Group</p>
                    <p className="text-sm font-medium text-on-surface">{formData.age_group}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface border border-outline-variant/10">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Group</p>
                    <p className="text-sm font-medium text-on-surface">
                      {groups.find(g => g.id === formData.group_id)?.group_name || "Unassigned"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side: Form */}
              <div className="md:w-2/3 flex flex-col bg-surface">
                <div className="px-8 py-6 border-b border-outline-variant/10 hidden md:flex justify-between items-center sticky top-0 z-10 bg-surface/80 backdrop-blur-md">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep === 1 ? 'bg-primary text-on-primary' : 'bg-primary/20 text-primary'}`}>1</div>
                      <div className={`w-8 h-0.5 rounded-full ${currentStep >= 2 ? 'bg-primary' : 'bg-outline-variant/20'}`}></div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep === 2 ? 'bg-primary text-on-primary' : 'bg-primary/20 text-primary'}`}>2</div>
                      <div className={`w-8 h-0.5 rounded-full ${currentStep >= 3 ? 'bg-primary' : 'bg-outline-variant/20'}`}></div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep === 3 ? 'bg-primary text-on-primary' : 'bg-primary/20 text-primary'}`}>3</div>
                    </div>
                    <h2 className="text-2xl font-bold text-primary">
                      {editingMember ? 'Update Profile' : 'New Registration'}
                      <span className="text-sm font-medium text-on-surface-variant ml-2 opacity-60">
                        Step {currentStep} of 3
                      </span>
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                <div id="registration-modal-content" className="p-8 overflow-y-auto custom-scrollbar flex-1">
                  {/* Step Progress Indicator */}
                  <div className="flex items-center gap-2 mb-8 px-2">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex-1 flex items-center gap-2">
                        <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step <= currentStep ? 'bg-primary' : 'bg-surface-container-highest opacity-30'}`} />
                        {step < 3 && <div className="w-1 h-1 rounded-full bg-surface-container-highest" />}
                      </div>
                    ))}
                  </div>

                  <form id="member-form" onSubmit={handleSaveMember} className="space-y-8">
                    <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <motion.div 
                        key="step-1"
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                          <UserCheck size={16} /> Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <Input
                              label="Full Legal Name"
                              placeholder="e.g. Johnathan Doe"
                              value={formData.full_name}
                              onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                              required
                            />
                          </div>
                          <Input
                            label="Email Address"
                            placeholder="member@domain.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            icon={Mail}
                          />
                          <Input
                            label="Phone Number"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            icon={Phone}
                          />
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-on-surface">Gender</label>
                            <div className="relative">
                              <select
                                className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                              >
                                {['Male', 'Female', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={18} />
                            </div>
                          </div>
                          <Input
                            label="Date of Birth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                          />
                          <Input
                            label="Emergency Contact"
                            placeholder="Name & Phone"
                            value={formData.emergency_contact}
                            onChange={e => setFormData({ ...formData, emergency_contact: e.target.value })}
                          />
                          <div className="md:col-span-2">
                            <Input
                              label="Residential Address"
                              placeholder="Home address details"
                              value={formData.address}
                              onChange={e => setFormData({ ...formData, address: e.target.value })}
                              icon={MapPin}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div 
                        key="step-2"
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                          <Heart size={16} /> Family & Relationships
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-on-surface">Marital Status</label>
                            <div className="relative">
                              <select
                                className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                                value={formData.marital_status}
                                onChange={e => setFormData({ ...formData, marital_status: e.target.value })}
                              >
                                {['Unmarried', 'Married', 'Widow', 'Divorced'].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={18} />
                            </div>
                          </div>
                          <Input
                            label="Spouse Name"
                            placeholder="If married"
                            value={formData.spouse_name}
                            onChange={e => setFormData({ ...formData, spouse_name: e.target.value })}
                            disabled={formData.marital_status !== 'Married'}
                          />
                          <Input
                            label="Number of Children"
                            type="number"
                            value={formData.children_count}
                            onChange={e => setFormData({ ...formData, children_count: parseInt(e.target.value) || 0 })}
                          />
                          <Input
                            label="Family ID"
                            placeholder="Group identifier"
                            value={formData.family_id}
                            onChange={e => setFormData({ ...formData, family_id: e.target.value })}
                          />
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 3 && (
                      <motion.div 
                        key="step-3"
                        initial={{ opacity: 0, x: 20 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                          <BookOpen size={16} /> Ministry & Stewardship
                        </h3>
                        {/* Step 3 Identification Header */}
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mb-2">
                          <h4 className="text-primary font-bold flex items-center gap-2">
                            <Plus size={16} /> Step 3: Service & Giving
                          </h4>
                          <p className="text-[10px] text-on-surface-variant opacity-70">Configure active roles and financial participation</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-on-surface">Bible Study Unit</label>
                            <div className="relative">
                              <select
                                className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                                value={formData.group_id}
                                onChange={e => setFormData({ ...formData, group_id: e.target.value })}
                              >
                                <option value="">Unassigned</option>
                                {(groups || []).map(g => (
                                  <option key={g?.id} value={g?.id}>{g?.group_name}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={18} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-on-surface">Join Type</label>
                            <div className="relative">
                              <select
                                className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                                value={formData.join_type}
                                onChange={e => setFormData({ ...formData, join_type: e.target.value })}
                              >
                                {['Relocate', 'Baptized Here'].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={18} />
                            </div>
                          </div>
                          <Input
                            label="Join Date"
                            type="date"
                            value={formData.join_date}
                            onChange={e => setFormData({ ...formData, join_date: e.target.value })}
                          />
                          <div className="flex flex-col justify-center gap-4 border border-outline-variant/10 rounded-2xl p-4 bg-primary/5">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.baptism_status}
                                onChange={e => setFormData({ ...formData, baptism_status: e.target.checked })}
                                className="w-5 h-5 accent-primary"
                              />
                              <span className="text-sm font-bold text-primary uppercase tracking-widest">Baptized Member</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.tithe_participation}
                                onChange={e => setFormData({ ...formData, tithe_participation: e.target.checked })}
                                className="w-5 h-5 accent-primary"
                              />
                              <span className="text-sm font-bold text-primary uppercase tracking-widest">Tithe Participant</span>
                            </label>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-on-surface">Giving Frequency</label>
                            <div className="relative">
                              <select
                                className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                                value={formData.giving_frequency}
                                onChange={e => setFormData({ ...formData, giving_frequency: e.target.value })}
                              >
                                {['Monthly', 'Weekly', 'Occasional', 'Not Active'].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={18} />
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm font-semibold text-on-surface mb-2 block">Personal Notes / Background</label>
                            <textarea
                              rows={3}
                              className="w-full p-4 rounded-2xl border border-outline-variant/20 bg-surface text-sm focus:ring-2 focus:ring-primary/20"
                              value={formData.notes}
                              onChange={e => setFormData({ ...formData, notes: e.target.value })}
                              placeholder="Add any specific details for church leaders..."
                            />
                          </div>

                          <div className="md:col-span-2 space-y-4">
                            <div className="flex justify-between items-center">
                              <label className="text-sm font-bold text-on-surface flex items-center gap-2">
                                <Heart size={16} className="text-primary" /> Ministries & Teams
                              </label>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {(availableMinistries || []).length > 0 ? (availableMinistries || []).map((min) => {
                                if (!min) return null;
                                const isSelected = formData.ministries?.includes(min.name);
                                return (
                                  <button
                                    key={min.id}
                                    type="button"
                                    onClick={() => {
                                      const currentMins = formData.ministries || [];
                                      const newSelected = isSelected 
                                        ? currentMins.filter(m => m !== min.name)
                                        : [...currentMins, min.name];
                                      setFormData({ ...formData, ministries: newSelected });
                                    }}
                                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all
                                      ${isSelected ? 'bg-primary/10 border-primary shadow-sm' : 'bg-surface border-outline-variant/10 opacity-70'}`}
                                  >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors
                                      ${isSelected ? 'bg-primary border-primary' : 'bg-transparent border-on-surface-variant'}`}>
                                      {isSelected && <Plus size={12} className="text-on-primary rotate-45" />}
                                    </div>
                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                                      {min.name}
                                    </span>
                                  </button>
                                );
                              }) : (
                                <div className="col-span-full py-8 text-center bg-surface rounded-2xl border border-dashed border-outline-variant/30">
                                  <p className="text-xs text-on-surface-variant italic opacity-60">No active ministries found. Use the 'Ministries' section to add roles.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

                {error && (
                    <div className="mt-6 p-4 rounded-xl bg-error/10 text-error flex items-center gap-3 border border-error/20">
                      <XCircle size={20} />
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  )}
                </div>

                <div className="px-8 py-6 border-t border-outline-variant/10 bg-surface-container-lowest flex gap-4 justify-between sticky bottom-0 z-10">
                  <div className="flex gap-4">
                    {currentStep > 1 && (
                      <Button
                        variant="secondary"
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="px-8"
                      >
                        Back
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setShowModal(false)}
                      className="px-8 border-outline-variant/20"
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  {currentStep < 3 ? (
                    <Button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="px-8"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      form="member-form"
                      className="px-8"
                      loading={isSaving}
                    >
                      {editingMember ? 'Save Changes' : 'Register Member'}
                    </Button>
                  )}
                </div>
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
