import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, Mail, Lock, 
  ArrowRight, ChevronLeft, Users, 
  Zap, CheckCircle2, User, MapPin, DollarSign
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
      color: 'text-primary',
      bg: 'bg-primary',
      border: 'border-primary',
      bgLight: 'bg-primary/5',
      shadow: 'shadow-primary/10',
      gradient: 'from-primary/10 to-transparent',
      desc: 'Oversee all church activities and group performance with editorial precision.' 
    },
    { 
      id: 'bible_leader', 
      name: 'Bible Study Leader', 
      icon: Users, 
      color: 'text-tertiary-fixed-dim',
      bg: 'bg-tertiary-fixed-dim',
      border: 'border-tertiary-fixed-dim',
      bgLight: 'bg-tertiary-fixed-dim/10',
      shadow: 'shadow-tertiary-fixed-dim/20',
      gradient: 'from-tertiary-fixed-dim/20 to-transparent',
      desc: 'Nurture your study group and track member engagement in a digital sanctuary.' 
    },
    { 
      id: 'finance', 
      name: 'Finance Officer', 
      icon: DollarSign, 
      color: 'text-primary',
      bg: 'bg-primary',
      border: 'border-primary',
      bgLight: 'bg-primary/5',
      shadow: 'shadow-primary/10',
      gradient: 'from-primary/10 to-transparent',
      desc: 'Manage church resources with transparency and stewardship.' 
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
      <div className="grid place-items-center min-h-screen bg-surface p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="max-w-lg text-center p-16 shadow-whisper bg-surface-container">
            <div className="w-24 h-24 rounded-[3rem] bg-primary/5 text-primary grid place-items-center mx-auto mb-8">
              <CheckCircle2 size={56} />
            </div>
            <h2 className="display-sm text-primary mb-4">Account Created</h2>
            <p className="label-sm opacity-60 uppercase tracking-widest">
              Welcome to the sanctuary. Redirecting to login...
            </p>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(350px,500px)_1fr] min-h-screen bg-surface text-primary">
      {/* Sidebar Info */}
      <div className={`bg-gradient-to-br ${activeRole.gradient} p-12 md:p-20 border-r border-primary/5 flex flex-col justify-center relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full bg-primary blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 rounded-full bg-tertiary-fixed-dim blur-[100px]" />
        </div>

        <div className="mb-16 relative z-10">
          <Link to="/" className="text-primary/40 flex items-center gap-3 font-black uppercase tracking-[0.2em] text-[11px] hover:text-primary transition-colors">
            <ChevronLeft size={16} /> Home Sanctuary
          </Link>
        </div>
        
        <div className="relative z-10">
          <h1 className="display-lg text-primary mb-8 leading-[0.9]">
            Join the <br /><span className={activeRole.color}>{activeRole.name}</span> Team
          </h1>
          <p className="headline-sm opacity-60 leading-relaxed max-w-md">
            {activeRole.desc}
          </p>
        </div>
        
        <div className="mt-auto pt-16 relative z-10">
          <div className="flex items-center gap-4 p-6 rounded-3xl bg-surface-container-low border border-primary/5 shadow-whisper">
            <Zap size={24} className={activeRole.color} />
            <span className="label-sm font-black uppercase tracking-widest opacity-60">Access granted to {activeRole.name} special features.</span>
          </div>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="p-12 md:p-24 flex flex-col items-center justify-center bg-surface">
        <motion.div 
          key={role}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-xl"
        >
          <div className="text-center mb-16">
            <div className="flex justify-center flex-wrap gap-4 mb-12">
              {roles.map(r => (
                <button 
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`px-6 py-5 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all duration-500 flex flex-col items-center gap-3 w-[130px]
                    ${role === r.id ? `${r.border} ${r.bgLight} ${r.color} shadow-lg ${r.shadow}` : 'border-primary/5 bg-transparent text-primary/30 hover:border-primary/20'}`}
                >
                  <r.icon size={24} />
                  <span className="text-center leading-tight">{r.name.includes("Bible") ? "Study Leader" : r.name}</span>
                </button>
              ))}
            </div>
            <h2 className="display-sm text-primary mb-4">Establish Your Identity</h2>
            <p className="label-sm opacity-60 uppercase tracking-widest">Complete the registration to activate your credentials</p>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-8">
            <Input label="Full Display Name" placeholder="e.g. Samuel Adekunle" value={name} onChange={e => setName(e.target.value)} required icon={User} />
            <Input label="Official Email Address" type="email" placeholder="samuel@church.org" value={email} onChange={e => setEmail(e.target.value)} required icon={Mail} />
            <Input label="Secure Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required icon={Lock} />

            {role === 'bible_leader' && (
              <div className="space-y-3">
                <label className="label-sm font-black uppercase tracking-widest text-primary/60 flex items-center gap-2">
                  <MapPin size={16} /> Select Bible Study Group
                </label>
                <div className="relative group">
                  <select 
                    value={groupId} 
                    onChange={e => setGroupId(e.target.value)}
                    required
                    className="w-full h-14 rounded-xl bg-surface-container-low border-2 border-transparent focus:border-primary/20 focus:bg-surface px-6 py-4 text-sm text-primary outline-none transition-all duration-500 font-bold appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23002c53'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 1.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1rem'
                    }}
                  >
                    <option value="">-- Choose a Group --</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.group_name}</option>
                    ))}
                  </select>
                </div>
                {groups.length === 0 && (
                  <p className="text-[11px] text-amber-600 font-black uppercase tracking-widest">No groups available. Contact Admin.</p>
                )}
              </div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100 text-center"
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" loading={loading} className={`h-16 ${activeRole.bg} hover:opacity-90 text-on-primary border-none shadow-xl ${activeRole.shadow}`}>
              Sign Up <ArrowRight size={20} className="ml-3" />
            </Button>
          </form>

          <div className="mt-16 pt-12 border-t border-primary/5 text-center">
            <p className="text-primary/40 text-xs font-medium">
              Already part of the ecosystem? <Link to="/login" className="text-primary font-black uppercase tracking-widest hover:underline ml-2">Sign In here</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
