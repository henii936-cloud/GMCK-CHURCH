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
    <div className="grid place-items-center min-h-screen bg-background text-foreground">
      <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-md border border-border text-center">
        <h2 className="mb-4 text-xl font-semibold">Preparing Your CMS...</h2>
        <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 md:px-10 bg-slate-900/40 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary grid place-items-center">
            <Layers size={24} className="text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">GMKC Church</h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-4">
            <Link to="/login/admin" className="font-semibold text-muted-foreground hover:text-foreground transition-colors">Admin</Link>
            <Link to="/login/leader" className="font-semibold text-muted-foreground hover:text-foreground transition-colors">Leader</Link>
            <Link to="/login/finance" className="font-semibold text-muted-foreground hover:text-foreground transition-colors">Finance</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-24 md:px-10 flex flex-col items-center text-center bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0%,transparent_70%)]">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-500/10 text-indigo-400 font-bold text-sm mb-8 border border-indigo-500/20">
            <Sparkles size={16} /> Empowering Your Spiritual Community
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-8">
            The Modern Pulse of <br />
            <span className="bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
              GMKC Church Management
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
            A unified ecosystem for bible studies, financial governance, and leadership activities. Designed to grow with your faith.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link to="/login">
              <Button className="px-10 py-6 text-lg h-auto">
                Access Portal <ArrowRight size={20} className="ml-3" />
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" className="px-10 py-6 text-lg h-auto">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Role Access Grid */}
      <section className="px-6 py-10 pb-20 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { id: 'admin', name: 'Admin', icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-500', shadow: 'shadow-indigo-500/20', border: 'border-indigo-500', hoverBg: 'hover:bg-indigo-500/10', loginPath: '/login/admin' },
            { id: 'bible_leader', name: 'Leader', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/20', border: 'border-emerald-500', hoverBg: 'hover:bg-emerald-500/10', loginPath: '/login/leader' },
            { id: 'finance', name: 'Finance', icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-500', shadow: 'shadow-amber-500/20', border: 'border-amber-500', hoverBg: 'hover:bg-amber-500/10', loginPath: '/login/finance' }
          ].map((r) => (
            <div key={r.id} className="p-8 rounded-3xl bg-white/5 border border-border text-center transition-all duration-300 hover:border-primary hover:bg-white/10 hover:-translate-y-2 group">
              <div className={`w-14 h-14 rounded-2xl ${r.bg} grid place-items-center mx-auto mb-5 shadow-lg ${r.shadow}`}>
                <r.icon className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-extrabold mb-2 text-foreground">{r.name} Portal</h3>
              <p className="text-muted-foreground text-sm mb-6">Access your {r.name.toLowerCase()} tools and management.</p>
              
              <div className="flex flex-col gap-3">
                <Link to={r.loginPath} className="w-full">
                  <Button className={`w-full ${r.bg} hover:opacity-90 text-white border-none`}>Sign In as {r.name}</Button>
                </Link>
                <Link to="/signup" state={{ role: r.id }} className="w-full">
                  <Button variant="outline" className={`w-full ${r.border} ${r.color} ${r.hoverBg}`}>Sign Up as {r.name}</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 py-20 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card icon={Users} title="Community Hub" subtitle="Member & Group Management">
            <p className="text-muted-foreground text-sm">Organize your congregation with ease. Assign leaders and track spiritual growth in one click.</p>
          </Card>
          <Card icon={BookOpen} title="Study Insights" subtitle="Bible Study Progress Tracking">
            <p className="text-muted-foreground text-sm">Log topics, verses, and key themes. Admins see real-time updates from every group leader.</p>
          </Card>
          <Card icon={DollarSign} title="Finance Protocol" subtitle="Secure Giving & Budgeting">
            <p className="text-muted-foreground text-sm">Tithe and offering logs with professional-grade security and full budget transparency.</p>
          </Card>
        </div>
      </section>

      <footer className="p-10 text-center border-t border-border mt-24 text-muted-foreground text-sm">
        &copy; 2026 GMKC Church. All Rights Reserved. Built with Antigravity.
      </footer>
    </div>
  );
}
