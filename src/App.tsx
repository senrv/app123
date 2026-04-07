/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { isSupabaseConfigured } from './lib/supabase';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';
import CreateReport from './pages/CreateReport';
import StudentData from './pages/StudentData';
import ReportRecap from './pages/ReportRecap';
import { ShieldAlert } from 'lucide-react';

function ConfigWarning() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-brand-gold-dark" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-4">Konfigurasi Diperlukan</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Aplikasi ini memerlukan koneksi ke Supabase. Silakan tambahkan variabel berikut di panel <strong>Secrets</strong> di AI Studio:
        </p>
        <div className="space-y-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100 font-mono text-xs text-slate-500 mb-8">
          <p>• VITE_SUPABASE_URL</p>
          <p>• VITE_SUPABASE_ANON_KEY</p>
          <p>• VITE_SUPABASE_SERVICE_ROLE_KEY</p>
        </div>
        <p className="text-sm text-slate-400">
          Setelah menambahkan secrets, segarkan halaman ini.
        </p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) return <Navigate to="/app" />;

  return <>{children}</>;
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <ConfigWarning />;
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/app" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            
            {/* Common for Admin & Guru */}
            <Route path="reports" element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="recap" element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <ReportRecap />
              </ProtectedRoute>
            } />

            {/* Admin Only */}
            <Route path="users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="students" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <StudentData />
              </ProtectedRoute>
            } />

            {/* Siswa Only */}
            <Route path="create-report" element={
              <ProtectedRoute allowedRoles={['siswa']}>
                <CreateReport />
              </ProtectedRoute>
            } />
            <Route path="history" element={
              <ProtectedRoute allowedRoles={['siswa']}>
                <Reports />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
