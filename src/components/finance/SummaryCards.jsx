import { motion } from "motion/react";
import { Wallet, DollarSign, Heart, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function SummaryCards({ transactions = [] }) {
  const sumByType = (type) => 
    transactions.filter(t => t.type === type).reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalIncome = sumByType('tithe') + sumByType('offering') + sumByType('donation');
  const totalExpense = sumByType('expense');
  const netBalance = totalIncome - totalExpense;

  const stats = [
    { label: "Total Income", val: totalIncome, icon: Wallet, color: '#002c53', trend: '+12.5%', isUp: true },
    { label: "Total Expense", val: totalExpense, icon: ArrowDownRight, color: '#eac077', trend: '+8.4%', isUp: false },
    { label: "Net Balance", val: netBalance, icon: DollarSign, color: netBalance >= 0 ? '#10b981' : '#ef4444', trend: 'Stable', isUp: netBalance >= 0 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
      {stats.map((stat, i) => (
        <motion.div 
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="editorial-card relative overflow-hidden group"
        >
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center bg-surface-container-low transition-transform group-hover:rotate-6 duration-500"
            >
              <stat.icon style={{ color: stat.color }} size={32} />
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full label-sm ${stat.isUp ? 'bg-primary/5 text-primary' : 'bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim'}`}>
              {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {stat.trend}
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="text-5xl font-heading font-bold mb-2 text-primary">
              ${stat.val.toLocaleString()}
            </h2>
            <p className="label-sm opacity-60">{stat.label}</p>
          </div>
          
          {/* Subtle accent bar */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-tertiary-fixed-dim opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      ))}
    </div>
  );
}
