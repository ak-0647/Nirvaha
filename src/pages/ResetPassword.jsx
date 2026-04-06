import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const { resetPassword, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from URL query params
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const otpRefs = useRef([]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => setResendTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (otpRefs.current[0]) otpRefs.current[0].focus();
  }, []);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) return setError('Please enter the 6-digit reset code.');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');

    setIsLoading(true);
    setError('');
    try {
      await resetPassword(email, otpString, newPassword);
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
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
      await forgotPassword(email);
      setSuccessMsg('New reset code sent!');
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
            background: 'linear-gradient(135deg, rgba(78,203,141,0.15), rgba(78,203,141,0.05))',
            border: '2px solid var(--success)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem'
          }}>
            <CheckCircle2 size={44} color="var(--success)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.75rem' }}>
            Password Reset
          </h2>
          <div className="gold-divider" />
          <p style={{ color: 'var(--text-muted)', margin: '1.5rem 0 2.5rem', lineHeight: 1.8, fontSize: '0.9rem' }}>
            Your password has been updated successfully. 
            <br />You can now login with your new credentials. 💙
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
      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '480px' }}>
        {/* Error / Success */}
        {error && (
          <div className="flex items-center gap-3" style={{
            background: 'rgba(231,76,90,0.12)', color: '#ff6b6b',
            padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem', border: '1px solid rgba(231,76,90,0.2)',
            fontSize: '0.875rem'
          }}>
            <span style={{ width: '100%', textAlign: 'center' }}>{error}</span>
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
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              Reset Password
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Enter the 6-digit code sent to<br />
              <strong style={{ color: 'var(--gold)' }}>{email}</strong>
            </p>
            <div className="gold-divider" style={{ marginTop: '1rem', width: '60px' }} />
          </div>

          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* OTP Input */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => otpRefs.current[i] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  style={{
                    width: '45px', height: '55px',
                    textAlign: 'center', fontSize: '1.5rem', fontWeight: 700,
                    background: 'var(--noir-surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', color: 'var(--cream)',
                    outline: 'none'
                  }}
                />
              ))}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="luxury-input-icon"
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="luxury-input-icon"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isLoading} style={{ padding: '1rem' }}>
              {isLoading ? 'Resetting...' : 'Update Password'}
            </button>
          </form>

          {/* Resend */}
          <div className="text-center" style={{ marginTop: '1.5rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Didn't receive the code?</p>
            {resendTimer > 0 ? (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Resend in <span style={{ color: 'var(--gold)' }}>{resendTimer}s</span></p>
            ) : (
              <button onClick={handleResendOTP} className="flex items-center gap-2 justify-center" style={{ color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 600, margin: '0 auto', background: 'none', border: 'none', cursor: 'pointer' }}>
                <RefreshCw size={14} /> Resend Code
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ResetPassword;
