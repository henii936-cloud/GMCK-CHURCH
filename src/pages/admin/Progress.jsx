import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { Card, Button } from "../../components/common/UI";
import { BookOpen, Calendar, MapPin, Filter, Search, Users, TrendingUp, Layers, Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Progress() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_progress')
        .select(`
          *,
          bible_study_groups(group_name)
        `)
        .order('completion_date', { ascending: false });

      if (error) throw error;
      setProgress(data || []);
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProgress = progress.filter(p =>
    p.study_topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.bible_study_groups?.group_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalSessions = progress.length;
  const uniqueGroups = [...new Set(progress.map(p => p.group_id).filter(Boolean))].length;
  const uniqueTopics = [...new Set(progress.map(p => p.study_topic).filter(Boolean))].length;
  const thisMonth = progress.filter(p => {
    if (!p.completion_date) return false;
    const d = new Date(p.completion_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const statCards = [
    { label: "Total Sessions", value: totalSessions, icon: BookOpen, color: "#6366f1", bg: "rgba(99, 102, 241, 0.1)" },
    { label: "Active Groups", value: uniqueGroups, icon: Users, color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
    { label: "Unique Topics", value: uniqueTopics, icon: Layers, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
    { label: "This Month", value: thisMonth, icon: Calendar, color: "#ec4899", bg: "rgba(236, 72, 153, 0.1)" },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.025em' }}>Study <span style={{ color: 'var(--primary)' }}>Progress</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500' }}>Monitor spiritual growth and study topics across all groups</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input
              type="text"
              placeholder="Filter topics or groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '44px', width: '250px' }}
            />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: stat.bg, display: 'grid', placeItems: 'center' }}>
                  <stat.icon size={24} color={stat.color} />
                </div>
                <TrendingUp size={18} color={stat.color} style={{ opacity: 0.5 }} />
              </div>
              <h3 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '4px', color: stat.color }}>
                {loading ? '—' : stat.value}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>{stat.label}</p>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${stat.color}, transparent)`, opacity: 0.4 }} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Progress Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 16px' }} />
          Loading progress...
        </div>
      ) : filteredProgress.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
          <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>No study progress records found.</p>
          <p style={{ fontSize: '0.875rem' }}>Records will appear here as leaders log their study sessions.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredProgress.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Card style={{ padding: '0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Top gradient bar */}
                <div style={{ height: '5px', background: 'linear-gradient(90deg, #6366f1, #10b981)' }} />

                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Date & Group badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={11} />
                      {p.bible_study_groups?.group_name || 'Unknown'}
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} />
                      {p.completion_date ? new Date(p.completion_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
                    </span>
                  </div>

                  {/* Topic */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99, 102, 241, 0.1)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <BookOpen size={18} color="var(--primary)" />
                    </div>
                    <h4 style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text)', lineHeight: '1.4', margin: 0 }}>
                      {p.study_topic}
                    </h4>
                  </div>

                  {/* Status badge */}
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ✓ Completed
                    </span>
                  </div>

                  {/* Notes */}
                  <div style={{ flex: 1 }}>
                    {p.notes ? (
                      <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--primary)', fontSize: '0.825rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: '1.6' }}>
                        {p.notes.length > 120 ? p.notes.substring(0, 120) + '...' : p.notes}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', opacity: 0.5, fontStyle: 'italic' }}>No notes recorded</p>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{ paddingTop: '14px', marginTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                      {p.completion_date ? new Date(p.completion_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
