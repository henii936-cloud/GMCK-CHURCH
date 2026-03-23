import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Mail, Lock, 
  ArrowRight, ChevronLeft, Users, 
  Zap, CheckCircle2, User, MapPin
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button, Card, Input } from '../../components/common/UI';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { groupService } from '../../services/api';

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
      color: 'text-indigo-500',
      bg: 'bg-indigo-500',
      border: 'border-indigo-500',
      bgLight: 'bg-indigo-500/10',
      shadow: 'shadow-indigo-500/20',
      gradient: 'from-indigo-500/20 to-transparent',
      desc: 'Oversee all church activities and group performance.' 
    },
    { 
      id: 'bible_leader', 
      name: 'Bible Study Leader', 
      icon: Users, 
      color: 'text-emerald-500',
      bg: 'bg-emerald-500',
      border: 'border-emerald-500',
      bgLight: 'bg-emerald-500/10',
      shadow: 'shadow-emerald-500/20',
      gradient: 'from-emerald-500/20 to-transparent',
      desc: 'Manage your study group and track member engagement.' 
    }
  ];

  useEffect(() => {
    if (role === 'bible_leader') {
      fetchAvailableGroups();
    }
  }, [role]);

  const fetchAvailableGroups = async () => {
    try {
      const data = await groupService.getGroups();
      // Only show groups that have no leaders assigned yet
      const unassignedGroups = data.filter(g => g.leaders.length === 0);
      setGroups(unassignedGroups);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const { user: newUser } = await signup(email, password, name, role);
      
      // If a group was selected, create the mapping
      if (role === 'bible_leader' && newUser?.id && groupId) {
        await groupService.assignLeader(groupId, newUser.id);
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
      <div className="grid place-items-center min-h-screen bg-background p-5">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="max-w-lg text-center p-12">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 grid place-items-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-extrabold mb-4">Account Created!</h2>
            <p className="text-muted-foreground mb-8">
              Welcome to the Church ERP System. Redirecting to login...
            </p>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(300px,450px)_1fr] min-h-screen bg-background text-foreground">
      {/* Sidebar Info */}
      <div className={`bg-gradient-to-br ${activeRole.gradient} p-10 md:p-16 border-r border-border flex flex-col justify-center`}>
        <div className="mb-10">
          <Link to="/" className="text-muted-foreground flex items-center gap-2 font-bold hover:text-foreground transition-colors">
            <ChevronLeft size={20} /> Home Page
          </Link>
        </div>
        
        <h1 className="text-5xl font-black tracking-tighter leading-tight mb-6">
          Join the <br /><span className={activeRole.color}>{activeRole.name}</span> Team
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {activeRole.desc}
        </p>
        
        <div className="mt-auto pt-10">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-border">
            <Zap size={20} className={activeRole.color} />
            <span className="text-sm font-semibold">Access granted to {activeRole.name} special features.</span>
          </div>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="p-10 md:p-16 flex flex-col items-center justify-center">
        <motion.div 
          key={role}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-lg"
        >
          <div className="text-center mb-10">
            <div className="flex justify-center gap-4 mb-8">
              {roles.map(r => (
                <button 
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`px-6 py-3 rounded-xl border font-bold transition-all duration-300 flex flex-col items-center gap-1 w-32
                    ${role === r.id ? `${r.border} ${r.bgLight} ${r.color}` : 'border-border bg-transparent text-muted-foreground hover:border-primary/50'}`}
                >
                  <r.icon size={20} />
                  <span className="text-[11px] uppercase tracking-wider">{r.id.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
            <h2 className="text-2xl font-extrabold mb-2">Establish Your Identity</h2>
            <p className="text-muted-foreground">Complete the registration to activate your church credentials.</p>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-6">
            <Input label="Full Display Name" placeholder="e.g. Samuel Adekunle" value={name} onChange={e => setName(e.target.value)} required icon={User} />
            <Input label="Official Email Address" type="email" placeholder="samuel@church.org" value={email} onChange={e => setEmail(e.target.value)} required icon={Mail} />
            <Input label="Secure Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required icon={Lock} />

            {role === 'bible_leader' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <MapPin size={16} /> Select Bible Study Group
                </label>
                <select 
                  value={groupId} 
                  onChange={e => setGroupId(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground text-base outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 1rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.25rem'
                  }}
                >
                  <option value="">-- Choose a Group --</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.group_name}</option>
                  ))}
                </select>
                {groups.length === 0 && (
                  <p className="text-xs text-amber-500 font-medium">No groups available. Contact Admin to create one.</p>
                )}
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold border border-destructive/20">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className={`h-14 ${activeRole.bg} hover:opacity-90 text-white border-none shadow-lg ${activeRole.shadow}`}>
              Sign Up <ArrowRight size={20} className="ml-3" />
            </Button>
          </form>

          <p className="text-center mt-8 text-muted-foreground text-sm">
            Already part of the ecosystem? <Link to="/login" className={`${activeRole.color} font-bold hover:underline`}>Sign In here</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}