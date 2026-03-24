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
    // Optional: scroll to form or provide feedback
  };

  const handleSave = async (e) => {
    // ... (rest of handleSave)
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
      
      // Remove empty optional IDs to prevent Supabase schema errors
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
      setMessage(`Error recording transaction: ${err.message || 'Please try again.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBudget = async (e) => {
    // ... (rest of handleCreateBudget)
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
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Tip: Search and click a member in the directory on the right to select faster.
              </p>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxHeight: '100vh', overflowY: 'auto', paddingRight: '8px' }}>
        {/* Member Directory Card */}
        <Card style={{ padding: '24px', flex: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Member Directory</h3>
            <div style={{ position: 'relative', width: '60%' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
              <input 
                type="text" 
                placeholder="Search name..." 
                className="input-field"
                style={{ paddingLeft: '36px', height: '36px', fontSize: '0.85rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}><Loader2 className="animate-spin mx-auto" size={20} /></div>
            ) : filteredMembers.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.85rem', padding: '12px' }}>No members found.</p>
            ) : (
              filteredMembers.map(m => (
                <div 
                  key={m.id} 
                  onClick={() => selectMember(m.id)}
                  style={{ 
                    padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', 
                    border: formData.member_id === m.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: '12px'
                  }}
                  className="hover:bg-white/5"
                >
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 }}>
                    {m.full_name?.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: '600', fontSize: '0.9rem', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{m.full_name}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>{m.phone || 'No phone'}</p>
                  </div>
                  {formData.member_id === m.id && <CheckCircle size={16} color="var(--primary)" />}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Budget Requests Card */}
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
