import EtDatePicker from "../../components/common/EtDatePicker";
import { useEffect, useState } from "react";
import { financeService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Card, Button, Input } from "../../components/common/UI";
import { DollarSign, ArrowDownRight, Wallet, Calendar, FileText, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Expenses() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  const [formData, setFormData] = useState({
    budget_id: "",
    category: "Utilities",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      const approvedBudgets = await financeService.getApprovedBudgets();
      setBudgets(approvedBudgets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const transactionData = {
        type: "expense",
        category: formData.category,
        amount: parseFloat(formData.amount),
        budget_id: formData.budget_id || null,
        description: formData.description,
        transaction_date: formData.date,
        recorded_by: user.id || null
      };
      
      if (!transactionData.budget_id) delete transactionData.budget_id;
      
      await financeService.createTransaction(transactionData);
      
      // If linked to a budget, we might want to mark it as used or update usage
      // For now, just a simple record
      
      setMessage("Expense recorded successfully!");
      setFormData({
        budget_id: "",
        category: "Utilities",
        amount: "",
        description: "",
        date: new Date().toISOString().split('T')[0]
      });
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error recording expense:", err);
      setMessage(`Error: ${err.message || 'Please try again.'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-20"
      >
        <h1 className="display-lg text-primary mb-8">
          Track <br />
          <span className="text-tertiary-fixed-dim italic font-heading">Church Expenses</span>
        </h1>
        <div className="flex items-center gap-4 text-tertiary-fixed-dim mb-8">
          <div className="w-12 h-[1px] bg-tertiary-fixed-dim" />
          <span className="label-sm tracking-[0.3em]">Financial Stewardship</span>
        </div>
        <p className="headline-sm text-on-surface-variant max-w-2xl leading-relaxed opacity-80">
          Recording every outflow with precision to ensure the resources of the sanctuary are managed with utmost integrity.
        </p>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left Column: Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-7"
        >
          <Card className="p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-fixed-dim/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <form onSubmit={handleSave} className="space-y-12 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <label className="label-sm flex items-center gap-3">
                    <ArrowDownRight size={14} className="text-tertiary-fixed-dim" />
                    Expense Category
                  </label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                    className="w-full h-16 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/10 px-8 text-sm font-bold text-primary appearance-none transition-all duration-500"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23002c53'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 2rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.2rem'
                    }}
                  >
                    <option value="Utilities">Utilities (Water, Electricity)</option>
                    <option value="Maintenance">Maintenance & Repairs</option>
                    <option value="Salaries">Staff Salaries</option>
                    <option value="Outreach">Missions & Outreach</option>
                    <option value="Events">Church Events</option>
                    <option value="Admin">Administrative Costs</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                </div>

                <Input 
                  label="Amount ($)" 
                  type="number" 
                  step="0.01"
                  placeholder="0.00" 
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                  icon={DollarSign}
                  className="space-y-6"
                  inputClassName="h-16"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <label className="label-sm flex items-center gap-3">
                    <Wallet size={14} className="text-tertiary-fixed-dim" />
                    Link to Approved Budget
                  </label>
                  <select 
                    value={formData.budget_id}
                    onChange={(e) => setFormData({...formData, budget_id: e.target.value})}
                    className="w-full h-16 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/10 px-8 text-sm font-bold text-primary appearance-none transition-all duration-500"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23002c53'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 2rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.2rem'
                    }}
                  >
                    <option value="">No specific budget allocation</option>
                    {budgets.map(b => (
                      <option key={b.id} value={b.id}>{b.name} (${b.amount.toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <EtDatePicker 
                  label="Expense Date" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                  icon={Calendar}
                  className="space-y-6"
                  inputClassName="h-16"
                />
              </div>

              <div className="space-y-6">
                <label className="label-sm flex items-center gap-3">
                  <FileText size={14} className="text-tertiary-fixed-dim" />
                  Description / Purpose
                </label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the purpose of this expense..."
                  className="w-full min-h-[120px] rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/10 p-8 text-sm font-medium text-primary placeholder:text-primary/20 transition-all duration-500"
                />
              </div>

              <AnimatePresence mode="wait">
                {message && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-6 rounded-xl text-center font-bold text-[10px] uppercase tracking-[0.2em] border ${message.includes('Error') ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}
                  >
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                type="submit" 
                className="w-full h-20 text-lg shadow-2xl shadow-primary/20" 
                disabled={saving}
                loading={saving}
              >
                Record Expense <ArrowRight size={20} className="ml-4" />
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Right Column: Info & Recent */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-5 space-y-16"
        >
          <div className="editorial-card bg-primary text-on-primary">
            <h3 className="headline-sm mb-6">Expense <span className="italic opacity-60">Policy</span></h3>
            <ul className="space-y-4 label-sm opacity-80">
              <li className="flex gap-3">
                <CheckCircle size={16} className="shrink-0" />
                All expenses over $500 require prior board approval.
              </li>
              <li className="flex gap-3">
                <CheckCircle size={16} className="shrink-0" />
                Receipts must be scanned and filed within 48 hours.
              </li>
              <li className="flex gap-3">
                <CheckCircle size={16} className="shrink-0" />
                Budget allocations must be verified before disbursement.
              </li>
            </ul>
          </div>

          <div className="space-y-8">
            <h3 className="headline-sm text-primary">Budget <span className="text-tertiary-fixed-dim italic">Status</span></h3>
            <div className="space-y-4">
              {loading ? (
                <div className="py-12 text-center"><Loader2 className="animate-spin mx-auto text-tertiary-fixed-dim" /></div>
              ) : budgets.length === 0 ? (
                <p className="label-sm opacity-40 italic">No approved budgets found.</p>
              ) : (
                budgets.slice(0, 5).map(b => (
                  <div key={b.id} className="p-6 rounded-3xl bg-surface-container-low border border-primary/5 group hover:bg-surface transition-all duration-500">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-black text-primary uppercase tracking-wider">{b.name}</span>
                      <span className="headline-sm text-primary font-black">${b.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-primary/5 rounded-full overflow-hidden">
                      <div className="h-full bg-tertiary-fixed-dim w-1/3" /> {/* Mock progress */}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
