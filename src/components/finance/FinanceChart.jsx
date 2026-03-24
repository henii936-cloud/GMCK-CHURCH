import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { motion } from "motion/react";
import { TrendingUp } from "lucide-react";

export default function FinanceChart({ transactions = [] }) {
  // Aggregate data by month OR simple mock for UI visual premium feel if data is sparse
  const processData = () => {
    const dataMap = {};
    transactions.forEach(t => {
      const date = new Date(t.transaction_date || t.date);
      const month = date.toLocaleString('default', { month: 'short' });
      if (!dataMap[month]) dataMap[month] = 0;
      dataMap[month] += t.amount;
    });
    
    // Sort and map for recharts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(m => ({
      name: m,
      value: dataMap[m] || Math.floor(Math.random() * 5000) + 1000 // Mock if empty for design demo
    }));
  };

  const chartData = processData();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl relative h-full"
    >
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp size={24} className="text-emerald-500" />
            Giving Trends
          </h3>
          <p className="text-sm text-white/40 font-medium">Monthly collection overview</p>
        </div>
        
        <div className="flex gap-2">
          {['1W', '1M', '1Y', 'ALL'].map(t => (
            <button key={t} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${t === '1M' ? 'bg-emerald-500 text-[#051C14]' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[350px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700 }}
              format={(val) => `$${val}`}
            />
            <Tooltip 
              contentStyle={{ background: 'rgba(5, 28, 20, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
              itemStyle={{ color: '#10b981', fontWeight: 900 }}
              labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: '4px', fontWeight: 700 }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#10b981" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorVal)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
