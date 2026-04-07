import { useState, useEffect } from "react";
import { ministryService, memberService } from "../../services/api";
import { Card, Button, Input } from "../../components/common/UI";
import { 
  Heart, Plus, Users, Search, Trash2, 
  ChevronRight, Filter, Music, Users2, 
  Mic2, Sparkles, X, Edit3, Save 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Ministries() {
  const [ministries, setMinistries] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMinistryName, setNewMinistryName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [selectedMinistry, setSelectedMinistry] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [minData, memData] = await Promise.all([
        ministryService.getMinistries(),
        memberService.getMembers()
      ]);
      setMinistries(minData || []);
      setMembers(memData || []);
    } catch (err) {
      console.error("Error loading ministries:", err);
      setError("Failed to synchronize ministries.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMinistry = async (e) => {
    e.preventDefault();
    if (!newMinistryName.trim()) return;

    try {
      await ministryService.createMinistry(newMinistryName.trim());
      setSuccess(`Ministry "${newMinistryName}" created successfully.`);
      setNewMinistryName("");
      setShowAddModal(false);
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to create ministry.");
    }
  };

  const handleDeleteMinistry = async (id) => {
    if (!window.confirm("Are you sure you want to remove this ministry? This won't delete the members, only the team category.")) return;
    try {
      await ministryService.deleteMinistry(id);
      setSuccess("Ministry deleted.");
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to delete ministry. It might be in use.");
    }
  };

  const getMembersInMinistry = (ministryName) => {
    return members.filter(m => m.ministries && m.ministries.includes(ministryName));
  };

  const filteredMinistries = ministries.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-on-surface">
            Church <span className="text-primary italic">Ministries</span>
          </h1>
          <p className="text-on-surface-variant font-medium mt-1 uppercase tracking-widest text-xs opacity-60">
            Governing groups and service teams
          </p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)} 
          icon={Plus} 
          className="rounded-full px-8 shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
        >
          Establish New Team
        </Button>
      </div>

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-8 p-4 bg-green-500/10 text-green-600 rounded-2xl border border-green-500/20 text-sm font-bold flex items-center gap-3"
        >
          <Sparkles size={18} /> {success}
        </motion.div>
      )}

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-primary p-6 text-on-primary">
          <Music className="mb-4 opacity-50" size={32} />
          <h3 className="text-sm font-black uppercase tracking-[0.2em] opacity-80">Total Teams</h3>
          <p className="text-4xl font-black">{ministries.length}</p>
        </Card>
        <Card className="p-6">
          <Users2 className="mb-4 text-primary/40" size={32} />
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant">Active Volunteers</h3>
          <p className="text-4xl font-black text-primary">
            {members.filter(m => m.ministries && m.ministries.length > 0).length}
          </p>
        </Card>
        <Card className="p-6 border-dashed border-2 border-primary/10 bg-transparent flex flex-col justify-center items-center text-center">
          <Heart className="text-tertiary-fixed-dim pulse-animation mb-2" size={32} />
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest leading-relaxed">
            Service teams increase <br /> engagement by 64%
          </p>
        </Card>
      </div>

      {/* Control Bar */}
      <div className="relative mb-8 max-w-xl">
        <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" />
        <input
          type="text"
          placeholder="Filter teams by name..."
          className="w-full pl-16 pr-6 h-16 rounded-[2rem] border border-outline-variant/10 bg-surface text-on-surface focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Ministries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredMinistries.map((min) => {
          const mInMin = getMembersInMinistry(min.name);
          return (
            <motion.div 
              key={min.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Card className="p-0 overflow-hidden border-outline-variant/5 hover:border-primary/20 transition-all duration-500 shadow-whisper h-full flex flex-col">
                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-all duration-700">
                      <Mic2 size={28} />
                    </div>
                    <button 
                      onClick={() => handleDeleteMinistry(min.id)}
                      className="p-2 rounded-lg text-on-surface-variant/20 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <h3 className="text-2xl font-black text-on-surface mb-2">{min.name}</h3>
                  <div className="flex items-center gap-2 mb-8">
                    <Users size={14} className="text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest text-primary">
                      {mInMin.length} Members Enlisted
                    </span>
                  </div>

                  {/* Members Avatars */}
                  <div className="flex -space-x-3 mb-8">
                    {mInMin.slice(0, 5).map((mem, i) => (
                      <div 
                        key={mem.id} 
                        className="w-10 h-10 rounded-full border-2 border-surface bg-primary/10 overflow-hidden ring-4 ring-transparent group-hover:ring-primary/5 transition-all"
                        title={mem.full_name}
                      >
                        {mem.image_url ? (
                          <img src={mem.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary">
                            {mem.full_name.charAt(0)}
                          </div>
                        )}
                      </div>
                    ))}
                    {mInMin.length > 5 && (
                      <div className="w-10 h-10 rounded-full border-2 border-surface bg-surface-container flex items-center justify-center text-[10px] font-black text-on-surface-variant">
                        +{mInMin.length - 5}
                      </div>
                    )}
                    {mInMin.length === 0 && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 italic">No members assigned yet</span>
                    )}
                  </div>
                </div>

                <div className="px-8 py-5 bg-surface-container-low border-t border-outline-variant/10 flex justify-between items-center group-hover:bg-primary/5 transition-colors">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Team Administration</span>
                  <button 
                    onClick={() => setSelectedMinistry(min.name)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-tertiary-fixed-dim transition-colors group/btn"
                  >
                    View Roster <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Rosters View Modal */}
      <AnimatePresence>
        {selectedMinistry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedMinistry(null)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="bg-primary p-12 text-on-primary shrink-0 relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <h2 className="text-sm font-black uppercase tracking-[0.3em] opacity-60 mb-2">Ministry Roster</h2>
                <h3 className="text-4xl font-black">{selectedMinistry}</h3>
              </div>

              <div className="p-12 overflow-y-auto flex-1">
                <div className="space-y-6">
                  {getMembersInMinistry(selectedMinistry).map(m => (
                    <div key={m.id} className="flex items-center justify-between p-5 rounded-2xl bg-surface-container-low border border-outline-variant/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/5 shadow-sm">
                          {m.image_url ? <img src={m.image_url} alt="" className="w-full h-full object-cover" /> : <Users size={20} className="text-primary" />}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{m.full_name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">{m.bible_study_groups?.group_name || 'No Group'}</p>
                        </div>
                      </div>
                      <div className="px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-black text-primary uppercase tracking-widest">
                        Enlisted
                      </div>
                    </div>
                  ))}
                  {getMembersInMinistry(selectedMinistry).length === 0 && (
                    <div className="text-center py-20 opacity-30">
                      <Users size={64} className="mx-auto mb-6 opacity-20" />
                      <p className="font-black uppercase tracking-widest">No members found in this ministry</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 pt-0 shrink-0">
                <Button onClick={() => setSelectedMinistry(null)} className="w-full py-6 rounded-2xl bg-primary hover:opacity-90">Close Roster</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Ministry Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-surface rounded-[2rem] shadow-2xl p-10 border border-outline-variant/10"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-black text-primary uppercase tracking-widest">New Team Profile</h2>
                <button onClick={() => setShowAddModal(false)} className="text-on-surface-variant hover:text-primary"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddMinistry} className="space-y-8">
                <Input 
                  label="Ministry Name" 
                  placeholder="e.g. Gospel Outreach" 
                  value={newMinistryName}
                  onChange={e => setNewMinistryName(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full h-14 rounded-xl shadow-lg shadow-primary/20">Establish Team</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
