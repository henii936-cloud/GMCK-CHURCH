import { motion } from "motion/react";
import { ListFilter, Search, ArrowRight, Wallet, DollarSign, Heart, ArrowDownRight, User } from "lucide-react";

export default function TransactionTable({ transactions = [] }) {
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'tithe': return { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: Wallet };
      case 'offering': return { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', icon: DollarSign };
      case 'donation': return { color: '#f472b6', bg: 'rgba(244,114,182,0.1)', icon: Heart };
      case 'expense': return { color: '#f87171', bg: 'rgba(248,113,113,0.1)', icon: ArrowDownRight };
      default: return { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: User };
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card p-10 rounded-[40px] border border-white/10 bg-white/[0.03] backdrop-blur-3xl"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h3 className="text-2xl font-black tracking-tight mb-2">Recent <span className="text-emerald-500">History</span></h3>
          <p className="text-emerald-500/50 font-bold text-xs uppercase tracking-widest">Transaction ledger analysis</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase text-white/40 hover:bg-white/10 transition-colors cursor-pointer group">
            <ListFilter size={18} className="group-hover:text-emerald-500" /> Filter Records
          </div>
          <button className="px-6 py-3 rounded-2xl bg-emerald-500 text-[#051C14] text-xs font-black uppercase shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
            Export Ledger
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-4">
          <thead>
            <tr className="text-[11px] font-black uppercase text-white/40 tracking-widest px-6 pb-2 block">
              <th className="w-2/5 p-0">Recipient Profile</th>
              <th className="w-1/5 p-0">Classification</th>
              <th className="w-1/5 p-0">Amount Value</th>
              <th className="w-1/5 p-0 text-right">Verification Date</th>
            </tr>
          </thead>
          <tbody className="block w-full">
            {transactions.map((t, i) => {
              const style = getTypeColor(t.type);
              const Icon = style.icon;
              return (
                <motion.tr 
                  key={t.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-emerald-500/20 rounded-[24px] cursor-pointer transition-all duration-300 block mb-3 flex items-center p-5"
                >
                  <td className="w-2/5 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-[#051C14] transition-all duration-500 shadow-inner">
                      <Icon size={20} className="transition-transform group-hover:rotate-[360deg] duration-700" />
                    </div>
                    <div>
                      <p className="font-black text-white group-hover:text-emerald-500 transition-colors">{t.profiles?.full_name || 'Anonymous'}</p>
                      <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">{t.id.slice(0, 8)}</p>
                    </div>
                  </td>

                  <td className="w-1/5">
                    <div 
                      className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
                      style={{ color: style.color, backgroundColor: style.bg, borderColor: `${style.color}22` }}
                    >
                      {t.type}
                    </div>
                  </td>

                  <td className="w-1/5">
                    <h4 className="text-xl font-black text-white group-hover:scale-110 origin-left transition-transform duration-300">
                      ${(t.amount || 0).toLocaleString()}
                    </h4>
                  </td>

                  <td className="w-1/5 text-right">
                    <p className="text-sm font-bold text-white/40 px-2 py-1 rounded-lg bg-white/5 inline-block">{new Date(t.transaction_date || t.date).toLocaleDateString()}</p>
                  </td>
                </motion.tr>
              );
            })}
            
            {transactions.length === 0 && (
              <div className="text-center py-20 bg-white/[0.01] rounded-[32px] border border-dashed border-white/10">
                <Search size={48} className="mx-auto text-white/10 mb-4" />
                <h4 className="text-xl font-bold text-white/20 uppercase tracking-widest">No transaction data available</h4>
              </div>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
