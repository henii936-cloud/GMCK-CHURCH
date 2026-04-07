import { DollarSign, Layers, CheckCircle2, AlertCircle, Plus, Users, ArrowLeft, Wallet, Loader2, ShieldCheck, PenTool, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
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
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

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

  const handleApprove = async (id, role, status = 'approved') => {
    try {
      await financeService.approveBudget(id, { id: user.id, full_name: user.full_name }, status, role, "Approved via Dashboard");
      loadData();
    } catch (err) {
      console.error("Approval error:", err);
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-on-surface">
                Teams & <span className="text-tertiary">Departments</span>
              </h1>
              <p className="text-on-surface-variant font-medium mt-1">Manage financial allocations across church groups</p>
            </div>
            <Button onClick={() => setShowTeamModal(true)} icon={Plus} className="bg-tertiary text-on-tertiary hover:bg-tertiary/90 px-6 rounded-full shadow-lg shadow-tertiary/20">
              Add New Team
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {allTeams.map((team, i) => {
              const teamBudgets = budgets.filter(b => ((b.name && b.name.includes("::")) ? b.name.split("::")[0] : "General") === team);
              const totalAllocated = teamBudgets.reduce((sum, b) => sum + (b.amount || 0), 0);
              const totalApproved = teamBudgets.filter(b => b.status === "Approved").reduce((sum, b) => sum + (b.amount || 0), 0);
              const progressPercentage = totalAllocated > 0 ? Math.min((totalApproved / totalAllocated) * 100, 100) : 0;
              
              return (
                <motion.div key={team} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card 
                    className="p-0 overflow-hidden h-full flex flex-col cursor-pointer transition-all duration-300 border border-outline-variant/20 hover:border-tertiary/50 hover:shadow-xl hover:shadow-tertiary/10 group bg-surface relative"
                    onClick={() => openTeamDetails(team)}
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tertiary/40 to-tertiary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                          <Users size={28} className="text-tertiary" />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <h3 className="text-xl font-black text-on-surface truncate group-hover:text-tertiary transition-colors">{team}</h3>
                          <span className="text-sm font-medium text-on-surface-variant">{teamBudgets.length} Budget Plans</span>
                        </div>
                      </div>

                      <div className="mt-auto bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10">
                        <div className="flex justify-between items-center gap-4">
                          <div className="flex-1">
                            <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant/60 mb-1">Requested</p>
                            <p className="text-lg font-black text-on-surface">${totalAllocated.toLocaleString()}</p>
                          </div>
                          <div className="w-px h-10 bg-outline-variant/20" />
                          <div className="flex-1 text-right">
                            <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500/60 mb-1">Approved</p>
                            <p className="text-lg font-black text-emerald-500">${totalApproved.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-surface-container-highest rounded-full mt-4 overflow-hidden relative">
                          <div 
                            className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${progressPercentage}%` }} 
                          />
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
                        <div style={{ height: '5px', background: isApproved ? (budget.is_used ? '#ef4444' : '#10b981') : '#f59e0b' }} />
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
                                  background: budget.is_used ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                  color: budget.is_used ? '#ef4444' : '#10b981',
                                  border: `1px solid ${budget.is_used ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                                }}>
                                  {budget.is_used ? 'FUNDS USED' : 'FUNDS AVAILABLE'}
                                </span>
                              </div>
                            )}
                            
                            {!isApproved && (
                              <div className="mt-4 space-y-3">
                                {isAdmin && (
                                  <div className="flex gap-2">
                                    {(budget.status === 'Pending') && (
                                      <button 
                                        onClick={() => handleApprove(budget.id, 'justifier')}
                                        className="flex-1 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 font-black uppercase text-[9px] tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                      >
                                        <PenTool size={14} /> Justify
                                      </button>
                                    )}
                                    {(budget.status === 'Partially Approved') && (
                                      <button 
                                        onClick={() => handleApprove(budget.id, 'signer')}
                                        className="flex-1 h-9 rounded-lg bg-primary text-white font-black uppercase text-[9px] tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                      >
                                        <ShieldCheck size={14} /> Sign
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => handleApprove(budget.id, budget.status === 'Pending' ? 'justifier' : 'signer', 'rejected')}
                                      className="w-9 h-9 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                    >
                                      <XCircle size={14} />
                                    </button>
                                  </div>
                                )}
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <AlertCircle size={12} color="#f59e0b" /> 
                                  {budget.status === 'Pending' ? 'Requires Justifier Signature' : 'Requires Final Signatory'}
                                </p>
                              </div>
                            )}

                            {/* Attribution History */}
                            {budget.approvals && budget.approvals.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-outline-variant/10 space-y-2">
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">Approval Attribution</p>
                                {budget.approvals.map(app => (
                                  <div key={app.id} className="flex items-center justify-between text-[10px]">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-black ${app.role === 'justifier' ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary'}`}>
                                        {app.role === 'justifier' ? 'J' : 'S'}
                                      </div>
                                      <span className="font-bold text-on-surface/70">{app.approver_name}</span>
                                    </div>
                                    <span className="opacity-40">{new Date(app.approved_at).toLocaleDateString()}</span>
                                  </div>
                                ))}
                              </div>
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
