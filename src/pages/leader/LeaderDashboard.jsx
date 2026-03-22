import React, { useEffect, useState } from 'react';
import { 
  Users, ClipboardList, BookOpen, 
  CheckCircle2, Calendar, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Card, Button } from '../../components/common/UI';
import { Link } from 'react-router-dom';

export default function LeaderDashboard() {
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchGroupData();
    }
  }, [user]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      // 🔥 NEW: Check mapping table for leader's group
      const { data: leaderMapping, error: mappingError } = await supabase
        .from('group_leaders')
        .select(`
          group_id,
          bible_study_groups (*)
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (mappingError) throw mappingError;
      
      if (!leaderMapping) {
        // If no group is found, fetch available groups
        fetchAvailableGroups();
        return;
      }
      
      setGroup(leaderMapping.bible_study_groups);

      // Get member count for this group
      const { count, error: memberError } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', leaderMapping.group_id);

      if (memberError) throw memberError;
      setMemberCount(count || 0);

    } catch (err) {
      console.error("Error fetching group data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableGroups = async () => {
    try {
      // 🕵️ Fetch groups that are NOT in the mapping table yet
      // We'll use a join or just filter groups where no leader is assigned
      const { data: allGroups, error: groupError } = await supabase
        .from('bible_study_groups')
        .select(`
          *,
          group_leaders (user_id)
        `);
      
      if (groupError) throw groupError;
      
      // Filter out groups that already have a leader assigned in the mapping table
      const available = allGroups.filter(g => !g.group_leaders || g.group_leaders.length === 0);
      setAvailableGroups(available);
    } catch (err) {
      console.error("Error fetching available groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimGroup = async (groupId) => {
    setClaiming(true);
    try {
      // 🔥 Insert into the mapping table instead of updating the group
      const { error } = await supabase
        .from('group_leaders')
        .insert({ 
          user_id: user.id,
          group_id: groupId 
        });
      
      if (error) throw error;
      
      // Refresh to show the newly claimed group
      fetchGroupData();
    } catch (err) {
      console.error("Error claiming group:", err.message);
      alert("This group has already been claimed by another leader.");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <div className="animate-spin" style={{ width: 40, height: 40, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 20px' }}></div>
      <p>Synchronizing Group Data...</p>
    </div>
  );

  // 🚪 SELECTION VIEW: If leader has no group
  if (!group) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '16px' }}>Welcome, {user?.full_name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>You haven't been assigned a group yet. Please select one of the available study groups below to begin leading.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {availableGroups.length > 0 ? availableGroups.map(g => (
            <Card key={g.id} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99, 102, 241, 0.1)', display: 'grid', placeItems: 'center' }}>
                  <Users size={24} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ fontWeight: '800', margin: 0 }}>{g.group_name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{g.location || 'Location not set'}</p>
                </div>
              </div>
              <Button 
                onClick={() => handleClaimGroup(g.id)} 
                style={{ width: '100%', justifyContent: 'center' }}
                loading={claiming}
              >
                Lead This Group <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </Button>
            </Card>
          )) : (
            <Card style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No groups are currently available for selection. Please contact the administrator.</p>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // 📊 DASHBOARD VIEW: Once group is assigned
  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.025em' }}>
          Welcome, {user?.full_name}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Leader of <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{group.group_name}</span>
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px',
        marginBottom: '40px'
      }}>
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99, 102, 241, 0.1)', display: 'grid', placeItems: 'center' }}>
              <Users size={24} color="var(--primary)" />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)' }}>Group Members</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{memberCount} Members</h3>
            </div>
          </div>
          <Link to="/leader" style={{ textDecoration: 'none' }}>
            <Button variant="outline" style={{ width: '100%', justifyContent: 'center' }}>
              View Members <ArrowRight size={16} style={{ marginLeft: '8px' }} />
            </Button>
          </Link>
        </Card>

        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', display: 'grid', placeItems: 'center' }}>
              <ClipboardList size={24} color="#10b981" />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)' }}>Attendance</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Take Today's</h3>
            </div>
          </div>
          <Link to="/leader/attendance" style={{ textDecoration: 'none' }}>
            <Button style={{ width: '100%', justifyContent: 'center', background: '#10b981' }}>
              Record Attendance <ArrowRight size={16} style={{ marginLeft: '8px' }} />
            </Button>
          </Link>
        </Card>

        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(245, 158, 11, 0.1)', display: 'grid', placeItems: 'center' }}>
              <BookOpen size={24} color="#f59e0b" />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)' }}>Study Progress</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Record Progress</h3>
            </div>
          </div>
          <Link to="/leader/study" style={{ textDecoration: 'none' }}>
            <Button style={{ width: '100%', justifyContent: 'center', background: '#f59e0b' }}>
              Log Study Session <ArrowRight size={16} style={{ marginLeft: '8px' }} />
            </Button>
          </Link>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <Card style={{ padding: '24px' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} color="#10b981" /> Recent Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', borderLeft: '4px solid #10b981' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>Attendance Recorded</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last Sunday • 12 members present</p>
            </div>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', borderLeft: '4px solid #f59e0b' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>Study Progress Logged</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Topic: Unity in Christ • Ephesians 1:1-10</p>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '24px' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="var(--primary)" /> Upcoming Study
          </h3>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Next session scheduled for</p>
            <p style={{ fontSize: '1.25rem', fontWeight: '800', margin: '8px 0' }}>Sunday, March 22nd</p>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', fontWeight: '700' }}>05:00 PM</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
