import { useEffect, useState } from "react";
import { attendanceService, memberService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Card, Button } from "../../components/common/UI";
import { ClipboardList, Users, Check, X, Search, Loader2 } from "lucide-react";

export default function Attendance() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [groupId, setGroupId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.id) load();
  }, [user]);

  const load = async () => {
    try {
      // 1. Get leader's group directly from groups table
      const { data: group } = await supabase
        .from('bible_study_groups')
        .select('id')
        .eq('leader_id', user.id)
        .maybeSingle();
      
      if (!group) {
        setLoading(false);
        return;
      }
      setGroupId(group.id);

      // 2. Get members for this group
      const data = await memberService.getMembers();
      const filtered = data.filter(m => m.group_id === group.id);
      setMembers(filtered);
      
      // Initialize attendance (lowercase to match DB)
      const initial = {};
      filtered.forEach(m => initial[m.id] = 'present');
      setAttendance(initial);
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
    if (!groupId) return setMessage("No assigned group found.");
    setSaving(true);
    setMessage("");
    try {
      const records = members.map(m => ({
        member_id: m.id,
        group_id: groupId,
        status: attendance[m.id],
        recorded_by: user.id,
        date: new Date().toISOString().split('T')[0]
      }));

      await attendanceService.saveAttendance(records);
      setMessage("Attendance saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Error saving attendance.");
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!groupId && !loading) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2 style={{ fontWeight: '800' }}>No Group Assigned</h2>
      <p style={{ color: 'var(--text-muted)' }}>You must be assigned to a group to take attendance.</p>
    </div>
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

      <Card style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)' }}>
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
                    <span className={`badge ${attendance[m.id] === 'present' ? 'badge-approved' : 'badge-pending'}`} style={{ opacity: 0.8, textTransform: 'capitalize' }}>
                      {attendance[m.id]}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        onClick={() => setStatus(m.id, 'present')}
                        style={{ width: 32, height: 32, borderRadius: 8, background: attendance[m.id] === 'present' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', transition: '0.2s' }}
                        title="Present"
                      >
                        <Check size={16} color={attendance[m.id] === 'present' ? 'white' : 'var(--text-muted)'} />
                      </button>
                      <button 
                        onClick={() => setStatus(m.id, 'absent')}
                        style={{ width: 32, height: 32, borderRadius: 8, background: attendance[m.id] === 'absent' ? '#ef4444' : 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', transition: '0.2s' }}
                        title="Absent"
                      >
                        <X size={16} color={attendance[m.id] === 'absent' ? 'white' : 'var(--text-muted)'} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '24px', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            {message && <p style={{ fontWeight: '700', color: message.includes('Error') ? '#ef4444' : '#10b981', background: message.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', padding: '8px 16px', borderRadius: '8px', fontSize: '0.875rem' }}>{message}</p>}
          </div>
          <Button onClick={handleSave} disabled={saving || members.length === 0} style={{ minWidth: '180px', justifyContent: 'center' }}>
            {saving ? <Loader2 className="animate-spin" /> : <>Finalize Attendance <Check size={18} style={{ marginLeft: '8px' }} /></>}
          </Button>
        </div>
      </Card>
    </div>
  );
}
