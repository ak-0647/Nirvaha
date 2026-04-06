import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Loader2, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

const OTPVerification = () => {
  const { verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from URL query params
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [isVerified, setIsVerified] = useState(false);
  const otpRefs = useRef([]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => setResendTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  // Focus high-level logic
  useEffect(() => {
    if (otpRefs.current[0]) otpRefs.current[0].focus();
  }, []);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await verifyOTP(email, otpString);
      setIsVerified(true);
      // Wait a bit to show success before redirecting
      setTimeout(() => {
        navigate('/account');
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    setError('');
    try {
      await resendOTP(email);
      setSuccessMsg('New OTP sent! Check your email.');
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div style={{
        minHeight: '80vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem'
      }}>
        <div className="animate-fade-scale glass" style={{
          padding: '4rem 3rem', borderRadius: 'var(--radius-xl)',
          width: '100%', maxWidth: '480px', textAlign: 'center',
          border: '1px solid rgba(201,169,110,0.15)'
        }}>
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(201,169,110,0.15), rgba(201,169,110,0.05))',
            border: '2px solid var(--gold)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem', animation: 'goldPulse 2s infinite'
          }}>
            <CheckCircle2 size={44} color="var(--gold)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.75rem' }}>
            Account Verified
          </h2>
          <div className="gold-divider" />
          <p style={{ color: 'var(--text-muted)', margin: '1.5rem 0 2.5rem', lineHeight: 1.8, fontSize: '0.9rem' }}>
            Congratulations! Your email has been successfully verified. 
            <br />Directing you to your account... 💙
          </p>
          <div className="flex justify-center">
            <Loader2 size={24} color="var(--gold)" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '80vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '4rem 1.5rem', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background Decor */}
      <div style={{
        position: 'absolute', top: '-150px', right: '-150px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,169,110,0.04) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '480px' }}>
        {/* Error / Success */}
        {error && (
          <div className="flex items-center gap-3" style={{
            background: 'rgba(231,76,90,0.12)', color: '#ff6b6b',
            padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem', border: '1px solid rgba(231,76,90,0.2)',
            fontSize: '0.875rem', textAlign: 'center'
          }}>
            <span style={{ width: '100%' }}>{error}</span>
          </div>
        )}
        {successMsg && (
          <div style={{
            background: 'rgba(78,203,141,0.12)', color: '#51cf66',
            padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem', border: '1px solid rgba(78,203,141,0.2)',
            fontSize: '0.875rem', textAlign: 'center'
          }}>
            {successMsg}
          </div>
        )}

        <div className="glass" style={{
          padding: '3rem', borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(201,169,110,0.1)'
        }}>
          {/* Header */}
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <div style={{
              width: '68px', height: '68px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(201,169,110,0.15), rgba(201,169,110,0.05))',
              border: '1px solid rgba(201,169,110,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <Mail size={30} color="var(--gold)" strokeWidth={1.5} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              Verify Your Email
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              We've sent a 6-digit code to<br />
              <strong style={{ color: 'var(--gold)' }}>{email || 'your email'}</strong>
            </p>
            <div className="gold-divider" style={{ marginTop: '1rem' }} />
          </div>

          {/* OTP Input */}
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginBottom: '2rem' }}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => otpRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                onPaste={i === 0 ? handleOtpPaste : undefined}
                style={{
                  width: '52px', height: '60px',
                  textAlign: 'center',
                  fontSize: '1.5rem', fontWeight: 700,
                  fontFamily: 'monospace',
                  background: digit ? 'rgba(201,169,110,0.08)' : 'var(--noir-surface)',
                  border: digit ? '2px solid var(--gold)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--cream)',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--gold)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(201,169,110,0.1)';
                }}
                onBlur={e => {
                  if (!digit) {
                    e.target.style.borderColor = 'var(--border)';
                  }
                  e.target.style.boxShadow = 'none';
                }}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerifyOTP}
            className="btn btn-primary w-full"
            style={{ padding: '1rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}
            disabled={isLoading || otp.join('').length !== 6}
          >
            {isLoading ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</>
            ) : 'Verify & Activate Account'}
          </button>

          {/* Resend */}
          <div className="text-center">
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Didn't receive the code?
            </p>
            {resendTimer > 0 ? (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                Resend in <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{resendTimer}s</span>
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={isLoading}
                className="flex items-center gap-2 justify-center"
                style={{
                  color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'opacity 0.2s', margin: '0 auto',
                  background: 'none', border: 'none'
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                <RefreshCw size={14} /> Resend OTP
              </button>
            )}
          </div>

          {/* Back button */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link
              to="/register"
              className="flex items-center gap-2 justify-center"
              style={{
                color: 'var(--text-muted)', fontSize: '0.8rem',
                transition: 'color 0.2s', margin: '0 auto',
                textDecoration: 'none'
              }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--cream)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <ArrowLeft size={14} /> Back to registration
            </Link>
          </div>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes goldPulse {
            0% { box-shadow: 0 0 0 0 rgba(201, 169, 110, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(201, 169, 110, 0); }
            100% { box-shadow: 0 0 0 0 rgba(201, 169, 110, 0); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default OTPVerification;
