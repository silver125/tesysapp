import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import CompanyDashboard from './pages/company/CompanyDashboard';
import type { UserRole } from './types';
import { TessyMark } from './components/ui';
import ErrorBoundary from './components/ErrorBoundary';
import InvalidSession from './components/InvalidSession';
import { dashboardPathForRole, normalizeUserRole } from './lib/authRoutes';

/* ── Aguarda Supabase verificar sessão antes de renderizar ── */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { authReady } = useAuth();
  if (!authReady) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#F7F8FF', flexDirection: 'column', gap: 16,
      }}>
        <TessyMark size={36} style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ fontSize: 13, color: '#9299A8' }}>Carregando Tessy…</div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    );
  }
  return <>{children}</>;
}

function RootRedirect() {
  const { user, logout } = useAuth();
  if (!user) return <Landing />;
  const role = normalizeUserRole(user.role);
  const dest = dashboardPathForRole(role);
  if (!dest) return <InvalidSession onLogout={logout} />;
  return <Navigate to={dest} replace />;
}

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: UserRole }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/entrar" replace state={{ from: location.pathname }} />;
  const normalizedRole = normalizeUserRole(user.role);
  if (!normalizedRole) return <InvalidSession onLogout={logout} />;
  if (normalizedRole !== role) {
    const dest = dashboardPathForRole(normalizedRole);
    if (!dest || location.pathname.startsWith(dest)) {
      return <InvalidSession onLogout={logout} />;
    }
    return <Navigate to={dest} replace />;
  }
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  if (user) {
    const role = normalizeUserRole(user.role);
    const dest = dashboardPathForRole(role);
    if (!dest) return <InvalidSession onLogout={logout} />;
    return <Navigate to={dest} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <AuthGate>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/entrar"   element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/esqueci-senha" element={<PublicOnly><ForgotPassword /></PublicOnly>} />
        <Route path="/redefinir-senha" element={<ResetPassword />} />
        <Route path="/cadastro" element={<PublicOnly><Register /></PublicOnly>} />
        <Route path="/privacidade" element={<PrivacyPolicy />} />
        <Route path="/termos" element={<TermsOfUse />} />
        <Route path="/medico/*" element={<ProtectedRoute role="medico"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/empresa/*" element={<ProtectedRoute role="empresa"><CompanyDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthGate>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
