import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Layers, Users, BookOpen, DollarSign, ArrowRight, Heart, Sparkles, 
  Shield, Zap, Globe, Menu, X, Briefcase, Eye, ChevronRight, Baby 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/common/UI';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [showRoleSelector, setShowRoleSelector] = React.useState(false);

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
        finance: "/finance",
        management: "/management",
        youth_ministry: "/youth",
        shepherd: "/shepherd",
        kids_ministry: "/kids"
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
    <div className="min-h-screen bg-surface text-on-surface selection:bg-tertiary-fixed-dim/30 font-sans overflow-x-hidden">
      {/* Subtle Texture/Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-tertiary-fixed-dim/10 blur-[150px] rounded-full"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
        <div className="container mx-auto px-6 h-full">
          <div className={`relative px-8 h-20 rounded-2xl flex items-center justify-between transition-all duration-500 ${scrolled ? 'bg-surface/80 backdrop-blur-xl shadow-whisper border border-primary/5' : 'bg-transparent'}`}>
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 5 }}
                className="w-12 h-12 rounded-xl bg-primary grid place-items-center shadow-lg"
              >
                <Layers size={24} className="text-on-primary" />
              </motion.div>
              <h2 className="text-2xl font-heading font-bold tracking-tight text-primary">GMKC<span className="text-tertiary-fixed-dim italic">CHURCH</span></h2>
            </div>

            <div className="hidden md:flex items-center gap-10">
              <Link to="/about" className="label-sm text-on-surface-variant hover:text-primary transition-colors">Vision</Link>
              <Link to="/mission" className="label-sm text-on-surface-variant hover:text-primary transition-colors">Mission</Link>
              <Link to="/community" className="label-sm text-on-surface-variant hover:text-primary transition-colors">Groups</Link>
              <div className="h-4 w-[1px] bg-primary/10"></div>
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <button className="label-sm font-black uppercase tracking-widest text-primary hover:text-tertiary-fixed-dim transition-colors flex items-center gap-2 cursor-pointer">
                    Sign In <ChevronRight size={14} className="rotate-90" />
                  </button>
                  <div className="absolute top-full right-0 mt-4 w-64 p-4 rounded-2xl bg-surface shadow-2xl border border-primary/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[110]">
                    <div className="grid gap-1">
                      <Link to="/login/admin" className="p-3 rounded-xl hover:bg-primary/5 transition-colors text-xs font-bold text-primary flex justify-between items-center group/item">Admin Portal <ArrowRight size={12} className="opacity-0 group-hover/item:opacity-100 transition-all" /></Link>
                      <Link to="/login/leader" className="p-3 rounded-xl hover:bg-tertiary-fixed-dim/10 transition-colors text-xs font-bold text-primary flex justify-between items-center group/item">Leader Portal <ArrowRight size={12} className="opacity-0 group-hover/item:opacity-100 transition-all" /></Link>
                      <Link to="/login/finance" className="p-3 rounded-xl hover:bg-primary/5 transition-colors text-xs font-bold text-primary flex justify-between items-center group/item">Finance Portal <ArrowRight size={12} className="opacity-0 group-hover/item:opacity-100 transition-all" /></Link>
                      <Link to="/login/management" className="p-3 rounded-xl hover:bg-primary/5 transition-colors text-xs font-bold text-primary flex justify-between items-center group/item">Management <ArrowRight size={12} className="opacity-0 group-hover/item:opacity-100 transition-all" /></Link>
                      <Link to="/login/youth" className="p-3 rounded-xl hover:bg-tertiary-fixed-dim/10 transition-colors text-xs font-bold text-primary flex justify-between items-center group/item">Youth Ministry <ArrowRight size={12} className="opacity-0 group-hover/item:opacity-100 transition-all" /></Link>
                      <Link to="/login/shepherd" className="p-3 rounded-xl hover:bg-primary/5 transition-colors text-xs font-bold text-primary flex justify-between items-center group/item">Shepherd <ArrowRight size={12} className="opacity-0 group-hover/item:opacity-100 transition-all" /></Link>
                      <Link to="/login/kids" className="p-3 rounded-xl hover:bg-tertiary-fixed-dim/10 transition-colors text-xs font-bold text-primary flex justify-between items-center group/item">Kids Ministry <ArrowRight size={12} className="opacity-0 group-hover/item:opacity-100 transition-all" /></Link>
                    </div>
                  </div>
                </div>
                <Button onClick={() => setShowRoleSelector(true)} className="bg-primary hover:bg-tertiary-fixed-dim text-on-primary hover:text-primary rounded-xl px-8 py-3 h-auto font-black uppercase tracking-widest text-[10px] transition-all duration-500">
                  Get Started
                </Button>
              </div>
            </div>

            <button
              className="md:hidden p-2 text-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
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
            className="fixed inset-x-6 top-28 z-[90] p-8 rounded-[2rem] bg-surface shadow-2xl border border-primary/5 md:hidden flex flex-col gap-4 max-h-[70vh] overflow-y-auto"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/30 mb-2">Auth Portals</p>
            <div className="grid grid-cols-1 gap-2">
              <Link to="/login/admin" className="p-4 bg-primary/5 rounded-2xl text-primary font-bold flex justify-between items-center">Admin <span>&rarr;</span></Link>
              <Link to="/login/leader" className="p-4 bg-tertiary-fixed-dim/5 rounded-2xl text-primary font-bold flex justify-between items-center">Leader <span>&rarr;</span></Link>
              <Link to="/login/finance" className="p-4 bg-primary/5 rounded-2xl text-primary font-bold flex justify-between items-center">Finance <span>&rarr;</span></Link>
              <Link to="/login/management" className="p-4 bg-primary/5 rounded-2xl text-primary font-bold flex justify-between items-center">Management <span>&rarr;</span></Link>
              <Link to="/login/youth" className="p-4 bg-tertiary-fixed-dim/5 rounded-2xl text-primary font-bold flex justify-between items-center">Youth <span>&rarr;</span></Link>
              <Link to="/login/shepherd" className="p-4 bg-primary/5 rounded-2xl text-primary font-bold flex justify-between items-center">Shepherd <span>&rarr;</span></Link>
              <Link to="/login/kids" className="p-4 bg-tertiary-fixed-dim/5 rounded-2xl text-primary font-bold flex justify-between items-center">Kids Ministry <span>&rarr;</span></Link>
            </div>
            <div className="h-[1px] bg-primary/10 my-2"></div>
            <Button onClick={() => { setShowRoleSelector(true); setIsMenuOpen(false); }} className="w-full bg-primary py-6 rounded-2xl h-auto font-black uppercase tracking-widest text-[11px] text-on-primary">Join Community</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-40 pb-20 px-6 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1544427928-c49cddee6eac?q=80&w=2000&auto=format&fit=crop"
            alt="Church Community"
            className="w-full h-full object-cover opacity-10 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-surface via-transparent to-surface"></div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative z-10 max-w-6xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-tertiary-fixed-dim/10 border border-tertiary-fixed-dim/20 text-primary font-black text-[10px] mb-12 uppercase tracking-[0.3em]">
            <Sparkles size={14} className="text-tertiary-fixed-dim" /> Unified Spiritual Management
          </motion.div>

          <motion.h1 variants={itemVariants} className="display-lg text-primary mb-12 leading-[0.9] max-w-4xl mx-auto">
            Lead Your <br />
            <span className="text-tertiary-fixed-dim italic">Faith</span> Community.
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-on-surface-variant mb-16 leading-relaxed max-w-2xl mx-auto font-medium tracking-wide">
            A minimalist, powerful ecosystem for modern church administration. Transform how you lead, study, and grow together.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              onClick={() => setShowRoleSelector(true)}
              className="px-12 py-8 text-xl h-auto rounded-3xl bg-primary text-on-primary hover:bg-tertiary-fixed-dim hover:text-primary group shadow-whisper transition-all duration-500 font-black uppercase tracking-widest text-sm"
            >
              Launch Platform <ArrowRight size={24} className="ml-3 transition-transform group-hover:translate-x-2" />
            </Button>
            <div className="relative group">
              <Button variant="outline" className="px-12 py-8 text-xl h-auto rounded-3xl border-primary/10 bg-surface-container-low text-primary hover:bg-surface-container transition-all duration-500 font-black uppercase tracking-widest text-sm">
                Access Portals
              </Button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 p-4 rounded-3xl bg-surface shadow-2xl border border-primary/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="grid gap-1">
                  {['admin', 'leader', 'finance', 'management', 'youth', 'shepherd', 'kids'].map(p => (
                    <Link key={p} to={`/login/${p}`} className="p-3 rounded-xl hover:bg-primary/5 transition-colors text-[10px] font-black uppercase tracking-widest text-primary flex justify-between items-center group/p">
                      {p.replace('_', ' ')} Portal <ChevronRight size={12} className="opacity-0 group-hover/p:opacity-100 translate-x-[-10px] group-hover/p:translate-x-0 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Access Grid */}
      <section className="py-32 px-6 relative bg-surface-container-low">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-24">
            <h2 className="display-md text-primary mb-6">Select Your <span className="text-tertiary-fixed-dim italic">Portal</span></h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto font-medium tracking-wide">Tailored interfaces for every aspect of church governance and community life.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { id: 'admin', name: 'Master Admin', icon: Shield, color: 'text-primary', bg: 'bg-primary/5', path: '/login/admin', desc: 'Manage users, roles, and global church settings.' },
              { id: 'bible_leader', name: 'Bible Leader', icon: BookOpen, color: 'text-tertiary-fixed-dim', bg: 'bg-tertiary-fixed-dim/5', path: '/login/leader', desc: 'Lead groups, track studies, and nurture members.' },
              { id: 'finance', name: 'Financial Office', icon: DollarSign, color: 'text-primary', bg: 'bg-primary/5', path: '/login/finance', desc: 'Secure budget tracking and financial oversight.' },
              { id: 'management', name: 'Management', icon: Briefcase, color: 'text-primary', bg: 'bg-primary/5', path: '/login/management', desc: 'Oversee church operations and financial controller.' },
              { id: 'youth_ministry', name: 'Youth Ministry', icon: Zap, color: 'text-tertiary-fixed-dim', bg: 'bg-tertiary-fixed-dim/5', path: '/login/youth', desc: 'Manage youth programs, events, and engagement.' },
              { id: 'shepherd', name: 'Shepherd', icon: Eye, color: 'text-primary', bg: 'bg-primary/5', path: '/login/shepherd', desc: 'Spiritual oversight for assigned groups and leaders.' },
              { id: 'kids_ministry', name: 'Kids Ministry', icon: Baby, color: 'text-tertiary-fixed-dim', bg: 'bg-tertiary-fixed-dim/5', path: '/login/kids', desc: 'Secure tracking for childrens ministry and spiritual growth.' }
            ].map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="group h-full"
              >
                <div className="editorial-card p-10 h-full flex flex-col hover:border-primary/20 transition-all duration-700 bg-surface-container shadow-whisper">
                  <div className={`w-14 h-14 rounded-2xl ${r.bg} ${r.color} flex items-center justify-center mb-8 transition-all duration-700 group-hover:rotate-12`}>
                    <r.icon size={28} />
                  </div>

                  <h3 className="headline-sm text-primary mb-3 font-black">{r.name}</h3>
                  <p className="text-on-surface-variant mb-10 text-sm leading-relaxed font-medium opacity-70 flex-1">{r.desc}</p>

                  <div className="flex flex-col gap-3">
                    <Link to={r.path} className="w-full">
                      <Button className="w-full py-5 h-auto rounded-xl bg-primary text-on-primary hover:bg-tertiary-fixed-dim hover:text-primary transition-all duration-500 font-black uppercase tracking-widest text-[10px]">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" state={{ role: r.id }} className="w-full text-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 hover:text-primary transition-colors cursor-pointer py-2 block">
                        Apply for Role
                      </span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="display-md text-primary mb-12 leading-tight">Advanced Tools for a <br /><span className="text-tertiary-fixed-dim italic">Dynamic</span> Community.</h2>
              <div className="space-y-12">
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
                    className="flex gap-8 items-start group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center shrink-0 text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-500">
                      <f.icon size={28} />
                    </div>
                    <div>
                      <h4 className="headline-sm text-primary mb-2">{f.title}</h4>
                      <p className="text-on-surface-variant text-sm font-medium leading-relaxed">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[4rem] bg-surface-container-low border border-primary/5 flex items-center justify-center p-16 overflow-hidden shadow-whisper">
                <div className="grid grid-cols-2 gap-6 w-full h-full opacity-40">
                  <div className="bg-primary/5 rounded-3xl animate-pulse"></div>
                  <div className="bg-tertiary-fixed-dim/10 rounded-3xl animate-pulse delay-75"></div>
                  <div className="bg-primary/10 rounded-3xl animate-pulse delay-150"></div>
                  <div className="bg-tertiary-fixed-dim/5 rounded-3xl animate-pulse delay-300"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Layers size={160} className="text-primary/10 drop-shadow-2xl animate-bounce-slow" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6">
        <motion.div
          className="container mx-auto max-w-5xl p-16 md:p-24 rounded-[4rem] bg-primary text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-tertiary-fixed-dim/10 blur-[100px] rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-surface/5 blur-[100px] rounded-full -ml-48 -mb-48"></div>

          <div className="relative z-10">
            <h2 className="display-md text-on-primary mb-10 tracking-tight">Ready to Transform Your <span className="text-tertiary-fixed-dim italic">Church?</span></h2>
            <p className="text-on-primary/70 mb-16 text-xl font-medium tracking-wide max-w-2xl mx-auto">Join hundreds of leaders managing their community with precision and heart.</p>
            <Button 
              onClick={() => setShowRoleSelector(true)}
              className="bg-tertiary-fixed-dim text-primary hover:bg-surface rounded-3xl px-16 py-8 text-2xl h-auto font-black uppercase tracking-[0.2em] border-none shadow-xl transition-all duration-500"
            >
              Get Started Now
            </Button>
          </div>
        </motion.div>
      </section>


      {/* Role Selection Modal */}
      <AnimatePresence>
        {showRoleSelector && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-primary/20 backdrop-blur-md z-[200]" 
              onClick={() => setShowRoleSelector(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="fixed inset-0 flex items-center justify-center p-6 z-[210] pointer-events-none"
            >
              <div className="bg-surface-container rounded-[3rem] p-12 md:p-16 max-w-4xl w-full shadow-2xl border border-primary/5 pointer-events-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
                
                <button onClick={() => setShowRoleSelector(false)} className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-surface-container-low hover:bg-surface-container-high flex items-center justify-center text-primary transition-all">
                  <X size={24} />
                </button>

                <div className="text-center mb-12 relative z-10">
                  <h2 className="display-sm text-primary mb-4">Choose Your <span className="text-tertiary-fixed-dim italic">Journey</span></h2>
                  <p className="label-sm text-on-surface-variant uppercase tracking-[0.3em] opacity-60">Role-Based Authentication Access</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                  {[
                    { id: 'admin', name: 'Master Admin', icon: Shield, col: 'bg-primary/5 text-primary' },
                    { id: 'bible_leader', name: 'Bible Leader', icon: BookOpen, col: 'bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim' },
                    { id: 'finance', name: 'Finance Office', icon: DollarSign, col: 'bg-primary/5 text-primary' },
                    { id: 'management', name: 'Management', icon: Briefcase, col: 'bg-primary/5 text-primary' },
                    { id: 'youth_ministry', name: 'Youth Ministry', icon: Zap, col: 'bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim' },
                    { id: 'shepherd', name: 'Shepherd', icon: Eye, col: 'bg-primary/5 text-primary' },
                    { id: 'kids_ministry', name: 'Kids Ministry', icon: Baby, col: 'bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim' }
                  ].map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    >
                      <div className="group p-6 rounded-3xl bg-surface hover:bg-surface-container-high border border-primary/5 hover:border-primary/20 transition-all duration-500 cursor-pointer h-full flex flex-col items-center text-center">
                        <div className={`w-14 h-14 rounded-2xl ${r.col} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                          <r.icon size={26} />
                        </div>
                        <h4 className="text-primary font-black uppercase tracking-widest text-[11px] mb-6">{r.name}</h4>
                        <div className="flex flex-col gap-2 w-full mt-auto">
                          <Link to={`/login/${r.id.split('_')[0]}`} className="w-full">
                            <Button className="w-full py-4 h-auto rounded-xl bg-primary text-on-primary hover:bg-tertiary-fixed-dim hover:text-primary text-[10px] font-black uppercase tracking-widest transition-all">Sign In</Button>
                          </Link>
                          <Link to="/signup" state={{ role: r.id }} className="w-full">
                            <Button variant="outline" className="w-full py-4 h-auto rounded-xl border-primary/10 text-primary hover:bg-surface-container text-[10px] font-black uppercase tracking-widest transition-all">Sign Up</Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <footer className="py-32 px-6 border-t border-primary/5 bg-surface-container-low">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-16">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary grid place-items-center">
                  <Layers size={20} className="text-on-primary" />
                </div>
                <h2 className="text-xl font-heading font-bold tracking-tight text-primary">GMKC<span className="text-tertiary-fixed-dim italic">CHURCH</span></h2>
              </div>
              <p className="text-on-surface-variant text-sm max-w-xs leading-relaxed font-medium">
                Empowering faith communities through elegant, intentional management solutions.
              </p>
            </div>

            <div className="flex gap-24">
              <div className="flex flex-col gap-6">
                <h4 className="text-primary font-black text-[10px] uppercase tracking-widest">Product</h4>
                <Link to="#" className="text-on-surface-variant hover:text-primary text-sm font-medium transition-colors">Features</Link>
                <Link to="#" className="text-on-surface-variant hover:text-primary text-sm font-medium transition-colors">Security</Link>
              </div>
              <div className="flex flex-col gap-6">
                <h4 className="text-primary font-black text-[10px] uppercase tracking-widest">Community</h4>
                <Link to="#" className="text-on-surface-variant hover:text-primary text-sm font-medium transition-colors">Events</Link>
                <Link to="#" className="text-on-surface-variant hover:text-primary text-sm font-medium transition-colors">Training</Link>
              </div>
            </div>

            <div className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-widest">
              &copy; 2026 GMKC Church. All Rights Reserved.
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

