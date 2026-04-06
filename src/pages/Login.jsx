import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Crown, Mail, Lock, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const alertMessage = location.state?.message;
  const from = location.state?.from || '/account';

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate(from);
    } catch (err) {
      if (err.data?.needsVerification) {
        navigate(`/verify-otp?email=${encodeURIComponent(err.data.email)}`);
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const labelStyle = {
    display: 'block', marginBottom: '0.5rem',
    fontSize: '0.72rem', fontWeight: 500,
    letterSpacing: '0.15em', textTransform: 'uppercase',
    color: 'var(--text-muted)'
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decoration */}
      <div style={{
        position: 'absolute', top: '-200px', right: '-200px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,169,110,0.04) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-200px', left: '-200px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,169,110,0.03) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        {/* Alert */}
        {(alertMessage || error) && (
          <div className="flex items-center gap-3" style={{
            background: 'rgba(231,76,90,0.08)', color: '#e74c5a',
            padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem', border: '1px solid rgba(231,76,90,0.2)',
            fontSize: '0.875rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error || alertMessage}</span>
          </div>
        )}

        {/* Card */}
        <div className="glass" style={{
          padding: '3rem',
          borderRadius: 'var(--radius-xl)',
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
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem', fontWeight: 500,
              marginBottom: '0.4rem'
            }}>Welcome Back</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in to your NIRVAHA account</p>
            <div className="gold-divider" style={{ marginTop: '1rem' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Email */}
            <div>
              <label style={labelStyle}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute', left: '1rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-dim)',
                  pointerEvents: 'none'
                }} />
                <input
                  type="email" name="email"
                  placeholder="you@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="luxury-input-icon"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                <label style={{
                  fontSize: '0.75rem', fontWeight: 500,
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: 'var(--text-muted)'
                }}>Password</label>
                <a href="#" style={{ fontSize: '0.78rem', color: 'var(--gold)', transition: 'opacity 0.2s' }}
                  onMouseOver={e => e.target.style.opacity = '0.7'}
                  onMouseOut={e => e.target.style.opacity = '1'}
                >Forgot Password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: '1rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-dim)',
                  pointerEvents: 'none'
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="luxury-input-icon"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '1rem', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--text-dim)',
                    cursor: 'pointer', transition: 'color 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--gold)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--text-dim)'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ padding: '1rem', marginTop: '0.5rem', fontSize: '0.85rem' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Signing In...</>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Spinner CSS */}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            New to NIRVAHA?{' '}
            <Link to="/register" style={{ color: 'var(--gold)', fontWeight: 600, transition: 'opacity 0.2s' }}
              onMouseOver={e => e.target.style.opacity = '0.7'}
              onMouseOut={e => e.target.style.opacity = '1'}
            >Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
