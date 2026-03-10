import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import AdminSignIn from './pages/AdminSignIn';
import AdminSignUp from './pages/AdminSignUp';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { Attendance } from './pages/Attendance';
import { Groups } from './pages/Groups';
import { ConfigRequired } from './components/ConfigRequired';
import { useAuth } from './hooks/useAuth';

// Placeholder components for other pages
const Programs = () => <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm"><h1 className="text-2xl font-bold mb-4">Church Programs</h1><p className="text-slate-500 italic">Feature coming soon: Event scheduling and calendar view.</p></div>;

function AppRoutes() {
  const { configRequired } = useAuth();

  if (configRequired) {
    return <ConfigRequired />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/admin-login" element={<AdminSignIn />} />
      <Route path="/admin-signup" element={<AdminSignUp />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="admin" element={<Dashboard />} />
        <Route path="members" element={<Members />} />
        <Route path="groups" element={<Groups />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="programs" element={<Programs />} />
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
