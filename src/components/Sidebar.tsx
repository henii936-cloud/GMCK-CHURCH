import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CalendarCheck, 
  CalendarDays, 
  LogOut,
  Church,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

export function Sidebar() {
  const { profile, signOut, setSelectedGroupId } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Members', icon: Users, path: '/members', adminOnly: true },
    { name: 'Bible Study', icon: BookOpen, path: '/groups' },
    { name: 'Attendance', icon: CalendarCheck, path: '/attendance' },
    { name: 'Programs', icon: CalendarDays, path: '/programs', adminOnly: true },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
          <Church size={24} />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 leading-tight">GraceFlow</h1>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">CMS</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-emerald-50 text-emerald-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
            {profile?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name}</p>
            <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
          </div>
        </div>
        {!isAdmin && (
          <button 
            onClick={() => setSelectedGroupId(null)}
            className="w-full flex items-center gap-3 px-3 py-2 mb-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <RefreshCw size={20} />
            Switch Group
          </button>
        )}
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
