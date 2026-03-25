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
        supabase.from('study_progress').select('*, bible_study_groups(group_name)').order('date', { ascending: false }).limit(5),
        supabase.from('events').select('*').gte('date', new Date().toISOString().split('T')[0]).order('date', { ascending: true }).limit(3)
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
    <div className="animate-fade-in max-w-7xl mx-auto h-[calc(100vh-11rem)] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 shrink-0">
        <div className="max-w-2xl">
          <p className="label-sm text-tertiary-fixed-dim mb-2 tracking-[0.3em]">Administrative Oversight</p>
          <h1 className="display-lg text-primary mb-2">Admin <span className="text-tertiary-fixed-dim italic">Dashboard</span></h1>
          <p className="text-on-surface-variant font-medium tracking-wide leading-relaxed text-sm">Global overview of church operations and Bible study progress. A digital sanctuary for ministry management.</p>
        </div>
        <div className="flex items-center gap-6 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg signature-gradient">
            <Calendar size={20} className="text-on-primary" />
          </div>
          <div className="text-right">
            <p className="label-sm opacity-60 mb-1">Current Period</p>
            <p className="text-lg font-heading font-bold text-primary">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 shrink-0">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="editorial-card group p-4 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-container-low transition-transform group-hover:rotate-6">
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary/40">
                  <TrendingUp size={12} />
                  <span>+12%</span>
                </div>
            </div>

            <div>
                <p className="label-sm opacity-60 mb-1 text-xs">{stat.label}</p>
                <h3 className="text-2xl font-heading font-bold text-primary">{loading ? '...' : stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 editorial-card flex flex-col p-6 min-h-0">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="headline-sm text-primary text-xl">Recent Study <span className="text-tertiary-fixed-dim italic">Progress</span></h3>
            <button className="label-sm text-primary hover:text-tertiary-fixed-dim transition-colors">View All</button>
          </div>
          <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {recentStudy.length > 0 ? recentStudy.map(study => (
              <div key={study.id} className="ministry-feed-item group hover:bg-surface-container-low rounded-lg transition-all px-4 py-2">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all shrink-0">
                    <BookOpen size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate">{study.bible_study_groups?.group_name}</p>
                    <p className="text-xs text-on-surface-variant truncate">{study.topic}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="label-sm opacity-60 text-xs">{new Date(study.date).toLocaleDateString()}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary">Completed</p>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-center py-8 text-on-surface-variant/40 font-medium text-sm">No recent study progress recorded.</p>
            )}
          </div>
        </div>

        <div className="editorial-card flex flex-col p-6 min-h-0">
          <h3 className="headline-sm text-primary text-xl mb-4 shrink-0">Upcoming <span className="text-tertiary-fixed-dim italic">Events</span></h3>
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {upcomingEvents.length > 0 ? upcomingEvents.map(event => {
              const date = new Date(event.date);
              return (
                <div key={event.id} className="flex gap-4 group items-center">
                  <div className="text-center min-w-[40px] shrink-0">
                    <p className="label-sm text-tertiary-fixed-dim text-xs">
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className="text-xl font-heading font-bold text-primary leading-none">{date.getDate()}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate">{event.title}</p>
                    <p className="label-sm opacity-60 mt-0.5 text-xs truncate">{event.location} • {event.event_time}</p>
                  </div>
                </div>
              );
            }) : (
              <p className="text-center py-8 text-on-surface-variant/40 font-medium text-sm">No upcoming events.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
