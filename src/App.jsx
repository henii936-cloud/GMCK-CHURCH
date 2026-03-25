import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import AdminLogin from "./pages/auth/AdminLogin";
import LeaderLogin from "./pages/auth/LeaderLogin";
import FinanceLogin from "./pages/auth/FinanceLogin";
import Signup from "./pages/auth/signup";
import Landing from "./pages/Landing";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LeaderDashboard from "./pages/leader/LeaderDashboard";
import AdminLeaders from "./pages/admin/Leaders";
import AdminProgress from "./pages/admin/Progress";
import AdminEvents from "./pages/admin/Events";
import AdminFinance from "./pages/admin/Finance";
import AdminBudgets from "./pages/admin/Budgets";
import AdminMembers from "./pages/admin/Members";
import AdminGroups from "./pages/admin/Groups";
import AdminReports from "./pages/admin/Reports";
import AdminActivities from "./pages/admin/Programs";
import LeaderAttendance from "./pages/leader/Attendance";
import LeaderStudy from "./pages/leader/Study";
import LeaderMembers from "./pages/leader/Members";
import RecordGiving from "./pages/finance/RecordGiving";
import ApprovedBudgets from "./pages/finance/ApprovedBudgets";
import LeaderRoute from "./routes/LeaderRoute";
import AdminRoute from "./routes/AdminRoute";
import FinanceRoute from "./routes/FinanceRoute";
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import Expenses from "./pages/finance/Expenses";
import Reports from "./pages/finance/Reports";

// We'll use simple components for pages we didn't implement fully for brevity, 
// but the core features requested are above.


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

          <Route path="/admin" element={<AdminRoute><Layout allowedRoles={['admin']} /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="groups" element={<AdminGroups />} />
            <Route path="leaders" element={<AdminLeaders />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="progress" element={<AdminProgress />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="budgets" element={<AdminBudgets />} />
            <Route path="programs" element={<AdminActivities />} />
          </Route>

          <Route path="/leader" element={<LeaderRoute><Layout allowedRoles={['bible_leader']} /></LeaderRoute>}>
            <Route index element={<LeaderDashboard />} />
            <Route path="members" element={<LeaderMembers />} />
            <Route path="attendance" element={<LeaderAttendance />} />
            <Route path="study" element={<LeaderStudy />} />
          </Route>

          <Route path="/finance" element={<Layout allowedRoles={['finance']} />}>
            <Route index element={<FinanceDashboard />} />
            <Route path="record" element={<RecordGiving />} />
            <Route path="budgets" element={<ApprovedBudgets />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          <Route path="/" element={<Landing />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
