import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { CheckIcon, AlertIcon, CardIcon, CrossIcon, AcademicIcon, ZapIcon, ClockIcon } from '../components/Icons';

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Profile data
  const [profile, setProfile] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);

  // Profile form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('MALE');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [programId, setProgramId] = useState('');
  const [jambRegNo, setJambRegNo] = useState('');

  // Documents
  const [passportPhotoUrl, setPassportPhotoUrl] = useState('');
  const [oLevelResultUrl, setOLevelResultUrl] = useState('');
  const [birthCertificateUrl, setBirthCertificateUrl] = useState('');
  const [utmeResultUrl, setUtmeResultUrl] = useState('');
  const [jambAdmissionLetterUrl, setJambAdmissionLetterUrl] = useState('');
  const [stateOfOriginCertUrl, setStateOfOriginCertUrl] = useState('');
  const [medicalCertUrl, setMedicalCertUrl] = useState('');
  const [guarantorFormUrl, setGuarantorFormUrl] = useState('');

  // Form edit states
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Payment states
  const [paying, setPaying] = useState(false);
  const [txRef, setTxRef] = useState('');
  const [authUrl, setAuthUrl] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'application_fee' | 'acceptance_fee'>('application_fee');
  const [verifying, setVerifying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [newMatric, setNewMatric] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');

  const loadProfile = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setProfile(data.profile);
      
      const programsRes = await api.get('/admin/programs');
      setPrograms(programsRes.data.data || []);
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to load profile details.');
    }
  };

  useEffect(() => {
    loadProfile().then(() => {
      setLoading(false);
    });
  }, []);

  // Pre-fill form when profile is loaded
  useEffect(() => {
    if (profile) {
      setPhoneNumber(profile.phoneNumber || '');
      setGender(profile.gender || 'MALE');
      if (profile.dateOfBirth) {
        setDateOfBirth(new Date(profile.dateOfBirth).toISOString().split('T')[0]);
      }
      setResidentialAddress(profile.residentialAddress || '');
      setCountry(profile.country || 'Nigeria');
      setState(profile.state || '');
      setLga(profile.lga || '');
      setProgramId(profile.programId || '');
      setJambRegNo(profile.jambRegNo || '');

      setPassportPhotoUrl(profile.passportPhotoUrl || '');
      setOLevelResultUrl(profile.oLevelResultUrl || '');
      setBirthCertificateUrl(profile.birthCertificateUrl || '');
      setUtmeResultUrl(profile.utmeResultUrl || '');
      setJambAdmissionLetterUrl(profile.jambAdmissionLetterUrl || '');
      setStateOfOriginCertUrl(profile.stateOfOriginCertUrl || '');
      setMedicalCertUrl(profile.medicalCertUrl || '');
      setGuarantorFormUrl(profile.guarantorFormUrl || '');
    }
  }, [profile]);

  // Handle automatic verification on callback redirect
  useEffect(() => {
    const reference = searchParams.get('reference');
    const type = searchParams.get('type') as 'application_fee' | 'acceptance_fee' | null;
    if (reference) {
      setSearchParams({}, { replace: true });
      setTxRef(reference);
      const mode = type || 'acceptance_fee';
      setPaymentType(mode);
      setShowPayModal(true);
      setVerifying(true);
      setErrorMsg('');
      setSuccessMsg('');

      const verifyUrl = mode === 'application_fee' 
        ? '/auth/applicant/application-fee/verify'
        : '/auth/applicant/acceptance-fee/verify';
      
      api.post(verifyUrl, { reference })
        .then((res) => {
          setSuccessMsg(res.data.message || 'Payment successfully verified!');
          if (mode === 'acceptance_fee') {
            setNewMatric(res.data.matricNumber || 'SU/...');
            if (res.data.studentCredentials) {
              setGeneratedEmail(res.data.studentCredentials.generatedEmail);
              setTemporaryPassword(res.data.studentCredentials.temporaryPassword);
            }
            if (user) {
              const updatedUser = {
                ...user,
                role: 'STUDENT',
                username: res.data.matricNumber || user.username
              };
              localStorage.setItem('umis_applicant_user', JSON.stringify(updatedUser));
              setUser(updatedUser);
            }
          }
          loadProfile();
        })
        .catch((err) => {
          console.error(err);
          setErrorMsg(err.response?.data?.error || 'Verification failed.');
        })
        .finally(() => {
          setVerifying(false);
        });
    }
  }, [searchParams, setSearchParams, user, setUser]);

  // Read file as base64 data url
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setFormSuccess('');
    setFormError('');
    try {
      await api.put('/auth/applicant/profile', {
        phoneNumber,
        gender,
        dateOfBirth,
        residentialAddress,
        country,
        state,
        lga,
        programId,
        jambRegNo,
        passportPhotoUrl,
        oLevelResultUrl,
        birthCertificateUrl,
        utmeResultUrl,
        jambAdmissionLetterUrl,
        stateOfOriginCertUrl,
        medicalCertUrl,
        guarantorFormUrl
      });
      setFormSuccess('Profile details and documents saved successfully!');
      await loadProfile();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.error || 'Failed to update profile details.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePayApplicationFee = async () => {
    setPaying(true);
    setErrorMsg('');
    setSuccessMsg('');
    setPaymentType('application_fee');
    try {
      const { data } = await api.post('/auth/applicant/application-fee/initialize', {
        callbackUrl: window.location.origin + '/dashboard?type=application_fee'
      });
      setTxRef(data.data.reference);
      setAuthUrl(data.data.authorization_url);
      setShowPayModal(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to initialize application fee payment.');
    } finally {
      setPaying(false);
    }
  };

  const handlePayAcceptanceFee = async () => {
    setPaying(true);
    setErrorMsg('');
    setSuccessMsg('');
    setPaymentType('acceptance_fee');
    try {
      const { data } = await api.post('/auth/applicant/acceptance-fee/initialize', {
        callbackUrl: window.location.origin + '/dashboard?type=acceptance_fee'
      });
      setTxRef(data.data.reference);
      setAuthUrl(data.data.authorization_url);
      setShowPayModal(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to initialize acceptance fee payment.');
    } finally {
      setPaying(false);
    }
  };

  const handleSimulateVerify = async () => {
    if (!txRef) return;
    setVerifying(true);
    setErrorMsg('');
    const verifyUrl = paymentType === 'application_fee'
      ? '/auth/applicant/application-fee/verify'
      : '/auth/applicant/acceptance-fee/verify';
    try {
      const { data } = await api.post(verifyUrl, { reference: txRef, simulate: true });
      setSuccessMsg(data.message || 'Payment successfully verified!');
      if (paymentType === 'acceptance_fee') {
        setNewMatric(data.matricNumber || 'SU/...');
        if (data.studentCredentials) {
          setGeneratedEmail(data.studentCredentials.generatedEmail);
          setTemporaryPassword(data.studentCredentials.temporaryPassword);
        }
        if (user) {
          const updatedUser = {
            ...user,
            role: 'STUDENT',
            username: data.matricNumber || user.username
          };
          localStorage.setItem('umis_applicant_user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      }
      await loadProfile();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const handleGatewayProceed = () => {
    if (!authUrl) return;
    if (authUrl.includes('SU_MOCK_') || !authUrl.includes('checkout.paystack.com')) {
      handleSimulateVerify();
    } else {
      window.location.href = authUrl;
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const hasPaidApplicationFee = profile?.payments?.some((p: any) =>
    p.status === 'COMPLETED' &&
    p.items?.some((item: any) => item.feeCategory?.name === 'Application Fee')
  );

  const applicationFeeInvoice = profile?.payments?.find((p: any) =>
    p.items?.some((item: any) => item.feeCategory?.name === 'Application Fee')
  );

  const acceptanceFeeInvoice = profile?.payments?.find((p: any) =>
    p.items?.some((item: any) => item.feeCategory?.name === 'Acceptance Fee')
  );

  const admissionStatus = profile?.admissionStatus || 'PENDING';

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Opus Hero Welcome Banner */}
      <div className="hero-banner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 className="hero-title">Hello, {profile?.firstName || 'Applicant'}!</h1>
            <p className="hero-subtitle">
              Application Ref ID: <strong style={{ color: 'var(--accent-400)', fontFamily: 'monospace' }}>{profile?.applicationNo}</strong>
              <span style={{ margin: '0 8px', opacity: 0.5 }}>|</span>
              Desired Major: <strong style={{ color: '#FFF' }}>{profile?.program?.name || 'Undergraduate Degree'}</strong>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-gold" style={{ fontSize: 11, padding: '4px 12px' }}>
              Admission Status: {admissionStatus}
            </span>
          </div>
        </div>
      </div>

      {!hasPaidApplicationFee ? (
        /* Application Fee not paid: Show profile details form + document uploads + checkout */
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'start' }}>
          
          <div className="section-card" style={{ margin: 0 }}>
            <div className="section-card-header">
              <h3 className="section-card-title">Admission Form & Document Upload</h3>
            </div>

            {formSuccess && (
              <div style={{ padding: 12, background: 'rgba(34,197,94,0.1)', border: '1px solid var(--success-500)', borderRadius: 'var(--radius-md)', color: 'var(--success-500)', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckIcon size={16} /> {formSuccess}
              </div>
            )}

            {formError && (
              <div style={{ padding: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger-500)', borderRadius: 'var(--radius-md)', color: 'var(--danger-500)', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertIcon size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              
              <h4 style={{ color: 'var(--accent-300)', margin: '8px 0 4px', borderBottom: '1px solid var(--border-default)', paddingBottom: 6 }}>1. Personal Information</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-control" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+234..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-control" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-control" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Desired major</label>
                  <select className="form-control" value={programId} onChange={(e) => setProgramId(e.target.value)} required>
                    <option value="">Select Programme</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Residential Address</label>
                <input className="form-control" value={residentialAddress} onChange={(e) => setResidentialAddress(e.target.value)} placeholder="House Address" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input className="form-control" value={country} onChange={(e) => setCountry(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-control" value={state} onChange={(e) => setState(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">LGA</label>
                  <input className="form-control" value={lga} onChange={(e) => setLga(e.target.value)} required />
                </div>
              </div>

              <div className="form-group" style={{ maxWidth: '50%' }}>
                <label className="form-label">JAMB Registration Number</label>
                <input className="form-control" value={jambRegNo} onChange={(e) => setJambRegNo(e.target.value)} placeholder="e.g. 12345678AB" />
              </div>

              <h4 style={{ color: 'var(--accent-300)', margin: '20px 0 4px', borderBottom: '1px solid var(--border-default)', paddingBottom: 6 }}>2. Required Documents</h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Passport Photograph</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setPassportPhotoUrl)} />
                  {passportPhotoUrl && <div style={{ fontSize: 11, color: 'var(--success-500)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><CheckIcon size={12} /> Document Uploaded</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">O'Level Result (WAEC/NECO)</label>
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, setOLevelResultUrl)} />
                  {oLevelResultUrl && <div style={{ fontSize: 11, color: 'var(--success-500)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><CheckIcon size={12} /> Document Uploaded</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Birth Certificate</label>
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, setBirthCertificateUrl)} />
                  {birthCertificateUrl && <div style={{ fontSize: 11, color: 'var(--success-500)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><CheckIcon size={12} /> Document Uploaded</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">UTME Result Slip</label>
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, setUtmeResultUrl)} />
                  {utmeResultUrl && <div style={{ fontSize: 11, color: 'var(--success-500)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><CheckIcon size={12} /> Document Uploaded</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">State of Origin Certificate</label>
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, setStateOfOriginCertUrl)} />
                  {stateOfOriginCertUrl && <div style={{ fontSize: 11, color: 'var(--success-500)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><CheckIcon size={12} /> Document Uploaded</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Medical Fitness Certificate</label>
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, setMedicalCertUrl)} />
                  {medicalCertUrl && <div style={{ fontSize: 11, color: 'var(--success-500)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><CheckIcon size={12} /> Document Uploaded</div>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">JAMB Admission Letter</label>
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, setJambAdmissionLetterUrl)} />
                  {jambAdmissionLetterUrl && <div style={{ fontSize: 11, color: 'var(--success-500)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><CheckIcon size={12} /> Document Uploaded</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Guarantor Letter / Form</label>
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, setGuarantorFormUrl)} />
                  {guarantorFormUrl && <div style={{ fontSize: 11, color: 'var(--success-500)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><CheckIcon size={12} /> Document Uploaded</div>}
                </div>
              </div>

              <button type="submit" disabled={updatingProfile} className="btn btn-primary" style={{ alignSelf: 'start', marginTop: 12, padding: '10px 24px' }}>
                {updatingProfile ? 'Saving Details...' : 'Save Profile & Documents'}
              </button>

            </form>
          </div>

          <div className="section-card" style={{ margin: 0, position: 'sticky', top: 20 }}>
            <div className="section-card-header">
              <h3 className="section-card-title">Checkout Application Fee</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'center', padding: '16px 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}><CardIcon size={48} color="var(--accent-400)" /></div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                To submit your portfolio for academic review, please pay the required application fee:
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent-400)', margin: '8px 0' }}>
                ₦{applicationFeeInvoice ? applicationFeeInvoice.amountDue.toLocaleString() : '10,000'}.00
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Ensure your personal information and documents are saved before initiating payment. Once paid, editing will be locked.
              </p>
              <button onClick={handlePayApplicationFee} disabled={paying} className="btn btn-primary" style={{ width: '100%' }}>
                {paying ? 'Initializing checkout...' : 'Checkout Application Fee'}
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* Application Fee Paid: Show admission status summary & acceptance fee actions */
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Status section */}
            <div className="section-card" style={{ margin: 0 }}>
              <div className="section-card-header">
                <h3 className="section-card-title">Admission Board Decision Status</h3>
              </div>

              {admissionStatus === 'PENDING' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', textAlign: 'center', padding: '16px 0' }}>
                  <ClockIcon size={48} color="var(--warning-500)" />
                  <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--warning-500)' }}>Under Academic Evaluation</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 400, lineHeight: 1.6 }}>
                    Your application fee has been verified and your documents are under review. The Admissions Board is auditing your credentials. Check back soon.
                  </p>
                </div>
              )}

              {admissionStatus === 'REJECTED' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', textAlign: 'center', padding: '16px 0' }}>
                  <CrossIcon size={48} color="var(--danger-500)" />
                  <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--danger-500)' }}>Application Unsuccessful</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 400, lineHeight: 1.6 }}>
                    We regret to inform you that we are unable to offer you admission for the desired major at this time. We wish you success in your future academic goals.
                  </p>
                </div>
              )}

              {admissionStatus === 'ADMITTED' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center', padding: '16px 0' }}>
                  <CheckIcon size={48} color="var(--success-500)" />
                  <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--success-500)' }}>Offer of Admission Available!</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 420, lineHeight: 1.6 }}>
                    Congratulations! You have been provisionally admitted into Shanahan University to study <strong>{profile?.program?.name || 'your chosen major'}</strong>.
                  </p>
                  <div className="divider" style={{ width: '100%', margin: '4px 0' }} />
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    To accept this offer and generate your student matriculation details, proceed to pay the admission/acceptance fee.
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handlePayAcceptanceFee}
                    disabled={paying}
                    style={{ width: '100%', maxWidth: 280, marginTop: 8 }}
                  >
                    {paying ? 'Initializing...' : `Pay Admission Fee (₦${acceptanceFeeInvoice ? acceptanceFeeInvoice.amountDue.toLocaleString() : '50,000'})`}
                  </button>
                </div>
              )}
            </div>

            {/* Profile summary card */}
            <div className="section-card" style={{ margin: 0 }}>
              <div className="section-card-header">
                <h3 className="section-card-title">Submitted Application Portfolio</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, fontSize: 13 }}>
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: 4 }}>Desired Major:</strong>
                  {profile?.program?.name || 'N/A'}
                </div>
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: 4 }}>Contact Phone:</strong>
                  {profile?.phoneNumber || 'N/A'}
                </div>
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: 4 }}>Residential Address:</strong>
                  {profile?.residentialAddress || 'N/A'}
                </div>
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-muted)', marginBottom: 4 }}>Origin:</strong>
                  {profile?.lga}, {profile?.state}, {profile?.country}
                </div>
              </div>
            </div>
          </div>

          <div className="section-card" style={{ margin: 0 }}>
            <div className="section-card-header">
              <h3 className="section-card-title">Payment Audit History</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {profile?.payments?.map((payment: any) => (
                <div key={payment.id} style={{ padding: 12, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', fontSize: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span>{payment.items?.[0]?.feeCategory?.name || 'University Fee'}</span>
                    <span className={`badge badge-${payment.status === 'COMPLETED' ? 'success' : 'warning'}`}>
                      {payment.status}
                    </span>
                  </div>
                  <div style={{ marginTop: 6, color: 'var(--text-muted)' }}>
                    Amount: ₦{payment.amountDue.toLocaleString()}
                  </div>
                  <div style={{ marginTop: 4, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    Ref: {payment.txReference || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Payment simulation modal */}
      {showPayModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">
                {paymentType === 'application_fee' ? 'Application Fee Payment' : 'Admission Fee Payment'}
              </h3>
              <button className="modal-close" onClick={() => { if (!verifying && !newMatric) setShowPayModal(false); }}><CrossIcon size={16} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {errorMsg && (
                <div style={{ padding: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger-500)', borderRadius: 'var(--radius-md)', color: 'var(--danger-500)', fontSize: 13, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <AlertIcon size={16} /> {errorMsg}
                </div>
              )}

              {successMsg && (
                <div style={{ padding: 12, background: 'rgba(34,197,94,0.1)', border: '1px solid var(--success-500)', borderRadius: 'var(--radius-md)', color: 'var(--success-500)', fontSize: 13, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <CheckIcon size={16} /> {successMsg}
                </div>
              )}

              {newMatric ? (
                /* Success step: Matriculation credentials display! */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center' }}>
                  <AcademicIcon size={52} color="var(--success-500)" />
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--success-500)' }}>Enrolled & Matriculated!</h3>
                  
                  <div style={{ width: '100%', padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Matriculation Number</span>
                      <strong style={{ fontSize: 18, fontFamily: 'monospace', color: 'var(--primary-200)' }}>{newMatric}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Official School Email Address</span>
                      <strong style={{ fontSize: 14, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{generatedEmail}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Temporary Account Password</span>
                      <strong style={{ fontSize: 14, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{temporaryPassword}</strong>
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.5 }}>
                    Your official student account has been successfully generated and credentials were dispatched to your registry contact. Log out of this portal and sign in to the Student Portal using your new Matriculation Number / School Email and Temporary Password!
                  </p>
                  
                  <button
                    onClick={() => {
                      localStorage.removeItem('umis_applicant_token');
                      localStorage.removeItem('umis_applicant_user');
                      window.location.href = 'http://localhost:5173/login'; // Student portal URL
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    Proceed to Student Portal login
                  </button>
                </div>
              ) : (
                /* Payment Checkout Gateway simulation */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', textAlign: 'center' }}>
                  <div>
                    Outstanding Amount: <strong>₦{paymentType === 'application_fee' 
                      ? (applicationFeeInvoice ? applicationFeeInvoice.amountDue.toLocaleString() : '10,000') 
                      : (acceptanceFeeInvoice ? acceptanceFeeInvoice.amountDue.toLocaleString() : '50,000')
                    }.00</strong>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Tx Ref: <code>{txRef}</code>
                  </div>

                  <button
                    type="button"
                    onClick={handleGatewayProceed}
                    className="btn btn-gold"
                    style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    disabled={verifying}
                  >
                    <CardIcon size={16} /> Pay via Paystack Gateway
                  </button>

                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>- OR -</div>

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onClick={handleSimulateVerify}
                    disabled={verifying}
                  >
                    <ZapIcon size={16} /> Simulate Successful Payment & Verify
                  </button>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-ghost"
                onClick={() => setShowPayModal(false)}
                disabled={verifying || !!newMatric}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
