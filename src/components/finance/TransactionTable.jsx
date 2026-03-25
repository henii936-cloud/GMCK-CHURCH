import { motion } from "motion/react";
import { ListFilter, Search, ArrowRight, Wallet, DollarSign, Heart, ArrowDownRight, User } from "lucide-react";

export default function TransactionTable({ transactions = [] }) {
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'tithe': return { color: '#002c53', bg: 'rgba(0,44,83,0.05)', icon: Wallet };
      case 'offering': return { color: '#002c53', bg: 'rgba(0,44,83,0.05)', icon: DollarSign };
      case 'donation': return { color: '#eac077', bg: 'rgba(234,192,119,0.1)', icon: Heart };
      case 'expense': return { color: '#eac077', bg: 'rgba(234,192,119,0.1)', icon: ArrowDownRight };
      default: return { color: '#44474e', bg: 'rgba(68,71,78,0.05)', icon: User };
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="editorial-card p-4 sm:p-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6 mb-6 sm:mb-12">
        <div>
          <h3 className="headline-md text-primary mb-1 sm:mb-2">Recent <span className="text-tertiary-fixed-dim italic">History</span></h3>
          <p className="label-sm opacity-60 text-[9px] sm:text-[11px]">Transaction ledger analysis</p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-surface-container-low text-[10px] sm:text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer group flex-1 sm:flex-none justify-center">
            <ListFilter size={14} className="group-hover:text-primary" />
            <span className="sm:inline">Filter</span>
          </div>
          <button className="btn-primary text-[10px] sm:text-sm py-2 sm:py-3 px-4 sm:px-6 flex-1 sm:flex-none">
            Export
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/10">
              <th className="pb-6 label-sm">Recipient Profile</th>
              <th className="pb-6 label-sm">Classification</th>
              <th className="pb-6 label-sm">Amount Value</th>
              <th className="pb-6 label-sm text-right">Verification Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => {
              const style = getTypeColor(t.type);
              const Icon = style.icon;
              return (
                <motion.tr 
                  key={t.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group hover:bg-surface-container-low transition-all duration-300 cursor-pointer"
                >
                  <td className="py-6 pr-4">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-500">
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-on-surface group-hover:text-primary transition-colors">{t.members?.full_name || 'Anonymous'}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Recorded by: {t.profiles?.full_name || 'Staff'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-6 px-4">
                    <div 
                      className="inline-flex items-center px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest"
                      style={{ color: style.color, backgroundColor: style.bg }}
                    >
                      {t.type}
                    </div>
                  </td>

                  <td className="py-6 px-4">
                    <h4 className="text-xl font-heading font-bold text-primary group-hover:scale-105 origin-left transition-transform duration-300">
                      ${(t.amount || 0).toLocaleString()}
                    </h4>
                  </td>

                  <td className="py-6 pl-4 text-right">
                    <p className="text-sm font-medium text-on-surface-variant">{new Date(t.transaction_date || t.date).toLocaleDateString()}</p>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {transactions.map((t, i) => {
          const style = getTypeColor(t.type);
          const Icon = style.icon;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all duration-300"
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: style.bg, color: style.color }}
              >
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="font-bold text-sm text-on-surface truncate">{t.members?.full_name || 'Anonymous'}</p>
                  <span className="font-heading font-bold text-primary text-sm shrink-0">${(t.amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span 
                    className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest"
                    style={{ color: style.color, backgroundColor: style.bg }}
                  >
                    {t.type}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-medium">{new Date(t.transaction_date || t.date).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {transactions.length === 0 && (
        <div className="text-center py-12 sm:py-24 bg-surface-container-low rounded-lg mt-4 sm:mt-8">
          <Search size={36} className="mx-auto text-on-surface-variant/20 mb-3 sm:mb-4" />
          <h4 className="headline-sm text-on-surface-variant/40">No transaction data available</h4>
        </div>
      )}
    </motion.div>
  );
}
