import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/signup";
import Landing from "./pages/Landing";
import AdminDashboard from "./pages/admin/AdminDashboard";
import LeaderDashboard from "./pages/leader/LeaderDashboard";

import AdminProgress from "./pages/admin/Progress";
import AdminEvents from "./pages/admin/Events";
import AdminEvangelism from "./pages/admin/Evangelism";
import AdminFinance from "./pages/admin/Finance";
import AdminBudgets from "./pages/admin/Budgets";
import AdminMembers from "./pages/admin/Members";
import AdminGroups from "./pages/admin/Groups";
import AdminReports from "./pages/admin/ReportGenerator";
import AdminActivities from "./pages/admin/Programs";
import LeaderAttendance from "./pages/leader/Attendance";
import LeaderStudy from "./pages/leader/Study";
import LeaderMembers from "./pages/leader/Members";
import Leaders from "./pages/admin/Leaders";
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
import ShepherdMinistries from "./pages/shepherd/Ministries";
import Messages from "./pages/common/Messages";
// Kids Ministry pages
import KidsRoute from "./routes/KidsRoute";
import KidsDashboard from "./pages/kids/KidsDashboard";
import KidsMembers from "./pages/kids/KidsMembers";
import KidsClasses from "./pages/kids/KidsClasses";
import KidsAttendance from "./pages/kids/KidsAttendance";
import KidsEvents from "./pages/kids/KidsEvents";

export default function App() {
  console.log("App component mounted");
  useEffect(() => {
    document.title = "ChurchERP - Dashboard";
  }, []);

  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><Layout allowedRoles={['admin']} /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="members" element={<AdminMembers />} />
              <Route path="groups" element={<AdminGroups viewOnly={true} />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="progress" element={<AdminProgress />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="evangelism" element={<AdminEvangelism viewOnly={true} />} />
              <Route path="finance" element={<AdminFinance />} />
              <Route path="budgets" element={<AdminBudgets />} />
              <Route path="programs" element={<AdminActivities />} />
              <Route path="ministries" element={<ShepherdMinistries viewOnly={true} />} />
              <Route path="leaders" element={<Leaders />} />
              <Route path="messages" element={<Messages />} />
            </Route>

            {/* Leader Routes */}
            <Route path="/leader" element={<LeaderRoute><Layout allowedRoles={['bible_leader']} /></LeaderRoute>}>
              <Route index element={<LeaderDashboard />} />
              <Route path="members" element={<LeaderMembers />} />
              <Route path="attendance" element={<LeaderAttendance />} />
              <Route path="study" element={<LeaderStudy />} />
              <Route path="messages" element={<Messages />} />
            </Route>

            {/* Finance Routes */}
            <Route path="/finance" element={<FinanceRoute><Layout allowedRoles={['finance']} /></FinanceRoute>}>
              <Route index element={<FinanceDashboard />} />
              <Route path="record" element={<RecordGiving />} />
              <Route path="budgets" element={<ApprovedBudgets />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="messages" element={<Messages />} />
            </Route>

            {/* Management Routes */}
            <Route path="/management" element={<ManagementRoute><Layout allowedRoles={['management']} /></ManagementRoute>}>
              <Route index element={<ManagementDashboard />} />
              <Route path="workers" element={<Workers />} />
              <Route path="salaries" element={<Salaries />} />
              <Route path="finance" element={<ManagementFinance />} />
              <Route path="messages" element={<Messages />} />
            </Route>

            {/* Youth Ministry Routes */}
            <Route path="/youth" element={<YouthRoute><Layout allowedRoles={['youth_ministry']} /></YouthRoute>}>
              <Route index element={<YouthDashboard />} />
              <Route path="events" element={<YouthEvents />} />
              <Route path="members" element={<YouthMembers />} />
              <Route path="messages" element={<Messages />} />
            </Route>

            {/* Shepherd Routes */}
            <Route path="/shepherd" element={<ShepherdRoute><Layout allowedRoles={['shepherd']} /></ShepherdRoute>}>
              <Route index element={<ShepherdDashboard />} />
              <Route path="groups" element={<AdminGroups viewOnly={false} />} />
              <Route path="evangelism" element={<AdminEvangelism viewOnly={false} />} />
              <Route path="ministries" element={<ShepherdMinistries viewOnly={false} />} />
              <Route path="messages" element={<Messages />} />
            </Route>

            {/* Kids Ministry Routes */}
            <Route path="/kids" element={<KidsRoute><Layout allowedRoles={['kids_ministry', 'admin']} /></KidsRoute>}>
              <Route index element={<KidsDashboard />} />
              <Route path="members" element={<KidsMembers />} />
              <Route path="classes" element={<KidsClasses />} />
              <Route path="attendance" element={<KidsAttendance />} />
              <Route path="events" element={<KidsEvents />} />
              <Route path="messages" element={<Messages />} />
            </Route>

            <Route path="/" element={<Landing />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

