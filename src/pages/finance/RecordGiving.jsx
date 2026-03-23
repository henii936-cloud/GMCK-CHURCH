import { useEffect, useState } from "react";
import { financeService, memberService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Card, Button, Input, Modal } from "../../components/common/UI";
import { DollarSign, ShieldCheck, User, Users, Search, Loader2, Plus, Clock, CheckCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RecordGiving() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
      setMembers(membersData);
      setBudgets(approvedBudgets);
      setAllBudgets(allBudgetsData);
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
      await financeService.createTransaction({
        ...formData,
        amount: parseFloat(formData.amount),
        recorded_by: user.id,
        transaction_date: new Date().toISOString().split('T')[0]
      });
      setMessage("Transaction recorded successfully!");
      setFormData({
        member_id: "",
        budget_id: "",
        type: "tithe",
        amount: ""
      });
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error recording transaction. Please try again.");
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

  const handleLogout = async () => {
    await logout();
    navigate("/login/finance");
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
      <div>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Record Offering / Tithe</h1>
            <p style={{ color: 'var(--text-muted)' }}>Securely input giving records for your congregation</p>
          </div>
          <Button variant="danger" icon={LogOut} onClick={handleLogout}>Sign Out</Button>
        </div>

        <Card style={{ padding: '40px' }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Member Reference</label>
              <select 
                className="input-field" 
                value={formData.member_id}
                onChange={(e) => setFormData({...formData, member_id: e.target.value})}
                required
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'white' }}
              >
                <option value="" style={{ background: '#0f172a' }}>Select Member</option>
                {members.map(m => (
                  <option key={m.id} value={m.id} style={{ background: '#0f172a' }}>{m.full_name || m.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Giving Type</label>
                <select 
                  className="input-field" 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'white' }}
                >
                  <option value="tithe" style={{ background: '#0f172a' }}>Tithe</option>
                  <option value="offering" style={{ background: '#0f172a' }}>Offering</option>
                  <option value="donation" style={{ background: '#0f172a' }}>Donation</option>
                </select>
              </div>

              <Input 
                label="Amount ($)" 
                type="number" 
                placeholder="0.00" 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Allocate to Budget (Optional)</label>
              <select 
                className="input-field" 
                value={formData.budget_id}
                onChange={(e) => setFormData({...formData, budget_id: e.target.value})}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'white' }}
              >
                <option value="" style={{ background: '#0f172a' }}>General Funds</option>
                {budgets.map(b => (
                  <option key={b.id} value={b.id} style={{ background: '#0f172a' }}>{b.name} (${b.amount})</option>
                ))}
              </select>
            </div>

            {message && <p style={{ fontWeight: '700', color: message.includes('Error') ? '#ef4444' : '#10b981', textAlign: 'center' }}>{message}</p>}

            <Button type="submit" style={{ height: '48px', justifyContent: 'center', fontSize: '1.25rem' }} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <>Log Transaction <ShieldCheck size={20} style={{ marginLeft: '12px' }} /></>}
            </Button>
          </form>
        </Card>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Card style={{ padding: '32px', background: 'var(--primary)', opacity: 0.9 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)' }}>
              <ShieldCheck size={32} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Secure Protocol</h3>
              <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>Transaction verified by Supabase Auth</p>
            </div>
          </div>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>All financial records are encrypted and audit-trailed. Please ensure you select the correct member reference to maintain accurate annual reports.</p>
        </Card>

        <Card style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Budget Requests</h3>
            <Button size="sm" icon={Plus} onClick={() => setIsBudgetModalOpen(true)}>New</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allBudgets.map(b => (
              <div key={b.id} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: '600', display: 'block' }}>{b.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    {b.status === 'Pending' ? <Clock size={12} className="text-yellow-500" /> : <CheckCircle size={12} className="text-emerald-500" />}
                    {b.status}
                  </span>
                </div>
                <span style={{ color: 'var(--primary)', fontWeight: '700' }}>${b.amount}</span>
              </div>
            ))}
            {allBudgets.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No budgets requested.</p>}
          </div>
        </Card>
      </div>

      <Modal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} title="Request Budget">
        <form onSubmit={handleCreateBudget} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input 
            label="Budget Name" 
            placeholder="e.g., Youth Ministry" 
            required 
            value={budgetForm.name} 
            onChange={(e) => setBudgetForm({...budgetForm, name: e.target.value})} 
          />
          <Input 
            label="Amount ($)" 
            type="number" 
            step="0.01" 
            required 
            value={budgetForm.amount} 
            onChange={(e) => setBudgetForm({...budgetForm, amount: e.target.value})} 
          />
          <Button type="submit" style={{ marginTop: '12px' }}>Submit Request</Button>
        </form>
      </Modal>
    </div>
  );
}
