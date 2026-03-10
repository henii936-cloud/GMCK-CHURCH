import React, { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Members() {
  const { profile, selectedGroupId } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const isAdmin = profile?.role === 'admin';

  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    gender: 'Male',
    marital_status: 'Single',
    email: '',
    phone_number: '',
    ministry: '',
    team: '',
    membership_status: 'Active'
  });

  useEffect(() => {
    fetchMembers();
  }, [selectedGroupId]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function fetchMembers() {
    setLoading(true);
    const supabase = getSupabase();
    
    if (!supabase) {
      // Mock data for demo
      const mockMembers = [
        { id: '1', full_name: 'John Doe', gender: 'Male', marital_status: 'Married', email: 'john@example.com', phone_number: '+251 911 223344', ministry: 'Choir', team: 'Vocals', membership_status: 'Active' },
        { id: '2', full_name: 'Jane Smith', gender: 'Female', marital_status: 'Single', email: 'jane@example.com', phone_number: '+251 922 334455', ministry: 'Youth', team: 'Media', membership_status: 'Active' },
        { id: '3', full_name: 'Robert Brown', gender: 'Male', marital_status: 'Widowed', email: 'robert@example.com', phone_number: '+251 933 445566', ministry: 'Prayer Team', team: 'Intercession', membership_status: 'Inactive' },
        { id: '4', full_name: 'Sarah Wilson', gender: 'Female', marital_status: 'Married', email: 'sarah@example.com', phone_number: '+251 944 556677', ministry: 'Evangelism', team: 'Outreach', membership_status: 'Active' },
        { id: '5', full_name: 'Michael Gebre', gender: 'Male', marital_status: 'Single', email: 'michael@example.com', phone_number: '+251 955 667788', ministry: 'Youth', team: 'Ushering', membership_status: 'Active' },
      ];
      
      if (!isAdmin && selectedGroupId) {
        // Mock filtering: just return a subset for leaders
        setMembers(mockMembers.slice(0, 3));
      } else {
        setMembers(mockMembers);
      }
      setLoading(false);
      return;
    }

    try {
      let query = supabase.from('members').select('*');

      if (!isAdmin && selectedGroupId) {
        // For leaders, only show members of their selected group
        const { data: groupMemberIds, error: gmError } = await supabase
          .from('bible_study_members')
          .select('member_id')
          .eq('group_id', selectedGroupId);
        
        if (gmError) throw gmError;
        
        const ids = groupMemberIds.map(gm => gm.member_id);
        query = query.in('id', ids);
      }

      const { data, error } = await query.order('full_name');

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const supabase = getSupabase();

    if (!supabase) {
      // Mock add for demo with a small delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newMember = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        created_at: new Date().toISOString()
      };
      
      setMembers([newMember, ...members]);
      setShowAddModal(false);
      setSubmitting(false);
      resetForm();
      setToast({ message: 'Member added successfully to demo!', type: 'success' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('members')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;
      
      setMembers([data, ...members]);
      setShowAddModal(false);
      resetForm();
      setToast({ message: 'Member added successfully!', type: 'success' });
    } catch (err) {
      console.error('Error adding member:', err);
      setToast({ message: 'Failed to add member. Please try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setFormData({
      full_name: '',
      gender: 'Male',
      marital_status: 'Single',
      email: '',
      phone_number: '',
      ministry: '',
      team: '',
      membership_status: 'Active'
    });
  }

  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Members Management</h1>
          <p className="text-slate-500">Manage and track all church members in one place.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
        >
          <Plus size={20} />
          Add Member
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Filter size={16} />
              Filters
            </button>
            <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ministry & Team</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-emerald-600" size={32} />
                      <p className="text-sm text-slate-500 font-medium">Loading members...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-slate-500 font-medium">No members found.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                          {member.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{member.full_name}</p>
                          <p className="text-xs text-slate-500">{member.gender} • {member.marital_status}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Mail size={14} className="text-slate-400" />
                          {member.email || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          {member.phone_number || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 w-fit">
                          {member.ministry || 'No Ministry'}
                        </span>
                        {member.team && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 w-fit">
                            {member.team}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.membership_status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {member.membership_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-900">{filteredMembers.length}</span> of <span className="font-bold text-slate-900">{members.length}</span> members
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50" disabled>
              <ChevronLeft size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50" disabled>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Add New Member</h2>
                  <p className="text-xs text-slate-500 font-medium">Enter the member's details below.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="e.g., John Doe"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Gender</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Marital Status</label>
                  <select 
                    value={formData.marital_status}
                    onChange={(e) => setFormData({...formData, marital_status: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Email Address <span className="text-xs font-normal text-slate-400">(Optional)</span>
                  </label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-slate-50/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                  <input 
                    required
                    type="tel" 
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    placeholder="+251 9..."
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Ministry <span className="text-xs font-normal text-slate-400">(Optional)</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.ministry}
                    onChange={(e) => setFormData({...formData, ministry: e.target.value})}
                    placeholder="e.g., Youth, Choir"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-slate-50/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Team <span className="text-xs font-normal text-slate-400">(Optional)</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.team}
                    onChange={(e) => setFormData({...formData, team: e.target.value})}
                    placeholder="e.g., Media, Ushering"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-slate-50/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Membership Status</label>
                  <select 
                    value={formData.membership_status}
                    onChange={(e) => setFormData({...formData, membership_status: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Probation">Probation</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/50 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      <span>Add Member</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 z-[100]"
          >
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${
              toast.type === 'success' 
                ? 'bg-emerald-600 border-emerald-500 text-white' 
                : 'bg-rose-600 border-rose-500 text-white'
            }`}>
              {toast.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
              <p className="text-sm font-bold">{toast.message}</p>
              <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70 transition-opacity">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
