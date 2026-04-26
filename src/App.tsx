import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import CompanyDashboard from './pages/company/CompanyDashboard';
import type { UserRole } from './types';

/* ── Aguarda Supabase verificar sessão antes de renderizar ── */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { authReady } = useAuth();
  if (!authReady) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg,#2E7BFF 0%,#5F2C82 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 18,
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>T</div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    );
  }
  return <>{children}</>;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Landing />;
  return <Navigate to={user.role === 'medico' ? '/medico' : '/empresa'} replace />;
}

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: UserRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/entrar" replace />;
  if (user.role !== role)
    return <Navigate to={user.role === 'medico' ? '/medico' : '/empresa'} replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'medico' ? '/medico' : '/empresa'} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <AuthGate>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/entrar"   element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/cadastro" element={<PublicOnly><Register /></PublicOnly>} />
        <Route path="/medico/*" element={<ProtectedRoute role="medico"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/empresa/*" element={<ProtectedRoute role="empresa"><CompanyDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthGate>
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
