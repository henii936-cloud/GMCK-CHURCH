import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Mail, Lock, 
  ArrowRight, ChevronLeft, Users, 
  Zap, CheckCircle2, User, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Card, Input } from '../../components/common/UI';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();
  const initialRole = location.state?.role || 'bible_leader';
  
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const roles = [
    { 
      id: 'admin', 
      name: 'Administrator', 
      icon: ShieldCheck, 
      color: '#6366f1', 
      desc: 'Oversee all church activities and group performance.' 
    },
    { 
      id: 'bible_leader', 
      name: 'Bible Study Leader', 
      icon: Users, 
      color: '#10b981', 
      desc: 'Manage your study group and track member engagement.' 
    }
  ];

  useEffect(() => {
    if (role === 'bible_leader') {
      fetchAvailableGroups();
    }
  }, [role]);

  const fetchAvailableGroups = async () => {
    const { data, error } = await supabase
      .from('bible_study_groups')
      .select('*')
      .is('leader_id', null);
    
    if (!error) setGroups(data);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    if (role === 'bible_leader' && !groupId) {
      setError("Please select a Bible study group to lead.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await signup(email, password, name, role);
      
      if (role === 'bible_leader' && data.user) {
        // Assign leader to group
        const { error: groupError } = await supabase
          .from('bible_study_groups')
          .update({ leader_id: data.user.id })
          .eq('id', groupId);
        
        if (groupError) throw groupError;
      }
      
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      console.error("Signup error:", err.message);
      setError(err.message || "An error occurred during account creation.");
    } finally {
      setLoading(false);
    }
  };

  const activeRole = roles.find(r => r.id === role) || roles[1];

  if (success) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: 'var(--bg)', padding: '20px' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card style={{ maxWidth: '500px', textAlign: 'center', padding: '48px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'grid', placeItems: 'center', margin: '0 auto 24px' }}>
              <CheckCircle2 size={48} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '16px' }}>Account Created!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
              Welcome to the Church ERP System. Redirecting to login...
            </p>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'minmax(300px, 450px) 1fr', 
      minHeight: '100vh', 
      background: 'var(--bg)',
      color: 'white'
    }}>
      {/* Sidebar Info */}
      <div style={{ 
        background: `linear-gradient(135deg, ${activeRole.color}22 0%, ${activeRole.color}00 100%)`, 
        padding: '60px 40px',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{ marginBottom: '40px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
            <ChevronLeft size={20} /> Home Page
          </Link>
        </div>
        
        <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: '1.2', marginBottom: '24px' }}>
          Join the <br /><span style={{ color: activeRole.color }}>{activeRole.name}</span> Team
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          {activeRole.desc}
        </p>
        
        <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
            <Zap size={20} color={activeRole.color} />
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Access granted to {activeRole.name} special features.</span>
          </div>
        </div>
      </div>

      {/* Main Form Area */}
      <div style={{ padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          key={role}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ width: '100%', maxWidth: '500px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
              {roles.map(r => (
                <button 
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  style={{ 
                    padding: '12px 24px', 
                    borderRadius: '12px', 
                    border: '1px solid',
                    borderColor: role === r.id ? r.color : 'var(--border)',
                    background: role === r.id ? `${r.color}11` : 'transparent',
                    color: role === r.id ? r.color : 'var(--text-muted)',
                    fontWeight: '700',
                    transition: '0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    width: '120px'
                  }}
                >
                  <r.icon size={20} />
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>{r.id.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Establish Your Identity</h2>
            <p style={{ color: 'var(--text-muted)' }}>Complete the registration to activate your church credentials.</p>
          </div>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Input label="Full Display Name" placeholder="e.g. Samuel Adekunle" value={name} onChange={e => setName(e.target.value)} required icon={User} />
            <Input label="Official Email Address" type="email" placeholder="samuel@church.org" value={email} onChange={e => setEmail(e.target.value)} required icon={Mail} />
            <Input label="Secure Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required icon={Lock} />

            {role === 'bible_leader' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} /> Select Bible Study Group
                </label>
                <select 
                  value={groupId} 
                  onChange={e => setGroupId(e.target.value)}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    borderRadius: '12px', 
                    background: 'var(--surface)', 
                    border: '1px solid var(--border)', 
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                >
                  <option value="">-- Choose a Group --</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                {groups.length === 0 && (
                  <p style={{ fontSize: '0.75rem', color: '#f59e0b' }}>No available groups. Please contact Admin to create one.</p>
                )}
              </div>
            )}

            {error && (
              <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.875rem', fontWeight: '600', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} style={{ height: '56px', background: activeRole.color, boxShadow: `0 8px 16px ${activeRole.color}22` }}>
              Sign Up <ArrowRight size={20} style={{ marginLeft: '12px' }} />
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Already part of the ecosystem? <Link to="/login" style={{ color: activeRole.color, fontWeight: '700', textDecoration: 'none' }}>Sign In here</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}