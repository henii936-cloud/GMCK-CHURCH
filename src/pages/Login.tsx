import React, { useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { Church, Mail, Lock, Loader2, UserCheck, ShieldCheck } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const { user, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabase();

  if (user) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase is not configured. Please use Demo Login or check settings.');
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl text-white mb-4 shadow-lg shadow-emerald-200">
            <Church size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">GraceFlow CMS</h1>
          <p className="text-slate-500 mt-2">Sign in to manage your church</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="name@church.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-4">Demo Access</p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => loginAsDemo('admin')}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
              >
                <ShieldCheck className="text-slate-400 group-hover:text-emerald-600" size={24} />
                <span className="text-xs font-bold text-slate-600 group-hover:text-emerald-700">Admin Demo</span>
              </button>
              <button 
                onClick={() => loginAsDemo('leader')}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
              >
                <UserCheck className="text-slate-400 group-hover:text-emerald-600" size={24} />
                <span className="text-xs font-bold text-slate-600 group-hover:text-emerald-700">Leader Demo</span>
              </button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 italic">
              "Let all things be done decently and in order."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
