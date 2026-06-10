import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
import ManagementDashboard from "./pages/management/ManagementDashboard";
import Workers from "./pages/management/Workers";
import Salaries from "./pages/management/Salaries";
import ManagementFinance from "./pages/management/ManagementFinance";
import YouthDashboard from "./pages/youth/YouthDashboard";
import YouthEvents from "./pages/youth/YouthEvents";
import YouthMembers from "./pages/youth/YouthMembers";
import ShepherdDashboard from "./pages/shepherd/ShepherdDashboard";
import ShepherdGroups from "./pages/shepherd/ShepherdGroups";
import ShepherdMinistries from "./pages/shepherd/Ministries";
import ShepherdEvents from "./pages/shepherd/ShepherdEvents";
import Messages from "./pages/common/Messages";
import Settings from "./pages/common/Settings";
import KidsRoute from "./routes/KidsRoute";
import KidsDashboard from "./pages/kids/KidsDashboard";
import KidsMembers from "./pages/kids/KidsMembers";
import KidsClasses from "./pages/kids/KidsClasses";
import KidsAttendance from "./pages/kids/KidsAttendance";
import KidsEvents from "./pages/kids/KidsEvents";

import CounselingRoute from "./routes/CounselingRoute";
import CounselingDashboard from "./pages/counseling/CounselingDashboard";
import CounselingRequests from "./pages/counseling/CounselingRequests";
import CounselingSessions from "./pages/counseling/CounselingSessions";

import ChurchDevelopmentRoute from "./routes/ChurchDevelopmentRoute";
import DevDashboard from "./pages/church_development/DevDashboard";
import DevProjects from "./pages/church_development/DevProjects";

import DiaconateRoute from "./routes/DiaconateRoute";
import DiaconateDashboard from "./pages/diaconate/DiaconateDashboard";
import DeaconAssignments from "./pages/diaconate/DeaconAssignments";

import EducationRoute from "./routes/EducationRoute";
import EducationDashboard from "./pages/education/EducationDashboard";
import EduCourses from "./pages/education/EduCourses";

import EvangelismMinistryRoute from "./routes/EvangelismMinistryRoute";
import EvangelismDashboard from "./pages/evangelism/EvangelismDashboard";
import EvangelismPrograms from "./pages/evangelism/EvangelismPrograms";
import Converts from "./pages/evangelism/Converts";

