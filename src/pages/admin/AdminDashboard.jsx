import React, { useEffect, useState } from 'react';
import { 
  Users, MapPin, ShieldCheck, 
  ClipboardList, BookOpen, Activity, 
  DollarSign, TrendingUp, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../services/supabaseClient';
import { Card } from '../../components/common/UI';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    members: 0,
    groups: 0,
    leaders: 0,
    attendance: 0,
    finance: 0
  });
  const [recentStudy, setRecentStudy] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentData();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: membersCount },
        { count: groupsCount },
        { count: leadersCount },
        { data: financeData }
      ] = await Promise.all([
        supabase.from('members').select('*', { count: 'exact', head: true }),
        supabase.from('bible_study_groups').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'bible_leader'),
        supabase.from('transactions').select('amount')
      ]);

      const totalFinance = financeData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      setStats({
        members: membersCount || 0,
        groups: groupsCount || 0,
        leaders: leadersCount || 0,
        attendance: 85, // Mock for now
        finance: totalFinance
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchRecentData = async () => {
    try {
      const [studyData, eventsData] = await Promise.all([
        supabase.from('study_progress').select('*, bible_study_groups(name)').order('completion_date', { ascending: false }).limit(5),
        supabase.from('events').select('*').gte('event_date', new Date().toISOString().split('T')[0]).order('event_date', { ascending: true }).limit(3)
      ]);
      setRecentStudy(studyData.data || []);
      setUpcomingEvents(eventsData.data || []);
    } catch (err) {
      console.error("Error fetching recent data:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Members', value: stats.members, icon: Users, color: '#6366f1' },
    { label: 'Bible Study Groups', value: stats.groups, icon: MapPin, color: '#10b981' },
    { label: 'Group Leaders', value: stats.leaders, icon: ShieldCheck, color: '#f59e0b' },
    { label: 'Weekly Attendance', value: `${stats.attendance}%`, icon: ClipboardList, color: '#ec4899' },
    { label: 'Total Finance', value: `$${stats.finance.toLocaleString()}`, icon: DollarSign, color: '#8b5cf6' }
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.025em' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Global overview of church operations and Bible study progress.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
            <Calendar size={16} color="var(--primary)" />
            <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '24px',
        marginBottom: '40px'
      }}>
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                position: 'absolute', 
                right: '-10px', 
                top: '-10px', 
                opacity: 0.05,
                transform: 'rotate(-15deg)'
              }}>
                <stat.icon size={100} color={stat.color} />
              </div>
              
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${stat.color}15`, display: 'grid', placeItems: 'center', marginBottom: '16px' }}>
                <stat.icon size={24} color={stat.color} />
              </div>
              
              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>{stat.label}</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{loading ? '...' : stat.value}</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px', fontSize: '0.75rem', color: '#10b981' }}>
                <TrendingUp size={14} />
                <span>+12% from last month</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontWeight: '700' }}>Recent Study Progress</h3>
            <button style={{ fontSize: '0.875rem', color: 'var(--primary)', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentStudy.length > 0 ? recentStudy.map(study => (
              <div key={study.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99, 102, 241, 0.1)', display: 'grid', placeItems: 'center' }}>
                  <BookOpen size={20} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{study.bible_study_groups?.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{study.study_topic}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: '600' }}>{new Date(study.completion_date).toLocaleDateString()}</p>
                  <p style={{ fontSize: '0.7rem', color: '#10b981' }}>Completed</p>
                </div>
              </div>
            )) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No recent study progress recorded.</p>
            )}
          </div>
        </Card>

        <Card style={{ padding: '24px' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '24px' }}>Upcoming Events</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {upcomingEvents.length > 0 ? upcomingEvents.map(event => {
              const date = new Date(event.event_date);
              return (
                <div key={event.id} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ textAlign: 'center', minWidth: '45px' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)' }}>
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p style={{ fontSize: '1.25rem', fontWeight: '800' }}>{date.getDate()}</p>
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{event.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{event.location} • {event.event_time}</p>
                  </div>
                </div>
              );
            }) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No upcoming events.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
