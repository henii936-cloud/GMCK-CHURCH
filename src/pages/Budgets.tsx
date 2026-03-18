import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  PieChart as PieChartIcon,
  Calendar,
  Check,
  X,
  Loader2,
  ChevronRight,
  BarChart3,
  Download,
  FileText,
  History,
  ShieldCheck,
  LayoutDashboard,
  Receipt,
  HandCoins,
  Trash2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { cn, formatDate } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { supabase, type Budget, type Transaction } from '../lib/supabase';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Budgets() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const isFinance = profile?.role === 'finance';
  
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expenses' | 'allocations' | 'planning'>('overview');
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newPlan, setNewPlan] = useState({
    title: '',
    ministry: '',
    amount: '',
    year: new Date().getFullYear() + 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [budgetData, txData] = await Promise.all([
        supabase.from('budgets').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*, budget:budgets(title)').order('date', { ascending: false })
      ]);

      if (budgetData.error) throw budgetData.error;
      if (txData.error) throw txData.error;

      setBudgets(budgetData.data || []);
      setTransactions(txData.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: insertError } = await supabase
        .from('budgets')
        .insert([{
          title: newPlan.title,
          ministry: newPlan.ministry,
          amount: parseFloat(newPlan.amount),
          year: newPlan.year,
          status: 'pending',
          created_by: profile.id
        }]);

      if (insertError) throw insertError;

      setSuccess('Budget plan submitted for approval!');
      setNewPlan({ title: '', ministry: '', amount: '', year: new Date().getFullYear() + 1 });
      setTimeout(() => {
        setShowPlanModal(false);
        setSuccess(null);
      }, 1500);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create budget plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'pending' | 'rejected') => {
    try {
      const { error: updateError } = await supabase
        .from('budgets')
        .update({ status })
        .eq('id', id);

      if (updateError) throw updateError;
      fetchData();
    } catch (err) {
      console.error('Error updating budget status:', err);
    }
  };

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'tithe' || t.type === 'offering' || t.type === 'donation').reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense' as any).reduce((acc, t) => acc + t.amount, 0); // Assuming 'expense' type might be added later or handled differently
    const approvedBudgets = budgets.filter(b => b.status === 'approved');
    const totalAllocated = approvedBudgets.reduce((acc, b) => acc + b.amount, 0);
    
    return { income, expenses, totalAllocated, balance: income - expenses };
  }, [transactions, budgets]);

  const allocationData = useMemo(() => {
    const approved = budgets.filter(b => b.status === 'approved');
    return approved.map(b => {
      const spent = transactions.filter(t => t.budget_id === b.id).reduce((acc, t) => acc + t.amount, 0);
      return {
        ...b,
        spent,
        percentage: b.amount > 0 ? (spent / b.amount) * 100 : 0
      };
    });
  }, [budgets, transactions]);

  const pieData = useMemo(() => {
    return allocationData.map(b => ({ name: b.title, value: b.amount }));
  }, [allocationData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance & Budgets</h1>
          <p className="text-slate-500">Comprehensive financial management and transparency.</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button 
              onClick={() => setShowPlanModal(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
            >
              <Plus size={20} />
              New Budget Plan
            </button>
          )}
          <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('overview')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
            activeTab === 'overview' ? "bg-emerald-600 text-white shadow-md shadow-emerald-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <LayoutDashboard size={18} />
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('income')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
            activeTab === 'income' ? "bg-emerald-600 text-white shadow-md shadow-emerald-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <HandCoins size={18} />
          Income
        </button>
        <button 
          onClick={() => setActiveTab('allocations')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
            activeTab === 'allocations' ? "bg-emerald-600 text-white shadow-md shadow-emerald-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <PieChartIcon size={18} />
          Allocations
        </button>
        <button 
          onClick={() => setActiveTab('planning')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
            activeTab === 'planning' ? "bg-emerald-600 text-white shadow-md shadow-emerald-100" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <BarChart3 size={18} />
          Planning
        </button>
      </div>

      {/* Main Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500">Total Income</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">${stats.income.toLocaleString()}</h3>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                    <TrendingDown size={20} />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500">Total Expenses</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">${stats.expenses.toLocaleString()}</h3>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Wallet size={20} />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500">Net Balance</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">${stats.balance.toLocaleString()}</h3>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl shadow-slate-200 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-sm font-medium text-slate-400">Total Allocated</p>
                  <h3 className="text-2xl font-bold mt-1">${stats.totalAllocated.toLocaleString()}</h3>
                  <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-3/4" />
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
              </div>
            </div>

            {/* Allocation Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6">Budget Allocation</h3>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="h-64 w-full md:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2 space-y-3">
                    {pieData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-sm font-medium text-slate-600">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">${item.value.toLocaleString()}</span>
                      </div>
                    ))}
                    {pieData.length === 0 && <p className="text-sm text-slate-500">No approved budgets.</p>}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <History size={18} className="text-emerald-600" />
                    Recent Transactions
                  </h3>
                  <button 
                    onClick={() => setActiveTab('income')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    View All
                  </button>
                </div>
                <div className="divide-y divide-slate-50">
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          (tx.type === 'tithe' || tx.type === 'offering' || tx.type === 'donation') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                          {(tx.type === 'tithe' || tx.type === 'offering' || tx.type === 'donation') ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 capitalize">{tx.type}</h4>
                          <p className="text-xs text-slate-500">{tx.budget?.title || 'General'} • {formatDate(tx.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-bold",
                          (tx.type === 'tithe' || tx.type === 'offering' || tx.type === 'donation') ? "text-emerald-600" : "text-rose-600"
                        )}>
                          ${tx.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No transactions recorded.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'income' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Budget</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.filter(t => t.type !== 'expense' as any).map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(tx.date)}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md uppercase tracking-wider">
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{tx.budget?.title || '-'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-right text-emerald-600">
                      ${tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'allocations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allocationData.map(budget => (
              <div key={budget.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{budget.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{budget.ministry}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md uppercase tracking-wider">
                    Approved
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spent</p>
                      <p className="text-xl font-bold text-slate-900">${budget.spent.toLocaleString()}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Allocation</p>
                      <p className="text-sm font-bold text-slate-600">${budget.amount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "absolute left-0 top-0 h-full transition-all duration-1000 ease-out",
                        budget.percentage < 80 ? "bg-emerald-500" : budget.percentage < 100 ? "bg-amber-500" : "bg-rose-500"
                      )}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs font-medium text-slate-500">
                      {budget.percentage.toFixed(1)}% of budget utilized
                    </p>
                    <p className="text-xs font-bold text-slate-900">
                      Remaining: ${(budget.amount - budget.spent).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {allocationData.length === 0 && <p className="col-span-2 text-center py-12 text-slate-500">No approved budgets found.</p>}
          </div>
        )}

        {activeTab === 'planning' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Budget Planning</h2>
                <p className="text-sm text-slate-500">Create and manage future ministry budgets.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgets.filter(b => b.status === 'pending' || b.status === 'rejected').map(plan => (
                <div key={plan.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{plan.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{plan.ministry} • Fiscal Year {plan.year}</p>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider",
                      plan.status === 'pending' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {plan.status}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl mb-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Amount</p>
                    <p className="text-lg font-bold text-slate-900">${plan.amount.toLocaleString()}</p>
                  </div>

                  {isAdmin && plan.status === 'pending' && (
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                      <button 
                        onClick={() => handleUpdateStatus(plan.id, 'approved')}
                        className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                      >
                        <Check size={14} />
                        Approve
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(plan.id, 'rejected')}
                        className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </div>
                  )}
                  {isAdmin && plan.status === 'rejected' && (
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                      <button 
                        onClick={() => handleUpdateStatus(plan.id, 'pending')}
                        className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                      >
                        <History size={14} />
                        Re-evaluate
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {budgets.filter(b => b.status === 'pending' || b.status === 'rejected').length === 0 && (
                <p className="col-span-2 text-center py-12 text-slate-500">No pending or rejected budget plans.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-600 text-white">
              <h2 className="text-xl font-bold">New Budget Plan</h2>
              <button 
                onClick={() => setShowPlanModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePlan} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              
              {success && (
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  {success}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Title</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g., Annual Youth Conference"
                  value={newPlan.title}
                  onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none text-sm transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Ministry</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g., Youth Ministry"
                  value={newPlan.ministry}
                  onChange={(e) => setNewPlan({ ...newPlan, ministry: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Amount ($)</label>
                  <input 
                    required
                    type="number"
                    placeholder="0.00"
                    value={newPlan.amount}
                    onChange={(e) => setNewPlan({ ...newPlan, amount: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none text-sm transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Year</label>
                  <input 
                    required
                    type="number"
                    value={newPlan.year}
                    onChange={(e) => setNewPlan({ ...newPlan, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
