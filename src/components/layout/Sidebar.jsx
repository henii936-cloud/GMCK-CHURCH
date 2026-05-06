import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../common/UI";
import { motion } from "motion/react";
import {
  Users, Layers, DollarSign, Activity, Settings,
  MapPin, BookOpen, ClipboardList, LogOut, ChevronRight, ShieldCheck, Wallet, Heart, ArrowDownRight,
  Menu, X, Briefcase, Zap, Eye, UserCheck, Calendar, Shield, FileText, MessageSquare
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('app_language', newLang);
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

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
      { name: "Evangelism", icon: Heart, path: "/admin/evangelism" },
      { name: "Ministries", icon: Heart, path: "/admin/ministries" },
      { name: "Finance", icon: DollarSign, path: "/admin/finance" },
      { name: "Budgets", icon: Wallet, path: "/admin/budgets" },
      { name: "Reports", icon: ClipboardList, path: "/admin/reports" },
      { name: "Messages", icon: MessageSquare, path: "/admin/messages" },
    ],
    bible_leader: [
      { name: "My Group Members", icon: Users, path: "/leader" },
      { name: "Take Attendance", icon: ClipboardList, path: "/leader/attendance" },
      { name: "Record Study Progress", icon: BookOpen, path: "/leader/study" },
      { name: "Messages", icon: MessageSquare, path: "/leader/messages" },
    ],
    finance: [
      { name: "Dashboard", icon: Layers, path: "/finance" },
      { name: "Approved Budgets", icon: Wallet, path: "/finance/budgets" },
      { name: "Record Giving", icon: DollarSign, path: "/finance/record" },
      { name: "Expenses", icon: ArrowDownRight, path: "/finance/expenses" },
      { name: "Messages", icon: MessageSquare, path: "/finance/messages" },
    ],
    management: [
      { name: "Dashboard", icon: Layers, path: "/management" },
      { name: "Church Workers", icon: UserCheck, path: "/management/workers" },
      { name: "Salary Management", icon: Wallet, path: "/management/salaries" },
      { name: "Finance Overview", icon: DollarSign, path: "/management/finance" },
      { name: "Messages", icon: MessageSquare, path: "/management/messages" },
    ],
    youth_ministry: [
      { name: "Dashboard", icon: Layers, path: "/youth" },
      { name: "Youth Members", icon: Users, path: "/youth/members" },
      { name: "Youth Events", icon: Calendar, path: "/youth/events" },
      { name: "Messages", icon: MessageSquare, path: "/youth/messages" },
    ],
    shepherd: [
      { name: "Overview", icon: Layers, path: "/shepherd" },
      { name: "Bible Study Groups", icon: MapPin, path: "/shepherd/groups" },
      { name: "Evangelism", icon: Heart, path: "/shepherd/evangelism" },
      { name: "Ministries", icon: Heart, path: "/shepherd/ministries" },
      { name: "Messages", icon: MessageSquare, path: "/shepherd/messages" },
    ],
    kids_ministry: [
      { name: "Dashboard", icon: Layers, path: "/kids" },
      { name: "Kids Members", icon: Users, path: "/kids/members" },
      { name: "Classes", icon: Layers, path: "/kids/classes" },
      { name: "Attendance", icon: ClipboardList, path: "/kids/attendance" },
      { name: "Kids Events", icon: Calendar, path: "/kids/events" },
      { name: "Messages", icon: MessageSquare, path: "/kids/messages" },
    ],
  };

  const navItems = menuItems[user?.role?.toLowerCase()] || [];

  const sidebarContent = (
    <>
      <div className="flex flex-col gap-2 mb-16">
        <div className="flex items-center gap-1.5">
          <div className="w-10 h-10 rounded-xl bg-primary grid place-items-center signature-gradient shadow-lg">
            <Layers size={20} className="text-on-primary" />
          </div>
          <h2 className="headline-sm text-primary tracking-tight">Church<span className="text-tertiary-fixed-dim italic">ERP</span></h2>
        </div>
        <p className="label-sm opacity-40 tracking-[0.3em] pl-[46px] -mt-[5px]">{user?.role?.replace('_', ' ')}</p>
      </div>

      <nav className="flex-1 overflow-y-auto pr-2 -mt-[87px]">
        <ul className="list-none flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl no-underline transition-all duration-500 group relative ${isActive ? 'text-primary bg-surface-container-highest' : 'text-on-surface-variant hover:bg-surface-container'}`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-primary rounded-r-full" 
                    />
                  )}
                  <item.icon size={20} className={isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary transition-colors duration-500'} />
                  <span className={`text-sm tracking-tight ${isActive ? 'font-black' : 'font-medium'}`}>{t(item.name)}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto text-primary/40" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto pt-6 border-t border-outline-variant/10">
        
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center justify-between px-4 py-3 mb-4 rounded-xl text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all duration-300"
        >
          <span className="font-medium tracking-tight text-xs uppercase">{t("Language")}: {i18n.language === 'en' ? 'English' : 'አማርኛ'}</span>
          <span className="text-xs font-black bg-surface-container-high px-2 py-1 rounded-md">{i18n.language === 'en' ? 'AM' : 'EN'}</span>
        </button>

        <div className="flex items-center gap-4 mb-8">
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
          <span>{t("Sign Out")}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60] w-11 h-11 rounded-xl bg-surface-container-lowest shadow-lg flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-all duration-300 cursor-pointer border border-outline-variant/10"
        aria-label="Open sidebar"
      >
        <Menu size={22} />
      </button>

      {/* Desktop sidebar */}
      <aside className="sidebar border-r border-outline-variant/5 hidden lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-primary/20 backdrop-blur-sm z-[70]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside 
        className={`lg:hidden fixed inset-y-0 left-0 z-[80] w-[280px] bg-surface-container-low p-6 flex flex-col gap-10 text-on-surface border-none shadow-2xl transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
