import { useEffect, useState } from "react";
import { financeService, memberService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Card, Button, Input, Modal } from "../../components/common/UI";
import { DollarSign, ShieldCheck, User, Users, Search, Loader2, Plus, Clock, CheckCircle, Wallet, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function RecordGiving() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [allBudgets, setAllBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetForm, setBudgetForm] = useState({ name: "", amount: "" });
  
  const [formData, setFormData] = useState({
    member_id: "",
    budget_id: "",
    type: "tithe",
    amount: ""
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const [membersData, approvedBudgets, allBudgetsData] = await Promise.all([
        memberService.getMembers(),
        financeService.getApprovedBudgets(),
        financeService.getBudgets()
      ]);
      setMembers(membersData || []);
      setBudgets(approvedBudgets || []);
      setAllBudgets(allBudgetsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone?.includes(searchTerm) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectMember = (id) => {
    setFormData({ ...formData, member_id: id });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        recorded_by: user.id || null,
        transaction_date: new Date().toISOString().split('T')[0]
      };
      
      if (!transactionData.member_id) delete transactionData.member_id;
      if (!transactionData.budget_id) delete transactionData.budget_id;
      
      await financeService.createTransaction(transactionData);
      setMessage("Transaction recorded successfully!");
      setFormData({
        member_id: "",
        budget_id: "",
        type: "tithe",
        amount: ""
      });
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Critical: Error recording transaction:", err);
      setMessage(`Error: ${err.message || 'Please try again.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    try {
      await financeService.createBudget({
        name: budgetForm.name,
        amount: parseFloat(budgetForm.amount)
      });
      setIsBudgetModalOpen(false);
      setBudgetForm({ name: "", amount: "" });
      load();
    } catch (err) {
      console.error("Error creating budget:", err);
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
          Record <br />
          <span className="text-tertiary-fixed-dim italic font-heading">Giving & Tithes</span>
        </h1>
        <div className="flex items-center gap-4 text-tertiary-fixed-dim mb-8">
          <div className="w-12 h-[1px] bg-tertiary-fixed-dim" />
          <span className="label-sm tracking-[0.3em]">Financial Stewardship</span>
        </div>
        <p className="headline-sm text-on-surface-variant max-w-2xl leading-relaxed opacity-80">
          Maintaining the sanctity of financial contributions through meticulous record-keeping and transparent stewardship.
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
              <div className="space-y-6">
                <label className="label-sm flex items-center gap-3">
                  <User size={14} className="text-tertiary-fixed-dim" />
                  Member Reference
                </label>
                <div className="relative">
                  <select 
                    value={formData.member_id}
                    onChange={(e) => setFormData({...formData, member_id: e.target.value})}
                    required
                    className="w-full h-16 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/10 px-8 text-sm font-bold text-primary appearance-none transition-all duration-500"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23002c53'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 2rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.2rem'
                    }}
                  >
                    <option value="">Select Member from Directory</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.full_name || m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <label className="label-sm flex items-center gap-3">
                    <Plus size={14} className="text-tertiary-fixed-dim" />
                    Giving Type
                  </label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                    className="w-full h-16 rounded-xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/10 px-8 text-sm font-bold text-primary appearance-none transition-all duration-500"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23002c53'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 2rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.2rem'
                    }}
                  >
                    <option value="tithe">Tithe</option>
                    <option value="offering">Offering</option>
                    <option value="donation">Donation</option>
                    <option value="first_fruit">First Fruit</option>
                  </select>
                </div>

                <Input 
                  label="Amount ($)" 
                  type="number" 
                  placeholder="0.00" 
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                  icon={DollarSign}
                  className="space-y-6"
                  inputClassName="h-16"
                />
              </div>

              <div className="space-y-6">
                <label className="label-sm flex items-center gap-3">
                  <Wallet size={14} className="text-tertiary-fixed-dim" />
                  Allocate to Budget (Optional)
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
                  <option value="">General Church Funds</option>
                  {budgets.map(b => (
                    <option key={b.id} value={b.id}>{b.name} (${b.amount.toLocaleString()})</option>
                  ))}
                </select>
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
                Log Transaction <ArrowRight size={20} className="ml-4" />
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Right Column: Directory & Requests */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-5 space-y-16"
        >
          {/* Member Directory */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="headline-sm text-primary">Directory</h3>
              <div className="relative w-48">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full h-10 pl-10 pr-4 rounded-full bg-surface-container-low border-none text-[10px] font-bold text-primary placeholder:text-primary/20 outline-none focus:bg-surface-container transition-all duration-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-4 custom-scrollbar">
              {loading ? (
                <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-tertiary-fixed-dim" size={40} /></div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-dashed border-primary/10">
                  <Users size={32} className="mx-auto text-primary/10 mb-4" />
                  <p className="label-sm opacity-40 italic">No members found.</p>
                </div>
              ) : (
                filteredMembers.map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => selectMember(m.id)}
                    className={`w-full p-6 rounded-2xl border-2 transition-all duration-500 flex items-center gap-6 text-left group
                      ${formData.member_id === m.id ? 'border-tertiary-fixed-dim bg-tertiary-fixed-dim/5' : 'border-transparent bg-surface-container-low hover:bg-surface-container'}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 overflow-hidden
                      ${formData.member_id === m.id ? 'bg-tertiary-fixed-dim text-on-tertiary-fixed' : 'bg-primary text-on-primary'}`}>
                      {m.image_url ? (
                        <img src={m.image_url} alt={m.full_name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        m.full_name?.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-primary truncate uppercase tracking-wider mb-1">{m.full_name}</p>
                      <p className="text-[10px] opacity-40 font-bold tracking-widest">{m.phone || 'No Contact Info'}</p>
                    </div>
                    {formData.member_id === m.id && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle size={20} className="text-tertiary-fixed-dim" />
                      </motion.div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Budget Requests */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="headline-sm text-primary">Budget Requests</h3>
              <button 
                onClick={() => setIsBudgetModalOpen(true)}
                className="w-10 h-10 rounded-full bg-tertiary-fixed-dim text-on-tertiary-fixed flex items-center justify-center hover:scale-110 transition-all duration-500 shadow-lg shadow-tertiary-fixed-dim/20"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {allBudgets.slice(0, 4).map(b => (
                <div key={b.id} className="p-6 rounded-3xl bg-surface-container-low border border-primary/5 flex justify-between items-center group hover:bg-surface transition-all duration-500">
                  <div className="space-y-2">
                    <span className="text-xs font-black text-primary uppercase tracking-wider block">{b.name}</span>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${b.status === 'Pending' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${b.status === 'Pending' ? 'text-amber-600' : 'text-emerald-600'}`}>{b.status}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="headline-sm text-primary font-black block">${b.amount.toLocaleString()}</span>
                    <span className="text-[10px] opacity-30 font-bold uppercase tracking-widest">Requested</span>
                  </div>
                </div>
              ))}
              {allBudgets.length === 0 && (
                <div className="text-center py-12 bg-surface-container-low rounded-3xl border border-dashed border-primary/10">
                  <p className="label-sm opacity-40 italic">No active requests.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <Modal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} title="New Budget Request">
        <form onSubmit={handleCreateBudget} className="space-y-10">
          <Input 
            label="Budget Name" 
            placeholder="e.g., Youth Ministry Outreach" 
            required 
            value={budgetForm.name} 
            onChange={(e) => setBudgetForm({...budgetForm, name: e.target.value})} 
            className="space-y-4"
            inputClassName="h-16"
          />
          <Input 
            label="Amount ($)" 
            type="number" 
            step="0.01" 
            placeholder="0.00"
            required 
            value={budgetForm.amount} 
            onChange={(e) => setBudgetForm({...budgetForm, amount: e.target.value})} 
            icon={DollarSign}
            className="space-y-4"
            inputClassName="h-16"
          />
          <Button type="submit" className="w-full h-16 mt-6 shadow-xl shadow-primary/10">Submit Official Request</Button>
        </form>
      </Modal>
    </div>
  );
}
