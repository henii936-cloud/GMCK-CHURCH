import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { activityService } from "../../services/api";
import { Card, Button, Input } from "../../components/common/UI";
import { 
  Activity, MapPin, BookOpen, ClipboardList, Clock, Users,
  Calendar, Plus, CalendarDays, Zap, TrendingUp,
  Music, Mic2, Star, Filter, X, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Programs() {
  const location = useLocation();
  const navigate = useNavigate();
  const groupFilter = location.state || null;
  
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("feed");
  const [showPlannerModal, setShowPlannerModal] = useState(false);

  const [newPlan, setNewPlan] = useState({
    type: "Sunday Service", date: "", time: "",
    preacher: "", worshipLeader: "", theme: "", program: "Weekly"
  });

  const [programPlans, setProgramPlans] = useState([
    { id: 1, type: "Sunday Service", date: "2026-03-22", time: "10:00 AM", preacher: "Rev. Samuel Johnson", worshipLeader: "Sarah Miller & Team", theme: "The Grace of Giving", program: "Weekly" },
    { id: 2, type: "Tuesday Morning Program", date: "2026-03-24", time: "06:00 AM", preacher: "Pastor Daniel Okoro", worshipLeader: "David King", theme: "Morning Devotion", program: "Weekly" },
    { id: 3, type: "Wednesday Night Program", date: "2026-03-25", time: "07:00 PM", preacher: "Evang. Grace Temi", worshipLeader: "Instrumentalists Only", theme: "Warfare Prayers", program: "Weekly" }
  ]);

  useEffect(() => { load(); }, [groupFilter?.groupId]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await activityService.getActivities(groupFilter?.groupId || null);
      setActivities(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAddPlan = (e) => {
    e.preventDefault();
    setProgramPlans([{ ...newPlan, id: Date.now() }, ...programPlans]);
    setShowPlannerModal(false);
    setNewPlan({ type: "Sunday Service", date: "", time: "", preacher: "", worshipLeader: "", theme: "", program: "Weekly" });
  };

  const getServiceColor = (type) => {
    if (type.includes("Sunday")) return "#6366f1";
    if (type.includes("Tuesday")) return "#10b981";
    if (type.includes("Wednesday")) return "#f59e0b";
    return "#ec4899";
  };

  // Stats
  const totalActivities = activities.length;
  const studySessions = activities.filter(a => a.type === 'study').length;
  const attendanceRecords = activities.filter(a => a.type === 'attendance').length;
  const uniqueGroups = [...new Set(activities.map(a => a.group_id).filter(Boolean))].length;

  const statCards = [
    { label: "Total Activities", value: totalActivities, icon: Activity, color: "#6366f1", bg: "rgba(99, 102, 241, 0.1)" },
    { label: "Study Sessions", value: studySessions, icon: BookOpen, color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
    { label: "Attendance Logs", value: attendanceRecords, icon: ClipboardList, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
    { label: "Active Groups", value: uniqueGroups, icon: Users, color: "#ec4899", bg: "rgba(236, 72, 153, 0.1)" },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.025em' }}>Church <span style={{ color: 'var(--primary)' }}>Programs</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500' }}>Real-time logs and strategic program planning</p>
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
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '6px' }}>
          <button onClick={() => setActiveTab("feed")} style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '700', background: activeTab === 'feed' ? 'var(--primary)' : 'transparent', color: activeTab === 'feed' ? 'white' : 'var(--text-muted)', transition: '0.3s', border: 'none', cursor: 'pointer' }}>
            Activity Feed
          </button>
          <button onClick={() => setActiveTab("planner")} style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '700', background: activeTab === 'planner' ? 'var(--primary)' : 'transparent', color: activeTab === 'planner' ? 'white' : 'var(--text-muted)', transition: '0.3s', border: 'none', cursor: 'pointer' }}>
            Program Planner
          </button>
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
            ) : activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                <Activity size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>No activities recorded yet.</p>
                <p style={{ fontSize: '0.875rem' }}>Activities will appear here as leaders take attendance and log study progress.</p>
              </div>
            ) : (
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
                      <div style={{ height: '5px', background: a.type === 'study' ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #6366f1, #4f46e5)' }} />
                      
                      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Header row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <div style={{ 
                            padding: '5px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em',
                            background: a.type === 'study' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                            color: a.type === 'study' ? '#10b981' : '#6366f1'
                          }}>
                            {a.type === 'study' ? '📖 Study' : '📋 Attendance'}
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} /> {new Date(a.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '8px', color: 'var(--text)', lineHeight: '1.3' }}>
                          {a.type === 'study' ? 'Bible Study Session' : 'Attendance Recorded'}
                        </h4>

                        {/* Group name */}
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', marginBottom: '16px' }}>
                          <MapPin size={13} style={{ opacity: 0.6 }} /> {a.groups?.name || 'Unknown Group'}
                        </p>

                        {/* Detail */}
                        <div style={{ flex: 1, marginBottom: '16px' }}>
                          {a.type === 'study' && a.detail ? (
                            <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid #10b981', fontSize: '0.825rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: '1.5' }}>
                              {a.detail}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Users size={13} /> Full group attendance recorded
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '0.65rem', fontWeight: 'bold',
                            background: a.type === 'study' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                            color: a.type === 'study' ? '#10b981' : '#6366f1'
                          }}>
                            {(a.profiles?.name || 'A').charAt(0).toUpperCase()}
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
            )}
          </motion.div>
        )}

        {activeTab === 'planner' && (
          <motion.div key="planner" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <Button icon={Plus} style={{ flex: 1 }} onClick={() => setShowPlannerModal(true)}>Schedule New Program</Button>
              <Button variant="secondary" icon={CalendarDays} style={{ flex: 1 }}>View Monthly Calendar</Button>
              <Button variant="secondary" icon={Star} style={{ flex: 1 }}>Yearly Outlook</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
              {programPlans.map((plan, i) => (
                <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card style={{ padding: '0', overflow: 'hidden', borderLeft: `6px solid ${getServiceColor(plan.type)}` }}>
                    <div style={{ padding: '28px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ padding: '5px 12px', borderRadius: '8px', background: `${getServiceColor(plan.type)}22`, color: getServiceColor(plan.type), fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
                          {plan.type}
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600' }}>{plan.program}</span>
                      </div>

                      <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '16px' }}>"{plan.theme || 'Untitled Program'}"</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center' }}>
                            <Mic2 size={18} color="var(--primary)" />
                          </div>
                          <div>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Preacher</p>
                            <p style={{ fontWeight: '700', fontSize: '1rem' }}>{plan.preacher || 'TBA'}</p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center' }}>
                            <Music size={18} color="#ec4899" />
                          </div>
                          <div>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Worship Leader</p>
                            <p style={{ fontWeight: '700', fontSize: '1rem' }}>{plan.worshipLeader || 'TBA'}</p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center' }}>
                            <Calendar size={18} color="var(--text-muted)" />
                          </div>
                          <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{plan.date ? new Date(plan.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Set Date'} @ {plan.time || 'Set Time'}</p>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 28px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                      <button style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer' }}><Zap size={14} /> Edit</button>
                      <button style={{ color: '#ef4444', fontSize: '0.825rem', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>Postpone</button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Planner Modal */}
      {showPlannerModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '40px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '24px' }}>Strategic <span style={{ color: 'var(--primary)' }}>Planner</span></h2>
            <form onSubmit={handleAddPlan} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <Input label="Program Theme" placeholder="e.g. Divine Restoration" value={newPlan.theme} onChange={e => setNewPlan({...newPlan, theme: e.target.value})} required />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)' }}>Service Category</label>
                <select className="input-field" value={newPlan.type} onChange={e => setNewPlan({...newPlan, type: e.target.value})}>
                  <option>Sunday Service</option>
                  <option>Tuesday Morning Program</option>
                  <option>Wednesday Night Program</option>
                  <option>Special Event</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)' }}>Cycle</label>
                <select className="input-field" value={newPlan.program} onChange={e => setNewPlan({...newPlan, program: e.target.value})}>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Annual</option>
                </select>
              </div>
              <Input label="Preacher" placeholder="Enter name" value={newPlan.preacher} onChange={e => setNewPlan({...newPlan, preacher: e.target.value})} />
              <Input label="Worship Leader" placeholder="Enter name" value={newPlan.worshipLeader} onChange={e => setNewPlan({...newPlan, worshipLeader: e.target.value})} />
              <Input type="date" label="Date" value={newPlan.date} onChange={e => setNewPlan({...newPlan, date: e.target.value})} />
              <Input type="time" label="Start Time" value={newPlan.time} onChange={e => setNewPlan({...newPlan, time: e.target.value})} />
              
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '12px' }}>
                <Button type="submit" style={{ flex: 1 }}>Publish Program</Button>
                <Button variant="secondary" onClick={() => setShowPlannerModal(false)}>Cancel</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
