import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { activityService, attendanceService, studyService } from "../../services/api";
import { Card, Button, Input } from "../../components/common/UI";
import { 
  Activity, MapPin, BookOpen, ClipboardList, Clock, Users,
  Calendar, Plus, CalendarDays, Zap, TrendingUp,
  Music, Mic2, Star, Filter, X, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AttendanceHistory from "../../components/common/AttendanceHistory";

export default function Programs() {
  const location = useLocation();
  const navigate = useNavigate();
  const groupFilter = location.state || null;
  
  const [activities, setActivities] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("feed");

  useEffect(() => { load(); }, [groupFilter?.groupId]);

  const load = async () => {
    try {
      setLoading(true);
      const groupId = groupFilter?.groupId || null;
      
      let studyData, attData;
      if (groupId) {
        studyData = await studyService.getStudyHistory(groupId);
        attData = await attendanceService.getAttendanceHistory(groupId);
      } else {
        studyData = await studyService.getAllStudyProgress();
        attData = await attendanceService.getAllAttendance();
      }
      
      // Map study data to the format expected by the feed
      const mappedStudy = (studyData || []).map(s => ({
        id: s.id,
        type: 'study',
        date: s.completion_date,
        created_at: s.created_at,
        group_id: s.group_id,
        groups: { name: s.bible_study_groups?.group_name },
        profiles: { name: null },
        detail: s.study_topic || s.topic_or_book
      }));
      
      setActivities(mappedStudy);
      setAttendanceRecords(attData || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };


  // Stats
  const totalActivities = activities.length + attendanceRecords.length;
  const studySessions = activities.length;
  const attendanceCount = attendanceRecords.length;
  const uniqueGroups = [...new Set([
    ...activities.map(a => a.group_id),
    ...attendanceRecords.map(a => a.group_id)
  ].filter(Boolean))].length;

  const statCards = [
    { label: "Total Activities", value: totalActivities, icon: Activity, color: "#6366f1", bg: "rgba(99, 102, 241, 0.1)" },
    { label: "Study Sessions", value: studySessions, icon: BookOpen, color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
    { label: "Attendance Logs", value: attendanceCount, icon: ClipboardList, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
    { label: "Active Groups", value: uniqueGroups, icon: Users, color: "#ec4899", bg: "rgba(236, 72, 153, 0.1)" },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.025em' }}>Church <span style={{ color: 'var(--primary)' }}>Programs</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500' }}>Real-time logs for church activities</p>
          {groupFilter?.groupName && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', fontSize: '0.875rem', fontWeight: '700' }}>
              <Filter size={14} />
              Viewing: {groupFilter.groupName}
              <button onClick={() => navigate('/admin/programs', { replace: true, state: null })} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}>
                <X size={14} />
              </button>
            </div>
          )}
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
              {/* Decorative gradient */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${stat.color}, transparent)`, opacity: 0.4 }} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'feed' && (
          <motion.div key="feed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 16px' }} />
                Loading activities...
              </div>
            ) : activities.length === 0 && attendanceRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                <Activity size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>No activities recorded yet.</p>
                <p style={{ fontSize: '0.875rem' }}>Activities will appear here as leaders take attendance and log study progress.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {activities.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-on-surface">Recent Study Sessions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                      {activities.map((a, i) => (
                        <motion.div
                          key={a.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                        >
                          <Card style={{ padding: '0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            {/* Top color bar */}
                            <div style={{ height: '5px', background: 'linear-gradient(90deg, #10b981, #059669)' }} />
                            
                            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                              {/* Header row */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ 
                                  padding: '5px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em',
                                  background: 'rgba(16, 185, 129, 0.12)',
                                  color: '#10b981'
                                }}>
                                  📖 Study
                                </div>
                                <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={11} /> {new Date(a.created_at).toLocaleDateString()}
                                </span>
                              </div>

                              {/* Title */}
                              <h4 style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '8px', color: 'var(--text)', lineHeight: '1.3' }}>
                                Bible Study Session
                              </h4>

                              {/* Group name */}
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', marginBottom: '16px' }}>
                                <MapPin size={13} style={{ opacity: 0.6 }} /> {a.groups?.name || 'Unknown Group'}
                              </p>

                              {/* Detail */}
                              <div style={{ flex: 1, marginBottom: '16px' }}>
                                {a.detail && (
                                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid #10b981', fontSize: '0.825rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: '1.5' }}>
                                    {a.detail}
                                  </div>
                                )}
                              </div>

                              {/* Footer */}
                              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ 
                                  width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '0.65rem', fontWeight: 'bold',
                                  background: 'rgba(16, 185, 129, 0.2)',
                                  color: '#10b981'
                                }}>
                                  {(a.profiles?.name || 'S').charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: '600', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {a.profiles?.name || 'System'}
                                </span>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {attendanceRecords.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-on-surface">Recent Attendance</h3>
                    <div className="bg-surface rounded-2xl p-6 border border-outline-variant/20 shadow-sm">
                      <AttendanceHistory history={attendanceRecords} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
