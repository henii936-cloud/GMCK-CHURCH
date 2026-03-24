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
      // Get the group the leader is assigned to via the mapping table
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
        // If no group is assigned, fetch available groups
        await fetchAvailableGroups();
        return;
      }
      
      setGroup(groupData);

      // Get member count for this group
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
      // Get all groups and filter out ones that already have a leader
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
      
      // Refresh to show the newly claimed group
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
      <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <p className="label-sm text-tertiary-fixed-dim mb-4 tracking-[0.3em]">Ministry Assignment</p>
          <h1 className="display-lg text-primary mb-6">Welcome, <span className="text-tertiary-fixed-dim italic">{user?.full_name}</span></h1>
          <p className="text-on-surface-variant font-medium tracking-wide max-w-2xl mx-auto leading-relaxed">You haven't been assigned a group yet. Please select one of the available study groups below to begin leading your digital sanctuary.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {availableGroups.length > 0 ? availableGroups.map(g => (
            <div key={g.id} className="editorial-card group hover:scale-[1.02] transition-all duration-500">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-500">
                  <Users size={28} />
                </div>
                <div>
                  <h3 className="headline-sm text-primary group-hover:text-primary transition-colors">{g.group_name}</h3>
                  <p className="label-sm opacity-60">{g.location || 'Location not set'}</p>
                </div>
              </div>
              <Button 
                onClick={() => handleClaimGroup(g.id)} 
                className="w-full py-6 rounded-xl bg-primary text-on-primary hover:bg-tertiary-fixed-dim hover:text-primary transition-all duration-500 font-bold tracking-wide"
                loading={claiming}
              >
                Lead This Group <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
          )) : (
            <div className="col-span-full editorial-card py-20 text-center">
              <p className="text-on-surface-variant font-medium opacity-40 italic">No groups are currently available for selection. Please contact the administrator.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 📊 DASHBOARD VIEW: Once group is assigned
  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
        <div className="max-w-2xl">
          <p className="label-sm text-tertiary-fixed-dim mb-4 tracking-[0.3em]">Ministry Leadership</p>
          <h1 className="display-lg text-primary mb-6">Welcome, <span className="text-tertiary-fixed-dim italic">{user?.full_name}</span></h1>
          <p className="text-on-surface-variant font-medium tracking-wide leading-relaxed">
            Leader of <span className="text-primary font-bold">{group.group_name}</span>. Guiding the congregation through study and fellowship.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-6 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
          <div className="w-12 h-12 rounded-xl bg-tertiary-fixed-dim flex items-center justify-center shadow-lg">
            <Calendar size={20} className="text-on-tertiary-fixed" />
          </div>
          <div>
            <p className="label-sm opacity-60 mb-1">Next Session</p>
            <p className="text-sm font-bold text-primary uppercase tracking-widest">Mar 22 • 05:00 PM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="editorial-card group">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-500">
              <Users size={28} />
            </div>
            <div>
              <p className="label-sm opacity-60 mb-1">Group Members</p>
              <h3 className="text-2xl font-heading font-bold text-primary">{memberCount} Members</h3>
            </div>
          </div>
          <Link to="/leader/members">
            <Button className="w-full py-4 rounded-xl border-2 border-primary/10 bg-transparent text-primary hover:bg-primary hover:text-on-primary transition-all duration-500 font-bold">
              View Members <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>

        <div className="editorial-card group">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
              <ClipboardList size={28} />
            </div>
            <div>
              <p className="label-sm opacity-60 mb-1">Attendance</p>
              <h3 className="text-2xl font-heading font-bold text-primary">Take Today's</h3>
            </div>
          </div>
          <Link to="/leader/attendance">
            <Button className="w-full py-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-500 font-bold shadow-lg shadow-emerald-600/10">
              Record Attendance <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>

        <div className="editorial-card group">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500">
              <BookOpen size={28} />
            </div>
            <div>
              <p className="label-sm opacity-60 mb-1">Study Progress</p>
              <h3 className="text-2xl font-heading font-bold text-primary">Record Progress</h3>
            </div>
          </div>
          <Link to="/leader/study">
            <Button className="w-full py-4 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-all duration-500 font-bold shadow-lg shadow-amber-600/10">
              Log Study Session <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="editorial-card">
          <h3 className="headline-sm text-primary mb-10 flex items-center gap-3">
            <CheckCircle2 size={24} className="text-emerald-500" /> Recent <span className="text-tertiary-fixed-dim italic">Activity</span>
          </h3>
          <div className="space-y-6">
            <div className="ministry-feed-item p-4 rounded-xl bg-surface-container-low border-l-4 border-emerald-500">
              <p className="font-bold text-primary">Attendance Recorded</p>
              <p className="label-sm opacity-60 mt-1">Last Sunday • 12 members present</p>
            </div>
            <div className="ministry-feed-item p-4 rounded-xl bg-surface-container-low border-l-4 border-amber-500">
              <p className="font-bold text-primary">Study Progress Logged</p>
              <p className="label-sm opacity-60 mt-1">Topic: Unity in Christ • Ephesians 1:1-10</p>
            </div>
          </div>
        </div>

        <div className="editorial-card text-center flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-primary mb-6">
            <Calendar size={32} />
          </div>
          <h3 className="headline-sm text-primary mb-2">Upcoming <span className="text-tertiary-fixed-dim italic">Study</span></h3>
          <p className="label-sm opacity-60 mb-6">Next session scheduled for</p>
          <p className="text-3xl font-heading font-bold text-primary mb-2">Sunday, March 22nd</p>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-tertiary-fixed-dim">05:00 PM</p>
        </div>
      </div>
    </div>
  );
}
