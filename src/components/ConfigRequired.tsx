import React from 'react';
import { Settings, ExternalLink, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function ConfigRequired() {
  const { loginAsDemo } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-50 rounded-full text-amber-500 mb-6">
          <AlertTriangle size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Configuration Required</h1>
        <p className="text-slate-600 mb-8">
          To start using GraceFlow CMS, you need to connect your Supabase project.
        </p>

        <div className="space-y-4 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Settings size={16} />
            Setup Steps
          </h2>
          <ol className="text-sm text-slate-600 space-y-3 list-decimal list-inside">
            <li>Open the <b>Secrets</b> panel in AI Studio.</li>
            <li>Add <code>VITE_SUPABASE_URL</code></li>
            <li>Add <code>VITE_SUPABASE_ANON_KEY</code></li>
            <li>Refresh this page.</li>
          </ol>
        </div>

        <div className="mb-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Start</p>
          <div className="space-y-3">
            <button 
              onClick={() => loginAsDemo('admin')}
              className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 transition-all group shadow-sm"
            >
              <ShieldCheck className="text-emerald-600" size={24} />
              <span className="font-bold text-slate-700 group-hover:text-emerald-700">Login as Admin</span>
            </button>
            <button 
              onClick={() => loginAsDemo('leader')}
              className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
            >
              <UserCheck className="text-slate-400 group-hover:text-emerald-600" size={20} />
              <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-700">Login as Leader</span>
            </button>
          </div>
        </div>

        <a 
          href="https://supabase.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:underline"
        >
          Get Supabase Keys
          <ExternalLink size={16} />
        </a>
      </div>
    </div>
  );
}
