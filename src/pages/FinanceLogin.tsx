import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Wallet, Mail, Lock, ArrowRight, Loader2, Landmark } from 'lucide-react';

export function FinanceLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // For now, finance uses the same login logic but redirects to a finance-specific view if needed
      // In a real app, we might check roles here
      await login(email, password);
      navigate('/budgets');
    } catch (err) {
      setError('Invalid finance credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image with heavy blur and dark overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=1920" 
          alt="Church background" 
          className="w-full h-full object-cover opacity-20 scale-110 blur-sm"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/50 via-stone-950 to-stone-950" />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-600 rounded-3xl text-white shadow-2xl shadow-amber-900/50 mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <Landmark size={40} />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Finance Portal</h1>
          <p className="text-stone-400 mt-3 font-medium">Authorized Personnel Only</p>
        </div>

        <div className="bg-stone-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-stone-800 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-500/10 text-rose-400 text-sm font-bold rounded-2xl border border-rose-500/20 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Secretary ID / Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-amber-500 transition-colors" size={20} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="finance@gmkc.org"
                  className="w-full pl-12 pr-4 py-4 bg-stone-950/50 border border-stone-800 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-white outline-none transition-all placeholder:text-stone-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-amber-500 transition-colors" size={20} />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-stone-950/50 border border-stone-800 rounded-2xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-white outline-none transition-all placeholder:text-stone-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2 active:scale-[0.98] group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  Access Treasury
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-stone-800 text-center">
            <Link to="/" className="text-sm font-bold text-stone-500 hover:text-white transition-colors flex items-center justify-center gap-2">
              Return to Public Site
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer micro-details */}
      <div className="mt-12 text-center relative z-10">
        <p className="text-[10px] font-bold text-stone-700 uppercase tracking-[0.3em]">
          GMKC Church • Financial Management System • v2.4.0
        </p>
      </div>
    </div>
  );
}
