import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Users, BookOpen, DollarSign, ArrowRight, Heart, Sparkles, Shield, Zap, Globe, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/common/UI';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="grid place-items-center min-h-screen bg-[#0f172a] text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 text-center shadow-2xl"
      >
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Awakening the CMS...
        </h2>
      </motion.div>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${scrolled ? 'py-4' : 'py-6'}`}>
        <div className="container mx-auto px-6 h-full">
          <div className={`relative px-6 h-16 rounded-2xl flex items-center justify-between transition-all duration-500 ${scrolled ? 'bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-lg' : 'bg-transparent'}`}>
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: 15 }}
                className="w-10 h-10 rounded-xl bg-indigo-600 grid place-items-center shadow-lg shadow-indigo-600/20"
              >
                <Layers size={22} className="text-white" />
              </motion.div>
              <h2 className="text-xl font-bold tracking-tight text-white">GMKC<span className="text-indigo-400">CHURCH</span></h2>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/about" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Vision</Link>
              <Link to="/mission" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Mission</Link>
              <Link to="/community" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Groups</Link>
              <div className="h-4 w-[1px] bg-white/10"></div>
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-semibold text-white/80 hover:text-white">Sign In</Link>
                <Link to="/signup">
                  <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-2 text-sm shadow-lg shadow-indigo-600/20 border-none h-auto">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>

            <button 
              className="md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-6 top-24 z-[90] p-6 rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 md:hidden flex flex-col gap-4"
          >
            <Link to="/login/admin" className="p-3 font-medium hover:bg-white/5 rounded-xl">Admin Portal</Link>
            <Link to="/login/leader" className="p-3 font-medium hover:bg-white/5 rounded-xl">Leader Portal</Link>
            <Link to="/login/finance" className="p-3 font-medium hover:bg-white/5 rounded-xl">Finance Portal</Link>
            <div className="h-[1px] bg-white/10"></div>
            <Link to="/signup">
              <Button className="w-full bg-indigo-600 py-4 h-auto">Join Our Community</Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1544427928-c49cddee6eac?q=80&w=2000&auto=format&fit=crop" 
            alt="Church Community Praying" 
            className="w-full h-full object-cover opacity-20 filter grayscale-[20%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]"></div>
          <div className="absolute inset-0 bg-radial-[at_center_center] from-transparent via-[#020617]/40 to-[#020617]"></div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold text-xs mb-8 uppercase tracking-widest">
            <Sparkles size={14} className="animate-pulse" /> Unified Spiritual Management
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black tracking-tight leading-[0.95] mb-8 text-white">
            Lead Your <br />
            <span className="inline-block text-indigo-500 italic">Faith</span> Community.
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-400 mb-12 leading-relaxed max-w-2xl mx-auto font-light">
            A minimalist, powerful ecosystem for modern church administration. Transform how you lead, study, and grow together.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button className="px-10 py-7 text-lg h-auto rounded-2xl bg-indigo-600 hover:bg-indigo-500 group shadow-2xl shadow-indigo-600/20">
                Launch Platform <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="px-10 py-7 text-lg h-auto rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md">
                Admin Console
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating Icons for dynamism */}
        <motion.div 
          animate={{ y: [0, -20, 0] }} 
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-[15%] hidden lg:block opacity-20 pointer-events-none"
        >
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
            <Heart size={32} />
          </div>
        </motion.div>
        <motion.div 
          animate={{ y: [0, 20, 0] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-[15%] hidden lg:block opacity-20 pointer-events-none"
        >
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500">
            <Globe size={32} />
          </div>
        </motion.div>
      </section>

      {/* Access Grid - Redesigned */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Select Your Portal</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Tailored interfaces for every aspect of church governance and community life.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { id: 'admin', name: 'Master Admin', icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-500/10', glow: 'shadow-indigo-500/10', border: 'border-indigo-500/20', path: '/login/admin', desc: 'Manage users, roles, and global church settings.' },
              { id: 'bible_leader', name: 'Bible Leader', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/10', border: 'border-emerald-500/20', path: '/login/leader', desc: 'Lead groups, track studies, and nurture members.' },
              { id: 'finance', name: 'Financial Office', icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/10', border: 'border-amber-500/20', path: '/login/finance', desc: 'Secure budget tracking and financial oversight.' }
            ].map((r, i) => (
              <motion.div 
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className={`relative p-8 rounded-[2.5rem] bg-slate-900/40 backdrop-blur-md border ${r.border} overflow-hidden group`}
              >
                <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full ${r.color === 'text-indigo-400' ? 'bg-indigo-500/5' : r.color === 'text-emerald-400' ? 'bg-emerald-500/5' : 'bg-amber-500/5'} blur-2xl transition-all group-hover:scale-150`}></div>
                
                <div className={`w-14 h-14 rounded-2xl ${r.bg} ${r.color} flex items-center justify-center mb-8 relative z-10`}>
                  <r.icon size={28} />
                </div>
                
                <h3 className="text-2xl font-bold mb-3 relative z-10">{r.name}</h3>
                <p className="text-slate-400 mb-8 relative z-10 text-sm leading-relaxed">{r.desc}</p>
                
                <div className="flex flex-col gap-3 relative z-10">
                  <Link to={r.path} className="w-full">
                    <Button className={`w-full py-6 h-auto rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-lg ${r.glow}`}>
                      Enter Portal
                    </Button>
                  </Link>
                  <Link to="/signup" state={{ role: r.id }} className="w-full">
                    <Button variant="outline" className="w-full py-6 h-auto rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white">
                      Create Role
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section - Clean & Modern */}
      <section className="py-24 px-6 bg-slate-900/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center text-left">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Advanced Tools for a <br />Dynamic Community.</h2>
              <div className="space-y-8">
                {[
                  { icon: Zap, title: "Real-time Sync", desc: "Instant updates across all leader devices during bible study sessions." },
                  { icon: Shield, title: "Vault-grade Security", desc: "Your congregation's data and finances are protected with top-tier encryption." },
                  { icon: BookOpen, title: "Smart Curriculum", desc: "Organize lessons and tracks development with automated logging." }
                ].map((f, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="flex gap-6 items-start"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center shrink-0">
                      <f.icon className="text-indigo-400" size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{f.title}</h4>
                      <p className="text-slate-400 text-sm">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[3rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center p-12 overflow-hidden shadow-2xl shadow-indigo-600/5">
                <div className="grid grid-cols-2 gap-4 w-full h-full opacity-60">
                   <div className="bg-indigo-500/20 rounded-3xl animate-pulse"></div>
                   <div className="bg-purple-500/20 rounded-3xl animate-pulse delay-75"></div>
                   <div className="bg-blue-500/20 rounded-3xl animate-pulse delay-150"></div>
                   <div className="bg-pink-500/20 rounded-3xl animate-pulse delay-300"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full bg-indigo-600 blur-[80px] opacity-20"></div>
                  <Layers size={120} className="text-indigo-500/50 drop-shadow-2xl animate-bounce-slow" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <motion.div 
          className="container mx-auto max-w-4xl p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-indigo-800 text-center relative overflow-hidden shadow-2xl shadow-indigo-600/20"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900/40 blur-3xl rounded-full -ml-32 -mb-32"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Ready to Transform Your Church?</h2>
            <p className="text-indigo-100/80 mb-12 text-xl font-light">Join hundreds of leaders managing their community with precision and heart.</p>
            <Link to="/signup">
              <Button className="bg-white text-indigo-600 hover:bg-slate-100 rounded-2xl px-12 py-8 text-xl h-auto font-bold border-none shadow-xl">
                Get Started Now
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-slate-900/20">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 grid place-items-center">
                <Layers size={18} className="text-white" />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white">GMKC<span className="text-indigo-400">CHURCH</span></h2>
            </div>
            
            <div className="flex gap-12">
              <div className="flex flex-col gap-4">
                <h4 className="text-white font-bold text-sm">Product</h4>
                <Link to="#" className="text-slate-400 hover:text-indigo-400 text-sm">Features</Link>
                <Link to="#" className="text-slate-400 hover:text-indigo-400 text-sm">Security</Link>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="text-white font-bold text-sm">Community</h4>
                <Link to="#" className="text-slate-400 hover:text-indigo-400 text-sm">Events</Link>
                <Link to="#" className="text-slate-400 hover:text-indigo-400 text-sm">Training</Link>
              </div>
            </div>

            <div className="text-slate-500 text-sm">
              &copy; 2026 GMKC Church. All Rights Reserved.
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

