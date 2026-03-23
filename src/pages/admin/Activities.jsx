import { useEffect, useState } from "react";
import { activityService } from "../../services/api";
import { Card, Button, Input } from "../../components/common/UI";
import { 
  Activity, MapPin, User, BookOpen, ClipboardList, Clock, 
  ChevronRight, Calendar, Plus, CalendarDays, Zap, 
  Music, Mic2, Star, Filter, Heart 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("feed"); // 'feed' or 'planner'
  const [showPlannerModal, setShowPlannerModal] = useState(false);

  const [newPlan, setNewPlan] = useState({
    type: "Sunday Service",
    date: "",
    time: "",
    preacher: "",
    worshipLeader: "",
    theme: "",
    program: "Weekly"
  });

  const [programPlans, setProgramPlans] = useState([
    { 
      id: 1, 
      type: "Sunday Service", 
      date: "2026-03-22", 
      time: "10:00 AM", 
      preacher: "Rev. Samuel Johnson", 
      worshipLeader: "Sarah Miller & Team",
      theme: "The Grace of Giving",
      program: "Weekly"
    },
    { 
      id: 2, 
      type: "Tuesday Morning Program", 
      date: "2026-03-24", 
      time: "06:00 AM", 
      preacher: "Pastor Daniel Okoro", 
      worshipLeader: "David King",
      theme: "Morning Devotion",
      program: "Weekly"
    },
    { 
      id: 3, 
      type: "Wednesday Night Program", 
      date: "2026-03-25", 
      time: "07:00 PM", 
      preacher: "Evang. Grace Temi", 
      worshipLeader: "Instrumentalists Only",
      theme: "Warfare Prayers",
      program: "Weekly"
    }
  ]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await activityService.getActivities();
      setActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = (e) => {
    e.preventDefault();
    const plan = { ...newPlan, id: Date.now() };
    setProgramPlans([plan, ...programPlans]);
    setShowPlannerModal(false);
    setNewPlan({
      type: "Sunday Service",
      date: "",
      time: "",
      preacher: "",
      worshipLeader: "",
      theme: "",
      program: "Weekly"
    });
  };

  const getServiceColor = (type) => {
    if (type.includes("Sunday")) return "#6366f1";
    if (type.includes("Tuesday")) return "#10b981";
    if (type.includes("Wednesday")) return "#f59e0b";
    return "#ec4899";
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.025em' }}>Church <span style={{ color: 'var(--primary)' }}>Activities</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500' }}>Real-time logs and strategic program planning</p>
        </div>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '6px' }}>
          <button 
            onClick={() => setActiveTab("feed")}
            style={{ 
              padding: '8px 20px', 
              borderRadius: '8px', 
              fontSize: '0.875rem', 
              fontWeight: '700', 
              background: activeTab === 'feed' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'feed' ? 'white' : 'var(--text-muted)',
              transition: '0.3s'
            }}
          >
            Live Activity Feed
          </button>
          <button 
            onClick={() => setActiveTab("planner")}
            style={{ 
              padding: '8px 20px', 
              borderRadius: '8px', 
              fontSize: '0.875rem', 
              fontWeight: '700', 
              background: activeTab === 'planner' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'planner' ? 'white' : 'var(--text-muted)',
              transition: '0.3s'
            }}
          >
            Program Planner
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'feed' && (
          <motion.div 
            key="feed"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {activities.map((a) => (
              <Card key={a.id} style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ display: 'flex', minHeight: '120px' }}>
                  <div style={{ width: '6px', background: a.type === 'study' ? 'var(--tertiary)' : 'var(--primary)', opacity: 0.8 }} />
                  <div style={{ flex: 1, padding: '24px', display: 'grid', gridTemplateColumns: '1fr auto 1fr auto', alignItems: 'center', gap: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(255, 255, 255, 0.05)', display: 'grid', placeItems: 'center', border: '1px solid var(--border)' }}>
                        {a.type === 'study' ? <BookOpen size={24} color="var(--tertiary)" /> : <ClipboardList size={24} color="var(--primary)" />}
                      </div>
                      <div>
                        <h4 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '4px' }}>{a.type === 'study' ? 'Bible Study Session' : 'Attendance Taken'}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {a.groups?.name}</p>
                      </div>
                    </div>
                    <div style={{ width: '1px', height: '40px', background: 'var(--border)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', opacity: 0.8, display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>{a.profiles?.name?.charAt(0)}</div>
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{a.profiles?.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600' }}><Clock size={14} /> {new Date(a.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        {activeTab === 'planner' && (
          <motion.div 
            key="planner"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
              <Button icon={Plus} style={{ flex: 1 }} onClick={() => setShowPlannerModal(true)}>Schedule New Program</Button>
              <Button variant="secondary" icon={CalendarDays} style={{ flex: 1 }}>View Monthly Calendar</Button>
              <Button variant="secondary" icon={Star} style={{ flex: 1 }}>Yearly Outlook</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
              {programPlans.map((plan) => (
                <Card key={plan.id} style={{ padding: '0', overflow: 'hidden', borderLeft: `6px solid ${getServiceColor(plan.type)}` }}>
                  <div style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                      <div style={{ padding: '6px 12px', borderRadius: '8px', background: `${getServiceColor(plan.type)}22`, color: getServiceColor(plan.type), fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>
                        {plan.type}
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600' }}>{plan.program}</span>
                    </div>

                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '16px' }}>"{plan.theme || 'Untitled Program'}"</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center' }}>
                          <Mic2 size={20} color="var(--primary)" />
                        </div>
                        <div>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Preacher</p>
                          <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>{plan.preacher || 'TBA'}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center' }}>
                          <Music size={20} color="#ec4899" />
                        </div>
                        <div>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Worship Leader</p>
                          <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>{plan.worshipLeader || 'TBA'}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center' }}>
                          <Calendar size={20} color="var(--text-muted)" />
                        </div>
                        <p style={{ fontWeight: '600' }}>{plan.date ? new Date(plan.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Set Date'} @ {plan.time || 'Set Time'}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                    <button style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={16} /> Edit Details</button>
                    <button style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: '600' }}>Postpone</button>
                  </div>
                </Card>
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
