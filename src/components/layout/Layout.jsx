import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";

export default function Layout({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="grid place-items-center min-h-screen bg-background text-foreground">
      <div className="p-6 rounded-2xl bg-card/50 backdrop-blur-md border border-border text-center">
        <h2 className="mb-4 text-xl font-semibold">Preparing Your CMS...</h2>
        <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  const userRole = (user?.role || user?.user_metadata?.role)?.toLowerCase();

  if (allowedRoles && !allowedRoles.some(r => r.toLowerCase() === userRole)) {
    const rolePath = {
      admin: "/admin",
      bible_leader: "/leader",
      finance: "/finance"
    };
    return <Navigate to={rolePath[userRole] || "/login"} replace />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="flex-1 min-h-screen bg-surface relative overflow-hidden w-full">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] rounded-full bg-tertiary-fixed-dim/5 blur-[100px] pointer-events-none" />
        
        {/* Vertical Rail Text (Editorial Touch) — hidden on mobile */}
        <div className="fixed right-8 top-1/2 -translate-y-1/2 vertical-text opacity-10 pointer-events-none select-none hidden xl:block">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">
            The Digital Sanctuary • GMKC Church ERP • Est. 2026
          </span>
        </div>

        <div className="main-content relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
