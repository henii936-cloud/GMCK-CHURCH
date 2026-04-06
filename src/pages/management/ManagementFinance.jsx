import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { motion } from "motion/react";
import { DollarSign, Loader2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, PieChart } from "lucide-react";

export default function ManagementFinance() {
  const [data, setData] = useState({ transactions: [], budgets: [], loading: true });

  useEffect(() => {
    const fetch = async () => {
      const [trans, budgets] = await Promise.all([
        supabase.from("transactions").select("*").order("created_at", { ascending: false }),
        supabase.from("budgets").select("*").order("created_at", { ascending: false }),
      ]);
      setData({ transactions: trans.data || [], budgets: budgets.data || [], loading: false });
    };
    fetch();
  }, []);

  if (data.loading) return (
    <div className="flex h-screen items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <Loader2 size={48} className="text-primary" />
      </motion.div>
    </div>
  );

  const income = data.transactions.filter(t => ["tithe","offering","donation","first_fruit"].includes(t.type)).reduce((s,t) => s + parseFloat(t.amount||0),0);
  const expenses = data.transactions.filter(t => t.type === "expense").reduce((s,t) => s + parseFloat(t.amount||0),0);
  const net = income - expenses;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="display-md text-primary mb-2">Finance <span className="text-tertiary-fixed-dim italic">Overview</span></h1>
        <p className="label-sm text-on-surface-variant tracking-widest">Read-only financial dashboard for management</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: "Total Income", value: income, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Total Expenses", value: expenses, icon: TrendingDown, color: "text-red-400", bg: "bg-red-400/10" },
          { label: "Net Balance", value: net, icon: PieChart, color: net >= 0 ? "text-primary" : "text-red-400", bg: net >= 0 ? "bg-primary/10" : "bg-red-400/10" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10"
          >
            <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-4`}>
              <s.icon size={22} className={s.color} />
            </div>
            <p className="text-on-surface-variant text-sm mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>${Math.abs(s.value).toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10 mb-8">
        <h2 className="headline-sm text-primary font-black mb-6">All Transactions</h2>
        <div className="space-y-2">
          {data.transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container-high transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === "expense" ? "bg-red-400/10" : "bg-green-500/10"}`}>
                  {t.type === "expense" ? <ArrowDownRight size={18} className="text-red-400" /> : <ArrowUpRight size={18} className="text-green-500" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-primary capitalize">{t.type?.replace("_", " ")}</p>
                  <p className="text-xs text-on-surface-variant">{t.description || t.notes || "—"} • {t.date || t.transaction_date}</p>
                </div>
              </div>
              <p className={`font-black text-sm ${t.type === "expense" ? "text-red-400" : "text-green-500"}`}>
                {t.type === "expense" ? "-" : "+"}${parseFloat(t.amount).toLocaleString()}
              </p>
            </div>
          ))}
          {data.transactions.length === 0 && <p className="text-center text-on-surface-variant/50 py-8 text-sm">No transactions found.</p>}
        </div>
      </div>

      {/* Budgets */}
      <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
        <h2 className="headline-sm text-primary font-black mb-6">Budgets</h2>
        <div className="space-y-3">
          {data.budgets.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low">
              <div>
                <p className="font-bold text-sm text-primary">{b.name}</p>
                <p className="text-xs text-on-surface-variant">Used: ${parseFloat(b.used_amount || 0).toLocaleString()} / ${parseFloat(b.amount || 0).toLocaleString()}</p>
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                b.status === "Approved" ? "bg-green-500/10 text-green-500" :
                b.status === "Rejected" ? "bg-red-400/10 text-red-400" :
                "bg-orange-400/10 text-orange-400"
              }`}>{b.status}</span>
            </div>
          ))}
          {data.budgets.length === 0 && <p className="text-center text-on-surface-variant/50 py-8 text-sm">No budgets found.</p>}
        </div>
      </div>
    </div>
  );
}
