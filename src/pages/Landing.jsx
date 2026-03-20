import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Users, BookOpen, DollarSign, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { Button, Card } from '../components/common/UI';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      const rolePath = {
        admin: "/admin",
        bible_leader: "/leader",
        finance: "/finance"
      };
      navigate(rolePath[user.role] || "/");
    }
  }, [user, loading, navigate]);

  if (loading) return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: 'var(--bg)', color: 'white' }}>
      <div style={{ padding: '24px', borderRadius: '16px', background: 'var(--surface)', backdropFilter: 'var(--glass)', border: '1px solid var(--border)', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px' }}>Preparing Your CMS...</h2>
        <div style={{ width: '48px', height: '48px', border: '3px solid var(--border)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="landing-page" style={{ background: 'var(--bg)', minHeight: '100vh', color: 'white' }}>
      {/* Navigation */}
      <nav style={{ 
        padding: '20px 40px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'rgba(30, 41, 59, 0.4)',
        backdropFilter: 'var(--glass)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
            <Layers size={24} color="white" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>GMKC Church</h2>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/login/admin" className="nav-link">Admin</Link>
            <Link to="/login/leader" className="nav-link">Leader</Link>
            <Link to="/login/finance" className="nav-link">Finance</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        padding: '100px 40px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%)'
      }}>
        <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 20px', 
            borderRadius: '999px', 
            background: 'rgba(99, 102, 241, 0.1)',
            color: 'var(--primary)',
            fontWeight: '700',
            fontSize: '0.875rem',
            marginBottom: '32px',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <Sparkles size={16} /> Empowering Your Spiritual Community
          </div>

          <h1 style={{ fontSize: '4.5rem', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: '1.1', marginBottom: '32px' }}>
            The Modern Pulse of <br /><span style={{ 
              background: 'linear-gradient(90deg, #6366f1, #ec4899)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent' 
            }}>GMKC Church Management</span>
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '48px', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto 48px' }}>
            A unified ecosystem for bible studies, financial governance, and leadership activities. Designed to grow with your faith.
          </p>

          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link to="/login">
              <Button style={{ padding: '16px 40px', fontSize: '1.1rem' }}>Access Portal <ArrowRight size={20} style={{ marginLeft: '12px' }} /></Button>
            </Link>
            <Link to="/signup">
              <Button variant="secondary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>Create Account</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Role Access Grid */}
      <section style={{ padding: '20px 40px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { id: 'admin', name: 'Admin', icon: Layers, color: '#6366f1', loginPath: '/login/admin' },
            { id: 'bible_leader', name: 'Leader', icon: Users, color: '#10b981', loginPath: '/login/leader' },
            { id: 'finance', name: 'Finance', icon: DollarSign, color: '#f59e0b', loginPath: '/login/finance' }
          ].map((r) => (
            <div key={r.id} style={{ 
              padding: '32px', 
              borderRadius: '24px', 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid var(--border)', 
              textAlign: 'center',
              transition: '0.3s',
            }} className="role-card">
              <div style={{ width: 56, height: 56, borderRadius: 16, background: r.color, display: 'grid', placeItems: 'center', margin: '0 auto 20px', boxShadow: `0 8px 16px ${r.color}33` }}>
                <r.icon color="white" size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px', color: 'white' }}>{r.name} Portal</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>Access your {r.name.toLowerCase()} tools and management.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to={r.loginPath} style={{ textDecoration: 'none' }}>
                  <Button style={{ width: '100%', background: r.color }}>Sign In as {r.name}</Button>
                </Link>
                <Link to="/signup" state={{ role: r.id }} style={{ textDecoration: 'none' }}>
                  <Button variant="secondary" style={{ width: '100%', borderColor: r.color, color: r.color }}>Sign Up as {r.name}</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ padding: '80px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
          <Card icon={Users} title="Community Hub" subtitle="Member & Group Management">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Organize your congregation with ease. Assign leaders and track spiritual growth in one click.</p>
          </Card>
          <Card icon={BookOpen} title="Study Insights" subtitle="Bible Study Progress Tracking">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Log topics, verses, and key themes. Admins see real-time updates from every group leader.</p>
          </Card>
          <Card icon={DollarSign} title="Finance Protocol" subtitle="Secure Giving & Budgeting">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Tithe and offering logs with professional-grade security and full budget transparency.</p>
          </Card>
        </div>
      </section>

      <footer style={{ padding: '40px', textAlign: 'center', borderTop: '1px solid var(--border)', marginTop: '100px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        &copy; 2026 GMKC Church. All Rights Reserved. Built with Antigravity.
      </footer>

      <style>{`
        .nav-link { 
          text-decoration: none; 
          font-weight: 600; 
          color: var(--text-muted); 
          transition: 0.2s; 
        }
        .nav-link:hover { color: white; }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .role-card:hover { 
          border-color: var(--primary) !important;
          background: rgba(255,255,255,0.05) !important;
          transform: translateY(-8px);
        }
      `}</style>
    </div>
  );
}
