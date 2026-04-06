import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Heart, MapPin, Clock, Crown, ArrowRight, Star, Truck, ChevronRight, Edit3, Save, X, Loader2, Phone, User, Mail, UploadCloud, Scissors } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Account = () => {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    gender: user?.gender || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        gender: user.gender
      });
    }
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fieldStyle = {
    background: 'var(--noir-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--cream)',
    padding: '0.65rem 0.75rem',
    fontSize: '0.85rem',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.3s'
  };

  return (
    <div style={{ minHeight: '80vh', paddingBottom: '5rem' }}>
      {/* Header */}
      <section style={{
        padding: '5rem 0 3rem',
        background: 'linear-gradient(180deg, var(--noir-surface) 0%, var(--noir) 100%)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container animate-fade-in">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(201,169,110,0.2)'
              }}>
                <Crown size={36} color="var(--noir)" />
              </div>
              <div>
                <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 500 }}>
                    Welcome, <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{user?.firstName || 'Member'}</span>
                  </h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={logout} className="btn" style={{ padding: '0.6rem 1.2rem', color: 'var(--text-dim)', border: '1px solid var(--border)' }}>
                Sign Out
              </button>
            </div>
          </div>
          
          {/* Tabs (Only Profile now) */}
          <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem', borderBottom: '1px solid var(--border)' }}>
            <div 
              style={{ padding: '0.8rem 0', color: 'var(--gold)', borderBottom: '2px solid var(--gold)', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'center' }}
            >
              <User size={18} /> Public Profile
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ padding: '3rem 2rem' }}>
        {/* Status Messages */}
        {error && <div className="alert alert-danger" style={{ marginBottom: '2rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(231,76,90,0.1)', color: '#e74c5a', border: '1px solid rgba(231,76,90,0.2)' }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '2rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(78,203,141,0.1)', color: '#4ecb8d', border: '1px solid rgba(78,203,141,0.2)' }}>{success}</div>}

        <div className="grid-2" style={{ gridTemplateColumns: undefined, gap: '2.5rem' }}>
          
          {/* ─── Main Content ─── */}
          <div>
            <div className="glass animate-fade-in" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', border: isEditing ? '1px solid var(--gold)' : '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isEditing ? <Edit3 size={20} color="var(--gold)" /> : <Crown size={20} color="var(--gold)" />}
                  {isEditing ? 'Update Personal Information' : 'Public Profile Details'}
                </h3>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <Edit3 size={14} /> Edit
                  </button>
                )}
              </div>
              
              <form onSubmit={handleUpdate}>
                <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>First Name</label>
                    {isEditing ? (
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} style={fieldStyle} required />
                    ) : (
                      <p style={{ color: 'var(--cream)', fontSize: '1rem', fontWeight: 500 }}>{user?.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>Last Name</label>
                    {isEditing ? (
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} style={fieldStyle} required />
                    ) : (
                      <p style={{ color: 'var(--cream)', fontSize: '1rem', fontWeight: 500 }}>{user?.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>Phone Number</label>
                    {isEditing ? (
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={fieldStyle} required />
                    ) : (
                      <p style={{ color: 'var(--cream)', fontSize: '1rem', fontWeight: 500 }}>{user?.phone || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>Gender</label>
                    {isEditing ? (
                      <select name="gender" value={formData.gender} onChange={handleChange} style={fieldStyle} required>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p style={{ color: 'var(--cream)', fontSize: '1rem', fontWeight: 500, textTransform: 'capitalize' }}>{user?.gender}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-4" style={{ marginTop: '2rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ flex: 1, padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      {isLoading ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
                      Save Changes
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ flex: 0.5, padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <X size={18} /> Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* ─── Sidebar ─── */}
          <div>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Support</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(201,169,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={14} color="var(--gold)" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Email Us</p>
                    <p style={{ fontSize: '0.85rem' }}>nirvahawaves@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(201,169,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={14} color="var(--gold)" />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Call Us</p>
                    <p style={{ fontSize: '0.85rem' }}>+91 98765 43210</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Secure Account</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>Your data is encrypted and managed according to our security protocols.</p>
              <Link to="/forgot-password" style={{ color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 600 }}>Change Password</Link>
            </div>

            <div className="glass animate-fade-in" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginTop: '1.5rem', border: '1px solid rgba(201,169,110,0.2)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--gold)' }}>Bespoke Orders</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>Looking for something uniquely tailored? Track your bespoke requests on our dedicated page.</p>
              <Link to="/bespoke" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', padding: '0.6rem' }}>View Bespoke Inquiry</Link>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .spin { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default Account
