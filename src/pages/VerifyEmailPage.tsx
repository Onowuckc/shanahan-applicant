import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Verification token is missing from the link.');
      return;
    }

    let isMounted = true;
    api.post('/auth/verify-email', { token })
      .then(() => {
        if (isMounted) {
          setSuccess(true);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.error || 'Failed to verify email address. The token may be invalid or expired.');
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [token]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: 20
    }}>
      <div style={{
        maxWidth: 440,
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e2e8f0',
        padding: 32,
        textAlign: 'center'
      }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ color: '#800020', margin: '0 0 6px 0', fontSize: 22, fontWeight: 700 }}>
            Shanahan University
          </h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>
            Applicant Email Verification
          </p>
        </div>

        {loading ? (
          <div style={{ padding: '24px 0' }}>
            <div className="spinner" style={{
              width: 36,
              height: 36,
              border: '3px solid #e2e8f0',
              borderTopColor: '#800020',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{ color: '#475569', fontSize: 15, margin: 0 }}>Verifying your email address...</p>
          </div>
        ) : success ? (
          <div>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 24
            }}>
              ✓
            </div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: 18 }}>
              Email Verified Successfully!
            </h3>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>
              Your email address has been verified. You can now log in to complete your admission application.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                padding: '12px 20px',
                backgroundColor: '#800020',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Proceed to Login
            </button>
          </div>
        ) : (
          <div>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 24
            }}>
              ✕
            </div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: 18 }}>
              Verification Failed
            </h3>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>
              {error}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link
                to="/login"
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'inline-block'
                }}
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
