import { useState, useEffect } from "react";
import { budgetService } from "../../services/api";
import { Card, Button, Input } from "../../components/common/UI";
import { DollarSign, Layers, CheckCircle2, AlertCircle, Plus, Search, Filter, TrendingUp, TrendingDown, Clock, MoreVertical, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [newBudget, setNewBudget] = useState({
    name: "",
    amount_total: 0,
    amount_used: 0,
    team: "",
    status: "approved",
    period: "Quarterly"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await budgetService.getBudgets();
      setBudgets(data);
    } catch (err) {
      console.error("Error loading budgets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    try {
      await budgetService.createBudget(newBudget);
      setShowModal(false);
      loadData();
      setNewBudget({ name: "", amount_total: 0, amount_used: 0, team: "", status: "approved", period: "Quarterly" });
    } catch (err) {
      console.error("Error creating budget:", err);
    }
  };

  const filteredBudgets = budgets.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.team?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateRemaining = (total, used) => total - used;
  const calculateProgress = (total, used) => (used / total) * 100;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.025em' }}>Financial <span style={{ color: 'var(--tertiary)' }}>Governance</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500' }}>Manage team budgets, track utilization, and approve requests</p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={Plus} style={{ background: 'var(--tertiary)' }}>Create New Budget</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <Card className="stat-card" style={{ borderLeft: '4px solid var(--tertiary)' }}>
          <span className="stat-label">Total Allocated</span>
          <span className="stat-value" style={{ color: 'var(--tertiary)' }}>$45,250</span>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} color="#10b981" /> 12% vs last quarter
          </p>
        </Card>
        <Card className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <span className="stat-label">Total Spend</span>
          <span className="stat-value" style={{ color: '#ef4444' }}>$12,450</span>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingDown size={14} color="#10b981" /> 8% below target
          </p>
        </Card>
        <Card className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <span className="stat-label">Remaining Funds</span>
          <span className="stat-value" style={{ color: '#10b981' }}>$32,800</span>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Wallet size={14} /> Available for projects
          </p>
        </Card>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search budgets by name or team..." 
            className="input-field" 
            style={{ paddingLeft: '48px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
        <AnimatePresence>
          {filteredBudgets.map((budget) => (
            <motion.div 
              key={budget.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card style={{ padding: '24px', height: '100%', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245, 158, 11, 0.1)', display: 'grid', placeItems: 'center', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <Layers size={24} color="var(--tertiary)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{budget.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>For {budget.team || 'General'}</p>
                    </div>
                  </div>
                  <CheckCircle2 color="#10b981" size={24} style={{ opacity: 0.8 }} />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '8px', fontWeight: '600' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Utilization Progress</span>
                    <span>{calculateProgress(budget.amount_total, budget.amount_used).toFixed(0)}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${calculateProgress(budget.amount_total, budget.amount_used)}%` }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, var(--tertiary), #f97316)', borderRadius: '999px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                  <div>
                    <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>Allocated</p>
                    <p style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text)' }}>${budget.amount_total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>Spent</p>
                    <p style={{ fontSize: '1rem', fontWeight: '700', color: '#ef4444' }}>${budget.amount_used.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>Remaining</p>
                    <p style={{ fontSize: '1rem', fontWeight: '700', color: '#10b981' }}>${calculateRemaining(budget.amount_total, budget.amount_used).toLocaleString()}</p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', marginTop: '20px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={12} /> Last updated: March 18, 2026
                  </p>
                  <Button variant="secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>View Ledger</Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '40px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '24px' }}>New Budget <span style={{ color: 'var(--tertiary)' }}>Allocation</span></h2>
            <form onSubmit={handleCreateBudget} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Input label="Budget Name" placeholder="e.g. Easter Program Fund" value={newBudget.name} onChange={e => setNewBudget({...newBudget, name: e.target.value})} required />
              <Input label="Team/Department" placeholder="e.g. Worship Team" value={newBudget.team} onChange={e => setNewBudget({...newBudget, team: e.target.value})} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <Input type="number" label="Total Amount ($)" placeholder="0.00" value={newBudget.amount_total} onChange={e => setNewBudget({...newBudget, amount_total: parseFloat(e.target.value)})} />
                <Input type="number" label="Starting Spend ($)" value={newBudget.amount_used} onChange={e => setNewBudget({...newBudget, amount_used: parseFloat(e.target.value)})} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <Button type="submit" style={{ flex: 1, background: 'var(--tertiary)' }} icon={DollarSign}>Authorize Budget</Button>
                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
