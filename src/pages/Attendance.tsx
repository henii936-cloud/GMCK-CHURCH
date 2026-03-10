import React, { useEffect, useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Save, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  Check
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

export function Attendance() {
  const { profile } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [members, setMembers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [groupSummaries, setGroupSummaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchMembers(selectedGroupId);
      fetchExistingAttendance(selectedGroupId, date);
    } else {
      setMembers([]);
      setAttendance({});
    }
    
    if (isAdmin) {
      fetchGroupSummaries(date);
    }
  }, [selectedGroupId, date, isAdmin, groups]);

  async function fetchGroupSummaries(dateStr: string) {
    const supabase = getSupabase();
    if (!supabase) {
      // Mock summaries for demo
      const mockSummaries = [
        { id: 'g1', name: 'Youth Bible Study', present: 12, absent: 3, total: 15 },
        { id: 'g2', name: 'Men\'s Fellowship', present: 8, absent: 2, total: 10 },
        { id: 'g3', name: 'Women\'s Prayer Group', present: 14, absent: 1, total: 15 },
      ];
      setGroupSummaries(mockSummaries);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('group_id, status')
        .eq('date', dateStr);

      if (error) throw error;

      const summaries = groups.map(group => {
        const groupAttendance = data?.filter(a => a.group_id === group.id) || [];
        const present = groupAttendance.filter(a => a.status === 'present').length;
        const absent = groupAttendance.filter(a => a.status === 'absent').length;
        return {
          id: group.id,
          name: group.name,
          present,
          absent,
          total: present + absent
        };
      });

      setGroupSummaries(summaries);
    } catch (err) {
      console.error('Error fetching group summaries:', err);
    }
  }

  async function fetchGroups() {
    const supabase = getSupabase();
    if (!supabase) {
      const mockGroups = [
        { id: 'g1', name: 'Youth Bible Study', leader_id: 'l1' },
        { id: 'g2', name: 'Men\'s Fellowship', leader_id: 'l2' },
        { id: 'g3', name: 'Women\'s Prayer Group', leader_id: 'l3' },
      ];
      setGroups(mockGroups);
      if (profile?.group_id) {
        setSelectedGroupId(profile.group_id);
      } else if (mockGroups.length > 0) {
        setSelectedGroupId(mockGroups[0].id);
      }
      setLoading(false);
      return;
    }

    try {
      let query = supabase.from('bible_study_groups').select('*');
      if (!isAdmin && profile?.group_id) {
        query = query.eq('id', profile.group_id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      setGroups(data || []);
      if (profile?.group_id) {
        setSelectedGroupId(profile.group_id);
      } else if (data && data.length > 0) {
        setSelectedGroupId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMembers(groupId: string) {
    setLoading(true);
    const supabase = getSupabase();
    if (!supabase) {
      // Mock members for the group
      const mockMembers = [
        { id: 'm1', full_name: 'John Doe', email: 'john@example.com' },
        { id: 'm2', full_name: 'Jane Smith', email: 'jane@example.com' },
        { id: 'm3', full_name: 'Robert Brown', email: 'robert@example.com' },
        { id: 'm4', full_name: 'Sarah Wilson', email: 'sarah@example.com' },
        { id: 'm5', full_name: 'Michael Gebre', email: 'michael@example.com' },
      ];
      setMembers(mockMembers);
      setLoading(false);
      return;
    }

    try {
      // Assuming members have a group_id or there's a junction table
      // For this implementation, we'll try to fetch from 'members' where group_id matches
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('group_id', groupId);

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchExistingAttendance(groupId: string, dateStr: string) {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('member_id, status')
        .eq('group_id', groupId)
        .eq('date', dateStr);

      if (error) throw error;
      
      const attendanceMap: Record<string, boolean> = {};
      data?.forEach(record => {
        attendanceMap[record.member_id] = record.status === 'present';
      });
      setAttendance(attendanceMap);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  }

  const toggleAttendance = (memberId: string) => {
    setAttendance(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const markAll = (present: boolean) => {
    const newAttendance: Record<string, boolean> = {};
    members.forEach(m => {
      newAttendance[m.id] = present;
    });
    setAttendance(newAttendance);
  };

  async function saveAttendance() {
    setSaving(true);
    const supabase = getSupabase();
    if (!supabase) {
      setTimeout(() => {
        setSaving(false);
        alert('Attendance saved successfully (Demo Mode)');
      }, 1000);
      return;
    }

    try {
      const records = members.map(m => ({
        group_id: selectedGroupId,
        member_id: m.id,
        date: date,
        status: attendance[m.id] ? 'present' : 'absent'
      }));

      // Upsert records (requires unique constraint on group_id, member_id, date)
      const { error } = await supabase
        .from('attendance')
        .upsert(records, { onConflict: 'group_id,member_id,date' });

      if (error) throw error;
      alert('Attendance saved successfully!');
    } catch (err) {
      console.error('Error saving attendance:', err);
      alert('Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  }

  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = Object.values(attendance).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Tracking</h1>
          <p className="text-slate-500">Record and monitor weekly Bible Study attendance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium transition-all"
            />
          </div>
          <button 
            onClick={saveAttendance}
            disabled={saving || !selectedGroupId}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Save Attendance
          </button>
        </div>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {groupSummaries.map((summary) => (
            <div key={summary.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{summary.name}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                  Group
                </span>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{summary.present}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Present</p>
                </div>
                <div className="w-px h-8 bg-slate-100" />
                <div>
                  <p className="text-2xl font-bold text-rose-500">{summary.absent}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Absent</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm font-bold text-slate-700">{Math.round((summary.present / (summary.total || 1)) * 100)}%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rate</p>
                </div>
              </div>
              <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${(summary.present / (summary.total || 1)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Group Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users size={18} className="text-emerald-600" />
              Select Group
            </h2>
            <div className="space-y-2">
              {groups.map(group => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border",
                    selectedGroupId === group.id 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm" 
                      : "bg-white border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {group.name}
                </button>
              ))}
              {groups.length === 0 && !loading && (
                <p className="text-xs text-slate-500 italic p-2 text-center">No groups found.</p>
              )}
            </div>
          </div>

          <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-lg shadow-emerald-100">
            <p className="text-emerald-100 text-sm font-medium">Summary for Today</p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">{presentCount}</p>
                <p className="text-xs text-emerald-100 uppercase tracking-wider font-bold mt-1">Present</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{members.length}</p>
                <p className="text-xs text-emerald-100 uppercase tracking-wider font-bold mt-1">Total</p>
              </div>
            </div>
            <div className="mt-4 h-2 bg-emerald-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-500" 
                style={{ width: `${members.length ? (presentCount / members.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main: Member List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => markAll(true)}
                  className="px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  Mark All Present
                </button>
                <button 
                  onClick={() => markAll(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="animate-spin text-emerald-600 mx-auto mb-2" size={32} />
                  <p className="text-sm text-slate-500 font-medium">Loading group members...</p>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-500 font-medium">No members found in this group.</p>
                </div>
              ) : (
                filteredMembers.map(member => (
                  <div 
                    key={member.id} 
                    className={cn(
                      "flex items-center justify-between p-4 transition-all cursor-pointer hover:bg-slate-50/50",
                      attendance[member.id] && "bg-emerald-50/30"
                    )}
                    onClick={() => toggleAttendance(member.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                        attendance[member.id] 
                          ? "bg-emerald-600 text-white" 
                          : "bg-slate-100 text-slate-600"
                      )}>
                        {attendance[member.id] ? <Check size={20} /> : member.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className={cn(
                          "text-sm font-bold transition-colors",
                          attendance[member.id] ? "text-emerald-700" : "text-slate-900"
                        )}>
                          {member.full_name}
                        </p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAttendance(member.id);
                        }}
                        className={cn(
                          "w-12 h-6 rounded-full relative transition-all duration-200 outline-none",
                          attendance[member.id] ? "bg-emerald-500" : "bg-slate-200"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm",
                          attendance[member.id] ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
