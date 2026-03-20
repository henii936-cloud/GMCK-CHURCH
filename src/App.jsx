import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import AdminLogin from "./pages/auth/AdminLogin";
import LeaderLogin from "./pages/auth/LeaderLogin";
import FinanceLogin from "./pages/auth/FinanceLogin";
import Signup from "./pages/auth/signup";
import Landing from "./pages/Landing";
import AdminActivities from "./pages/admin/Activities";
import AdminMembers from "./pages/admin/Members";
import AdminGroups from "./pages/admin/Groups";
import AdminBudgets from "./pages/admin/Budgets";
import AdminReports from "./pages/admin/Reports";
import LeaderAttendance from "./pages/leader/Attendance";
import LeaderStudy from "./pages/leader/Study";
import FinanceGiving from "./pages/finance/RecordGiving";
import FinanceRoute from "./routes/FinanceRoute";
import LeaderRoute from "./routes/LeaderRoute";
import AdminRoute from "./routes/AdminRoute";

// We'll use simple components for pages we didn't implement fully for brevity, 
// but the core features requested are above.

const AdminDashboard = () => (
  <div className="animate-fade-in">
    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '16px' }}>Admin Dashboard</h1>
    <div className="stat-grid">
      <div className="glass-card stat-card"><span className="stat-label">Total Members</span><span className="stat-value">124</span></div>
      <div className="glass-card stat-card"><span className="stat-label">Active Groups</span><span className="stat-value">8</span></div>
      <div className="glass-card stat-card"><span className="stat-label">Monthly Giving</span><span className="stat-value">$12,450</span></div>
    </div>
  </div>
);

const LeaderDashboard = () => (
  <div className="animate-fade-in">
    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '16px' }}>Leader Overview</h1>
    <p style={{ color: 'var(--text-muted)' }}>Manage your group's progress from here.</p>
  </div>
);

const FinanceDashboard = () => (
  <div className="animate-fade-in">
    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '16px' }}>Finance Central</h1>
    <p style={{ color: 'var(--text-muted)' }}>Real-time overview of giving and budget utilization.</p>
  </div>
);

export default function App() {
  console.log("App component mounted");
  useEffect(() => {
    document.title = "ChurchERP - Dashboard";
  }, []);
  
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/login/leader" element={<LeaderLogin />} />
          <Route path="/login/finance" element={<FinanceLogin />} />
          <Route path="/login" element={<Navigate to="/login/admin" />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/admin" element={<Layout allowedRoles={['admin']} />}>
            <Route index element={<AdminDashboard />} />
            <Route path="activities" element={<AdminActivities />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="groups" element={<AdminGroups />} />
            <Route path="budgets" element={<AdminBudgets />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          <Route path="/leader" element={<Layout allowedRoles={['bible_leader']} />}>
            <Route index element={<LeaderDashboard />} />
            <Route path="attendance" element={<LeaderAttendance />} />
            <Route path="study" element={<LeaderStudy />} />
          </Route>

          <Route path="/finance" element={<Layout allowedRoles={['finance']} />}>
            <Route index element={<FinanceDashboard />} />
            <Route path="giving" element={<FinanceGiving />} />
            <Route path="budgets" element={<div>Coming Soon: Approved Budgets View</div>} />
            <Route path="transactions" element={<div>Coming Soon: History Feed</div>} />
          </Route>

          <Route path="/" element={<Landing />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
