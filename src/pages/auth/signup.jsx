import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, UserPlus, Mail, Lock, 
  ArrowRight, ChevronLeft, Users, DollarSign, 
  Zap, CheckCircle2, Loader2, Sparkles, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Input } from '../../components/common/UI';
import { supabase } from '../../services/supabaseClient';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialRole = location.state?.role || 'bible_leader';
  
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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
    },
    { 
      id: 'finance', 
      name: 'Finance Officer', 
      icon: DollarSign, 
      color: '#f59e0b', 
      desc: 'Record giving, tithes, and manage church budgets.' 
    }
  ];

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return; // 🚫 Prevent duplicate concurrent calls
    
    setLoading(true);
    setError(null);

    try {
      console.log("Attempting signup with:", email, password, name, role); // Point 5: Wrong Credentials / Case Issues
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });

      if (signupError) {
        console.error("Signup error:", signupError.message); // Point 2: Handle Errors
        alert(signupError.message); // Point 2: Handle Errors
        throw signupError;
      }
      
      console.log("Signup success:", data);
      // Redirect to Home page as requested
      navigate("/");
    } catch (err) {
      console.error("Signup error:", err.message);
      setError(err.message || "An error occurred during account creation.");
    } finally {
      setLoading(false);
    }
  };

  const activeRole = roles.find(r => r.id === role);

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
              Welcome to the GMKC Church Management System. Please check your email for a verification link to activate your portal.
            </p>
            <Link to="/login" style={{ width: '100%', textDecoration: 'none' }}>
              <Button style={{ width: '100%', height: '56px' }}>Proceed to Login</Button>
            </Link>
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
          {activeRole.desc} GMKC Church empowers its people through modern leadership tools.
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
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>{r.id}</span>
                </button>
              ))}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Establish Your Identity</h2>
            <p style={{ color: 'var(--text-muted)' }}>Complete the registration to activate your church credentials.</p>
          </div>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Input label="Full Display Name" placeholder="e.g. Samuel Adekunle" value={name} onChange={e => setName(e.target.value)} required icon={User} />
            <Input label="Official Email Address" type="email" placeholder="samuel@gmkc-church.org" value={email} onChange={e => setEmail(e.target.value)} required icon={Mail} />
            <Input label="Secure Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required icon={Lock} />

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