import PulpitRoute from "./routes/PulpitRoute";
import PulpitDashboard from "./pages/pulpit/PulpitDashboard";
import Preachers from "./pages/pulpit/Preachers";
import PulpitAssignments from "./pages/pulpit/PulpitAssignments";
import PreacherAssessments from "./pages/pulpit/PreacherAssessments";
export default function App() {
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
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Layout allowedRoles={["admin"]} />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="members" element={<AdminMembers />} />
              <Route path="groups" element={<AdminGroups viewOnly={true} />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="progress" element={<AdminProgress />} />
              <Route path="events" element={<AdminEvents />} />
              <Route
                path="evangelism"
                element={<AdminEvangelism viewOnly={true} />}
              />
              <Route path="finance" element={<AdminFinance />} />
              <Route path="budgets" element={<AdminBudgets />} />
              <Route path="programs" element={<AdminActivities />} />
              <Route
                path="ministries"
                element={<ShepherdMinistries viewOnly={true} />}
              />
              <Route path="leaders" element={<Leaders />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Bible Leader Routes */}
            <Route
              path="/leader"
              element={
                <LeaderRoute>
                  <Layout allowedRoles={["bible_leader"]} />
                </LeaderRoute>
              }
            >
              <Route index element={<LeaderDashboard />} />
              <Route path="members" element={<LeaderMembers />} />
              <Route path="attendance" element={<LeaderAttendance />} />
              <Route path="study" element={<LeaderStudy />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Finance Routes */}
            <Route
              path="/finance"
              element={
                <FinanceRoute>
                  <Layout allowedRoles={["finance"]} />
                </FinanceRoute>
              }
            >
              <Route index element={<FinanceDashboard />} />
              <Route path="record" element={<RecordGiving />} />
              <Route path="budgets" element={<ApprovedBudgets />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Management Routes */}
            <Route
              path="/management"
              element={
                <ManagementRoute>
                  <Layout allowedRoles={["management"]} />
                </ManagementRoute>
              }
            >
              <Route index element={<ManagementDashboard />} />
              <Route path="workers" element={<Workers />} />
              <Route path="salaries" element={<Salaries />} />
              <Route path="finance" element={<ManagementFinance />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Youth Ministry Routes */}
            <Route
              path="/youth"
              element={
                <YouthRoute>
                  <Layout allowedRoles={["youth_ministry"]} />
                </YouthRoute>
              }
            >
              <Route index element={<YouthDashboard />} />
              <Route path="events" element={<YouthEvents />} />
              <Route path="members" element={<YouthMembers />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Shepherd Routes */}
            <Route
              path="/shepherd"
              element={
                <ShepherdRoute>
                  <Layout allowedRoles={["shepherd"]} />
                </ShepherdRoute>
              }
            >
              <Route index element={<ShepherdDashboard />} />
              <Route path="groups" element={<AdminGroups viewOnly={false} />} />
              <Route path="events" element={<ShepherdEvents />} />
              <Route
                path="evangelism"
                element={<AdminEvangelism viewOnly={false} />}
              />
              <Route
                path="ministries"
                element={<ShepherdMinistries viewOnly={false} />}
              />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Kids Ministry Routes */}
            <Route
              path="/kids"
              element={
                <KidsRoute>
                  <Layout allowedRoles={["kids_ministry", "admin"]} />
                </KidsRoute>
              }
            >
              <Route index element={<KidsDashboard />} />
              <Route path="members" element={<KidsMembers />} />
              <Route path="classes" element={<KidsClasses />} />
              <Route path="attendance" element={<KidsAttendance />} />
              <Route path="events" element={<KidsEvents />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Counseling Ministry Routes */}
            <Route
              path="/counseling"
              element={
                <CounselingRoute>
                  <Layout allowedRoles={["counseling_ministry", "admin"]} />
                </CounselingRoute>
              }
            >
              <Route index element={<CounselingDashboard />} />
              <Route path="requests" element={<CounselingRequests />} />
              <Route path="sessions" element={<CounselingSessions />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Church Development Routes */}
            <Route
              path="/church-development"
              element={
                <ChurchDevelopmentRoute>
                  <Layout allowedRoles={["church_development", "admin"]} />
                </ChurchDevelopmentRoute>
              }
            >
              <Route index element={<DevDashboard />} />
              <Route path="projects" element={<DevProjects />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Diaconate Routes */}
            <Route
              path="/diaconate"
              element={
                <DiaconateRoute>
                  <Layout allowedRoles={["diaconate", "admin"]} />
                </DiaconateRoute>
              }
            >
              <Route index element={<DiaconateDashboard />} />
              <Route path="assignments" element={<DeaconAssignments />} />
              <Route path="welfare" element={<DeaconAssignments />} /> {/* Temp mapping */}
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Education Ministry Routes */}
            <Route
              path="/education"
              element={
                <EducationRoute>
                  <Layout allowedRoles={["education_ministry", "admin"]} />
                </EducationRoute>
              }
            >
              <Route index element={<EducationDashboard />} />
              <Route path="courses" element={<EduCourses />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Evangelism Ministry Routes */}
            <Route
              path="/evangelism"
              element={
                <EvangelismMinistryRoute>
                  <Layout allowedRoles={["evangelism_ministry", "admin"]} />
                </EvangelismMinistryRoute>
              }
            >
              <Route index element={<EvangelismDashboard />} />
              <Route path="programs" element={<EvangelismPrograms />} />
              <Route path="converts" element={<Converts />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Pulpit Ministry Routes */}
            <Route
              path="/pulpit"
              element={
                <PulpitRoute>
                  <Layout allowedRoles={["pulpit_ministry", "admin"]} />
                </PulpitRoute>
              }
            >
              <Route index element={<PulpitDashboard />} />
              <Route path="preachers" element={<Preachers />} />
              <Route path="assignments" element={<PulpitAssignments />} />
              <Route path="assessments" element={<PreacherAssessments />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="/" element={<Landing />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}
