import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import AdminLogin from "./pages/auth/AdminLogin";
import LeaderLogin from "./pages/auth/LeaderLogin";
import FinanceLogin from "./pages/auth/FinanceLogin";
import ManagementLogin from "./pages/auth/ManagementLogin";
import YouthLogin from "./pages/auth/YouthLogin";
import ShepherdLogin from "./pages/auth/ShepherdLogin";
import Signup from "./pages/auth/signup";
import Landing from "./pages/Landing";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LeaderDashboard from "./pages/leader/LeaderDashboard";
import AdminLeaders from "./pages/admin/Leaders";
import AdminProgress from "./pages/admin/Progress";
import AdminEvents from "./pages/admin/Events";
import AdminEvangelism from "./pages/admin/Evangelism";
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
import ManagementRoute from "./routes/ManagementRoute";
import YouthRoute from "./routes/YouthRoute";
import ShepherdRoute from "./routes/ShepherdRoute";
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import Expenses from "./pages/finance/Expenses";
import Reports from "./pages/finance/Reports";
// Management pages
import ManagementDashboard from "./pages/management/ManagementDashboard";
import Workers from "./pages/management/Workers";
import Salaries from "./pages/management/Salaries";
import ManagementFinance from "./pages/management/ManagementFinance";
// Youth Ministry pages
import YouthDashboard from "./pages/youth/YouthDashboard";
import YouthEvents from "./pages/youth/YouthEvents";
import YouthMembers from "./pages/youth/YouthMembers";
// Shepherd pages
import ShepherdDashboard from "./pages/shepherd/ShepherdDashboard";
import ShepherdGroups from "./pages/shepherd/ShepherdGroups";
import ShepherdReports from "./pages/shepherd/ShepherdReports";
import ShepherdMinistries from "./pages/shepherd/Ministries";

export default function App() {
  console.log("App component mounted");
  useEffect(() => {
    document.title = "ChurchERP - Dashboard";
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/login/leader" element={<LeaderLogin />} />
          <Route path="/login/finance" element={<FinanceLogin />} />
          <Route path="/login/management" element={<ManagementLogin />} />
          <Route path="/login/youth" element={<YouthLogin />} />
          <Route path="/login/shepherd" element={<ShepherdLogin />} />
          <Route path="/login" element={<Navigate to="/login/admin" />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><Layout allowedRoles={['admin']} /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="groups" element={<AdminGroups />} />
            <Route path="leaders" element={<AdminLeaders />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="progress" element={<AdminProgress />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="evangelism" element={<AdminEvangelism />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="budgets" element={<AdminBudgets />} />
            <Route path="programs" element={<AdminActivities />} />
            <Route path="ministries" element={<ShepherdMinistries />} />
          </Route>

          {/* Leader Routes */}
          <Route path="/leader" element={<LeaderRoute><Layout allowedRoles={['bible_leader']} /></LeaderRoute>}>
            <Route index element={<LeaderDashboard />} />
            <Route path="members" element={<LeaderMembers />} />
            <Route path="attendance" element={<LeaderAttendance />} />
            <Route path="study" element={<LeaderStudy />} />
          </Route>

          {/* Finance Routes */}
          <Route path="/finance" element={<FinanceRoute><Layout allowedRoles={['finance']} /></FinanceRoute>}>
            <Route index element={<FinanceDashboard />} />
            <Route path="record" element={<RecordGiving />} />
            <Route path="budgets" element={<ApprovedBudgets />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Management Routes */}
          <Route path="/management" element={<ManagementRoute><Layout allowedRoles={['management']} /></ManagementRoute>}>
            <Route index element={<ManagementDashboard />} />
            <Route path="workers" element={<Workers />} />
            <Route path="salaries" element={<Salaries />} />
            <Route path="finance" element={<ManagementFinance />} />
          </Route>

          {/* Youth Ministry Routes */}
          <Route path="/youth" element={<YouthRoute><Layout allowedRoles={['youth_ministry']} /></YouthRoute>}>
            <Route index element={<YouthDashboard />} />
            <Route path="events" element={<YouthEvents />} />
            <Route path="members" element={<YouthMembers />} />
          </Route>

          {/* Shepherd Routes */}
          <Route path="/shepherd" element={<ShepherdRoute><Layout allowedRoles={['shepherd']} /></ShepherdRoute>}>
            <Route index element={<ShepherdDashboard />} />
            <Route path="groups" element={<ShepherdGroups />} />
            <Route path="reports" element={<ShepherdReports />} />
            <Route path="ministries" element={<ShepherdMinistries />} />
          </Route>

          <Route path="/" element={<Landing />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

