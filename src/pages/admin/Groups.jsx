import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { groupService, memberService } from "../../services/api";
import { Card, Button, Input } from "../../components/common/UI";
import { MapPin, Users, User, Plus, Search, BookOpen, Layers, Activity, Trash2, XCircle, AlertCircle, UsersRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../services/supabaseClient";

export default function Groups({ viewOnly = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newGroup, setNewGroup] = useState({
    group_name: "",
    location: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user?.id) loadData();
  }, [user?.id]);

  const loadData = async () => {
    try {
      const groupsData = await groupService.getGroups();
      setGroups(groupsData);
    } catch (err) {
      console.error("Error loading groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const payload = {
        group_name: newGroup.group_name,
        location: newGroup.location
      };
      
      console.log("Creating group with payload:", payload);
      await groupService.createGroup(payload);
      
      setShowModal(false);
      loadData();
      setNewGroup({ group_name: "", location: "" });
    } catch (err) {
      console.error("Error creating group:", err);
      setError(err.message || "Failed to create group. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    setIsDeleting(true);
    try {
      await groupService.deleteGroup(groupToDelete.id);
      setGroups(groups.filter(g => g.id !== groupToDelete.id));
      setGroupToDelete(null);
    } catch (err) {
      console.error("Error deleting group:", err);
      alert(err.message || "Failed to delete group. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredGroups = groups.filter(g => 
    g.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.leaders?.some(l => l.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    g.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.025em' }}>Bible Study <span style={{ color: 'var(--primary)' }}>Groups</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500' }}>Manage groups, allow leaders to self-assign, and track participation across the church</p>
        </div>
        {!viewOnly && <Button onClick={() => setShowModal(true)} icon={Plus}>Create New Group</Button>}
      </div>

      <div style={{ position: 'relative', marginBottom: '40px' }}>
        <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Search groups by name, leader, or location..." 
          className="search-input"
          style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', background: 'var(--card)', border: '1px solid var(--border)', fontSize: '1rem', transition: 'all 0.3s ease' }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>Creating your view...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <AnimatePresence>
            {filteredGroups.map(group => (
              <motion.div 
                key={group.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99, 102, 241, 0.1)', display: 'grid', placeItems: 'center' }}>
                      <Layers size={22} color="var(--primary)" />
                    </div>
                    {!viewOnly && (
                      <button 
                        onClick={() => setGroupToDelete(group)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                        onMouseOut={e => e.currentTarget.style.background = 'none'}
                        title="Delete Group"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    {viewOnly && (
                      <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Admin View</span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>{group.group_name}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      <User size={16} /> 
                      <span style={{ fontWeight: '600', color: 'var(--text)' }}>
                        Leader: {group.leaders.length > 0 ? group.leaders.map(l => l.full_name).join(", ") : 'Unassigned'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      <MapPin size={16} /> 
                      <span>Location: {group.location || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      <Users size={16} /> 
                      <span>Active Members: {group.members_count || 0}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      <BookOpen size={16} /> 
                      <span>Current Study: New Genesis Series</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button 
                      variant="secondary" 
                      style={{ flex: 1, padding: '8px', fontSize: '0.875rem' }} 
                      icon={Activity}
                      onClick={() => navigate('/admin/programs', { state: { groupId: group.id, groupName: group.group_name } })}
                    >
                      Programs
                    </Button>
                  </div>
                
                <div style={{ height: '4px', width: '100%', background: 'var(--primary)', opacity: 0.1 }} />
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      )}

      {/* Modal for Group Creation */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-surface border border-outline-variant/20 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface/80 backdrop-blur-md">
                <div>
                  <h2 className="text-2xl font-bold text-primary">
                    Create <span className="text-on-surface">Study Group</span>
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Establish a new community gathering
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                <form id="group-form" onSubmit={handleCreateGroup} className="space-y-6">
                  {/* Group Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface">Group Name *</label>
                    <div className="relative">
                      <UsersRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Young Adults Fellowship"
                        value={newGroup.group_name}
                        onChange={e => setNewGroup({...newGroup, group_name: e.target.value})}
                        className="w-full h-14 pl-12 pr-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface">Meeting Location</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                      <input
                        type="text"
                        placeholder="e.g. Main Hall / Online"
                        value={newGroup.location}
                        onChange={e => setNewGroup({...newGroup, location: e.target.value})}
                        className="w-full h-14 pl-12 pr-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
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
                  form="group-form"
                  className="px-8 shadow-lg shadow-primary/20 pulse-animation"
                  loading={isSaving}
                >
                  Create Group
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal for Group Deletion */}
      {groupToDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card" 
            style={{ width: '100%', maxWidth: '400px', padding: '32px', textAlign: 'center' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Delete Group</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.875rem' }}>
              Are you sure you want to delete <strong>{groupToDelete.group_name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="secondary" onClick={() => setGroupToDelete(null)} disabled={isDeleting} style={{ flex: 1 }}>Cancel</Button>
              <Button onClick={handleDeleteGroup} loading={isDeleting} style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none' }}>Delete</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
