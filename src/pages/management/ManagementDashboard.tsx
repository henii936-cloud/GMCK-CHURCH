import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion } from "motion/react";
import {
  Briefcase, DollarSign, Users, TrendingUp, TrendingDown,
  Loader2, Plus, Bell, Search, FileText, ArrowUpRight, ArrowDownRight,
  UserCheck, Wallet
} from "lucide-react";

export default function ManagementDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    transactions: [],
    workers: [],
    budgets: [],
    salaryPayments: [],
    loading: true,
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [trans, workers, budgets, salaries] = await Promise.all([
        supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("church_workers").select("*").order("full_name"),
        supabase.from("budgets").select("*").order("created_at", { ascending: false }),
        supabase.from("salary_payments").select("*, church_workers(full_name, position)").order("created_at", { ascending: false }).limit(15),
      ]);
      setData({
        transactions: trans.data || [],
        workers: workers.data || [],
        budgets: budgets.data || [],
        salaryPayments: salaries.data || [],
        loading: false,
      });
    } catch (err) {
      console.error(err);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  if (data.loading) return (
    <div className="flex h-screen items-center justify-center bg-surface">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <Loader2 size={48} className="text-primary" />
      </motion.div>
    </div>
  );

  const totalIncome = data.transactions.filter(t => ["tithe","offering","donation","first_fruit"].includes(t.type)).reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const totalExpenses = data.transactions.filter(t => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const totalSalaries = data.salaryPayments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const activeWorkers = data.workers.filter(w => w.status === "Active").length;

  const statCards = [
    { label: "Total Income", value: `$${totalIncome.toLocaleString()}`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Total Expenses", value: `$${totalExpenses.toLocaleString()}`, icon: TrendingDown, color: "text-red-400", bg: "bg-red-400/10" },
    { label: "Church Workers", value: activeWorkers, icon: UserCheck, color: "text-primary", bg: "bg-primary/10" },
    { label: "Salary Paid (Period)", value: `$${totalSalaries.toLocaleString()}`, icon: Wallet, color: "text-tertiary-fixed-dim", bg: "bg-tertiary-fixed-dim/10" },
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
        <div>
          <h1 className="display-lg text-primary mb-2">Management <span className="text-tertiary-fixed-dim italic">Control</span></h1>
          <p className="label-sm text-tertiary-fixed-dim tracking-[0.3em]">Executive Operations & Financial Oversight</p>
          <p className="text-on-surface-variant mt-3 font-medium">Welcome back, {user?.full_name}. Oversee all financial activities and worker management.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" size={16} />
            <input type="text" placeholder="Search records..." className="editorial-input pl-10 w-64 bg-surface-container-low" />
          </div>
          <button className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center relative hover:bg-surface-container transition-all border border-outline-variant/10">
            <Bell size={20} className="text-on-surface-variant" />
            <span className="absolute top-3 right-3 w-2 h-2 bg-tertiary-fixed-dim rounded-full" />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10"
          >
            <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center mb-4`}>
              <card.icon size={22} className={card.color} />
            </div>
            <p className="text-on-surface-variant text-sm font-medium mb-1">{card.label}</p>
            <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="xl:col-span-2 bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="headline-sm text-primary font-black">Recent Transactions</h2>
            <span className="label-sm text-primary/50 uppercase tracking-widest">Finance Overview</span>
          </div>
          <div className="space-y-3">
            {data.transactions.slice(0, 8).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container-high transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === "expense" ? "bg-red-400/10" : "bg-green-500/10"}`}>
                    {t.type === "expense" ? <ArrowDownRight size={18} className="text-red-400" /> : <ArrowUpRight size={18} className="text-green-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary capitalize">{t.type?.replace("_", " ")}</p>
                    <p className="text-xs text-on-surface-variant">{t.date || t.transaction_date || "—"}</p>
                  </div>
                </div>
                <p className={`font-black text-sm ${t.type === "expense" ? "text-red-400" : "text-green-500"}`}>
                  {t.type === "expense" ? "-" : "+"}${parseFloat(t.amount).toLocaleString()}
                </p>
              </div>
            ))}
            {data.transactions.length === 0 && (
              <p className="text-center text-on-surface-variant/50 py-8 text-sm">No transactions yet.</p>
            )}
          </div>
        </div>

        {/* Church Workers */}
        <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="headline-sm text-primary font-black">Workers</h2>
            <span className="label-sm text-primary/50">{data.workers.length} total</span>
          </div>
          <div className="space-y-3">
            {data.workers.slice(0, 8).map((w) => (
              <div key={w.id} className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container-high transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-sm">
                  {w.full_name?.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-primary truncate">{w.full_name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{w.position || "Staff"}</p>
                </div>
                <div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${w.status === "Active" ? "bg-green-500/10 text-green-500" : "bg-red-400/10 text-red-400"}`}>
                    {w.status}
                  </span>
                </div>
              </div>
            ))}
            {data.workers.length === 0 && (
              <p className="text-center text-on-surface-variant/50 py-8 text-sm">No workers registered.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
