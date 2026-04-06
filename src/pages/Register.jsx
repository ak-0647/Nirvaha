import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Crown, Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '',
    phone: '', password: '', confirmPassword: '', gender: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'Required';
    if (!formData.lastName.trim()) errs.lastName = 'Required';
    if (!formData.email.includes('@')) errs.email = 'Enter a valid email';
    if (formData.phone.length < 10) errs.phone = 'Enter a valid phone number';
    if (formData.password.length < 6) errs.password = 'Min. 6 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!formData.gender) errs.gender = 'Please select';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        password: formData.password
      });
      // Redirect to OTP verification page
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fieldStyle = (field) => ({
    background: 'var(--noir-surface)',
    border: `1px solid ${errors[field] ? 'var(--danger)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    transition: 'all 0.3s var(--ease-luxury)',
    width: '100%',
    padding: '0.9rem 1rem 0.9rem 2.75rem',
    fontFamily: 'var(--font-body)'
  });

  const iconStyle = {
    position: 'absolute', left: '0.9rem', top: '50%',
    transform: 'translateY(-50%)', color: 'var(--text-dim)',
    pointerEvents: 'none'
  };

  const labelStyle = {
    display: 'block', marginBottom: '0.5rem',
    fontSize: '0.72rem', fontWeight: 500,
    letterSpacing: '0.15em', textTransform: 'uppercase',
    color: 'var(--text-muted)'
  };

  const errStyle = { color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px' };

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

      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '580px' }}>
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
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 500, marginBottom: '0.4rem' }}>
              Join NIRVAHA
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Create your account and step into elegance ✨
            </p>
            <div className="gold-divider" style={{ marginTop: '1rem' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Name Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={iconStyle} />
                  <input type="text" name="firstName" placeholder="Arjun" value={formData.firstName} onChange={handleChange} style={fieldStyle('firstName')} />
                </div>
                {errors.firstName && <p style={errStyle}>{errors.firstName}</p>}
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={iconStyle} />
                  <input type="text" name="lastName" placeholder="Mehta" value={formData.lastName} onChange={handleChange} style={fieldStyle('lastName')} />
                </div>
                {errors.lastName && <p style={errStyle}>{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={iconStyle} />
                <input type="email" name="email" placeholder="you@email.com" value={formData.email} onChange={handleChange} style={fieldStyle('email')} />
              </div>
              {errors.email && <p style={errStyle}>{errors.email}</p>}
            </div>

            {/* Phone & Gender */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={iconStyle} />
                  <input type="tel" name="phone" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} style={fieldStyle('phone')} />
                </div>
                {errors.phone && <p style={errStyle}>{errors.phone}</p>}
              </div>
              <div>
                <label style={labelStyle}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}
                  style={{
                    ...fieldStyle('gender'),
                    padding: '0.9rem 1rem',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%238a8478' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center'
                  }}>
                  <option value="" style={{ background: 'var(--noir-surface)' }}>Select</option>
                  <option value="male" style={{ background: 'var(--noir-surface)' }}>Male</option>
                  <option value="female" style={{ background: 'var(--noir-surface)' }}>Female</option>
                  <option value="other" style={{ background: 'var(--noir-surface)' }}>Prefer not to say</option>
                </select>
                {errors.gender && <p style={errStyle}>{errors.gender}</p>}
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={iconStyle} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" placeholder="Min. 6 characters"
                  value={formData.password} onChange={handleChange}
                  style={{ ...fieldStyle('password'), paddingRight: '3rem' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-dim)', cursor: 'pointer', transition: 'color 0.2s'
                }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--gold)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--text-dim)'}
                >{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
              {errors.password && <p style={errStyle}>{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={iconStyle} />
                <input
                  type="password" name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword} onChange={handleChange}
                  style={fieldStyle('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && <p style={errStyle}>{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ padding: '1rem', fontSize: '0.85rem', marginTop: '0.25rem' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Sending OTP...</>
              ) : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 600, transition: 'opacity 0.2s' }}
              onMouseOver={e => e.target.style.opacity = '0.7'}
              onMouseOut={e => e.target.style.opacity = '1'}
            >Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
