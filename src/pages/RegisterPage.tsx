import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import logoImg from '../assets/SHANAHAN-UNI-LOGO.png';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('MALE');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jambRegNo, setJambRegNo] = useState('');
  const [programId, setProgramId] = useState('');
  const [admissionYear, setAdmissionYear] = useState(String(new Date().getFullYear()));

  // States
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Try to load programs from backend
    api.get('/admin/programs')
      .then(res => {
        setPrograms(res.data.data || []);
      })
      .catch(err => {
        console.warn('Failed to fetch programs list from backend, using default fallback list.', err);
        // Fallback standard programs
        setPrograms([
          { id: '1', name: 'B.Sc. Computer Science' },
          { id: '2', name: 'B.Sc. Cybersecurity' },
          { id: '3', name: 'B.Sc. Software Engineering' }
        ]);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !dateOfBirth) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        gender,
        dateOfBirth,
        phoneNumber: phoneNumber.trim() || null,
        jambRegNo: jambRegNo.trim().toUpperCase() || null,
        programId: programId || null,
        admissionYear: parseInt(admissionYear)
      });

      setSuccess('Registration successful! You will receive your application details. Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <img src={logoImg} alt="Logo" style={{ width: 72, height: 72, objectFit: 'contain', marginBottom: 16 }} />
          <h2 className="login-title">Admission Form</h2>
          <p className="login-subtitle">Submit application to join Shanahan University</p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--danger-500)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger-500)',
            fontSize: 13,
            marginBottom: 20,
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid var(--success-500)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--success-500)',
            fontSize: 13,
            marginBottom: 20,
            textAlign: 'center'
          }}>
            🎉 {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                className="form-control"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading || !!success}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                className="form-control"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading || !!success}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || !!success}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || !!success}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-control"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={loading || !!success}
                required
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-control"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                disabled={loading || !!success}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                className="form-control"
                placeholder="e.g. +234..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading || !!success}
              />
            </div>
            <div className="form-group">
              <label className="form-label">JAMB Reg Number</label>
              <input
                className="form-control"
                placeholder="e.g. 12345678AB"
                value={jambRegNo}
                onChange={(e) => setJambRegNo(e.target.value)}
                disabled={loading || !!success}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Desired Programme</label>
              <select
                className="form-control"
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                disabled={loading || !!success}
              >
                <option value="">Select Programme</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Entry Year</label>
              <input
                type="number"
                className="form-control"
                value={admissionYear}
                onChange={(e) => setAdmissionYear(e.target.value)}
                disabled={loading || !!success}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading || !!success}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>

        <div style={{ marginTop: 28, textAlign: 'center', fontSize: 13 }}>
          <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
