import React, { useEffect, useState } from 'react';
import { 
  Users, ClipboardList, BookOpen, 
  CheckCircle2, Calendar, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../services/supabaseClient';
import { groupService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, Button } from '../../components/common/UI';
import { Link } from 'react-router-dom';

export default function LeaderDashboard() {
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchGroupData();
    }
  }, [user]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('group_leaders')
        .select(`
          group_id,
          bible_study_groups:group_id (*)
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (assignmentError) throw assignmentError;
      
      const groupData = assignmentData?.bible_study_groups;
      
      if (!groupData) {
        await fetchAvailableGroups();
        return;
      }
      
      setGroup(groupData);

      const { count, error: memberError } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupData.id);

      if (memberError) throw memberError;
      setMemberCount(count || 0);

    } catch (err) {
      console.error("Error fetching group data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableGroups = async () => {
    try {
      const data = await groupService.getGroups();
      const unassigned = data.filter(g => g.leaders.length === 0);
      setAvailableGroups(unassigned || []);
    } catch (err) {
      console.error("Error fetching available groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimGroup = async (groupId) => {
    setClaiming(true);
    try {
      await groupService.assignLeader(groupId, user.id);
      fetchGroupData();
    } catch (err) {
      console.error("Error claiming group:", err);
      alert("Failed to claim group. It might have been taken by another leader.");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="w-12 h-12 rounded-full border-4 border-surface-container-low border-t-primary animate-spin mb-6"></div>
      <p className="label-sm text-primary tracking-widest uppercase font-black">Synchronizing Group Data</p>
    </div>
  );

  // 🚪 SELECTION VIEW: If leader has no group
  if (!group) {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto px-1">
        <div className="text-center mb-10 sm:mb-20 pl-10 lg:pl-0">
          <p className="label-sm text-tertiary-fixed-dim mb-2 sm:mb-4 tracking-[0.3em] text-[9px] sm:text-[11px]">Ministry Assignment</p>
          <h1 className="display-lg text-primary mb-3 sm:mb-6">Welcome, <span className="text-tertiary-fixed-dim italic">{user?.full_name}</span></h1>
          <p className="text-on-surface-variant font-medium tracking-wide max-w-2xl mx-auto leading-relaxed text-xs sm:text-base">You haven't been assigned a group yet. Please select one of the available study groups below to begin leading your digital sanctuary.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
          {availableGroups.length > 0 ? availableGroups.map(g => (
            <div key={g.id} className="editorial-card group hover:scale-[1.02] transition-all duration-500 p-5 sm:p-8">
              <div className="flex items-center gap-3 sm:gap-6 mb-5 sm:mb-8">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-500 shrink-0">
                  <Users size={22} className="sm:hidden" />
                  <Users size={28} className="hidden sm:block" />
                </div>
                <div className="min-w-0">
                  <h3 className="headline-sm text-primary group-hover:text-primary transition-colors truncate">{g.group_name}</h3>
                  <p className="label-sm opacity-60 text-[9px] sm:text-[11px]">{g.location || 'Location not set'}</p>
                </div>
              </div>
              <Button 
                onClick={() => handleClaimGroup(g.id)} 
                className="w-full py-3 sm:py-6 rounded-xl bg-primary text-on-primary hover:bg-tertiary-fixed-dim hover:text-primary transition-all duration-500 font-bold tracking-wide text-sm sm:text-base"
                loading={claiming}
              >
                Lead This Group <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          )) : (
            <div className="col-span-full editorial-card py-12 sm:py-20 text-center">
              <p className="text-on-surface-variant font-medium opacity-40 italic text-sm">No groups are currently available for selection. Please contact the administrator.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 📊 DASHBOARD VIEW: Once group is assigned
  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:gap-8 mb-8 sm:mb-20">
        <div className="max-w-2xl pl-10 lg:pl-0">
          <p className="label-sm text-tertiary-fixed-dim mb-2 sm:mb-4 tracking-[0.3em] text-[9px] sm:text-[11px]">Ministry Leadership</p>
          <h1 className="display-lg text-primary mb-2 sm:mb-6">Welcome, <span className="text-tertiary-fixed-dim italic">{user?.full_name}</span></h1>
          <p className="text-on-surface-variant font-medium tracking-wide leading-relaxed text-xs sm:text-base">
            Leader of <span className="text-primary font-bold">{group.group_name}</span>. Guiding the congregation through study and fellowship.
          </p>
        </div>
        <div className="flex items-center gap-3 sm:gap-6 bg-surface-container-low p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-outline-variant/10 self-start">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-tertiary-fixed-dim flex items-center justify-center shadow-lg shrink-0">
            <Calendar size={16} className="text-on-tertiary-fixed sm:hidden" />
            <Calendar size={20} className="text-on-tertiary-fixed hidden sm:block" />
          </div>
          <div>
            <p className="label-sm opacity-60 mb-0.5 sm:mb-1 text-[9px] sm:text-[11px]">Next Session</p>
            <p className="text-xs sm:text-sm font-bold text-primary uppercase tracking-widest">Mar 22 • 05:00 PM</p>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-16">
        <div className="editorial-card group p-5 sm:p-8">
          <div className="flex items-center gap-3 sm:gap-6 mb-5 sm:mb-8">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-500 shrink-0">
              <Users size={22} className="sm:hidden" />
              <Users size={28} className="hidden sm:block" />
            </div>
            <div>
              <p className="label-sm opacity-60 mb-0.5 sm:mb-1 text-[9px] sm:text-[11px]">Group Members</p>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-primary">{memberCount} Members</h3>
            </div>
          </div>
          <Link to="/leader/members">
            <Button className="w-full py-3 sm:py-4 rounded-xl border-2 border-primary/10 bg-transparent text-primary hover:bg-primary hover:text-on-primary transition-all duration-500 font-bold text-sm sm:text-base">
              View Members <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>

        <div className="editorial-card group p-5 sm:p-8">
          <div className="flex items-center gap-3 sm:gap-6 mb-5 sm:mb-8">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-surface-container-low flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shrink-0">
              <ClipboardList size={22} className="sm:hidden" />
              <ClipboardList size={28} className="hidden sm:block" />
            </div>
            <div>
              <p className="label-sm opacity-60 mb-0.5 sm:mb-1 text-[9px] sm:text-[11px]">Attendance</p>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-primary">Take Today's</h3>
            </div>
          </div>
          <Link to="/leader/attendance">
            <Button className="w-full py-3 sm:py-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-500 font-bold shadow-lg shadow-emerald-600/10 text-sm sm:text-base">
              Record Attendance <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>

        <div className="editorial-card group p-5 sm:p-8 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 sm:gap-6 mb-5 sm:mb-8">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-surface-container-low flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500 shrink-0">
              <BookOpen size={22} className="sm:hidden" />
              <BookOpen size={28} className="hidden sm:block" />
            </div>
            <div>
              <p className="label-sm opacity-60 mb-0.5 sm:mb-1 text-[9px] sm:text-[11px]">Study Progress</p>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-primary">Record Progress</h3>
            </div>
          </div>
          <Link to="/leader/study">
            <Button className="w-full py-3 sm:py-4 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-all duration-500 font-bold shadow-lg shadow-amber-600/10 text-sm sm:text-base">
              Log Study Session <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Activity + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-12">
        <div className="editorial-card p-5 sm:p-8">
          <h3 className="headline-sm text-primary mb-5 sm:mb-10 flex items-center gap-2 sm:gap-3">
            <CheckCircle2 size={20} className="text-emerald-500 sm:hidden" />
            <CheckCircle2 size={24} className="text-emerald-500 hidden sm:block" />
            Recent <span className="text-tertiary-fixed-dim italic">Activity</span>
          </h3>
          <div className="space-y-3 sm:space-y-6">
            <div className="ministry-feed-item p-3 sm:p-4 rounded-lg sm:rounded-xl bg-surface-container-low border-l-4 border-emerald-500">
              <p className="font-bold text-primary text-sm sm:text-base">Attendance Recorded</p>
              <p className="label-sm opacity-60 mt-0.5 sm:mt-1 text-[9px] sm:text-[11px]">Last Sunday • 12 members present</p>
            </div>
            <div className="ministry-feed-item p-3 sm:p-4 rounded-lg sm:rounded-xl bg-surface-container-low border-l-4 border-amber-500">
              <p className="font-bold text-primary text-sm sm:text-base">Study Progress Logged</p>
              <p className="label-sm opacity-60 mt-0.5 sm:mt-1 text-[9px] sm:text-[11px]">Topic: Unity in Christ • Ephesians 1:1-10</p>
            </div>
          </div>
        </div>

        <div className="editorial-card text-center flex flex-col items-center justify-center py-10 sm:py-16 p-5 sm:p-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-surface-container-low flex items-center justify-center text-primary mb-4 sm:mb-6">
            <Calendar size={24} className="sm:hidden" />
            <Calendar size={32} className="hidden sm:block" />
          </div>
          <h3 className="headline-sm text-primary mb-1 sm:mb-2">Upcoming <span className="text-tertiary-fixed-dim italic">Study</span></h3>
          <p className="label-sm opacity-60 mb-3 sm:mb-6 text-[9px] sm:text-[11px]">Next session scheduled for</p>
          <p className="text-xl sm:text-3xl font-heading font-bold text-primary mb-1 sm:mb-2">Sunday, March 22nd</p>
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-tertiary-fixed-dim">05:00 PM</p>
        </div>
      </div>
    </div>
  );
}
