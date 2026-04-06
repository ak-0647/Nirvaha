import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { User, Menu, X, Crown, Camera, Globe, MapPin, Mail, Phone, Package, Sun, Moon } from 'lucide-react'

// Auth Context
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import Home from './pages/Home'
import Shop from './pages/Shop'
import Bespoke from './pages/Bespoke'
import Account from './pages/Account'
import Orders from './pages/Orders'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import OTPVerification from './pages/OTPVerification'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

// Components

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ message: 'Please sign in to access your account.', from: location.pathname }} replace />;
  }

  return children;
};

// Admin Route Wrapper
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.email !== 'nirvahawaves@gmail.com') return <Navigate to="/" replace />;
  
  return children;
};

// ═══ THEME HOOK ═══
const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nirvaha_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nirvaha_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return { theme, toggleTheme };
};

// ═══ NAVBAR ═══
const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // In light mode: nav text must stay LIGHT when unscrolled (over dark hero image)
  // and switch to DARK when scrolled (light background visible).
  // In dark mode: always light text.
  const navTextColor = theme === 'light'
    ? (scrolled ? '#3d3228' : '#e8e0d4')
    : '#c4b99a';
  
  const logoColor = theme === 'light'
    ? (scrolled ? '#1c1610' : '#f5f0e8')
    : '#f5f0e8';

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: scrolled ? '0.75rem 0' : '1.25rem 0',
        background: scrolled
          ? (theme === 'dark' ? 'rgba(10, 10, 10, 0.92)' : 'rgba(248, 245, 240, 0.95)')
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}>
        <div className="container flex items-center justify-between">
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }} onClick={() => setMobileOpen(false)}>
            <Crown size={28} color="var(--gold)" strokeWidth={1.5} />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              color: logoColor,
              textTransform: 'uppercase',
              transition: 'color 0.4s ease'
            }}>NIRVAHA</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="flex gap-8 items-center hide-mobile" style={{ fontWeight: 400, fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {['Home', 'Collections', 'Bespoke', 'Account'].map(label => (
              <Link
                key={label}
                to={label === 'Home' ? '/' : `/${label.toLowerCase()}`}
                style={{ color: navTextColor, transition: 'color 0.3s' }}
                onMouseOver={e => e.target.style.color = 'var(--gold)'}
                onMouseOut={e => e.target.style.color = navTextColor}
              >{label}</Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex gap-4 items-center">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              <div className="theme-toggle-knob">
                {theme === 'dark' ? <Moon size={12} color="var(--noir)" strokeWidth={2.5} /> : <Sun size={12} color="var(--noir)" strokeWidth={2.5} />}
              </div>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {user?.email === 'nirvahawaves@gmail.com' && (
                  <Link to="/admin" className="flex items-center gap-2 hide-mobile" style={{ textDecoration: 'none', transition: 'opacity 0.3s' }}
                    onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
                    onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                    <Crown size={16} color="var(--gold)" />
                    <span style={{ color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 600 }}>
                      Admin
                    </span>
                  </Link>
                )}
                <Link to="/orders" className="flex items-center gap-2 hide-mobile" style={{ textDecoration: 'none', transition: 'opacity 0.3s' }}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                  <Package size={16} color="var(--gold)" />
                  <span style={{ color: navTextColor, fontSize: '0.8rem', fontWeight: 500, transition: 'color 0.4s ease' }}>
                    Orders
                  </span>
                </Link>
                <Link to="/account" className="flex items-center gap-2" style={{ textDecoration: 'none', transition: 'opacity 0.3s' }}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <User size={16} color="#fff" />
                  </div>
                  <span style={{ color: navTextColor, fontSize: '0.8rem', fontWeight: 500, transition: 'color 0.4s ease' }} className="hide-mobile">
                    {user?.firstName}
                  </span>
                </Link>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary hide-mobile"
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.75rem' }}>Sign In</Link>
            )}

            {/* Mobile Menu Toggle */}
            <button style={{ color: navTextColor, display: 'none' }}
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <div className={`mobile-nav-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />
      <div className={`mobile-nav-drawer ${mobileOpen ? 'open' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown size={24} color="var(--gold)" />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--gold)' }}>NIRVAHA</span>
          </div>
          <button onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-muted)' }}>
            <X size={28} />
          </button>
        </div>

        <div className="mobile-nav-links">
          {['Home', 'Collections', 'Bespoke', 'Account'].map((label) => (
            <Link
              key={label}
              to={label === 'Home' ? '/' : `/${label.toLowerCase()}`}
              className="mobile-nav-link"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          {!isAuthenticated ? (
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setMobileOpen(false)}>Sign In</Link>
          ) : (
            <>
              <Link to="/orders" className="mobile-nav-link" onClick={() => setMobileOpen(false)}>Orders</Link>
              {user?.email === 'nirvahawaves@gmail.com' && (
                <Link to="/admin" className="mobile-nav-link" style={{ color: 'var(--gold)' }} onClick={() => setMobileOpen(false)}>Admin Panel</Link>
              )}
              <button 
                onClick={() => { logout(); setMobileOpen(false); }}
                className="mobile-nav-link" 
                style={{ textAlign: 'left', color: 'var(--danger)', border: 'none', background: 'none' }}
              >
                Logout
              </button>
            </>
          )}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
            © 2024 NIRVAHA LUXE
          </p>
        </div>
      </div>
    </>
  );
}

// ═══ FOOTER ═══
const Footer = () => (
  <footer style={{
    backgroundColor: 'var(--noir-light)',
    borderTop: '1px solid var(--border)',
    padding: '5rem 0 2rem 0',
    marginTop: 'auto'
  }}>
    <div className="container">
      {/* Top Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
            <Crown size={24} color="var(--gold)" strokeWidth={1.5} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, letterSpacing: '0.15em', color: 'var(--cream)' }}>NIRVAHA</span>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.9rem', maxWidth: '300px' }}>
            Where elegance meets simplicity. Minimal, aesthetic kurtis crafted with care and detail in cotton & rayon. 💙
          </p>
          <div className="flex gap-4" style={{ marginTop: '1.5rem' }}>
            <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.3s' }}
              onMouseOver={e => e.target.style.color = 'var(--gold)'}
              onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>
              <Camera size={20} />
            </a>
            <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.3s' }}
              onMouseOver={e => e.target.style.color = 'var(--gold)'}
              onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>
              <Globe size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: 'var(--font-body)' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {['Home', 'Cotton Kurtis', 'Rayon Kurtis', 'Chikankari'].map(link => (
              <li key={link}>
                <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', transition: 'color 0.3s' }}
                  onMouseOver={e => e.target.style.color = 'var(--cream)'}
                  onMouseOut={e => e.target.style.color = 'var(--text-muted)'}
                >{link}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h4 style={{ color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: 'var(--font-body)' }}>Customer Care</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {['Size Guide', 'Shipping & Returns', 'Care Instructions', 'Contact Us'].map(link => (
              <li key={link}>
                <a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', transition: 'color 0.3s' }}
                  onMouseOver={e => e.target.style.color = 'var(--cream)'}
                  onMouseOut={e => e.target.style.color = 'var(--text-muted)'}
                >{link}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: 'var(--font-body)' }}>Get in Touch</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <MapPin size={16} color="var(--gold)" />
              <span>Mumbai, Maharashtra, India</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span>nirvahawaves@gmail.com</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <Phone size={16} color="var(--gold)" />
              <span>+91 98765 43210</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
          © 2024 NIRVAHA. All rights reserved.
        </p>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>
          "Simplicity is the ultimate sophistication." ✨
        </p>
      </div>
    </div>
  </footer>
)

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
          <Navbar />
          <main style={{ flex: 1, paddingTop: '80px' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<OTPVerification />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/collections" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
              <Route path="/bespoke" element={<ProtectedRoute><Bespoke /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
