import { useEffect, useState } from "react";
import { attendanceService, memberService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Card, Button } from "../../components/common/UI";
import { ClipboardList, Users, Check, X, Search, Loader2, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "../../services/supabaseClient";

export default function Attendance() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("take"); // 'take' or 'history'
  const [groupId, setGroupId] = useState(null);
  const [expandedDates, setExpandedDates] = useState({});

  const toggleDate = (dateKey) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }));
  };

  useEffect(() => {
    if (user?.id) {
      load();
    }
  }, [user]);

  const load = async () => {
    try {
      setLoading(true);
      
      // 1. Get the leader's assigned group
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('group_leaders')
        .select('group_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (assignmentError) throw assignmentError;
      
      const currentGroupId = assignmentData?.group_id;
      setGroupId(currentGroupId);

      if (!currentGroupId) {
        setMembers([]);
        return;
      }

      // For simplicity, we fetch all and filter by group_id
      const data = await memberService.getMembers();
      const filtered = data.filter(m => m.group_id === currentGroupId);
      setMembers(filtered);
      
      // Initialize attendance
      const initial = {};
      filtered.forEach(m => initial[m.id] = 'Present');
      setAttendance(initial);

      const historyData = await attendanceService.getAttendanceHistory(currentGroupId);
      setHistory(historyData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setStatus = (memberId, status) => {
    setAttendance(prev => ({ ...prev, [memberId]: status }));
  };

  const handleSave = async () => {
    if (!groupId) return;
    setSaving(true);
    setMessage("");
    try {
      const records = members.map(m => ({
        member_id: m.id,
        group_id: groupId,
        status: attendance[m.id] || 'Present',
        date: new Date().toISOString().split('T')[0]
      }));

      await attendanceService.saveAttendance(records);
      setMessage("Attendance saved successfully!");
      
      // Reload history and switch to history tab
      const historyData = await attendanceService.getAttendanceHistory(groupId);
      setHistory(historyData);
      
      setTimeout(() => {
        setMessage("");
        setActiveTab("history");
      }, 1500);
    } catch (err) {
      console.error("Save attendance error:", err);
      
      // Extract detailed error information
      let errorMsg = err.message || 'Please try again.';
      if (err.details) errorMsg += ` (${err.details})`;
      if (err.hint) errorMsg += ` Hint: ${err.hint}`;
      if (err.code) errorMsg += ` Code: ${err.code}`;
      
      setMessage(`Error saving attendance: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedHistory = history.reduce((acc, record) => {
    const dateKey = record.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(record);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedHistory).sort((a, b) => new Date(b) - new Date(a));
  
  const today = new Date().toISOString().split('T')[0];
  const isAttendanceTakenToday = history.some(record => record.date === today);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Attendance Tracking</h1>
          <p style={{ color: 'var(--text-muted)' }}>Quickly mark your group members for today's session</p>
        </div>
        <div style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.25rem' }}>
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('take')}
          style={{ 
            padding: '10px 20px', 
            borderRadius: '8px', 
            border: 'none', 
            background: activeTab === 'take' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', 
            color: activeTab === 'take' ? 'white' : 'var(--text-muted)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: '0.2s'
          }}
        >
          <ClipboardList size={18} /> Take Attendance
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          style={{ 
            padding: '10px 20px', 
            borderRadius: '8px', 
            border: 'none', 
            background: activeTab === 'history' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', 
            color: activeTab === 'history' ? 'white' : 'var(--text-muted)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: '0.2s'
          }}
        >
          <Calendar size={18} /> Attendance History
        </button>
      </div>

      <Card style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {activeTab === 'take' ? (
          isAttendanceTakenToday ? (
            <div className="p-16 text-center flex flex-col items-center justify-center bg-surface">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                <Check size={40} />
              </div>
              <h2 className="text-2xl font-bold text-on-surface mb-3">Attendance Complete</h2>
              <p className="text-on-surface-variant mb-8 max-w-md">You have already recorded attendance for today's session. Thank you for keeping the records up to date.</p>
              <Button onClick={() => setActiveTab('history')} style={{ padding: '12px 24px' }}>
                View Attendance History
              </Button>
            </div>
          ) : (
          <>
            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                  type="text" 
                  placeholder="Search members..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '44px', width: '100%' }}
                />
              </div>
              <div className="glass-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--primary)" />
                <span style={{ fontWeight: '600' }}>{members.length} Total</span>
              </div>
            </div>

            <div className="p-6 bg-surface">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredMembers.map((m) => (
                  <div 
                    key={m.id} 
                    className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col gap-4 ${
                      attendance[m.id] === 'Present' ? 'bg-emerald-500/5 border-emerald-500/20 shadow-sm shadow-emerald-500/5' : 
                      attendance[m.id] === 'Absent' ? 'bg-red-500/5 border-red-500/20 shadow-sm shadow-red-500/5' : 
                      'bg-amber-500/5 border-amber-500/20 shadow-sm shadow-amber-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          attendance[m.id] === 'Present' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 
                          attendance[m.id] === 'Absent' ? 'bg-red-500/20 text-red-600 dark:text-red-400' : 
                          'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}>
                          {m.full_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-on-surface text-lg">{m.full_name}</h3>
                          <span className={`text-xs font-bold uppercase tracking-wider ${
                            attendance[m.id] === 'Present' ? 'text-emerald-600 dark:text-emerald-400' : 
                            attendance[m.id] === 'Absent' ? 'text-red-600 dark:text-red-400' : 
                            'text-amber-600 dark:text-amber-400'
                          }`}>
                            {attendance[m.id]}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <button 
                        onClick={() => setStatus(m.id, 'Present')}
                        className={`py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                          attendance[m.id] === 'Present' 
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                            : 'bg-surface-container hover:bg-emerald-500/10 text-on-surface-variant hover:text-emerald-500'
                        }`}
                      >
                        <Check size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Present</span>
                      </button>
                      <button 
                        onClick={() => setStatus(m.id, 'Absent')}
                        className={`py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                          attendance[m.id] === 'Absent' 
                            ? 'bg-red-500 text-white shadow-md shadow-red-500/20' 
                            : 'bg-surface-container hover:bg-red-500/10 text-on-surface-variant hover:text-red-500'
                        }`}
                      >
                        <X size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Absent</span>
                      </button>
                      <button 
                        onClick={() => setStatus(m.id, 'Excused')}
                        className={`py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                          attendance[m.id] === 'Excused' 
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' 
                            : 'bg-surface-container hover:bg-amber-500/10 text-on-surface-variant hover:text-amber-500'
                        }`}
                      >
                        <span className="font-black text-sm leading-none h-[18px] flex items-center">E</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">Excused</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '24px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const newAttendance = {};
                    members.forEach(m => newAttendance[m.id] = 'Present');
                    setAttendance(newAttendance);
                  }}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}
                >
                  Mark All Present
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const newAttendance = {};
                    members.forEach(m => newAttendance[m.id] = 'Absent');
                    setAttendance(newAttendance);
                  }}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}
                >
                  Mark All Absent
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const newAttendance = {};
                    members.forEach(m => newAttendance[m.id] = 'Excused');
                    setAttendance(newAttendance);
                  }}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}
                >
                  Mark All Excused
                </Button>
                
                <div style={{ display: 'flex', gap: '16px', marginLeft: '16px', fontSize: '0.875rem', fontWeight: '600' }}>
                  <span style={{ color: '#10b981' }}>{Object.values(attendance).filter(s => s === 'Present').length} Present</span>
                  <span style={{ color: '#ef4444' }}>{Object.values(attendance).filter(s => s === 'Absent').length} Absent</span>
                  <span style={{ color: '#f59e0b' }}>{Object.values(attendance).filter(s => s === 'Excused').length} Excused</span>
                </div>

                {message && <p style={{ fontWeight: '700', color: message.includes('Error') ? '#ef4444' : '#10b981', background: message.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', padding: '8px 16px', borderRadius: '8px', fontSize: '0.875rem', marginLeft: '12px' }}>{message}</p>}
              </div>
              <Button onClick={handleSave} disabled={saving || members.length === 0} style={{ minWidth: '180px', justifyContent: 'center' }}>
                {saving ? <Loader2 className="animate-spin" /> : <>Finalize Attendance <Check size={18} style={{ marginLeft: '8px' }} /></>}
              </Button>
            </div>
          </>
          )
        ) : (
          <div className="p-6 space-y-8 bg-surface">
            {sortedDates.length === 0 ? (
              <div className="p-10 text-center text-on-surface-variant font-medium">
                No attendance history found.
              </div>
            ) : (
              sortedDates.map(dateKey => {
                const records = groupedHistory[dateKey];
                const presentCount = records.filter(r => r.status === 'Present').length;
                const absentCount = records.filter(r => r.status === 'Absent').length;
                const excusedCount = records.filter(r => r.status === 'Excused').length;
                
                // Parse date safely (assuming YYYY-MM-DD format from DB)
                const [year, month, day] = dateKey.split('-');
                const displayDate = new Date(year, month - 1, day).toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                });

                const isExpanded = expandedDates[dateKey];

                return (
                  <div key={dateKey} className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm">
                    {/* Date Header */}
                    <div 
                      className="bg-surface-container-low p-5 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-surface-container-low/80 transition-colors"
                      onClick={() => toggleDate(dateKey)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-on-surface">{displayDate}</h3>
                          <p className="text-sm text-on-surface-variant font-medium mt-0.5">{records.length} Total Members Recorded</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* Summary Badges */}
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-wide uppercase">
                            {presentCount} Present
                          </span>
                          <span className="px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold tracking-wide uppercase">
                            {absentCount} Absent
                          </span>
                          <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold tracking-wide uppercase">
                            {excusedCount} Excused
                          </span>
                        </div>
                        <div className="text-on-surface-variant flex items-center justify-center w-8 h-8 rounded-full bg-surface-container">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>
                    </div>

                    {/* Records List */}
                    {isExpanded && (
                      <div className="divide-y divide-outline-variant/10 animate-in slide-in-from-top-2 duration-200">
                        {records.map(record => (
                          <div key={record.id} className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                {record.members?.full_name?.charAt(0) || '?'}
                              </div>
                              <span className="font-semibold text-on-surface">{record.members?.full_name || 'Unknown'}</span>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                              record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 
                              record.status === 'Absent' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 
                              'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}>
                              {record.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
