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
                <Link to="/login" className="label-sm font-bold text-primary hover:text-tertiary-fixed-dim transition-colors">Sign In</Link>
                <Link to="/signup">
                  <Button className="bg-primary hover:bg-tertiary-fixed-dim text-on-primary hover:text-primary rounded-xl px-8 py-3 h-auto font-bold transition-all duration-500">
                    Get Started
                  </Button>
                </Link>
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
            className="fixed inset-x-6 top-28 z-[90] p-8 rounded-[2rem] bg-surface shadow-2xl border border-primary/5 md:hidden flex flex-col gap-6"
          >
            <Link to="/login/admin" className="headline-sm text-primary p-4 hover:bg-surface-container-low rounded-2xl transition-all">Admin Portal</Link>
            <Link to="/login/leader" className="headline-sm text-primary p-4 hover:bg-surface-container-low rounded-2xl transition-all">Leader Portal</Link>
            <Link to="/login/finance" className="headline-sm text-primary p-4 hover:bg-surface-container-low rounded-2xl transition-all">Finance Portal</Link>
            <div className="h-[1px] bg-primary/10"></div>
            <Link to="/signup">
              <Button className="w-full bg-primary py-6 rounded-2xl h-auto font-bold text-on-primary">Join Our Community</Button>
            </Link>
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
            <Link to="/signup">
              <Button className="px-12 py-8 text-xl h-auto rounded-2xl bg-primary text-on-primary hover:bg-tertiary-fixed-dim hover:text-primary group shadow-whisper transition-all duration-500 font-bold">
                Launch Platform <ArrowRight size={24} className="ml-3 transition-transform group-hover:translate-x-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="px-12 py-8 text-xl h-auto rounded-2xl border-primary/10 bg-surface-container-low text-primary hover:bg-surface-container transition-all duration-500 font-bold">
                Admin Console
              </Button>
            </Link>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { id: 'admin', name: 'Master Admin', icon: Shield, color: 'text-primary', bg: 'bg-surface-container', path: '/login/admin', desc: 'Manage users, roles, and global church settings.' },
              { id: 'bible_leader', name: 'Bible Leader', icon: Users, color: 'text-emerald-700', bg: 'bg-emerald-50', path: '/login/leader', desc: 'Lead groups, track studies, and nurture members.' },
              { id: 'finance', name: 'Financial Office', icon: DollarSign, color: 'text-amber-700', bg: 'bg-amber-50', path: '/login/finance', desc: 'Secure budget tracking and financial oversight.' }
            ].map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="editorial-card group hover:scale-[1.02] transition-all duration-500"
              >
                <div className={`w-16 h-16 rounded-2xl ${r.bg} ${r.color} flex items-center justify-center mb-10 transition-all duration-500 group-hover:rotate-6 shadow-sm`}>
                  <r.icon size={32} />
                </div>

                <h3 className="headline-sm text-primary mb-4">{r.name}</h3>
                <p className="text-on-surface-variant mb-10 text-sm leading-relaxed font-medium">{r.desc}</p>

                <div className="flex flex-col gap-4">
                  <Link to={r.path} className="w-full">
                    <Button className="w-full py-6 h-auto rounded-xl bg-primary text-on-primary hover:bg-tertiary-fixed-dim hover:text-primary transition-all duration-500 font-bold">
                      Enter Portal
                    </Button>
                  </Link>
                  <Link to="/signup" state={{ role: r.id }} className="w-full">
                    <Button variant="outline" className="w-full py-6 h-auto rounded-xl border-primary/10 bg-surface-container-low text-primary hover:bg-surface-container transition-all duration-500 font-bold">
                      Create Role
                    </Button>
                  </Link>
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
            <Link to="/signup">
              <Button className="bg-tertiary-fixed-dim text-primary hover:bg-surface rounded-2xl px-16 py-8 text-2xl h-auto font-bold border-none shadow-xl transition-all duration-500">
                Get Started Now
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
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

