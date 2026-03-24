import { motion } from "motion/react";
import { Wallet, DollarSign, Heart, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function SummaryCards({ transactions = [] }) {
  const sumByType = (type) => 
    transactions.filter(t => t.type === type).reduce((sum, t) => sum + (t.amount || 0), 0);

  const stats = [
    { label: "Total Tithes", val: sumByType('tithe'), icon: Wallet, color: '#10b981', trend: '+12.5%', isUp: true },
    { label: "Offerings", val: sumByType('offering'), icon: DollarSign, color: '#60a5fa', trend: '+5.2%', isUp: true },
    { label: "Donations", val: sumByType('donation'), icon: Heart, color: '#f472b6', trend: '-2.1%', isUp: false },
    { label: "Total Expense", val: sumByType('expense'), icon: ArrowDownRight, color: '#f87171', trend: '+8.4%', isUp: false },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat, i) => (
        <motion.div 
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card p-8 rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl relative overflow-hidden group"
        >
          {/* Decorative radial gradient */}
          <div 
            className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 blur-3xl group-hover:scale-150 transition-transform duration-700"
            style={{ backgroundColor: stat.color }}
          ></div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12 duration-500"
              style={{ background: `rgba(255,255,255,0.05)`, border: `1px solid rgba(255,255,255,0.1)` }}
            >
              <stat.icon style={{ color: stat.color }} size={28} />
            </div>
            
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${stat.isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {stat.trend}
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-1 group-hover:scale-105 origin-left transition-transform duration-500">
              ${stat.val.toLocaleString()}
            </h2>
            <p className="text-white/40 font-bold text-sm tracking-wide uppercase">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
