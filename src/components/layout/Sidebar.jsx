import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../common/UI";
import {
  Users, Layers, DollarSign, Activity, Settings,
  MapPin, BookOpen, ClipboardList, LogOut, ChevronRight, ShieldCheck, Wallet
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
      { name: "Group Leaders", icon: ShieldCheck, path: "/admin/leaders" },
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
      { name: "Tithes", icon: Wallet, path: "/finance/tithes" },
      { name: "Offerings", icon: DollarSign, path: "/finance/offerings" },
      { name: "Donations", icon: Heart, path: "/finance/donations" },
      { name: "Expenses", icon: ArrowDownRight, path: "/finance/expenses" },
      { name: "Reports", icon: ClipboardList, path: "/finance/reports" },
    ]
  };

  const navItems = menuItems[user?.role?.toLowerCase()] || [];

  return (
    <aside className="sidebar">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary grid place-items-center">
          <Layers size={24} className="text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">ChurchERP</h2>
          <span className="text-xs uppercase text-primary font-bold tracking-wider">{user?.role?.replace('_', ' ')} Portal</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="list-none flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg no-underline transition-all duration-200 relative overflow-hidden ${isActive ? 'text-foreground bg-primary/15 font-semibold' : 'text-muted-foreground hover:bg-secondary/50 font-medium'}`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-[20%] bottom-[20%] w-1 bg-primary rounded-r-md" />
                  )}
                  <item.icon size={20} className={isActive ? 'text-primary' : 'text-inherit'} />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="glass-card p-4 mt-auto bg-white/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-primary/80 grid place-items-center font-bold text-primary-foreground">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm whitespace-nowrap text-ellipsis">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <Button
          variant="danger"
          onClick={handleLogout}
          icon={LogOut}
          className="w-full justify-center"
        >
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
