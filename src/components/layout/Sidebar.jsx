import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../common/UI";
import { motion } from "motion/react";
import {
  Users, Layers, DollarSign, Activity, Settings,
  MapPin, BookOpen, ClipboardList, LogOut, ChevronRight, ShieldCheck, Wallet, Heart, ArrowDownRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = {
    admin: [
      { name: "Dashboard", icon: Layers, path: "/admin" },
      { name: "Members", icon: Users, path: "/admin/members" },
      { name: "Bible Study Groups", icon: MapPin, path: "/admin/groups" },
      { name: "Study Progress", icon: BookOpen, path: "/admin/progress" },
      { name: "Events", icon: Activity, path: "/admin/events" },
      { name: "Finance", icon: DollarSign, path: "/admin/finance" },
      { name: "Budgets", icon: Wallet, path: "/admin/budgets" },
    ],
    bible_leader: [
      { name: "My Group Members", icon: Users, path: "/leader" },
      { name: "Take Attendance", icon: ClipboardList, path: "/leader/attendance" },
      { name: "Record Study Progress", icon: BookOpen, path: "/leader/study" },
    ],
    finance: [
      { name: "Dashboard", icon: Layers, path: "/finance" },
      { name: "Approved Budgets", icon: Wallet, path: "/finance/budgets" },
      { name: "Record Giving", icon: DollarSign, path: "/finance/record" },
      { name: "Expenses", icon: ArrowDownRight, path: "/finance/expenses" },
      { name: "Reports", icon: ClipboardList, path: "/finance/reports" },
    ]
  };

  const navItems = menuItems[user?.role?.toLowerCase()] || [];

  return (
    <aside className="sidebar border-r border-outline-variant/5">
      <div className="flex flex-col gap-2 mb-16 px-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary grid place-items-center signature-gradient shadow-lg">
            <Layers size={20} className="text-on-primary" />
          </div>
          <h2 className="headline-sm text-primary tracking-tight">Church<span className="text-tertiary-fixed-dim italic">ERP</span></h2>
        </div>
        <p className="label-sm opacity-40 tracking-[0.3em] pl-14">{user?.role?.replace('_', ' ')}</p>
      </div>

      <nav className="flex-1 overflow-y-auto pr-2">
        <ul className="list-none flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-4 px-6 py-4 rounded-xl no-underline transition-all duration-500 group relative ${isActive ? 'text-primary bg-surface-container-highest' : 'text-on-surface-variant hover:bg-surface-container'}`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-primary rounded-r-full" 
                    />
                  )}
                  <item.icon size={20} className={isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary transition-colors duration-500'} />
                  <span className={`text-sm tracking-tight ${isActive ? 'font-black' : 'font-medium'}`}>{item.name}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto text-primary/40" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto pt-10 border-t border-outline-variant/10">
        <div className="flex items-center gap-4 mb-8 px-4">
          <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed-dim grid place-items-center font-heading font-bold text-on-tertiary-fixed shadow-whisper">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-primary truncate">{user?.full_name}</p>
            <p className="label-sm opacity-40 lowercase tracking-widest">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all duration-500"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
