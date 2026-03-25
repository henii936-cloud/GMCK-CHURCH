import React, { useEffect, useState } from 'react';
import { memberService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Button } from '../../components/common/UI';
import { Users, Search, Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

export default function LeaderMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.id) {
      loadMembers();
    }
  }, [user]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('group_leaders')
        .select('group_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (assignmentError) throw assignmentError;
      
      if (!assignmentData?.group_id) {
        setMembers([]);
        return;
      }

      const data = await memberService.getMembers();
      const groupMembers = data.filter(m => m.group_id === assignmentData.group_id);
      setMembers(groupMembers);
    } catch (err) {
      console.error("Error loading members:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-5 sm:mb-8 pl-10 lg:pl-0">
        <p className="label-sm text-tertiary-fixed-dim mb-1.5 sm:mb-2 tracking-[0.3em] text-[9px] sm:text-[11px]">Ministry Roster</p>
        <h1 className="display-lg text-primary mb-1 sm:mb-2">Group <span className="text-tertiary-fixed-dim italic">Members</span></h1>
        <p className="text-on-surface-variant font-medium tracking-wide text-xs sm:text-sm hidden sm:block">View and manage members of your study group</p>
      </div>

      <Card className="overflow-hidden !p-0">
        {/* Search bar */}
        <div className="p-3 sm:p-6 bg-surface-container-low border-b border-outline-variant/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 opacity-40 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search members..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2.5 sm:py-3 pl-9 sm:pl-12 pr-4 rounded-lg sm:rounded-xl bg-surface-container-lowest text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none border-2 border-transparent focus:border-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-surface-container-lowest shrink-0 self-start sm:self-auto">
            <Users size={16} className="text-primary" />
            <span className="text-xs sm:text-sm font-bold text-on-surface">{members.length} Members</span>
          </div>
        </div>

        {loading ? (
          <div className="p-10 sm:p-16 text-center">
            <div className="w-10 h-10 rounded-full border-4 border-surface-container-low border-t-primary animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-on-surface-variant font-medium">Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-10 sm:p-16 text-center">
            <Users size={36} className="mx-auto text-on-surface-variant/20 mb-3" />
            <p className="text-sm text-on-surface-variant font-medium">No members found.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto p-3">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    <th className="pb-4 pt-2 px-4 label-sm">Name</th>
                    <th className="pb-4 pt-2 px-4 label-sm">Contact Info</th>
                    <th className="pb-4 pt-2 px-4 label-sm">Address</th>
                    <th className="pb-4 pt-2 px-4 label-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 grid place-items-center font-bold text-primary text-sm">
                            {m.full_name?.charAt(0) || '?'}
                          </div>
                          <span className="font-bold text-on-surface text-sm">{m.full_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          {m.email && (
                            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                              <Mail size={12} /> {m.email}
                            </div>
                          )}
                          {m.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                              <Phone size={12} /> {m.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {m.address ? (
                          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                            <MapPin size={12} /> {m.address}
                          </div>
                        ) : (
                          <span className="text-xs text-on-surface-variant/50">Not provided</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          m.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-600' 
                            : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {m.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card layout */}
            <div className="md:hidden p-3 space-y-2.5">
              {filteredMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 grid place-items-center font-bold text-primary text-sm shrink-0">
                    {m.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="font-bold text-sm text-on-surface truncate">{m.full_name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0 ${
                        m.status === 'Active' 
                          ? 'bg-emerald-500/10 text-emerald-600' 
                          : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {m.status || 'Active'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      {m.phone && (
                        <span className="flex items-center gap-1 text-[10px] text-on-surface-variant">
                          <Phone size={10} /> {m.phone}
                        </span>
                      )}
                      {m.email && (
                        <span className="flex items-center gap-1 text-[10px] text-on-surface-variant truncate">
                          <Mail size={10} /> {m.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
