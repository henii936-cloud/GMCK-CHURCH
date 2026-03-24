import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Users, Wallet, Loader2, ArrowUpRight, ArrowDownRight, Bell, Search, LayoutDashboard, FileText, PieChart as PieChartIcon } from "lucide-react";
import { financeService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import SummaryCards from "../../components/finance/SummaryCards";
import FinanceChart from "../../components/finance/FinanceChart";
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
      <div className="flex h-screen items-center justify-center bg-[#051C14]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Loader2 size={48} className="text-emerald-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#051C14] text-white p-8 animate-fade-in dashboard-container">
      {/* Top Header Section */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Finance <span className="text-emerald-500">Center</span></h1>
          <p className="text-emerald-500/60 font-medium">Spiritual Stewardship & Financial Transparency</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/40 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search records..." 
              className="bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all w-64"
            />
          </div>
          <button className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative hover:bg-white/10 transition-colors group">
            <Bell size={22} className="text-emerald-400" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#051C14]"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="text-right">
              <p className="text-sm font-bold leading-tight">{user?.full_name}</p>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Finance Officer</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-[#051C14] flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-500/20">
              {user?.full_name?.charAt(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="space-y-8">
        {/* Row 1: Summary Cards */}
        <SummaryCards transactions={data.transactions} />

        {/* Row 2: Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <FinanceChart transactions={data.transactions} />
          </div>
          <div className="glass-card p-8 rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl flex flex-col h-full">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <PieChartIcon className="text-emerald-500" size={24} />
              Distribution
            </h3>
            <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
              {/* Custom Pie Chart Concept or Placeholder for better UI visual */}
              <div className="w-48 h-48 rounded-full border-[16px] border-emerald-500/20 flex flex-col items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-[16px] border-t-emerald-500 border-r-emerald-500 rotate-[45deg]"></div>
                <h2 className="text-3xl font-black">78%</h2>
                <p className="text-[10px] text-emerald-500 uppercase font-black tracking-widest">Efficiency</p>
              </div>
            </div>
            <div className="space-y-4 mt-6">
              {[
                { label: 'Tithes', color: 'bg-emerald-500', val: '65%' },
                { label: 'Offerings', color: 'bg-emerald-400', val: '20%' },
                { label: 'Donations', color: 'bg-emerald-300', val: '15%' }
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color} group-hover:scale-125 transition-transform`}></div>
                    <span className="text-sm font-medium text-white/60">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Transaction Table */}
        <TransactionTable transactions={data.transactions} />
      </div>

      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .glass-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        .dashboard-container::-webkit-scrollbar {
          width: 8px;
        }
        .dashboard-container::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
