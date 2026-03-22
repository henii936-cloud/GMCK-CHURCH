import { useState, useEffect } from "react";
import { groupService, memberService } from "../../services/api";
import { Card, Button, Input } from "../../components/common/UI";
import { MapPin, Users, User, Plus, Search, BookOpen, Layers, MoreVertical, Settings, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../services/supabaseClient";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [newGroup, setNewGroup] = useState({
    group_name: "",
    leader_id: "",
    location: "",
    members_count: 0
  });

  useEffect(() => {
    loadData();
  }, []);

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
    try {
      await groupService.createGroup(newGroup);
      setShowModal(false);
      loadData();
      setNewGroup({ group_name: "", leader_id: "", location: "", members_count: 0 });
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };

  const filteredGroups = groups.filter(g => 
    g.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.025em' }}>Bible Study <span style={{ color: 'var(--primary)' }}>Groups</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500' }}>Manage groups, assign leaders, and track participation across the church</p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={Plus}>Create New Group</Button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by group name, leader, or location..." 
            className="input-field" 
            style={{ paddingLeft: '48px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
        <AnimatePresence>
          {filteredGroups.map((group) => (
            <motion.div 
              key={group.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card style={{ padding: '0', overflow: 'hidden', height: '100%', position: 'relative' }}>
                <div style={{ padding: '24px', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ 
                      width: 52, height: 52, borderRadius: 16, 
                      background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)', 
                      display: 'grid', placeItems: 'center',
                      boxShadow: '0 8px 16px rgba(99, 102, 241, 0.2)'
                    }}>
                      <Layers size={28} color="white" />
                    </div>
                    <button style={{ color: 'var(--text-muted)', padding: '4px' }}><MoreVertical size={20} /></button>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>{group.group_name}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      <User size={16} /> 
                      <span style={{ fontWeight: '600', color: 'var(--text)' }}>Leader: {group.profiles?.full_name || 'Unassigned'}</span>
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
                    <Button variant="secondary" style={{ flex: 1, padding: '8px', fontSize: '0.875rem' }} icon={Activity}>Activities</Button>
                    <Button variant="secondary" style={{ flex: 1, padding: '8px', fontSize: '0.875rem' }} icon={Settings}>Settings</Button>
                  </div>
                </div>
                
                <div style={{ height: '4px', width: '100%', background: 'var(--primary)', opacity: 0.1 }} />
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal for Group Creation */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card" 
            style={{ width: '100%', maxWidth: '500px', padding: '40px' }}
          >
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '24px' }}>Create <span style={{ color: 'var(--primary)' }}>Study Group</span></h2>
            
            <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Input label="Group Name" placeholder="e.g. Young Adults Fellowship" value={newGroup.group_name} onChange={e => setNewGroup({...newGroup, group_name: e.target.value})} required />
              
              <Input label="Primary Meeting Location" placeholder="e.g. Main Hall / Online" value={newGroup.location} onChange={e => setNewGroup({...newGroup, location: e.target.value})} />
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <Button type="submit" style={{ flex: 1 }} icon={Plus}>Save Group</Button>
                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
