import React, { useEffect, useState } from 'react';
import { 
  Users, 
  BookOpen, 
  CalendarCheck, 
  CalendarDays,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Link } from 'react-router-dom';

const data = [
  { name: 'Week 1', attendance: 400 },
  { name: 'Week 2', attendance: 300 },
  { name: 'Week 3', attendance: 500 },
  { name: 'Week 4', attendance: 450 },
  { name: 'Week 5', attendance: 600 },
  { name: 'Week 6', attendance: 550 },
];

export function Dashboard() {
  const { profile, selectedGroupId } = useAuth();
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalGroups: 0,
    totalPrograms: 0,
    weeklyAttendance: 0,
    totalIncome: 0,
    totalExpenses: 0
  });

  useEffect(() => {
    async function fetchStats() {
      const supabase = getSupabase();
      const isAdmin = profile?.role === 'admin';
      const isFinance = profile?.role === 'finance';

      if (!supabase) {
        const seed = selectedGroupId ? selectedGroupId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
        setStats({
          totalMembers: isAdmin ? 1250 : (15 + (seed % 20)),
          totalGroups: isAdmin ? 42 : 1,
          totalPrograms: isAdmin ? 8 : (seed % 3),
          weeklyAttendance: isAdmin ? 840 : (12 + (seed % 10)),
          totalIncome: 55000,
          totalExpenses: 43000
        });
        return;
      }

      try {
        let membersQuery: any = supabase.from('members').select('id', { count: 'exact' });
        let groupsQuery: any = supabase.from('bible_study_groups').select('id', { count: 'exact' });

        if (!isAdmin && !isFinance && selectedGroupId) {
          // For leaders, only count members in their selected group
          membersQuery = supabase
            .from('bible_study_members')
            .select('member_id', { count: 'exact' })
            .eq('group_id', selectedGroupId);
          
          groupsQuery = supabase
            .from('bible_study_groups')
            .select('id', { count: 'exact' })
            .eq('id', selectedGroupId);
        }

        const queries: any[] = [membersQuery, groupsQuery];

        if (isAdmin) {
          queries.push(supabase.from('programs').select('id', { count: 'exact' }));
        }

        if (isAdmin || isFinance) {
          queries.push(supabase.from('transactions').select('amount, type'));
        }

        const results = await Promise.all(queries);
        const members = results[0];
        const groups = results[1];
        const programs = isAdmin ? results[2] : { count: 0 };
        const transactions = (isAdmin || isFinance) ? (isAdmin ? results[3] : results[2]) : { data: [] };

        const income = transactions.data?.filter((t: any) => t.type === 'tithe' || t.type === 'offering' || t.type === 'donation').reduce((acc: number, t: any) => acc + t.amount, 0) || 0;
        const expenses = transactions.data?.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0) || 0;

        setStats({
          totalMembers: members.count || 0,
          totalGroups: groups.count || 0,
          totalPrograms: programs.count || 0,
          weeklyAttendance: isAdmin ? 450 : 18, // Mock for now
          totalIncome: income,
          totalExpenses: expenses
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    }
    fetchStats();
  }, [profile?.role, selectedGroupId]);

  const isAdmin = profile?.role === 'admin';
  const isFinance = profile?.role === 'finance';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {profile?.full_name}</h1>
        <p className="text-slate-500">Here's what's happening in your church today.</p>
      </div>

      {isFinance ? (
        <div className="bg-amber-600 p-6 rounded-2xl text-white shadow-lg shadow-amber-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Financial Records Portal</h2>
            <p className="text-amber-100">Record new tithes and offerings for approved budgets.</p>
          </div>
          <Link 
            to="/transactions" 
            className="bg-white text-amber-600 px-6 py-3 rounded-xl font-bold hover:bg-amber-50 transition-colors shrink-0"
          >
            Record Transaction
          </Link>
        </div>
      ) : !isAdmin ? (
        <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-lg shadow-emerald-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Ready to record today's attendance?</h2>
            <p className="text-emerald-100">Keep your group records up to date with just a few clicks.</p>
          </div>
          <Link 
            to="/attendance" 
            className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors shrink-0"
          >
            Mark Attendance Now
          </Link>
        </div>
      ) : (
        <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Manage Bible Study Groups</h2>
            <p className="text-blue-100">Create new groups, assign leaders, and organize your members.</p>
          </div>
          <Link 
            to="/groups" 
            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shrink-0"
          >
            Go to Groups
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isFinance ? (
          <>
            <StatCard 
              title="Total Income" 
              value={`$${stats.totalIncome.toLocaleString()}`} 
              icon={TrendingUp} 
              trend="+12%" 
              trendUp={true}
              color="bg-emerald-500"
            />
            <StatCard 
              title="Total Expenses" 
              value={`$${stats.totalExpenses.toLocaleString()}`} 
              icon={TrendingUp} 
              trend="-5%" 
              trendUp={false}
              color="bg-rose-500"
            />
            <StatCard 
              title="Net Balance" 
              value={`$${(stats.totalIncome - stats.totalExpenses).toLocaleString()}`} 
              icon={TrendingUp} 
              trend="Healthy" 
              trendUp={true}
              color="bg-blue-500"
            />
            <StatCard 
              title="Total Members" 
              value={stats.totalMembers} 
              icon={Users} 
              trend="+12%" 
              trendUp={true}
              color="bg-indigo-500"
            />
          </>
        ) : (
          <>
            <StatCard 
              title="Total Members" 
              value={stats.totalMembers} 
              icon={Users} 
              trend="+12%" 
              trendUp={true}
              color="bg-blue-500"
            />
            <StatCard 
              title="Study Groups" 
              value={stats.totalGroups} 
              icon={BookOpen} 
              trend="+2" 
              trendUp={true}
              color="bg-emerald-500"
            />
            <StatCard 
              title="Weekly Attendance" 
              value={stats.weeklyAttendance} 
              icon={CalendarCheck} 
              trend="-5%" 
              trendUp={false}
              color="bg-amber-500"
            />
            {isAdmin && (
              <StatCard 
                title="Upcoming Programs" 
                value={stats.totalPrograms} 
                icon={CalendarDays} 
                trend="Next: Sunday" 
                trendUp={true}
                color="bg-purple-500"
              />
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="font-bold text-slate-900 mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {!isAdmin ? (
              <>
                <ActivityItem 
                  title="Attendance Recorded" 
                  desc="Youth Bible Study - 18 present" 
                  time="2 hours ago"
                  icon={CalendarCheck}
                  iconColor="text-emerald-600 bg-emerald-50"
                />
                <ActivityItem 
                  title="New Member Added" 
                  desc="Stefan Salvatore joined your group" 
                  time="5 hours ago"
                  icon={Users}
                  iconColor="text-blue-600 bg-blue-50"
                />
                <ActivityItem 
                  title="Group Message Sent" 
                  desc="Reminder for next Tuesday's session" 
                  time="Yesterday"
                  icon={BookOpen}
                  iconColor="text-amber-600 bg-amber-50"
                />
              </>
            ) : (
              <>
                <ActivityItem 
                  title="New Member Joined" 
                  desc="John Doe added to Youth Ministry" 
                  time="2 hours ago"
                  icon={Users}
                  iconColor="text-blue-600 bg-blue-50"
                />
                <ActivityItem 
                  title="Attendance Recorded" 
                  desc="Youth Bible Study - 45 present" 
                  time="5 hours ago"
                  icon={CalendarCheck}
                  iconColor="text-emerald-600 bg-emerald-50"
                />
                <ActivityItem 
                  title="Program Scheduled" 
                  desc="Annual Conference set for Oct 12" 
                  time="Yesterday"
                  icon={CalendarDays}
                  iconColor="text-purple-600 bg-purple-50"
                />
              </>
            )}
          </div>
          <button className="w-full mt-8 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-xl text-white ${color}`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function ActivityItem({ title, desc, time, icon: Icon, iconColor }: any) {
  return (
    <div className="flex gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
        <p className="text-[10px] text-slate-400 mt-1 font-medium uppercase tracking-wider">{time}</p>
      </div>
    </div>
  );
}
