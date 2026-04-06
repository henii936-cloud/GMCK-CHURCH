import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion } from "motion/react";
import { Users, Search, Loader2, Filter } from "lucide-react";

export default function YouthMembersPage() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const { data } = await supabase.from("members").select("*, bible_study_groups(group_name)").in("age_group", ["Youth", "Teen", "Young Adult"]).order("full_name");
    setMembers(data || []);
    setLoading(false);
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
                  <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${
                    m.age_group === "Teen" ? "bg-blue-400/10 text-blue-400" :
                    m.age_group === "Youth" ? "bg-primary/10 text-primary" :
                    "bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim"
                  }`}>{m.age_group}</span>
                </div>
                <div className="space-y-1.5">
                  {m.phone && <p className="text-xs text-on-surface-variant">📞 {m.phone}</p>}
                  {m.email && <p className="text-xs text-on-surface-variant truncate">✉️ {m.email}</p>}
                  {m.bible_study_groups?.group_name && <p className="text-xs text-on-surface-variant">🏠 {m.bible_study_groups.group_name}</p>}
                  <p className="text-xs text-on-surface-variant">Joined: {m.join_date ? new Date(m.join_date).toLocaleDateString() : "—"}</p>
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
    </div>
  );
}
