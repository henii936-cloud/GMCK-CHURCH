import { useEffect, useState } from "react";
import { attendanceService, memberService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Card, Button } from "../../components/common/UI";
import { ClipboardList, Users, Check, X, Search, Loader2 } from "lucide-react";

export default function Attendance() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    load();
  }, [user]);

  const load = async () => {
    try {
      // For simplicity, we fetch all and filter by group_id
      const data = await memberService.getMembers();
      const filtered = data.filter(m => m.group_id === user?.group_id);
      setMembers(filtered);
      
      // Initialize attendance
      const initial = {};
      filtered.forEach(m => initial[m.id] = true);
      setAttendance(initial);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (memberId) => {
    setAttendance(prev => ({ ...prev, [memberId]: !prev[memberId] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const records = members.map(m => ({
        member_id: m.id,
        group_id: user.group_id,
        present: attendance[m.id],
        taken_by: user.id
      }));

      await attendanceService.saveAttendance(records, user.group_id, user.id);
      setMessage("Attendance saved successfully!");
      // Reset after success
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error saving attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                <tr key={m.id} onClick={() => toggle(m.id)} style={{ cursor: 'pointer', transition: '0.2s' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'grid', placeItems: 'center', fontWeight: '800', color: 'var(--primary)' }}>
                        {m.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: '600' }}>{m.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${attendance[m.id] ? 'badge-approved' : 'badge-pending'}`} style={{ opacity: 0.8 }}>
                      {attendance[m.id] ? 'Present' : 'Absent'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setAttendance(prev => ({ ...prev, [m.id]: true })); }}
                        style={{ width: 32, height: 32, borderRadius: 8, background: attendance[m.id] ? 'var(--primary)' : 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', transition: '0.2s' }}
                      >
                        <Check size={16} color={attendance[m.id] ? 'white' : 'var(--text-muted)'} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setAttendance(prev => ({ ...prev, [m.id]: false })); }}
                        style={{ width: 32, height: 32, borderRadius: 8, background: !attendance[m.id] ? '#ef4444' : 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', transition: '0.2s' }}
                      >
                        <X size={16} color={!attendance[m.id] ? 'white' : 'var(--text-muted)'} />
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
