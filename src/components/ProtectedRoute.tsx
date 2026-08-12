import { useState } from 'react';
import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/SHANAHAN-UNI-LOGO.png';
import { StatusIcon, ProfileIcon, LogoutIcon, AcademicIcon, CrossIcon, MenuIcon } from './Icons';

export function ProtectedRoute() {
  const { isAuthenticated, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'STUDENT') {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><AcademicIcon size={52} color="var(--primary-300)" /></div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>You've Been Matriculated!</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
            Your admission and acceptance fee have been verified, and a Student Profile was successfully created. Please log in directly to the Student Portal to proceed.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('umis_applicant_token');
              localStorage.removeItem('umis_applicant_user');
              window.location.href = 'http://localhost:5173/login';
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

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="app-shell">
      {/* Mobile Topbar */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logoImg} alt="Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary-200)' }}>SHANAHAN ADMISSIONS</span>
        </div>
        <button className="hamburger-btn" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <CrossIcon size={20} /> : <MenuIcon size={20} />}
        </button>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      <div className={`sidebar-backdrop ${mobileOpen ? 'show' : ''}`} onClick={closeMobile} />

      {/* Sidebar Navigation Drawer */}
      <aside className={`sidebar-drawer ${mobileOpen ? 'mobile-open' : ''}`} style={{
        width: 265,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-default)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        flexShrink: 0
      }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '0.04em', color: 'var(--primary-200)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={logoImg} alt="Logo" style={{ width: 34, height: 34, objectFit: 'contain' }} /> SHANAHAN ADMISSIONS
          </div>
          <div style={{ fontSize: 10, color: 'var(--accent-400)', marginTop: 4, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>Applicant Portal</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <NavLink
            to="/dashboard"
            onClick={closeMobile}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon"><StatusIcon size={18} /></span>
            <span>Admissions Status</span>
          </NavLink>

          <NavLink
            to="/profile"
            onClick={closeMobile}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon"><ProfileIcon size={18} /></span>
            <span>Profile & Security</span>
          </NavLink>
        </nav>

        <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div className="user-avatar" style={{ width: 36, height: 36, fontSize: 13, background: 'linear-gradient(135deg, var(--primary-700), var(--primary-800))', border: '1px solid var(--border-accent)' }}>
              {user?.firstName?.slice(0, 2).toUpperCase() || 'AP'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.firstName}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user?.username}</div>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('umis_applicant_token');
              localStorage.removeItem('umis_applicant_user');
              window.location.href = '/login';
            }}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--danger-400)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12 }}
          >
            <LogoutIcon size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content-area" style={{ flex: 1, padding: 36, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
