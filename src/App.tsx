import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { Attendance } from './pages/Attendance';
import { Groups } from './pages/Groups';
import { Programs } from './pages/Programs';
import { Budgets } from './pages/Budgets';
import { Transactions } from './pages/Transactions';
import { Login } from './pages/Login';
import { AdminLogin } from './pages/AdminLogin';
import { SignUp } from './pages/SignUp';
import { Landing } from './pages/Landing';
import { FinanceLogin } from './pages/FinanceLogin';
import { useAuth } from './hooks/useAuth';

import { GroupSelection } from './components/GroupSelection';

function AppRoutes() {
  const { user, profile, selectedGroupId } = useAuth();
  const location = useLocation();

  // If leader is logged in but hasn't selected a group, show group selection
  if (profile?.role === 'leader' && !selectedGroupId) {
    return <GroupSelection />;
  }

  const isAdmin = profile?.role === 'admin';
  const isFinance = profile?.role === 'finance';

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/admin-login" element={user ? <Navigate to="/dashboard" replace /> : <AdminLogin />} />
      <Route path="/finance-login" element={user ? <Navigate to="/dashboard" replace /> : <FinanceLogin />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignUp />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/members" element={(isAdmin || isFinance) ? <Members /> : <Navigate to="/dashboard" replace />} />
        <Route path="/groups" element={isAdmin ? <Groups /> : <Navigate to="/dashboard" replace />} />
        <Route path="/attendance" element={isAdmin ? <Attendance /> : <Navigate to="/dashboard" replace />} />
        <Route path="/programs" element={isAdmin ? <Programs /> : <Navigate to="/dashboard" replace />} />
        <Route path="/budgets" element={(isAdmin || isFinance) ? <Budgets /> : <Navigate to="/dashboard" replace />} />
        <Route path="/transactions" element={(isAdmin || isFinance) ? <Transactions /> : <Navigate to="/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
