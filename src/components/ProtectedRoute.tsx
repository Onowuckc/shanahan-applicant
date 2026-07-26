import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/SHANAHAN-UNI-LOGO.png';


export function ProtectedRoute() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role is STUDENT, they should go to the Student Portal instead of this portal!
  if (user?.role === 'STUDENT') {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎓</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>You've Been Matriculated!</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
            Your admission and acceptance fee have been verified, and a Student Profile was successfully created. Please log in directly to the Student Portal to proceed.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('umis_applicant_token');
              localStorage.removeItem('umis_applicant_user');
              window.location.href = 'http://localhost:5173/login'; // Redirect to student portal local address
            }}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Go to Student Portal Login
          </button>
        </div>
      </div>
    );
  }

  if (user?.role !== 'APPLICANT') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Sidebar Navigation */}
      <aside style={{
        width: 260,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-default)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.05em', color: 'var(--primary-200)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={logoImg} alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} /> SHANAHAN ADMISSIONS
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', fontWeight: 600 }}>Applicant Portal</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--primary-200)',
            background: 'rgba(212,160,23,0.08)',
            border: '1px solid rgba(212,160,23,0.15)',
          }}>
            <span>📊</span>
            <span>Admissions Status</span>
          </div>
        </nav>

        <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-700), var(--primary-800))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
              👤
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.firstName}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 140, textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.username}</div>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('umis_applicant_token');
              localStorage.removeItem('umis_applicant_user');
              window.location.href = '/login';
            }}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--danger-400)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}
          >
            <span>🚪</span> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
