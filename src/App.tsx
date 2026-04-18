import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import CompanyDashboard from './pages/company/CompanyDashboard';
import type { UserRole } from './types';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: UserRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === 'medico' ? '/medico' : '/empresa'} replace />;
  }
  return <>{children}</>;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Login />;
  return <Navigate to={user.role === 'medico' ? '/medico' : '/empresa'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route
        path="/medico/*"
        element={
          <ProtectedRoute role="medico">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/empresa/*"
        element={
          <ProtectedRoute role="empresa">
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
