import { formatToEthiopian } from "../../utils/ethiopianDate";
import React, { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { Users, Search, Loader2, Edit2, X } from "lucide-react";
import EtDatePicker from "../../components/common/EtDatePicker";

export default function YouthMembersPage() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("All");
  const [loading, setLoading] = useState(true);
  
  // Birthday editing states
  const [editingMember, setEditingMember] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [birthday, setBirthday] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const { data } = await supabase.from("members").select("*, bible_study_groups(group_name)").in("age_group", ["Youth", "Teen", "Young Adult"]).order("full_name");
    setMembers(data || []);
    setLoading(false);
  };

  const handleOpenEditModal = (member: any) => {
    setEditingMember(member);
    setBirthday(member.date_of_birth || "");
    setShowModal(true);
  };

  const handleSaveBirthday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("members")
        .update({ date_of_birth: birthday || null })
        .eq("id", editingMember.id);
      if (error) throw error;
      setShowModal(false);
      fetchMembers();
    } catch (err) {
      console.error("Error updating birthday:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const groups = ["All", "Teen", "Youth", "Young Adult"];
  const filtered = members.filter(m => {
    const matchSearch = m.full_name?.toLowerCase().includes(search.toLowerCase()) || m.phone?.includes(search);
    const matchGroup = filterGroup === "All" || m.age_group === filterGroup;
    return matchSearch && matchGroup;
  });

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="display-md text-primary mb-2">Youth <span className="text-tertiary-fixed-dim italic">Members</span></h1>
          <p className="label-sm text-on-surface-variant tracking-widest">{members.length} youth registered in the church</p>
        </div>
        {/* Age filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {groups.map(g => (
            <button key={g} onClick={() => setFilterGroup(g)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filterGroup === g ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
        <input type="text" placeholder="Search youth members by name or phone..." className="editorial-input pl-12 w-full bg-surface-container-low" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={36} className="text-primary animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-surface-container rounded-3xl p-6 border border-outline-variant/10 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  {m.image_url ? (
                    <img src={m.image_url} alt={m.full_name} className="w-14 h-14 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-xl">
                      {m.full_name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <p className="font-black text-primary text-sm truncate">{m.full_name}</p>
                    <p className="text-xs text-on-surface-variant">{m.gender || "—"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${
                      m.age_group === "Teen" ? "bg-blue-400/10 text-blue-400" :
                      m.age_group === "Youth" ? "bg-primary/10 text-primary" :
                      "bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim"
                    }`}>{m.age_group}</span>
                    <button 
                      onClick={() => handleOpenEditModal(m)} 
                      className="p-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container text-on-surface-variant hover:text-primary transition-all cursor-pointer"
                      title="Edit Birthday"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {m.phone && <p className="text-xs text-on-surface-variant">📞 {m.phone}</p>}
                  {m.email && <p className="text-xs text-on-surface-variant truncate">✉️ {m.email}</p>}
                  {m.bible_study_groups?.group_name && <p className="text-xs text-on-surface-variant">🏠 {m.bible_study_groups.group_name}</p>}
                  <p className="text-xs text-on-surface-variant">🎂 Birthday: {m.date_of_birth ? formatToEthiopian(m.date_of_birth) : "—"}</p>
                  <p className="text-xs text-on-surface-variant">Joined: {m.join_date ? formatToEthiopian(m.join_date) : "—"}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20 text-on-surface-variant/50">
              <Users size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">No youth members found.</p>
              {filterGroup !== "All" && <p className="text-sm mt-2">Try selecting a different age group.</p>}
            </div>
          )}
        </>
      )}

      {/* Birthday Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-surface border border-outline-variant/10 rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
                <h2 className="headline-sm text-primary font-black">Edit Birthday</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"><X size={24} /></button>
              </div>
              <form onSubmit={handleSaveBirthday} className="p-8 space-y-6">
                <div className="space-y-2">
                  <p className="text-sm text-on-surface font-semibold">Member Name:</p>
                  <p className="text-base text-primary font-bold">{editingMember?.full_name}</p>
                </div>
                <EtDatePicker label="Birth Date" value={birthday} onChange={e => setBirthday(e.target.value)} required={false} name="date_of_birth" />
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-surface-container-low hover:bg-surface-container text-on-surface transition-all cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSaving} className="px-8 py-2.5 rounded-xl text-sm font-bold bg-primary text-on-primary hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50">
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
