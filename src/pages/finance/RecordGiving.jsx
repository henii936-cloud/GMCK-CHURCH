import { useEffect, useState } from "react";
import { financeService, memberService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Card, Button, Input } from "../../components/common/UI";
import { DollarSign, ShieldCheck, User, Users, Search, Loader2 } from "lucide-react";

export default function RecordGiving() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
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
      const [membersData, budgetsData] = await Promise.all([
        memberService.getMembers(),
        financeService.getApprovedBudgets()
      ]);
      setMembers(membersData);
      setBudgets(budgetsData);
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
        recorded_by: user.id
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

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Record Offering / Tithe</h1>
          <p style={{ color: 'var(--text-muted)' }}>Securely input giving records for your congregation</p>
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
                  <option key={m.id} value={m.id} style={{ background: '#0f172a' }}>{m.name}</option>
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
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '16px' }}>Available Budgets</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {budgets.map(b => (
              <div key={b.id} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600' }}>{b.name}</span>
                <span style={{ color: 'var(--primary)', fontWeight: '700' }}>${b.amount}</span>
              </div>
            ))}
            {budgets.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No approved budgets available.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
