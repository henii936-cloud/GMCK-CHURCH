import React from 'react';
import { Link } from 'react-router-dom';
import { Church, Shield, Users, Wallet, ArrowRight, Heart, BookOpen, Calendar } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                <Church size={24} />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">GMKC Church</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/admin-login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5">
                <Shield size={16} />
                Admin
              </Link>
              <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                <Users size={16} />
                Bible Leader
              </Link>
              <Link to="/finance-login" className="text-sm font-bold text-slate-600 hover:text-amber-600 transition-colors flex items-center gap-1.5">
                <Wallet size={16} />
                Finance
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="hidden sm:inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100 active:scale-95"
              >
                Sign In
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative min-h-screen flex items-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=1920" 
              alt="People praying together" 
              className="w-full h-full object-cover object-center scale-105 animate-subtle-zoom"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90 backdrop-blur-[1px]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-32">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-bold uppercase tracking-[0.2em] mb-8 border border-emerald-500/30 backdrop-blur-md">
                <Heart size={16} className="animate-pulse" />
                Welcome to GMKC Church
              </div>
              <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter mb-8 leading-[0.95]">
                Growing in Faith, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Serving with Love.</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-200 mb-12 leading-relaxed max-w-2xl mx-auto font-medium opacity-90">
                A community dedicated to spiritual growth, 
                meaningful fellowship, and impactful service.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link 
                  to="/signup" 
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-2xl shadow-emerald-900/40 flex items-center justify-center gap-3 active:scale-[0.98] group"
                >
                  Join Our Community
                  <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/login" 
                  className="w-full sm:w-auto bg-white/10 backdrop-blur-xl border border-white/20 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  Leader Portal
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
          </div>
        </section>

        {/* Features / Quick Links */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={BookOpen}
                title="Bible Study"
                description="Join our weekly Bible study groups to dive deeper into the Word and grow with fellow believers."
                color="text-emerald-600 bg-emerald-100"
              />
              <FeatureCard 
                icon={Calendar}
                title="Church Events"
                description="Stay updated with our upcoming programs, conferences, and community outreach events."
                color="text-blue-600 bg-blue-100"
              />
              <FeatureCard 
                icon={Users}
                title="Fellowship"
                description="Connect with various ministries and find a place where you can serve and belong."
                color="text-purple-600 bg-purple-100"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <Church size={18} />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">GMKC Church</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} GMKC Church. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: any) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${color}`}>
        <Icon size={28} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
