import { useEffect, useState } from "react";
import { attendanceService, memberService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Card, Button } from "../../components/common/UI";
import { ClipboardList, Users, Check, X, Search, Loader2, Calendar } from "lucide-react";
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

            <div style={{ padding: '12px' }}>
              <table className="table-glass">
                <thead>
                  <tr>
                    <th>Member Name</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m) => (
                    <tr key={m.id} style={{ transition: '0.2s' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'grid', placeItems: 'center', fontWeight: '800', color: 'var(--primary)' }}>
                            {m.full_name.charAt(0)}
                          </div>
                          <span style={{ fontWeight: '600' }}>{m.full_name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ 
                          opacity: 0.8,
                          color: attendance[m.id] === 'Present' ? '#10b981' : attendance[m.id] === 'Absent' ? '#ef4444' : '#f59e0b',
                          background: attendance[m.id] === 'Present' ? 'rgba(16, 185, 129, 0.1)' : attendance[m.id] === 'Absent' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'
                        }}>
                          {attendance[m.id]}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button 
                            onClick={() => setStatus(m.id, 'Present')}
                            style={{ padding: '6px 12px', borderRadius: 8, background: attendance[m.id] === 'Present' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s', border: 'none', cursor: 'pointer', color: attendance[m.id] === 'Present' ? 'white' : 'var(--text-muted)' }}
                            title="Present"
                          >
                            <Check size={16} /> <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Present</span>
                          </button>
                          <button 
                            onClick={() => setStatus(m.id, 'Absent')}
                            style={{ padding: '6px 12px', borderRadius: 8, background: attendance[m.id] === 'Absent' ? '#ef4444' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s', border: 'none', cursor: 'pointer', color: attendance[m.id] === 'Absent' ? 'white' : 'var(--text-muted)' }}
                            title="Absent"
                          >
                            <X size={16} /> <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Absent</span>
                          </button>
                          <button 
                            onClick={() => setStatus(m.id, 'Excused')}
                            style={{ padding: '6px 12px', borderRadius: 8, background: attendance[m.id] === 'Excused' ? '#f59e0b' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s', border: 'none', cursor: 'pointer', color: attendance[m.id] === 'Excused' ? 'white' : 'var(--text-muted)' }}
                            title="Excused"
                          >
                            <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>E</span> <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>Excused</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
        ) : (
          <div style={{ padding: '12px' }}>
            {history.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No attendance history found.
              </div>
            ) : (
              <table className="table-glass">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Member Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record) => (
                    <tr key={record.id}>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontWeight: '600' }}>{record.members?.full_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{
                          color: record.status === 'Present' ? '#10b981' : record.status === 'Absent' ? '#ef4444' : '#f59e0b',
                          background: record.status === 'Present' ? 'rgba(16, 185, 129, 0.1)' : record.status === 'Absent' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'
                        }}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
