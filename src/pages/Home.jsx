import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, Truck, Shield, RotateCcw, Crown, Sparkles, Gem, Heart } from 'lucide-react'
import heroBg from '../assets/kurti_hero_bg.png'
import kurtiCotton from '../assets/kurti_cotton.png'
import kurtiRayon from '../assets/kurti_rayon.png'
import kurtiChikan from '../assets/kurti_chikan.png'
import kurtiProduct1 from '../assets/kurti_product_1.png'
import kurtiProduct2 from '../assets/kurti_product_2.png'

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'Blush Cotton A-Line Kurti',
    category: 'Cotton Collection',
    price: '₹1,299',
    originalPrice: '₹1,799',
    badge: 'Bestseller',
    image: kurtiProduct1,
    rating: 4.9
  },
  {
    id: 2,
    name: 'Sage Green Rayon Kurti',
    category: 'Rayon Collection',
    price: '₹999',
    badge: 'New',
    image: kurtiProduct2,
    rating: 4.8
  },
  {
    id: 3,
    name: 'Ivory Chikankari Kurti',
    category: 'Handwork Collection',
    price: '₹2,499',
    badge: 'Limited',
    image: kurtiChikan,
    rating: 5.0
  },
  {
    id: 4,
    name: 'Dusty Rose Cotton Kurti',
    category: 'Cotton Collection',
    price: '₹1,199',
    originalPrice: '₹1,599',
    image: kurtiCotton,
    rating: 4.7
  }
]

const CATEGORIES = [
  { name: 'Cotton Kurtis', icon: <Sparkles size={28} />, count: 24, image: kurtiCotton },
  { name: 'Rayon Kurtis', icon: <Crown size={28} />, count: 18, image: kurtiRayon },
  { name: 'Chikankari Kurtis', icon: <Gem size={28} />, count: 12, image: kurtiChikan },
]

