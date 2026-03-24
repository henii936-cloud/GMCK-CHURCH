import { useState, useEffect } from "react";
import { financeService } from "../../services/api";
import { Card, Button } from "../../components/common/UI";
import { DollarSign, TrendingUp, CheckCircle, Clock, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import TransactionTable from "../../components/finance/TransactionTable";

export default function Finance() {
  const { logout } = useAuth();
  const navigate = useNavigate();
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

  const handleLogout = async () => {
    await logout();
    navigate("/login/admin");
  };

  const totalTithes = transactions.filter(t => t.type === 'tithe' || t.category === 'Tithes').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalOfferings = transactions.filter(t => t.type === 'offering' || t.category === 'Offering').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalDonations = transactions.filter(t => t.type === 'donation' || t.category === 'Donation').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalIncome = totalTithes + totalOfferings + totalDonations;

  const approvedBudgets = budgets.filter(b => b.status === 'Approved');
  const pendingBudgets = budgets.filter(b => b.status === 'Pending');
  
  const totalBudgeted = approvedBudgets.reduce((sum, b) => sum + b.amount, 0);
  const budgetUsage = totalIncome > 0 ? ((totalBudgeted / totalIncome) * 100).toFixed(1) : 0;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Finance Overview</h1>
          <p style={{ color: 'var(--text-muted)' }}>Read-only view of church finances and budget approvals</p>
        </div>
        <Button variant="danger" icon={LogOut} onClick={handleLogout}>Sign Out</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <Card style={{ padding: '24px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981', marginBottom: '12px' }}>
            <TrendingUp size={20} />
            <span style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase' }}>Total Tithes</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>${totalTithes.toLocaleString()}</h2>
        </Card>
        <Card style={{ padding: '24px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#3b82f6', marginBottom: '12px' }}>
            <TrendingUp size={20} />
            <span style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase' }}>Total Offerings</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>${totalOfferings.toLocaleString()}</h2>
        </Card>
        <Card style={{ padding: '24px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#8b5cf6', marginBottom: '12px' }}>
            <TrendingUp size={20} />
            <span style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase' }}>Total Donations</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>${totalDonations.toLocaleString()}</h2>
        </Card>
        <Card style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary)', marginBottom: '12px' }}>
            <DollarSign size={20} />
            <span style={{ fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase' }}>Total Income</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>${totalIncome.toLocaleString()}</h2>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <Card style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '24px' }}>Budget Usage</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: '900', margin: 0, lineHeight: 1 }}>{budgetUsage}%</h2>
            <span style={{ color: 'var(--text-muted)', paddingBottom: '8px', fontWeight: '600' }}>of total income allocated</span>
          </div>
          <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(budgetUsage, 100)}%`, height: '100%', background: 'var(--primary)', borderRadius: '6px' }}></div>
          </div>
          
          <div style={{ marginTop: '32px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>Approved Budgets</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {approvedBudgets.map(b => {
                const nameStr = b.name || "General::Untitled";
                const parts = nameStr.split('::');
                const team = parts.length > 1 ? parts[0] : 'General';
                const name = parts.length > 1 ? parts[1] : nameStr;
                return (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border)', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px' }}>{team}</div>
                      <span style={{ fontWeight: '600' }}>{name}</span>
                    </div>
                    <span style={{ fontWeight: '800', color: 'var(--primary)' }}>${b.amount.toLocaleString()}</span>
                  </div>
                );
              })}
              {approvedBudgets.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No approved budgets.</p>}
            </div>
          </div>
        </Card>

        <Card style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '24px' }}>Pending Budget Approvals</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingBudgets.map(b => {
              const nameStr = b.name || "General::Untitled";
              const parts = nameStr.split('::');
              const team = parts.length > 1 ? parts[0] : 'General';
              const name = parts.length > 1 ? parts[1] : nameStr;
              return (
                <div key={b.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>
                        {team}
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 4px 0' }}>{name}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} className="text-yellow-500" /> Requested
                      </span>
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: '900' }}>${b.amount.toLocaleString()}</span>
                  </div>
                  <Button 
                    onClick={() => handleApproveBudget(b.id)} 
                    style={{ width: '100%', justifyContent: 'center', background: '#10b981', color: 'white' }}
                    icon={CheckCircle}
                  >
                    Approve Budget
                  </Button>
                </div>
              );
            })}
            {pendingBudgets.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                <CheckCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p>All caught up! No pending requests.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div style={{ marginTop: '40px' }}>
        <TransactionTable transactions={transactions} />
      </div>
    </div>
  );
}
