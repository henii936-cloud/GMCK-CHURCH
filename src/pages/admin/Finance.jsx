import { useState, useEffect, useMemo } from "react";
import { financeService } from "../../services/api";
import { Card, Button } from "../../components/common/UI";
import {
  DollarSign, TrendingUp, TrendingDown, CheckCircle, Clock,
  Wallet, Heart, ArrowDownRight, PieChart as PieChartIcon,
  BarChart3, CalendarDays, Banknote, ShieldCheck, AlertCircle,
  ArrowUpRight, Layers, Receipt
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import TransactionTable from "../../components/finance/TransactionTable";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = {
  sapphire: 'var(--color-premium-sapphire)',
  gold: 'var(--color-premium-gold)',
  emerald: 'var(--color-premium-emerald)',
  ruby: 'var(--color-premium-ruby)',
  amethyst: 'var(--color-premium-amethyst)',
};

const PIE_COLORS = ['#002c53', '#d4af37', '#065f46', '#9f1239'];

export default function Finance() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transData, budgetData] = await Promise.all([
        financeService.getTransactions(),
        financeService.getBudgets()
      ]);
      setTransactions(transData || []);
      setBudgets(budgetData || []);
    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBudget = async (id) => {
    try {
      await financeService.updateBudgetStatus(id, "Approved");
      fetchData();
    } catch (error) {
      console.error("Error approving budget:", error);
    }
  };

  // ── Computed Finance Metrics ──
  const metrics = useMemo(() => {
    const totalTithes = transactions.filter(t => t.type === 'tithe' || t.category === 'Tithes').reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalOfferings = transactions.filter(t => t.type === 'offering' || t.category === 'Offering').reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalDonations = transactions.filter(t => t.type === 'donation' || t.category === 'Donation').reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense' || t.category === 'Expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalIncome = totalTithes + totalOfferings + totalDonations;
    const netBalance = totalIncome - totalExpenses;

    const approvedBudgets = budgets.filter(b => b.status === 'Approved');
    const pendingBudgets = budgets.filter(b => b.status === 'Pending');
    const totalBudgeted = approvedBudgets.reduce((sum, b) => sum + b.amount, 0);
    const budgetUsage = totalIncome > 0 ? ((totalBudgeted / totalIncome) * 100) : 0;

    return {
      totalTithes, totalOfferings, totalDonations, totalExpenses,
      totalIncome, netBalance, approvedBudgets, pendingBudgets,
      totalBudgeted, budgetUsage
    };
  }, [transactions, budgets]);

  // ── Chart Data ──
  const pieData = useMemo(() => [
    { name: 'Tithes', value: metrics.totalTithes },
    { name: 'Offerings', value: metrics.totalOfferings },
    { name: 'Donations', value: metrics.totalDonations },
    { name: 'Expenses', value: metrics.totalExpenses },
  ].filter(d => d.value > 0), [metrics]);

  const trendData = useMemo(() => {
    const dataMap = {};
    transactions.forEach(t => {
      const date = new Date(t.transaction_date || t.date);
      const month = date.toLocaleString('default', { month: 'short' });
      if (!dataMap[month]) dataMap[month] = { income: 0, expense: 0 };
      if (t.type === 'expense') {
        dataMap[month].expense += t.amount || 0;
      } else {
        dataMap[month].income += t.amount || 0;
      }
    });
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(m => ({
      name: m,
      income: dataMap[m]?.income || 0,
      expense: dataMap[m]?.expense || 0,
    })).filter(d => d.income > 0 || d.expense > 0);
  }, [transactions]);

  // ── Stat cards config ──
  const statCards = [
    {
      label: 'Total Income',
      value: `$${metrics.totalIncome.toLocaleString()}`,
      icon: TrendingUp,
      color: COLORS.emerald,
      description: 'Tithes + Offerings + Donations'
    },
    {
      label: 'Total Expenses',
      value: `$${metrics.totalExpenses.toLocaleString()}`,
      icon: TrendingDown,
      color: COLORS.ruby,
      description: 'All recorded disbursements'
    },
    {
      label: 'Net Balance',
      value: `$${metrics.netBalance.toLocaleString()}`,
      icon: Banknote,
      color: metrics.netBalance >= 0 ? COLORS.sapphire : COLORS.ruby,
      description: metrics.netBalance >= 0 ? 'Healthy surplus' : 'Deficit — review expenses'
    },
    {
      label: 'Budget Allocated',
      value: `$${metrics.totalBudgeted.toLocaleString()}`,
      icon: Layers,
      color: COLORS.amethyst,
      description: `${metrics.budgetUsage.toFixed(1)}% of income`
    },
    {
      label: 'Pending Approvals',
      value: metrics.pendingBudgets.length,
      icon: Clock,
      color: COLORS.gold,
      description: `${metrics.approvedBudgets.length} approved`
    },
  ];

  // ── Helper: parse budget name ──
  const parseBudgetName = (b) => {
    const nameStr = b.name || "General::Untitled";
    const parts = nameStr.split('::');
    return {
      team: parts.length > 1 ? parts[0] : 'General',
      name: parts.length > 1 ? parts[1] : nameStr
    };
  };

  // ── Income breakdown bars ──
  const incomeBreakdown = [
    { label: 'Tithes', value: metrics.totalTithes, icon: Wallet, color: COLORS.sapphire },
    { label: 'Offerings', value: metrics.totalOfferings, icon: DollarSign, color: COLORS.emerald },
    { label: 'Donations', value: metrics.totalDonations, icon: Heart, color: COLORS.gold },
  ];

  const maxIncome = Math.max(...incomeBreakdown.map(i => i.value), 1);

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* ── Editorial Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-4 mb-6 sm:mb-8"
      >
        <div className="max-w-2xl pl-10 lg:pl-0">
          <p className="label-sm text-tertiary-fixed-dim mb-1.5 sm:mb-2 tracking-[0.3em] text-[9px] sm:text-[11px]">Financial Oversight</p>
          <h1 className="display-lg text-primary mb-1.5 sm:mb-2">Finance <span className="text-tertiary-fixed-dim italic">Overview</span></h1>
          <p className="text-on-surface-variant font-medium tracking-wide leading-relaxed text-xs sm:text-sm hidden sm:block">
            Comprehensive view of church finances, budget allocations, and transaction history.
          </p>
        </div>
        <div className="flex items-center gap-3 sm:gap-6 bg-surface-container-low p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-outline-variant/10 self-start">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary flex items-center justify-center shadow-lg signature-gradient shrink-0">
            <CalendarDays size={16} className="text-on-primary sm:hidden" />
            <CalendarDays size={20} className="text-on-primary hidden sm:block" />
          </div>
          <div className="text-right">
            <p className="label-sm opacity-60 mb-0.5 text-[9px] sm:text-[11px]">Current Period</p>
            <p className="text-sm sm:text-lg font-heading font-bold text-primary">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.5 }}
            className={`editorial-card group p-3.5 sm:p-5 flex flex-col justify-between relative overflow-hidden cursor-default ${index === statCards.length - 1 && statCards.length % 2 !== 0 ? 'col-span-2 sm:col-span-1' : ''}`}
            style={{
              borderTop: `3px solid ${stat.color}`,
              boxShadow: `0 8px 24px -8px color-mix(in srgb, ${stat.color} 30%, transparent)`
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
              style={{ background: `linear-gradient(135deg, ${stat.color}, transparent)` }}
            />
            <div className="flex justify-between items-start mb-3 sm:mb-5 relative z-10">
              <div
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 shadow-sm"
                style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 15%, transparent)`, color: stat.color }}
              >
                <stat.icon size={18} strokeWidth={2} className="sm:hidden" />
                <stat.icon size={22} strokeWidth={2} className="hidden sm:block" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="label-sm opacity-70 mb-0.5 sm:mb-1 text-[8px] sm:text-[10px] tracking-[0.12em] sm:tracking-[0.15em]">{stat.label}</p>
              <h3 className="text-lg sm:text-2xl font-heading font-bold" style={{ color: stat.color }}>
                {loading ? '...' : stat.value}
              </h3>
              <p className="text-[9px] sm:text-[10px] text-on-surface-variant mt-0.5 sm:mt-1 font-medium hidden sm:block">{stat.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Income Breakdown + Pie Chart Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Income Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="lg:col-span-3 editorial-card p-5 sm:p-8"
        >
          <div className="flex justify-between items-center mb-5 sm:mb-8">
            <div>
              <h3 className="headline-sm text-primary">Income <span className="text-tertiary-fixed-dim italic">Breakdown</span></h3>
              <p className="label-sm opacity-60 mt-0.5 sm:mt-1 text-[9px] sm:text-[11px]">By category</p>
            </div>
            <BarChart3 size={20} className="text-tertiary-fixed-dim opacity-60 sm:hidden" />
            <BarChart3 size={24} className="text-tertiary-fixed-dim opacity-60 hidden sm:block" />
          </div>
          <div className="space-y-4 sm:space-y-6">
            {incomeBreakdown.map((item, i) => {
              const percentage = metrics.totalIncome > 0 ? ((item.value / metrics.totalIncome) * 100).toFixed(1) : 0;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `color-mix(in srgb, ${item.color} 12%, transparent)`, color: item.color }}
                      >
                        <item.icon size={14} className="sm:hidden" />
                        <item.icon size={18} className="hidden sm:block" />
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-on-surface">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{percentage}%</span>
                      <span className="font-heading font-bold text-sm sm:text-lg" style={{ color: item.color }}>${item.value.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 sm:h-2.5 bg-surface-container-low rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.value / maxIncome) * 100}%` }}
                      transition={{ delay: 0.6 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Distribution Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="lg:col-span-2 editorial-card p-5 sm:p-8 flex flex-col"
        >
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <div>
              <h3 className="headline-sm text-primary">Fund <span className="text-tertiary-fixed-dim italic">Distribution</span></h3>
              <p className="label-sm opacity-60 mt-0.5 sm:mt-1 text-[9px] sm:text-[11px]">Income vs Expenses</p>
            </div>
            <PieChartIcon size={20} className="text-tertiary-fixed-dim opacity-60 sm:hidden" />
            <PieChartIcon size={24} className="text-tertiary-fixed-dim opacity-60 hidden sm:block" />
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[200px] sm:min-h-[240px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                    animationDuration={1200}
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ color: 'var(--color-on-surface-variant)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>{value}</span>}
                  />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}
                    formatter={(value) => [`$${value.toLocaleString()}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <PieChartIcon size={32} className="mx-auto text-on-surface-variant/20 mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm text-on-surface-variant/50 font-medium">No data to display</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Trend Chart ── */}
      {trendData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="editorial-card p-5 sm:p-8 mb-6 sm:mb-8"
        >
          <div className="flex justify-between items-center mb-5 sm:mb-8">
            <div>
              <h3 className="headline-sm text-primary">Monthly <span className="text-tertiary-fixed-dim italic">Trends</span></h3>
              <p className="label-sm opacity-60 mt-0.5 sm:mt-1 text-[9px] sm:text-[11px]">Income vs Expense over time</p>
            </div>
            <TrendingUp size={20} className="text-tertiary-fixed-dim opacity-60 sm:hidden" />
            <TrendingUp size={24} className="text-tertiary-fixed-dim opacity-60 hidden sm:block" />
          </div>
          <div className="h-[200px] sm:h-[280px] w-full -ml-2 sm:ml-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#065f46" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#065f46" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9f1239" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#9f1239" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(val) => `$${val}`}
                  width={45}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface-container-lowest)',
                    border: '1px solid var(--color-outline-variant)',
                    borderRadius: '12px', fontSize: '11px', fontWeight: 700
                  }}
                  formatter={(value, name) => [`$${value.toLocaleString()}`, name === 'income' ? 'Income' : 'Expenses']}
                />
                <Area type="monotone" dataKey="income" stroke="#065f46" strokeWidth={2} fillOpacity={1} fill="url(#incomeGrad)" animationDuration={1500} />
                <Area type="monotone" dataKey="expense" stroke="#9f1239" strokeWidth={2} fillOpacity={1} fill="url(#expenseGrad)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 sm:gap-8 mt-3 sm:mt-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: '#065f46' }} />
              <span className="text-[10px] sm:text-xs font-bold text-on-surface-variant">Income</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: '#9f1239' }} />
              <span className="text-[10px] sm:text-xs font-bold text-on-surface-variant">Expenses</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Budget Section: Allocation Meter + Approved + Pending ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">

        {/* Budget Allocation Meter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="editorial-card p-5 sm:p-8 flex flex-col justify-between md:col-span-2 lg:col-span-1"
        >
          <div className="mb-4 sm:mb-6">
            <h3 className="headline-sm text-primary mb-0.5 sm:mb-1">Budget <span className="text-tertiary-fixed-dim italic">Usage</span></h3>
            <p className="label-sm opacity-60 text-[9px] sm:text-[11px]">Allocation vs total income</p>
          </div>

          {/* Circular Progress */}
          <div className="flex items-center justify-center my-4 sm:my-6">
            <div className="relative">
              <svg width="140" height="140" viewBox="0 0 160 160" className="sm:w-[160px] sm:h-[160px]">
                <circle cx="80" cy="80" r="68" fill="none" stroke="var(--color-surface-container-low)" strokeWidth="12" />
                <motion.circle
                  cx="80" cy="80" r="68"
                  fill="none"
                  stroke={metrics.budgetUsage > 90 ? '#9f1239' : metrics.budgetUsage > 70 ? '#d4af37' : '#065f46'}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 68}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 68 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 68 * (1 - Math.min(metrics.budgetUsage, 100) / 100) }}
                  transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                  transform="rotate(-90 80 80)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl font-heading font-bold text-primary">{metrics.budgetUsage.toFixed(0)}%</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Allocated</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 sm:space-y-3 mt-3 sm:mt-4">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-on-surface-variant font-medium">Total Budgeted</span>
              <span className="font-heading font-bold text-primary">${metrics.totalBudgeted.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-on-surface-variant font-medium">Total Income</span>
              <span className="font-heading font-bold text-primary">${metrics.totalIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm border-t border-outline-variant/10 pt-2.5 sm:pt-3">
              <span className="text-on-surface-variant font-bold">Remaining</span>
              <span className="font-heading font-bold" style={{ color: COLORS.emerald }}>${(metrics.totalIncome - metrics.totalBudgeted).toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* Approved Budgets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="editorial-card p-5 sm:p-8 flex flex-col"
        >
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <div>
              <h3 className="headline-sm text-primary">Approved <span className="text-tertiary-fixed-dim italic">Budgets</span></h3>
              <p className="label-sm opacity-60 mt-0.5 sm:mt-1 text-[9px] sm:text-[11px]">{metrics.approvedBudgets.length} budgets</p>
            </div>
            <ShieldCheck size={20} className="text-tertiary-fixed-dim opacity-60 sm:hidden" />
            <ShieldCheck size={24} className="text-tertiary-fixed-dim opacity-60 hidden sm:block" />
          </div>
          <div className="space-y-2.5 sm:space-y-3 overflow-y-auto flex-1 max-h-[300px] sm:max-h-[360px] pr-1 custom-scrollbar">
            {metrics.approvedBudgets.map((b, i) => {
              const { team, name } = parseBudgetName(b);
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.05 }}
                  className="group flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-surface-container-low hover:bg-surface-container transition-all duration-300 gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div
                      className="inline-block px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-0.5 sm:mb-1"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--color-premium-sapphire) 10%, transparent)', color: COLORS.sapphire }}
                    >
                      {team}
                    </div>
                    <p className="font-bold text-xs sm:text-sm text-on-surface group-hover:text-primary transition-colors truncate">{name}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span
                      className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded-full hidden sm:inline"
                      style={{
                        backgroundColor: b.is_used ? 'color-mix(in srgb, var(--color-on-surface-variant) 8%, transparent)' : 'color-mix(in srgb, #065f46 10%, transparent)',
                        color: b.is_used ? 'var(--color-on-surface-variant)' : '#065f46'
                      }}
                    >
                      {b.is_used ? 'Used' : 'Available'}
                    </span>
                    <span className="font-heading font-bold text-primary text-xs sm:text-sm">${b.amount.toLocaleString()}</span>
                  </div>
                </motion.div>
              );
            })}
            {metrics.approvedBudgets.length === 0 && (
              <div className="text-center py-8 sm:py-12 text-on-surface-variant/40">
                <ShieldCheck size={28} className="mx-auto mb-2 sm:mb-3 opacity-30" />
                <p className="text-xs sm:text-sm font-medium">No approved budgets yet.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Pending Budget Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="editorial-card p-5 sm:p-8 flex flex-col md:col-span-2 lg:col-span-1"
        >
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <div>
              <h3 className="headline-sm text-primary">Pending <span className="text-tertiary-fixed-dim italic">Approvals</span></h3>
              <p className="label-sm opacity-60 mt-0.5 sm:mt-1 text-[9px] sm:text-[11px]">{metrics.pendingBudgets.length} awaiting review</p>
            </div>
            <AlertCircle size={20} className="text-tertiary-fixed-dim opacity-60 sm:hidden" />
            <AlertCircle size={24} className="text-tertiary-fixed-dim opacity-60 hidden sm:block" />
          </div>
          <div className="space-y-3 sm:space-y-4 overflow-y-auto flex-1 max-h-[300px] sm:max-h-[360px] pr-1 custom-scrollbar">
            <AnimatePresence>
              {metrics.pendingBudgets.map((b, i) => {
                const { team, name } = parseBudgetName(b);
                return (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 sm:p-5 rounded-lg sm:rounded-xl bg-surface-container-low border border-outline-variant/10 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-3 sm:mb-4 gap-3">
                      <div className="min-w-0 flex-1">
                        <div
                          className="inline-block px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-1 sm:mb-1.5"
                          style={{ backgroundColor: 'color-mix(in srgb, var(--color-premium-gold) 15%, transparent)', color: COLORS.gold }}
                        >
                          {team}
                        </div>
                        <h4 className="font-bold text-sm sm:text-base text-on-surface truncate">{name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
                          <Clock size={11} className="text-on-surface-variant opacity-50" />
                          <span className="text-[9px] sm:text-[10px] text-on-surface-variant font-medium">Pending review</span>
                        </div>
                      </div>
                      <span className="text-lg sm:text-xl font-heading font-bold text-primary shrink-0">${b.amount.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => handleApproveBudget(b.id)}
                      className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer"
                      style={{
                        backgroundColor: 'color-mix(in srgb, #065f46 12%, transparent)',
                        color: '#065f46',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#065f46'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, #065f46 12%, transparent)'; e.currentTarget.style.color = '#065f46'; }}
                    >
                      <CheckCircle size={13} />
                      Approve Budget
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {metrics.pendingBudgets.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-surface-container mx-auto flex items-center justify-center mb-3 sm:mb-4">
                  <CheckCircle size={22} className="text-on-surface-variant/30" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-on-surface-variant/50">All caught up!</p>
                <p className="text-[10px] sm:text-[11px] text-on-surface-variant/30 mt-1">No pending requests.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Transaction Ledger ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
      >
        <TransactionTable transactions={transactions} />
      </motion.div>
    </div>
  );
}
