import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Loader2, ArrowLeft, Crown } from 'lucide-react';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError('Please enter your email address.');

    setIsLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      // Redirect to reset password with email in query
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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

      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        {/* Error */}
        {error && (
          <div className="flex items-center gap-3" style={{
            background: 'rgba(231,76,90,0.08)', color: '#e74c5a',
            padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem', border: '1px solid rgba(231,76,90,0.2)',
            fontSize: '0.875rem'
          }}>
            <span>{error}</span>
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
              <Crown size={30} color="var(--gold)" strokeWidth={1.5} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              Recover Access
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Enter your email address and we'll send you a code to reset your password.
            </p>
            <div className="gold-divider" style={{ marginTop: '1rem' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block', marginBottom: '0.5rem',
                fontSize: '0.75rem', fontWeight: 500,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--text-muted)'
              }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute', left: '1rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-dim)',
                  pointerEvents: 'none'
                }} />
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="luxury-input-icon"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ padding: '1rem', fontSize: '0.85rem' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Sending Code...</>
              ) : 'Send Reset Code'}
            </button>
          </form>

          {/* Back button */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link
              to="/login"
              className="flex items-center gap-2 justify-center"
              style={{
                color: 'var(--text-muted)', fontSize: '0.8rem',
                transition: 'color 0.2s', margin: '0 auto',
                textDecoration: 'none'
              }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--cream)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ForgotPassword;
