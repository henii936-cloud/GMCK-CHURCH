import React, { useEffect, useState } from 'react';
import { memberService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Button } from '../../components/common/UI';
import { Users, Search, Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

export default function LeaderMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.id) {
      loadMembers();
    }
  }, [user]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      
      // 1. Get the leader's assigned group
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('group_leaders')
        .select('group_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (assignmentError) throw assignmentError;
      
      if (!assignmentData?.group_id) {
        setMembers([]);
        return;
      }

      // 2. Fetch members for that group
      const data = await memberService.getMembers();
      const groupMembers = data.filter(m => m.group_id === assignmentData.group_id);
      setMembers(groupMembers);
    } catch (err) {
      console.error("Error loading members:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Group Members</h1>
          <p style={{ color: 'var(--text-muted)' }}>View and manage members of your study group</p>
        </div>
      </div>

      <Card style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input 
              type="text" 
              placeholder="Search members by name, email, or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '44px', width: '100%' }}
            />
          </div>
          <div className="glass-card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="var(--primary)" />
            <span style={{ fontWeight: '600' }}>{members.length} Members</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading members...</div>
        ) : filteredMembers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No members found.
          </div>
        ) : (
          <div style={{ padding: '12px' }}>
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact Info</th>
                  <th>Address</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'grid', placeItems: 'center', fontWeight: '800', color: 'var(--primary)' }}>
                          {m.full_name?.charAt(0) || '?'}
                        </div>
                        <span style={{ fontWeight: '600' }}>{m.full_name}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {m.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            <Mail size={14} /> {m.email}
                          </div>
                        )}
                        {m.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            <Phone size={14} /> {m.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {m.address ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                          <MapPin size={14} /> {m.address}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Not provided</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${m.status === 'Active' ? 'badge-approved' : 'badge-pending'}`}>
                        {m.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
