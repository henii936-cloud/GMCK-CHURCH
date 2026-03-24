import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Users, Wallet, Loader2, ArrowUpRight, ArrowDownRight, Bell, Search, LayoutDashboard, FileText, PieChart as PieChartIcon } from "lucide-react";
import { financeService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import SummaryCards from "../../components/finance/SummaryCards";
import TransactionTable from "../../components/finance/TransactionTable";
import { motion } from "motion/react";

export default function FinanceDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    transactions: [],
    budgets: [],
    loading: true
  });

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true }));
      const [trans, budgetResults] = await Promise.all([
        financeService.getTransactions().catch(() => []),
        financeService.getBudgets().catch(() => [])
      ]);
      setData({
        transactions: trans || [],
        budgets: budgetResults || [],
        loading: false
      });
    } catch (err) {
      console.error("Error loading finance data:", err);
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

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
        <div className="max-w-2xl">
          <h1 className="display-lg text-primary mb-4">Finance <span className="text-tertiary-fixed-dim italic">Center</span></h1>
          <p className="label-sm text-tertiary-fixed-dim mb-6 tracking-[0.3em]">Financial Stewardship</p>
          <p className="text-on-surface-variant font-medium tracking-wide leading-relaxed">Spiritual stewardship and financial transparency. Managing the resources of the sanctuary with integrity and grace.</p>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search financial records..." 
              className="editorial-input pl-12 w-72 bg-surface-container-low focus:bg-surface-container-lowest transition-all"
            />
          </div>
          <button className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center relative hover:bg-surface-container transition-all group border border-outline-variant/10">
            <Bell size={22} className="text-on-surface-variant group-hover:text-primary" />
            <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-tertiary-fixed-dim rounded-full border-2 border-surface"></span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="space-y-12">
        {/* Row 1: Summary Cards */}
        <SummaryCards transactions={data.transactions} />

        {/* Row 3: Transaction Table */}
        <TransactionTable transactions={data.transactions} />
      </div>
    </div>
  );
}
