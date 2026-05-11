import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { Card, Button } from "../../components/common/UI";
import { ShieldCheck, Mail, MapPin, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Leaders() {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          bible_study_groups(name)
        `)
        .eq('role', 'bible_leader')
        .order('full_name');

      if (error) throw error;
      setLeaders(data || []);
    } catch (error) {
      console.error("Error fetching leaders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = (leaderId) => {
    navigate('/admin/messages', { state: { directChatId: leaderId } });
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Group Leaders</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and oversee Bible study group leadership</p>
        </div>
        <Button icon={UserPlus}>Add Leader</Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading Leaders...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {leaders.map((leader, index) => (
            <motion.div
              key={leader.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ 
                    width: 64, height: 64, borderRadius: 16, 
                    background: 'var(--primary)', color: 'white', 
                    display: 'grid', placeItems: 'center', fontSize: '1.5rem', fontWeight: '800' 
                  }}>
                    {leader.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>{leader.full_name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.875rem', fontWeight: '600', marginTop: '4px' }}>
                      <ShieldCheck size={14} />
                      <span>Bible Study Leader</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                    <Mail size={16} />
                    <span style={{ fontSize: '0.9rem' }}>{leader.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                    <MapPin size={16} />
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text)' }}>
                      {leader.bible_study_groups?.name || 'No Group Assigned'}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
                  <Button 
                    variant="outline" 
                    style={{ flex: 1 }}
                    onClick={() => handleMessage(leader.id)}
                  >
                    Message
                  </Button>
                  <Button variant="secondary" style={{ flex: 1 }}>Edit Profile</Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