const Home = () => {
  const [heroLoaded, setHeroLoaded] = useState(false)
  const [email, setEmail] = useState('')
  const [newsLoading, setNewsLoading] = useState(false)
  const [newsSuccess, setNewsSuccess] = useState('')
  const [newsError, setNewsError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setHeroLoaded(true), 200)
    return () => clearTimeout(timer)
  }, [])

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setNewsLoading(true);
    setNewsError('');
    setNewsSuccess('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Subscription failed');
      setNewsSuccess(data.message);
      setEmail('');
    } catch (err) {
      setNewsError(err.message);
    } finally {
      setNewsLoading(false);
    }
  };

  return (
    <div>
      {/* ═══ HERO SECTION ═══ */}
      <section style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        marginTop: '-80px'
      }}>
        {/* Background */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: heroLoaded ? 'scale(1)' : 'scale(1.1)',
          transition: 'transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          zIndex: -2
        }} />
        {/* Overlays */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'linear-gradient(135deg, rgba(10,10,10,0.88) 0%, rgba(10,10,10,0.45) 50%, rgba(10,10,10,0.75) 100%)',
          zIndex: -1
        }} />
        {/* Gold accent line */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--gold), transparent)'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 10, paddingTop: '4rem' }}>
          <div style={{ maxWidth: '700px' }}>
            {/* Launching Soon Badge */}
            <div className={heroLoaded ? 'animate-fade-in' : ''} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '1.5rem',
              padding: '0.5rem 1.2rem',
              background: 'rgba(201, 169, 110, 0.12)',
              border: '1px solid rgba(201, 169, 110, 0.25)',
              borderRadius: 'var(--radius-full)',
              opacity: heroLoaded ? undefined : 0,
              animation: heroLoaded ? 'fadeIn 0.8s var(--ease-luxury) forwards, goldPulse 3s ease-in-out infinite' : undefined
            }}>
              <Sparkles size={14} color="var(--gold)" />
              <span style={{
                color: 'var(--gold)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-body)'
              }}>Launching Soon ✨</span>
            </div>

            {/* Pre-title */}
            <div className={heroLoaded ? 'animate-fade-in' : ''} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              opacity: heroLoaded ? undefined : 0
            }}>
              <div style={{ width: '40px', height: '1px', background: 'var(--gold)' }} />
              <span style={{
                color: 'var(--gold)',
                fontSize: '0.8rem',
                fontWeight: 500,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-body)'
              }}>Welcome to Nirvaha 💙</span>
            </div>

            {/* Main Title */}
            <h1 className={heroLoaded ? 'animate-fade-in animate-delay-200' : ''} style={{
              fontSize: 'clamp(2.8rem, 6vw, 5rem)',
              fontFamily: 'var(--font-display)',
              fontWeight: 500,
              lineHeight: 1.05,
              marginBottom: '2rem',
              color: 'var(--cream)',
              opacity: heroLoaded ? undefined : 0
            }}>
              Where Elegance<br />
              <span className="gradient-text" style={{ fontStyle: 'italic' }}>Meets Simplicity</span>
            </h1>

            {/* Subtitle */}
            <p className={heroLoaded ? 'animate-fade-in animate-delay-300' : ''} style={{
              fontSize: '1.1rem',
              color: 'var(--cream-muted)',
              lineHeight: 1.8,
              marginBottom: '2.5rem',
              maxWidth: '520px',
              opacity: heroLoaded ? undefined : 0
            }}>
              We design minimal, aesthetic kurtis crafted with care and detail. Bringing you timeless fashion in premium cotton & rayon. 💗
            </p>

            {/* CTAs */}
            <div className={`flex gap-4 ${heroLoaded ? 'animate-fade-in animate-delay-400' : ''}`} style={{
              opacity: heroLoaded ? undefined : 0,
              flexWrap: 'wrap'
            }}>
              <Link to="/collections" className="btn btn-primary" style={{ padding: '1rem 2.5rem', flex: '1 1 auto', minWidth: '200px' }}>
                Explore Collection <ArrowRight size={18} />
              </Link>
              <Link to="/shop" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', flex: '1 1 auto', minWidth: '200px' }}>
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MARQUEE BANNER ═══ */}
      <section style={{
        background: 'var(--gold)',
        padding: '0.8rem 0',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          animation: 'marquee 30s linear infinite',
          whiteSpace: 'nowrap',
          gap: '4rem'
        }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-8 items-center" style={{ flexShrink: 0 }}>
              {['PURE COTTON', '★', 'PREMIUM RAYON', '★', 'HANDCRAFTED', '★', 'MINIMAL AESTHETIC', '★', 'MADE WITH LOVE 💗'].map((text, j) => (
                <span key={j} style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  color: 'var(--noir)',
                  fontFamily: 'var(--font-body)'
                }}>{text}</span>
              ))}
            </div>
          ))}
        </div>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
        `}</style>
      </section>

      {/* ═══ CATEGORIES ═══ */}
      <section style={{ padding: '6rem 0' }}>
        <div className="container">
          <div className="text-center animate-fade-in">
            <span style={{ color: 'var(--gold)', fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 500 }}>OUR FABRICS</span>
            <h2 className="section-title" style={{ marginTop: '0.75rem' }}>Shop by Collection</h2>
            <div className="gold-divider" />
            <p className="section-subtitle">Each kurti is thoughtfully crafted in fabrics that feel as beautiful as they look.</p>
          </div>

          <div className="grid-3">
            {CATEGORIES.map((cat, idx) => (
              <Link to="/collections" key={cat.name}
                className="animate-fade-in"
                style={{
                  animationDelay: `${idx * 150}ms`,
                  position: 'relative',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  height: '400px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)',
                  transition: 'all 0.5s var(--ease-luxury)'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.querySelector('.cat-img').style.transform = 'scale(1.1)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.querySelector('.cat-img').style.transform = 'scale(1)'
                }}
              >
                <img className="cat-img" src={cat.image} alt={cat.name} style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  objectFit: 'cover', transition: 'transform 0.8s var(--ease-luxury)'
                }} />
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  background: 'linear-gradient(to top, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.2) 60%)',
                }} />
                <div style={{ position: 'relative', padding: '2rem', width: '100%' }}>
                  <div style={{ color: 'var(--gold)', marginBottom: '0.75rem' }}>{cat.icon}</div>
                  <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem', color: 'var(--cream)' }}>{cat.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cat.count} Styles</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED PRODUCTS ═══ */}
      <section style={{ padding: '6rem 0', background: 'var(--noir-light)' }}>
        <div className="container">
          <div className="flex justify-between items-center" style={{ marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ color: 'var(--gold)', fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 500 }}>HANDPICKED</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 500, marginTop: '0.5rem' }}>Our Best Kurtis</h2>
            </div>
            <Link to="/collections" className="btn btn-secondary" style={{ padding: '0.65rem 1.5rem' }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {FEATURED_PRODUCTS.map((product, idx) => (
              <div key={product.id} className="product-card animate-fade-in" style={{ animationDelay: `${idx * 120}ms` }}>
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  {product.badge && <span className="product-badge">{product.badge}</span>}

                  {/* Hover overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    padding: '1.5rem',
                    background: 'linear-gradient(to top, rgba(10,10,10,0.9), transparent)',
                    display: 'flex',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                    transform: 'translateY(10px)'
                  }}
                    className="product-overlay"
                  >
                    <Link to="/shop" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.75rem' }}>
                      Add to Bag
                    </Link>
                  </div>
                </div>
                <div className="product-info">
                  <div className="product-category">{product.category}</div>
                  <h3>{product.name}</h3>
                  <div className="flex items-center justify-between" style={{ marginTop: '0.5rem' }}>
                    <div className="product-price">
                      {product.price}
                      {product.originalPrice && <span className="original-price">{product.originalPrice}</span>}
                    </div>
                    <div className="flex items-center gap-1" style={{ color: 'var(--gold)', fontSize: '0.8rem' }}>
                      <Star size={14} fill="currentColor" />
                      <span style={{ color: 'var(--cream)' }}>{product.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Product overlay hover CSS */}
          <style>{`
            .product-card:hover .product-overlay {
              opacity: 1 !important;
              transform: translateY(0) !important;
            }
          `}</style>
        </div>
      </section>

      {/* ═══ BRAND STORY SECTION ═══ */}
      <section style={{ padding: '8rem 0', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute', top: '50%', left: '-10%',
          width: '300px', height: '300px',
          borderRadius: '50%',
          border: '1px solid rgba(201, 169, 110, 0.06)',
          transform: 'translateY(-50%)'
        }} />

        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            {/* Text */}
            <div className="animate-slide-left">
              <span style={{ color: 'var(--gold)', fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 500 }}>OUR STORY</span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.8rem',
                fontWeight: 500,
                marginTop: '0.75rem',
                marginBottom: '1.5rem',
                lineHeight: 1.15
              }}>
                Crafted with<br />
                <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Care & Detail</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.9, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                At Nirvaha, we believe fashion should be effortless — minimal, aesthetic, and timeless. Our kurtis are designed for the modern woman who values comfort without compromising on elegance.
              </p>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.9, marginBottom: '2.5rem', fontSize: '0.95rem' }}>
                We work with premium cotton and rayon fabrics, bringing you pieces that drape beautifully and feel amazing all day long. Every stitch, every detail speaks of our love for quality craftsmanship. 💫
              </p>
              <Link to="/collections" className="btn btn-secondary" style={{ padding: '0.85rem 2rem' }}>
                Discover More <ArrowRight size={16} />
              </Link>
            </div>

            {/* Image Grid */}
            <div className="animate-slide-right" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '300px' }}>
                <img src={kurtiCotton} alt="Cotton Kurtis" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '300px', marginTop: '2rem' }}>
                <img src={kurtiRayon} alt="Rayon Kurtis" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '200px', gridColumn: 'span 2' }}>
                <img src={kurtiChikan} alt="Chikankari Collection" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRUST BADGES ═══ */}
      <section style={{ padding: '5rem 0', background: 'var(--noir-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="grid-3" style={{ textAlign: 'center' }}>
            {[
              { icon: <Truck size={28} strokeWidth={1.5} />, title: 'Pan-India Shipping', desc: 'Free above ₹1,500' },
              { icon: <Shield size={28} strokeWidth={1.5} />, title: 'Premium Fabrics', desc: '100% genuine quality' },
              { icon: <RotateCcw size={28} strokeWidth={1.5} />, title: 'Easy Returns', desc: 'Hassle-free returns' },
              { icon: <Heart size={28} strokeWidth={1.5} />, title: 'Made with Love', desc: 'Crafted with care 💗' }
            ].map((item, idx) => (
              <div key={idx} className="animate-fade-in" style={{
                animationDelay: `${idx * 100}ms`,
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                transition: 'all 0.4s var(--ease-luxury)',
                cursor: 'default'
              }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'var(--noir-card)'
                  e.currentTarget.style.transform = 'translateY(-5px)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ color: 'var(--gold)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--cream)' }}>{item.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NEWSLETTER ═══ */}
      <section style={{ padding: '6rem 0' }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <div className="text-center animate-fade-in">
            <Crown size={32} color="var(--gold)" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 500, marginBottom: '0.75rem' }}>
              Be the <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>First to Know</span>
            </h2>
            <div className="gold-divider" />
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.7 }}>
              Get notified when we launch! Subscribe for early access to our debut collection and exclusive launch-day offers. ✨
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2" style={{ maxWidth: '500px', margin: '0 auto', flexWrap: 'wrap' }}>
              <input
                type="email"
                placeholder="Enter your email"
                className="luxury-input"
                style={{ flex: '1 1 300px' }}
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={newsLoading}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '1rem 2rem', whiteSpace: 'nowrap', flex: '1 1 auto' }} disabled={newsLoading}>
                {newsLoading ? 'Processing...' : 'Notify Me'}
              </button>
            </form>
            {newsSuccess && <p className="animate-fade-in" style={{ color: 'var(--success)', fontSize: '0.9rem', marginTop: '1.5rem', fontWeight: 500 }}>{newsSuccess}</p>}
            {newsError && <p className="animate-fade-in" style={{ color: 'var(--danger)', fontSize: '0.9rem', marginTop: '1.5rem' }}>{newsError}</p>}
            <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '1rem' }}>We respect your privacy. No spam, we promise. 🫧</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
