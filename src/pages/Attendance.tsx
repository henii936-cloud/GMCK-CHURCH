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
  const { profile, selectedGroupId: authSelectedGroupId } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [members, setMembers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [groupSummaries, setGroupSummaries] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'mark' | 'history'>('mark');
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);
  const [historyDetails, setHistoryDetails] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    fetchGroups();
  }, [authSelectedGroupId]);

  useEffect(() => {
    if (selectedGroupId) {
      fetchMembers(selectedGroupId);
      fetchExistingAttendance(selectedGroupId, date);
      if (activeTab === 'history' && !selectedHistoryDate) {
        fetchHistory(selectedGroupId);
      }
      if (selectedHistoryDate) {
        fetchHistoryDetails(selectedGroupId, selectedHistoryDate);
      }
    } else {
      setMembers([]);
      setAttendance({});
    }
    
    if (isAdmin) {
      fetchGroupSummaries(date);
    }
  }, [selectedGroupId, date, isAdmin, groups, activeTab, selectedHistoryDate]);

  async function fetchHistoryDetails(groupId: string, dateStr: string) {
    setDetailsLoading(true);
    const supabase = getSupabase();
    
    if (!supabase) {
      // Mock details
      setTimeout(() => {
        const seed = groupId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const mockDetails = members.map((m, idx) => ({
          ...m,
          status: (seed + idx) % 5 === 0 ? 'absent' : 'present'
        }));
        setHistoryDetails(mockDetails);
        setDetailsLoading(false);
      }, 500);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('member_id, status, members(full_name, email)')
        .eq('group_id', groupId)
        .eq('date', dateStr);

      if (error) throw error;
      
      const details = data.map((d: any) => ({
        id: d.member_id,
        full_name: d.members.full_name,
        email: d.members.email,
        status: d.status
      }));
      
      setHistoryDetails(details);
    } catch (err) {
      console.error('Error fetching history details:', err);
    } finally {
      setDetailsLoading(false);
    }
  }

  async function fetchHistory(groupId: string) {
    setHistoryLoading(true);
    const supabase = getSupabase();
    
    if (!supabase) {
      // Mock history
      setTimeout(() => {
        const seed = groupId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        setHistory([
          { date: '2024-03-05', present: 12 + (seed % 3), total: 15, rate: Math.round(((12 + (seed % 3)) / 15) * 100) },
          { date: '2024-02-26', present: 14 - (seed % 2), total: 15, rate: Math.round(((14 - (seed % 2)) / 15) * 100) },
          { date: '2024-02-19', present: 10 + (seed % 4), total: 15, rate: Math.round(((10 + (seed % 4)) / 15) * 100) },
          { date: '2024-02-12', present: 13, total: 15, rate: 87 },
          { date: '2024-02-05', present: 11, total: 15, rate: 73 },
        ]);
        setHistoryLoading(false);
      }, 500);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('date, status')
        .eq('group_id', groupId);

      if (error) throw error;

      // Group by date
      const grouped = data.reduce((acc: any, curr: any) => {
        if (!acc[curr.date]) {
          acc[curr.date] = { date: curr.date, present: 0, total: 0 };
        }
        acc[curr.date].total++;
        if (curr.status === 'present') acc[curr.date].present++;
        return acc;
      }, {});

      const historyList = Object.values(grouped).map((h: any) => ({
        ...h,
        rate: Math.round((h.present / h.total) * 100)
      })).sort((a: any, b: any) => b.date.localeCompare(a.date));

      setHistory(historyList);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function fetchGroupSummaries(dateStr: string) {
    const supabase = getSupabase();
    if (!supabase) {
      // Mock summaries
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
        { id: 'g4', name: 'Young Adults Ministry', leader_id: 'l4' },
        { id: 'g5', name: 'Choir Rehearsal', leader_id: 'l5' },
        { id: 'g6', name: 'Evangelism Team', leader_id: 'l6' },
        { id: 'g7', name: 'Sunday School Teachers', leader_id: 'l7' },
      ];
      
      if (!isAdmin && authSelectedGroupId) {
        const filtered = mockGroups.filter(g => g.id === authSelectedGroupId);
        setGroups(filtered);
        setSelectedGroupId(authSelectedGroupId);
      } else {
        setGroups(mockGroups);
        if (mockGroups.length > 0) setSelectedGroupId(mockGroups[0].id);
      }
      setLoading(false);
      return;
    }

    try {
      let query = supabase.from('bible_study_groups').select('*');
      if (!isAdmin && authSelectedGroupId) {
        query = query.eq('id', authSelectedGroupId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      setGroups(data || []);
      if (!isAdmin && authSelectedGroupId) {
        setSelectedGroupId(authSelectedGroupId);
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
      const seed = groupId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const mockMembers = [
        { id: `m1-${groupId}`, full_name: 'John Doe', email: 'john@example.com' },
        { id: `m2-${groupId}`, full_name: 'Jane Smith', email: 'jane@example.com' },
        { id: `m3-${groupId}`, full_name: 'Robert Brown', email: 'robert@example.com' },
        { id: `m4-${groupId}`, full_name: 'Sarah Wilson', email: 'sarah@example.com' },
        { id: `m5-${groupId}`, full_name: 'Michael Gebre', email: 'michael@example.com' },
        { id: `m6-${groupId}`, full_name: 'Abebe Bikila', email: 'abebe@example.com' },
        { id: `m7-${groupId}`, full_name: 'Martha Tadesse', email: 'martha@example.com' },
        { id: `m8-${groupId}`, full_name: 'Samuel L. Jackson', email: 'samuel@example.com' },
        { id: `m9-${groupId}`, full_name: 'Elena Gilbert', email: 'elena@example.com' },
        { id: `m10-${groupId}`, full_name: 'Damon Salvatore', email: 'damon@example.com' },
        { id: `m11-${groupId}`, full_name: 'Stefan Salvatore', email: 'stefan@example.com' },
        { id: `m12-${groupId}`, full_name: 'Bonnie Bennett', email: 'bonnie@example.com' },
      ];
      setMembers(mockMembers);
      setLoading(false);
      return;
    }

    try {
      // Fetch members via the junction table
      const { data: groupMembers, error: gmError } = await supabase
        .from('bible_study_members')
        .select('member_id')
        .eq('group_id', groupId);
      
      if (gmError) throw gmError;
      
      const memberIds = groupMembers.map(gm => gm.member_id);
      
      if (memberIds.length === 0) {
        setMembers([]);
        return;
      }

      const { data, error } = await supabase
        .from('members')
        .select('*')
        .in('id', memberIds);

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
    if (!supabase) {
      // Mock existing attendance
      const seed = groupId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const attendanceMap: Record<string, boolean> = {};
      members.forEach((m, idx) => {
        attendanceMap[m.id] = (seed + idx) % 4 !== 0;
      });
      setAttendance(attendanceMap);
      return;
    }

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
        alert('Attendance saved successfully');
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

        {/* Main: Member List or History */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('mark')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'mark' 
                  ? "bg-white text-emerald-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              Mark Attendance
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === 'history' 
                  ? "bg-white text-emerald-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              Attendance History
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {activeTab === 'mark' ? (
              <>
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
                            "flex items-center justify-between p-4 transition-all hover:bg-slate-50/50 cursor-pointer",
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
                                "w-12 h-6 rounded-full relative transition-all duration-200 outline-none cursor-pointer",
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
              </>
            ) : (
              <div className="divide-y divide-slate-100">
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedHistoryDate ? (
                      <button 
                        onClick={() => setSelectedHistoryDate(null)}
                        className="flex items-center gap-2 hover:text-emerald-600 transition-colors"
                      >
                        <ChevronLeft size={18} />
                        Back to History
                      </button>
                    ) : (
                      "Past Attendance Records"
                    )}
                  </h3>
                  {selectedHistoryDate && (
                    <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-200">
                      {formatDate(selectedHistoryDate)}
                    </span>
                  )}
                </div>

                {selectedHistoryDate ? (
                  <div className="divide-y divide-slate-100">
                    {detailsLoading ? (
                      <div className="p-12 text-center">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-2" size={32} />
                        <p className="text-sm text-slate-500 font-medium">Loading details...</p>
                      </div>
                    ) : historyDetails.length === 0 ? (
                      <div className="p-12 text-center">
                        <p className="text-slate-500 font-medium">No details found for this date.</p>
                      </div>
                    ) : (
                      historyDetails.map((detail) => (
                        <div key={detail.id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                              detail.status === 'present' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                            )}>
                              {detail.status === 'present' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{detail.full_name}</p>
                              <p className="text-xs text-slate-500">{detail.email}</p>
                            </div>
                          </div>
                          <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded-lg",
                            detail.status === 'present' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                          )}>
                            {detail.status === 'present' ? 'Present' : 'Absent'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <>
                    {historyLoading ? (
                      <div className="p-12 text-center">
                        <Loader2 className="animate-spin text-emerald-600 mx-auto mb-2" size={32} />
                        <p className="text-sm text-slate-500 font-medium">Loading history...</p>
                      </div>
                    ) : history.length === 0 ? (
                      <div className="p-12 text-center">
                        <p className="text-slate-500 font-medium">No history records found.</p>
                      </div>
                    ) : (
                      history.map((record, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setSelectedHistoryDate(record.date)}
                          className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                              <Calendar size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{formatDate(record.date)}</p>
                              <p className="text-xs text-slate-500">{record.present} present out of {record.total}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                              <p className={cn(
                                "text-sm font-bold",
                                record.rate >= 80 ? "text-emerald-600" : record.rate >= 50 ? "text-amber-600" : "text-rose-600"
                              )}>
                                {record.rate}%
                              </p>
                              <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full transition-all duration-500",
                                    record.rate >= 80 ? "bg-emerald-500" : record.rate >= 50 ? "bg-amber-500" : "bg-rose-500"
                                  )}
                                  style={{ width: `${record.rate}%` }}
                                />
                              </div>
                            </div>
                            <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
