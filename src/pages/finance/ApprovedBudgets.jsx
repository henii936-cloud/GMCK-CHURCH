import { useState, useEffect } from "react";
import { financeService } from "../../services/api";
import { Card, Button } from "../../components/common/UI";
import { Wallet, CheckCircle, Clock, ShieldCheck, XCircle, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ApprovedBudgets() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await financeService.getApprovedBudgets();
      setBudgets(data || []);
    } catch (error) {
      console.error("Error fetching approved budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUsed = async (id, currentUsed) => {
    try {
      await financeService.updateBudgetUsage(id, !currentUsed);
      fetchData();
    } catch (error) {
      console.error("Error updating budget usage:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login/finance");
  };

  return (
    <div className="animate-fade-in p-8 bg-[#051C14] min-h-screen text-white">
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.05em' }}>
            Approved <span style={{ color: '#10b981' }}>Spending Plans</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Manage the disbursement and usage of approved church funds.</p>
        </div>
        <Button variant="danger" icon={LogOut} onClick={handleLogout} style={{ borderRadius: '16px' }}>Sign Out</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {budgets.map(b => {
          const nameStr = b.name || "General::Untitled";
          const parts = nameStr.split('::');
          const team = parts.length > 1 ? parts[0] : 'General';
          const name = parts.length > 1 ? parts[1] : nameStr;
          const isUsed = b.is_used;

          return (
            <Card 
              key={b.id} 
              className={`p-8 border ${isUsed ? 'border-white/5 opacity-60' : 'border-emerald-500/20'} bg-white/[0.03] backdrop-blur-2xl rounded-[32px] transition-all duration-300 hover:scale-[1.02]`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{ width: 56, height: 56, borderRadius: 20, background: isUsed ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.1)', display: 'grid', placeItems: 'center' }}>
                  <Wallet size={28} color={isUsed ? 'rgba(255,255,255,0.3)' : '#10b981'} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '900', color: isUsed ? 'rgba(255,255,255,0.3)' : '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{team}</span>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '900', margin: '4px 0 0 0' }}>${b.amount.toLocaleString()}</h3>
                </div>
              </div>

              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>{name}</h4>
              
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: '16px', 
                background: isUsed ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.05)', 
                border: isUsed ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(16, 185, 129, 0.2)',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: isUsed ? 'rgba(255,255,255,0.4)' : '#10b981'
              }}>
                {isUsed ? <XCircle size={16} /> : <CheckCircle size={16} />}
                {isUsed ? 'Budget Fully Utilized' : 'Funds Available for Use'}
              </div>

              <Button 
                onClick={() => handleToggleUsed(b.id, isUsed)}
                style={{ 
                  width: '100%', 
                  justifyContent: 'center', 
                  borderRadius: '16px',
                  background: isUsed ? 'rgba(255,255,255,0.1)' : '#10b981',
                  color: 'white',
                  fontWeight: '800'
                }}
                icon={isUsed ? Clock : ShieldCheck}
              >
                {isUsed ? 'Mark as UNUSED' : 'Mark as USED'}
              </Button>
            </Card>
          );
        })}
        {budgets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(255,255,255,0.2)', gridColumn: '1/-1' }}>
            <Wallet size={64} style={{ margin: '0 auto 24px', opacity: 0.1 }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>No Approved Budgets</h3>
            <p>Once admin approves a request, it will appear here for you to manage.</p>
          </div>
        )}
      </div>

      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          transition: all 0.3s ease;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
