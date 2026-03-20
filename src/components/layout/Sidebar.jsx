import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../common/UI";
import { 
  Users, Layers, DollarSign, Activity, Settings, 
  MapPin, BookOpen, ClipboardList, LogOut, ChevronRight, ShieldCheck
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
      { name: "Attendance Reports", icon: ClipboardList, path: "/admin/reports" },
      { name: "Study Progress", icon: BookOpen, path: "/admin/progress" },
      { name: "Events", icon: Activity, path: "/admin/events" },
      { name: "Finance", icon: DollarSign, path: "/admin/finance" },
    ],
    bible_leader: [
      { name: "My Group Members", icon: Users, path: "/leader" },
      { name: "Take Attendance", icon: ClipboardList, path: "/leader/attendance" },
      { name: "Record Study Progress", icon: BookOpen, path: "/leader/study" },
    ]
  };

  const navItems = menuItems[user?.role] || [];

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
          <Layers size={24} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.025em' }}>ChurchERP</h2>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: '700', letterSpacing: '0.05em' }}>{user?.role?.replace('_', ' ')} Portal</span>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px 16px', 
                  borderRadius: 'var(--radius)',
                  textDecoration: 'none',
                  color: location.pathname === item.path ? 'white' : 'var(--text-muted)',
                  background: location.pathname === item.path ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  fontWeight: location.pathname === item.path ? '600' : '500',
                  transition: '0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {location.pathname === item.path && (
                  <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '4px', background: 'var(--primary)', borderRadius: '0 4px 4px 0' }} />
                )}
                <item.icon size={20} style={{ color: location.pathname === item.path ? 'var(--primary)' : 'inherit' }} />
                <span>{item.name}</span>
                {location.pathname === item.path && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="glass-card" style={{ padding: '16px', marginTop: 'auto', background: 'rgba(255, 255, 255, 0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', opacity: 0.8, display: 'grid', placeItems: 'center', fontWeight: '700' }}>
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.full_name}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <Button 
          variant="danger" 
          onClick={handleLogout} 
          icon={LogOut}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
