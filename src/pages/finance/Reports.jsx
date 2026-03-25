import { useEffect, useState } from "react";
import { financeService } from "../../services/api";
import { Card, Button } from "../../components/common/UI";
import { Calendar, Download, TrendingUp, DollarSign, ArrowDownRight, ArrowUpRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";

export default function Reports() {
  const [data, setData] = useState({
    transactions: [],
    budgets: [],
    loading: true
  });
  const [timeframe, setTimeframe] = useState('monthly'); // 'weekly' | 'monthly' | 'yearly'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true }));
      const [trans, budgets] = await Promise.all([
        financeService.getTransactions().catch(() => []),
        financeService.getBudgets().catch(() => [])
      ]);
      setData({
        transactions: trans || [],
        budgets: budgets || [],
        loading: false
      });
    } catch (err) {
      console.error("Error loading reports data:", err);
      setData({ transactions: [], budgets: [], loading: false });
    }
  };

  if (data.loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Loader2 size={48} className="text-primary" />
        </motion.div>
      </div>
    );
  }

  const totalIncome = data.transactions.filter(t => t.type !== 'expense' && t.category !== 'Expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpenses = data.transactions.filter(t => t.type === 'expense' || t.category === 'Expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div className="max-w-2xl">
          <h1 className="display-lg text-primary mb-4">Financial <span className="text-tertiary-fixed-dim italic">Reports</span></h1>
          <p className="label-sm text-tertiary-fixed-dim mb-6 tracking-[0.3em]">Analytics & Insights</p>
          <p className="text-on-surface-variant font-medium tracking-wide leading-relaxed">Comprehensive overview of church finances, including income trends, expense tracking, and budget utilization.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-surface-container-low p-1 rounded-xl flex">
            {['weekly', 'monthly', 'yearly'].map(t => (
              <button 
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${timeframe === t ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-primary'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <button className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-all text-primary border border-outline-variant/10">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="editorial-card">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
              <ArrowUpRight size={24} />
            </div>
            <p className="label-sm opacity-60">Total Income</p>
          </div>
          <h2 className="text-4xl font-heading font-bold text-primary">${totalIncome.toLocaleString()}</h2>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="editorial-card">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <ArrowDownRight size={24} />
            </div>
            <p className="label-sm opacity-60">Total Expenses</p>
          </div>
          <h2 className="text-4xl font-heading font-bold text-primary">${totalExpenses.toLocaleString()}</h2>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="editorial-card">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${netBalance >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
              <DollarSign size={24} />
            </div>
            <p className="label-sm opacity-60">Net Balance</p>
          </div>
          <h2 className="text-4xl font-heading font-bold text-primary">${netBalance.toLocaleString()}</h2>
        </motion.div>
      </div>
    </div>
  );
}
