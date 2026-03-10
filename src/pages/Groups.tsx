import React, { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { 
  Plus, 
  Search, 
  Users, 
  MapPin, 
  User, 
  Loader2, 
  MoreVertical,
  X,
  Check,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Groups() {
  const { profile } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManageMembersModal, setShowManageMembersModal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupLeader, setNewGroupLeader] = useState('');
  const [newGroupLocation, setNewGroupLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const supabase = getSupabase();
    
    if (!supabase) {
      // Mock data
      setGroups([
        { id: 'g1', name: 'Youth Bible Study', leader_id: 'l1', leader_name: 'Pastor Samuel', location: 'Church Hall B', member_count: 12 },
        { id: 'g2', name: 'Men\'s Fellowship', leader_id: 'l2', leader_name: 'Elder John', location: 'Main Sanctuary', member_count: 8 },
        { id: 'g3', name: 'Women\'s Prayer Group', leader_id: 'l3', leader_name: 'Sister Mary', location: 'Room 104', member_count: 15 },
      ]);
      setLeaders([
        { id: 'l1', full_name: 'Pastor Samuel' },
        { id: 'l2', full_name: 'Elder John' },
        { id: 'l3', full_name: 'Sister Mary' },
      ]);
      setAllMembers([
        { id: 'm1', full_name: 'John Doe', group_id: 'g1' },
        { id: 'm2', full_name: 'Jane Smith', group_id: 'g1' },
        { id: 'm3', full_name: 'Robert Brown', group_id: 'g2' },
        { id: 'm4', full_name: 'Sarah Wilson', group_id: null },
        { id: 'm5', full_name: 'Michael Gebre', group_id: null },
      ]);
      setLoading(false);
      return;
    }

    try {
      const [groupsRes, leadersRes, membersRes] = await Promise.all([
        supabase.from('bible_study_groups').select('*, leader:profiles(full_name)'),
        supabase.from('profiles').select('id, full_name').eq('role', 'leader'),
        supabase.from('members').select('id, full_name, group_id')
      ]);

      if (groupsRes.error) throw groupsRes.error;
      
      // Transform groups to include leader name and member count
      const transformedGroups = groupsRes.data.map(g => ({
        ...g,
        leader_name: g.leader?.full_name || 'Unassigned',
        member_count: membersRes.data?.filter(m => m.group_id === g.id).length || 0
      }));

      setGroups(transformedGroups);
      setLeaders(leadersRes.data || []);
      setAllMembers(membersRes.data || []);
    } catch (err) {
      console.error('Error fetching groups data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const supabase = getSupabase();

    if (!supabase) {
      const newGroup = {
        id: Math.random().toString(36).substr(2, 9),
        name: newGroupName,
        leader_id: newGroupLeader,
        leader_name: leaders.find(l => l.id === newGroupLeader)?.full_name || 'Unassigned',
        location: newGroupLocation,
        member_count: 0
      };
      setGroups([...groups, newGroup]);
      setShowCreateModal(false);
      setSubmitting(false);
      resetForm();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bible_study_groups')
        .insert([{
          name: newGroupName,
          leader_id: newGroupLeader || null,
          location: newGroupLocation
        }])
        .select()
        .single();

      if (error) throw error;
      
      fetchData(); // Refresh list
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Error creating group:', err);
      alert('Failed to create group.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddMemberToGroup(memberId: string, groupId: string) {
    const supabase = getSupabase();
    if (!supabase) {
      setAllMembers(allMembers.map(m => m.id === memberId ? { ...m, group_id: groupId } : m));
      setGroups(groups.map(g => g.id === groupId ? { ...g, member_count: g.member_count + 1 } : g));
      return;
    }

    try {
      const { error } = await supabase
        .from('members')
        .update({ group_id: groupId })
        .eq('id', memberId);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Error adding member to group:', err);
    }
  }

  async function handleRemoveMemberFromGroup(memberId: string) {
    const supabase = getSupabase();
    if (!supabase) {
      const member = allMembers.find(m => m.id === memberId);
      if (member?.group_id) {
        setGroups(groups.map(g => g.id === member.group_id ? { ...g, member_count: g.member_count - 1 } : g));
      }
      setAllMembers(allMembers.map(m => m.id === memberId ? { ...m, group_id: null } : m));
      return;
    }

    try {
      const { error } = await supabase
        .from('members')
        .update({ group_id: null })
        .eq('id', memberId);

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error('Error removing member from group:', err);
    }
  }

  function resetForm() {
    setNewGroupName('');
    setNewGroupLeader('');
    setNewGroupLocation('');
  }

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.leader_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentGroupMembers = allMembers.filter(m => m.group_id === showManageMembersModal);
  const unassignedMembers = allMembers.filter(m => !m.group_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bible Study Groups</h1>
          <p className="text-slate-500">Manage groups, assign leaders, and track locations.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
          >
            <Plus size={20} />
            Create New Group
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search groups or leaders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {loading ? (
            <div className="col-span-full py-12 text-center">
              <Loader2 className="animate-spin text-emerald-600 mx-auto mb-2" size={32} />
              <p className="text-sm text-slate-500 font-medium">Loading groups...</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <p className="text-slate-500 font-medium">No groups found.</p>
            </div>
          ) : (
            filteredGroups.map(group => (
              <div key={group.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-200 hover:shadow-md transition-all group relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Users size={24} />
                  </div>
                  {isAdmin && (
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-1">{group.name}</h3>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User size={16} className="text-slate-400" />
                    <span className="font-medium">Leader:</span> {group.leader_name}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="font-medium">Location:</span> {group.location || 'Not set'}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users size={16} className="text-slate-400" />
                    <span className="font-medium">Members:</span> {group.member_count}
                  </div>
                </div>

                <button 
                  onClick={() => setShowManageMembersModal(group.id)}
                  className="w-full py-2.5 text-sm font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Manage Members
                  <ChevronRight size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Create New Group</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Group Name</label>
                <input 
                  required
                  type="text" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Youth Bible Study"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Assign Leader</label>
                <select 
                  value={newGroupLeader}
                  onChange={(e) => setNewGroupLeader(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                >
                  <option value="">Select a leader...</option>
                  {leaders.map(leader => (
                    <option key={leader.id} value={leader.id}>{leader.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
                <input 
                  type="text" 
                  value={newGroupLocation}
                  onChange={(e) => setNewGroupLocation(e.target.value)}
                  placeholder="e.g., Church Hall B"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showManageMembersModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Manage Members</h2>
                <p className="text-sm text-slate-500">{groups.find(g => g.id === showManageMembersModal)?.name}</p>
              </div>
              <button onClick={() => setShowManageMembersModal(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Current Members */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Users size={16} className="text-emerald-600" />
                  Current Members ({currentGroupMembers.length})
                </h3>
                <div className="space-y-2">
                  {currentGroupMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-sm font-medium text-slate-700">{member.full_name}</span>
                      {isAdmin && (
                        <button 
                          onClick={() => handleRemoveMemberFromGroup(member.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  {currentGroupMembers.length === 0 && (
                    <p className="text-sm text-slate-400 italic text-center py-4">No members assigned yet.</p>
                  )}
                </div>
              </div>

              {/* Add Members */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Plus size={16} className="text-emerald-600" />
                  Add Unassigned Members
                </h3>
                <div className="space-y-2">
                  {unassignedMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-200 transition-all">
                      <span className="text-sm font-medium text-slate-700">{member.full_name}</span>
                      <button 
                        onClick={() => handleAddMemberToGroup(member.id, showManageMembersModal)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  ))}
                  {unassignedMembers.length === 0 && (
                    <p className="text-sm text-slate-400 italic text-center py-4">All members are already assigned to groups.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <button 
                onClick={() => setShowManageMembersModal(null)}
                className="w-full py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
