import { useState, useEffect } from "react";
import { financeService } from "../../services/api";
import { Card, Button, Input } from "../../components/common/UI";
import { DollarSign, Layers, CheckCircle2, AlertCircle, Plus, Users, ArrowLeft, Wallet, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View states: 'teams' or 'team-details'
  const [currentView, setCurrentView] = useState('teams');
  const [activeTeam, setActiveTeam] = useState(null);

  // Modals
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Form states
  const [newTeamName, setNewTeamName] = useState("");
  const [sessionTeams, setSessionTeams] = useState(["Worship Department", "Youth Ministry", "Media Team"]);
  const [newBudget, setNewBudget] = useState({ name: "", amount_total: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await financeService.getBudgets();
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
      const formattedName = `${activeTeam}::${newBudget.name}`;
      const budgetData = {
        name: formattedName,
        amount: newBudget.amount_total,
      };
      
      await financeService.createBudget(budgetData);
      setShowConfigModal(false);
      loadData();
      setNewBudget({ name: "", amount_total: 0 });
    } catch (err) {
      console.error("Error creating budget:", err);
    }
  };

  const handleAddTeam = (e) => {
    e.preventDefault();
    if (newTeamName && !sessionTeams.includes(newTeamName)) {
      setSessionTeams([...sessionTeams, newTeamName]);
    }
    setNewTeamName("");
    setShowTeamModal(false);
  };

  const openTeamDetails = (teamName) => {
    setActiveTeam(teamName);
    setCurrentView('team-details');
  };

  const goBackToTeams = () => {
    setActiveTeam(null);
    setCurrentView('teams');
  };

  // Derive all unique teams
  const dbTeams = [...new Set(budgets.map(b => (b.name && b.name.includes("::")) ? b.name.split("::")[0] : "General"))];
  const allTeams = [...new Set(["General", ...sessionTeams, ...dbTeams])];

  return (
    <div className="animate-fade-in" style={{ height: '100%', minHeight: '80vh' }}>
      
      {currentView === 'teams' ? (
        // ==========================================
        // VIEW 1: TEAMS DASHBOARD
        // ==========================================
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.025em' }}>
                Teams & <span style={{ color: 'var(--tertiary)' }}>Departments</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '500' }}>Manage financial allocations across church groups</p>
            </div>
            <Button onClick={() => setShowTeamModal(true)} icon={Plus} style={{ background: 'var(--tertiary)', padding: '12px 24px', fontSize: '1rem' }}>
              Add New Team
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {allTeams.map((team, i) => {
              const teamBudgets = budgets.filter(b => ((b.name && b.name.includes("::")) ? b.name.split("::")[0] : "General") === team);
              const totalAllocated = teamBudgets.reduce((sum, b) => sum + (b.amount || 0), 0);
              const totalApproved = teamBudgets.filter(b => b.status === "Approved").reduce((sum, b) => sum + (b.amount || 0), 0);
              
              return (
                <motion.div key={team} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card style={{ padding: '0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--border)' }} className="hover:border-tertiary/50 hover:shadow-lg" onClick={() => openTeamDetails(team)}>
                    <div style={{ padding: '24px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(16, 185, 129, 0.1)', display: 'grid', placeItems: 'center' }}>
                          <Users size={24} color="var(--tertiary)" />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{team}</h3>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>{teamBudgets.length} Budget Plans</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>Requested</p>
                          <p style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text)' }}>${totalAllocated.toLocaleString()}</p>
                        </div>
                        <div style={{ width: '1px', background: 'var(--border)' }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>Approved</p>
                          <p style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981' }}>${totalApproved.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      ) : (

        // ==========================================
        // VIEW 2: INSIDE A SPECIFIC TEAM
        // ==========================================
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <button 
            onClick={goBackToTeams} 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', padding: '0 0 20px 0', alignSelf: 'flex-start' }}
          >
            <ArrowLeft size={16} /> Back to All Teams
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.025em' }}>
                {activeTeam} <span style={{ color: 'var(--primary)' }}>Budgets</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: '500' }}>Allocate and manage individual budget plans for this team</p>
            </div>
            <Button onClick={() => setShowConfigModal(true)} icon={Plus} style={{ padding: '12px 24px', fontSize: '1rem' }}>
              Create Allocation Plan
            </Button>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, paddingBottom: '20px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 16px' }} /> Loading...
              </div>
            ) : budgets.filter(b => ((b.name && b.name.includes("::")) ? b.name.split("::")[0] : "General") === activeTeam).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <Wallet size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>No Budgets Yet</h3>
                <p>Click "Create Allocation Plan" to setup the first budget panel for the {activeTeam}.</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {budgets.filter(b => ((b.name && b.name.includes("::")) ? b.name.split("::")[0] : "General") === activeTeam).map((budget, i) => {
                  const rawName = (budget.name || "").split('::');
                  const dpyName = rawName.length > 1 ? rawName[1] : budget.name;
                  const isApproved = budget.status === "Approved";

                  return (
                    <motion.div key={budget.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card style={{ padding: '0', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '5px', background: isApproved ? '#10b981' : '#f59e0b' }} />
                        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', background: isApproved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: isApproved ? '#10b981' : '#f59e0b', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>
                              {budget.status}
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Panel #{i+1}</span>
                          </div>

                          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', lineHeight: '1.3' }}>{dpyName}</h3>

                          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px', marginTop: 'auto', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Requested Amt</span>
                              <span style={{ fontSize: '1.25rem', fontWeight: '900', color: isApproved ? '#10b981' : 'var(--text)' }}>
                                ${(budget.amount || 0).toLocaleString()}
                              </span>
                            </div>
                            
                            {isApproved && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>UTILITY STATUS</span>
                                <span style={{ 
                                  fontSize: '0.65rem', 
                                  fontWeight: '900', 
                                  padding: '2px 8px', 
                                  borderRadius: '4px', 
                                  background: budget.is_used ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.1)',
                                  color: budget.is_used ? 'var(--text-muted)' : '#10b981',
                                  border: `1px solid ${budget.is_used ? 'var(--border)' : 'rgba(16, 185, 129, 0.2)'}`
                                }}>
                                  {budget.is_used ? 'FUNDS USED' : 'FUNDS AVAILABLE'}
                                </span>
                              </div>
                            )}
                            
                            {!isApproved && (
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px' }}>
                                <AlertCircle size={12} color="#f59e0b" /> Pending admin review in Finance
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Add Team Modal */}
      {showTeamModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px' }}>Add <span style={{ color: 'var(--tertiary)' }}>New Team</span></h2>
            <form onSubmit={handleAddTeam} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Input label="Team/Department Name" placeholder="e.g. Media Team, Choir" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} required />
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <Button type="submit" style={{ flex: 1, background: 'var(--tertiary)' }}>Create Team</Button>
                <Button variant="secondary" onClick={() => setShowTeamModal(false)}>Cancel</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Allocate Budget Plan Modal */}
      {showConfigModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>Create <span style={{ color: 'var(--primary)' }}>Allocation Panel</span></h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>This request will be sent to Finance for approval under <b>{activeTeam}</b>.</p>
            
            <form onSubmit={handleCreateBudget} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Input label="Plan / Item Name" placeholder="e.g. New Microphones" value={newBudget.name} onChange={e => setNewBudget({...newBudget, name: e.target.value})} required />
              <Input type="number" label="Requested Amount ($)" placeholder="0.00" value={newBudget.amount_total} onChange={e => setNewBudget({...newBudget, amount_total: parseFloat(e.target.value)})} required />
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <Button type="submit" style={{ flex: 1 }} icon={DollarSign}>Submit to Finance</Button>
                <Button variant="secondary" onClick={() => setShowConfigModal(false)}>Cancel</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
