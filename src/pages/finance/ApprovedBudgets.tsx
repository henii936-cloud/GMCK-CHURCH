import { useState, useEffect } from "react";
import { financeService } from "../../services/api";
import { Card, Button } from "../../components/common/UI";
import { Wallet, CheckCircle, Clock, ShieldCheck, XCircle, Calendar, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ApprovedBudgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await financeService.getApprovedBudgets();
      setBudgets(data || []);
    } catch (error) {
      console.error("Error fetching approved budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUsed = async (id, currentUsed) => {
    try {
      await financeService.updateBudgetUsage(id, !currentUsed);
      fetchData();
    } catch (error) {
      console.error("Error updating budget usage:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-6">
          <h1 className="display-lg text-primary leading-[0.88] tracking-tight">
            Approved <br />
            <span className="text-tertiary-fixed-dim italic font-heading">Spending Plans</span>
          </h1>
          <div className="flex items-center gap-3 text-tertiary-fixed-dim">
            <Calendar size={20} />
            <span className="label-sm font-black uppercase tracking-[0.2em]">Fiscal Year 2024</span>
          </div>
          <p className="headline-sm opacity-60 max-w-xl leading-relaxed">
            Manage the disbursement and usage of approved church funds with stewardship and transparency.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="label-sm opacity-40 uppercase tracking-widest mb-1">Total Approved</p>
            <p className="headline-sm text-primary font-black">
              ${budgets.reduce((acc, b) => acc + (b.amount || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="w-px h-12 bg-primary/10 hidden sm:block" />
          <div className="text-right">
            <p className="label-sm opacity-40 uppercase tracking-widest mb-1">Active Budgets</p>
            <p className="headline-sm text-tertiary-fixed-dim font-black">
              {budgets.filter(b => !b.is_used).length}
            </p>
          </div>
        </div>
      </header>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {budgets.map((b, index) => {
            const nameStr = b.name || "General::Untitled";
            const parts = nameStr.split('::');
            const team = parts.length > 1 ? parts[0] : 'General';
            const name = parts.length > 1 ? parts[1] : nameStr;
            const isUsed = b.is_used;

            return (
              <motion.div
                key={b.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
              >
                <Card 
                  className={`group relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 !p-5`}
                  style={{ borderTop: `3px solid ${isUsed ? '#ef4444' : '#10b981'}` }}
                >
                  {/* Status Indicator */}
                  <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl font-black uppercase tracking-widest text-[8px] ${isUsed ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-600'}`}>
                    {isUsed ? 'Utilized' : 'Available'}
                  </div>

                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-10 h-10 rounded-xl grid place-items-center transition-colors duration-500 ${isUsed ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-600'}`}>
                      <Wallet size={20} />
                    </div>
                    <div className="text-right pt-1">
                      <p className={`font-black uppercase tracking-widest text-[8px] mb-0.5 ${isUsed ? 'text-red-400' : 'text-emerald-500'}`}>{team}</p>
                      <p className="text-xl font-heading font-bold text-on-surface leading-none">${b.amount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-on-surface mb-1 line-clamp-1">{name}</h3>
                      <p className="text-[10px] opacity-60 leading-relaxed">
                        Approved for disbursement.
                      </p>
                    </div>

                    <div className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors duration-500 ${isUsed ? 'bg-red-500/5 border-red-500/15 text-red-500' : 'bg-emerald-500/5 border-emerald-500/15 text-emerald-600'}`}>
                      {isUsed ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        {isUsed ? 'Fully Utilized' : 'Ready for Disbursement'}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleToggleUsed(b.id, isUsed)}
                      className={`w-full h-10 rounded-lg font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all duration-500 cursor-pointer ${isUsed ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20'}`}
                    >
                      {isUsed ? <><Clock size={14} /> Reactivate</> : <><ShieldCheck size={14} /> Mark Utilized</>}
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {budgets.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-32 text-center"
          >
            <div className="w-24 h-24 rounded-[3rem] bg-primary/5 grid place-items-center mx-auto mb-8">
              <Wallet size={48} className="text-primary/20" />
            </div>
            <h3 className="headline-sm text-primary mb-4">No Approved Budgets</h3>
            <p className="label-sm opacity-40 max-w-md mx-auto leading-relaxed">
              Once the administration approves a budget request, it will appear here for your management and disbursement.
            </p>
          </motion.div>
        )}
      </div>

      {loading && budgets.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="editorial-card h-[400px] animate-pulse bg-primary/5 rounded-[32px]" />
          ))}
        </div>
      )}
    </div>
  );
}
