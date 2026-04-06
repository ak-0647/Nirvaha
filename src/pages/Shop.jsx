import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Plus, Minus, X, CreditCard, Truck, CheckCircle2, ArrowRight, Loader2, Package, Star, Search, SlidersHorizontal, Wallet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CATEGORIES = ['All', 'Cotton', 'Rayon', 'Chikankari'];

const Shop = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [step, setStep] = useState(1); // 1=select, 2=details, 3=done
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    address: '', city: '', pincode: '',
    payment: 'card'
  });
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState('');

  // Fetch products from DB
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Filtering Logic
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  // Cart functions
  const addToCart = (product, size = 'M') => {
    const existing = cart.find(c => c.productId === product._id && c.size === size);
    if (existing) {
      setCart(cart.map(c =>
        c.productId === product._id && c.size === size
          ? { ...c, qty: c.qty + 1 }
          : c
      ));
    } else {
      setCart([...cart, {
        productId: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        size,
        qty: 1,
        imageId: product.imageId,
        sizes: product.sizes || ['S', 'M', 'L']
      }]);
    }
  };

  const updateQty = (idx, delta) => {
    setCart(cart.map((item, i) =>
      i === idx ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  const updateSize = (idx, newSize) => {
    setCart(cart.map((item, i) =>
      i === idx ? { ...item, size: newSize } : item
    ));
  };

  const removeItem = (idx) => setCart(cart.filter((_, i) => i !== idx));

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 1500 ? 0 : 99;
  const total = subtotal + shipping;
  const formatPrice = (n) => '₹' + n.toLocaleString('en-IN');

  const submitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setOrderLoading(true);
    setOrderError('');

    try {
      const token = localStorage.getItem('nirvaha_token');
      const orderItems = cart.map(item => ({
        name: item.name,
        size: item.size,
        price: formatPrice(item.price * item.qty),
        image: item.imageId ? `${API_BASE}/api/media/image/${item.imageId}` : ''
      }));

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: orderItems, total: formatPrice(total), paymentMethod: formData.payment })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to place order');
      }

      const orderData = await res.json();
      setPlacedOrderId(orderData.orderId);
      setStep(3);
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh' }}>
      {/* Header */}
      <section style={{
        padding: '5rem 0 3rem',
        background: 'linear-gradient(180deg, var(--noir-surface) 0%, var(--noir) 100%)',
        textAlign: 'center',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container animate-fade-in">
          <span style={{ color: 'var(--gold)', fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 500 }}>
            {step === 1 ? 'EXPLORE COLLECTIONS' : step === 2 ? 'CHECKOUT' : 'CONFIRMED'}
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 500, marginTop: '0.5rem' }}>
            {step === 1 && <>Our <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Collections</span></>}
            {step === 2 && <>Shipping <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Details</span></>}
            {step === 3 && <>Order <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Confirmed</span></>}
          </h1>
          <div className="gold-divider" />
        </div>
      </section>

      <div className="container" style={{ padding: '3rem 2rem' }}>
        {/* STEP 1: Discover & Order */}
        {step === 1 && (
          <div className="animate-fade-in">
            {/* Filter Bar integrated from Collections */}
            <div className="glass" style={{
              padding: '1.25rem 2rem',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '3rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div className="flex items-center gap-2" style={{
                flex: 1, minWidth: '280px', background: 'var(--noir-surface)',
                padding: '0.6rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)'
              }}>
                <Search size={18} color="var(--text-dim)" />
                <input
                  type="text"
                  placeholder="Search our luxury collection…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ border: 'none', background: 'transparent', width: '100%', padding: '0.3rem', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>

              <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                <SlidersHorizontal size={16} color="var(--gold)" style={{ marginRight: '0.5rem' }} />
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                    padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
                    border: activeCategory === cat ? '1px solid var(--gold)' : '1px solid var(--border)',
                    background: activeCategory === cat ? 'rgba(201, 169, 110, 0.1)' : 'transparent',
                    color: activeCategory === cat ? 'var(--gold)' : 'var(--text-muted)',
                    cursor: 'pointer', transition: 'all 0.3s ease'
                  }}>{cat}</button>
                ))}
              </div>
            </div>

            {loadingProducts ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 0', color: 'var(--gold)' }}>
                <Loader2 size={36} className="spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fetching Collections...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center" style={{ padding: '4rem 0' }}>
                <Package size={48} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Kurtis Found</h3>
                <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search or filters. 💗</p>
              </div>
            ) : (
              <div className="grid-2" style={{ gridTemplateColumns: cart.length > 0 ? undefined : '1fr', gap: '2.5rem' }}>
                {/* Product Grid */}
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
                    {filteredProducts.map((product, idx) => {
                      const inCart = cart.find(c => c.productId === product._id);
                      return (
                        <div key={product._id} className="product-card animate-fade-in" style={{ animationDelay: `${idx * 60}ms` }}>
                          <div className="product-image">
                            <img
                              src={`${API_BASE}/api/media/image/${product.imageId}`}
                              alt={product.name}
                              onError={e => { e.target.style.background = 'var(--noir-surface)'; }}
                            />
                            {product.badge && <span className="product-badge">{product.badge}</span>}
                            {inCart && (
                              <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'var(--gold)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                                <CheckCircle2 size={16} color="var(--noir)" />
                              </div>
                            )}
                          </div>
                          <div className="product-info">
                            <div className="product-category">{product.category}</div>
                            <h3>{product.name}</h3>
                            <div className="flex items-center justify-between" style={{ marginTop: '0.5rem' }}>
                              <div className="product-price">
                                {formatPrice(product.price)}
                                {product.originalPrice && <span className="original-price">{formatPrice(product.originalPrice)}</span>}
                              </div>
                              <div className="flex items-center gap-1" style={{ color: 'var(--gold)', fontSize: '0.8rem' }}>
                                <Star size={14} fill="currentColor" />
                                <span style={{ color: 'var(--cream)' }}>{product.rating || 4.5}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => addToCart(product)}
                              className="btn btn-primary w-full"
                              style={{ marginTop: '1.25rem', padding: '0.75rem', fontSize: '0.8rem' }}
                            >
                              {inCart ? `Order More (${inCart.qty})` : 'Add to Order'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Unified Cart Sidebar */}
                {cart.length > 0 && (
                  <div className="glass animate-fade-in" style={{ 
                    padding: '2rem', 
                    borderRadius: 'var(--radius-lg)', 
                    height: 'fit-content', 
                    position: 'sticky', 
                    top: '100px', 
                    border: '1px solid var(--border-gold)',
                    zIndex: 10
                  }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShoppingBag size={18} color="var(--gold)" />
                      Your Order
                      <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>{cart.length} item{cart.length > 1 ? 's' : ''}</span>
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                      {cart.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                          <div style={{ width: '60px', height: '75px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={`${API_BASE}/api/media/image/${item.imageId}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ fontSize: '0.85rem', fontFamily: 'var(--font-display)', marginBottom: '0.3rem', color: 'var(--cream)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                            <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.5rem' }}>
                              {(item.sizes || ['S', 'M', 'L']).map(s => (
                                <button key={s} onClick={() => updateSize(idx, s)} style={{
                                  padding: '0.15rem 0.4rem', fontSize: '0.6rem', fontWeight: 600, borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s',
                                  border: item.size === s ? '1px solid var(--gold)' : '1px solid var(--border)',
                                  background: item.size === s ? 'rgba(201,169,110,0.15)' : 'transparent',
                                  color: item.size === s ? 'var(--gold)' : 'var(--text-dim)'
                                }}>{s}</button>
                              ))}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <button onClick={() => updateQty(idx, -1)} style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}><Minus size={12} /></button>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.qty}</span>
                                <button onClick={() => updateQty(idx, 1)} style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}><Plus size={12} /></button>
                              </div>
                              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--cream)' }}>{formatPrice(item.price * item.qty)}</span>
                            </div>
                          </div>
                          <button onClick={() => removeItem(idx)} style={{ color: 'var(--text-dim)', cursor: 'pointer', alignSelf: 'flex-start' }}><X size={16} /></button>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div className="flex justify-between" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <span>Subtotal</span><span style={{ color: 'var(--cream)' }}>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <span>Shipping</span>
                        <span style={{ color: shipping === 0 ? 'var(--success)' : 'var(--cream)' }}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between" style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                      <span>Total</span><span style={{ color: 'var(--gold)' }}>{formatPrice(total)}</span>
                    </div>

                    <button className="btn btn-primary w-full" onClick={() => setStep(2)} style={{ padding: '0.85rem shadow-gold' }}>
                      Proceed to Checkout <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Checkout */}
        {step === 2 && (
          <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Shipping Details</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>Confirm your delivery information to place the order.</p>

              {orderError && (
                <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(231,76,90,0.1)', border: '1px solid rgba(231,76,90,0.2)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  {orderError}
                </div>
              )}

              <form onSubmit={submitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Full Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} required className="luxury-input" placeholder="Your full name" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Phone</label>
                    <input name="phone" type="tel" value={formData.phone} onChange={handleChange} required className="luxury-input" placeholder="+91 98765 43210" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Email</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} required className="luxury-input" placeholder="you@email.com" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Address</label>
                  <input name="address" value={formData.address} onChange={handleChange} required className="luxury-input" placeholder="Street address" />
                </div>
                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>City</label>
                    <input name="city" value={formData.city} onChange={handleChange} required className="luxury-input" placeholder="City" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>PIN Code</label>
                    <input name="pincode" value={formData.pincode} onChange={handleChange} required className="luxury-input" placeholder="400001" />
                  </div>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Payment Method</label>
                  <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
                    {[
                      { value: 'card', label: 'Credit Card', icon: <CreditCard size={18} /> },
                      { value: 'upi', label: 'UPI / Wallet', icon: <Wallet size={18} /> },
                      { value: 'cod', label: 'Cash on Delivery', icon: <Truck size={18} /> }
                    ].map(pm => (
                      <button key={pm.value} type="button" onClick={() => setFormData({ ...formData, payment: pm.value })}
                        className="flex items-center gap-2"
                        style={{
                          flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)',
                          border: formData.payment === pm.value ? '1px solid var(--gold)' : '1px solid var(--border)',
                          background: formData.payment === pm.value ? 'rgba(201,169,110,0.08)' : 'var(--noir-surface)',
                          color: formData.payment === pm.value ? 'var(--gold)' : 'var(--text-muted)',
                          cursor: 'pointer', transition: 'all 0.3s', fontSize: '0.85rem', fontWeight: 500
                        }}
                      >{pm.icon} {pm.label}</button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between" style={{ marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary" disabled={orderLoading}>
                    {orderLoading ? <Loader2 size={16} className="spin" /> : <>Place Order <ArrowRight size={16} /></>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* STEP 3: Confirmation */}
        {step === 3 && (
          <div className="animate-fade-in text-center" style={{ padding: '4rem 0', maxWidth: '500px', margin: '0 auto' }}>
            <CheckCircle2 size={60} color="var(--gold)" style={{ margin: '0 auto 2rem' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: '0.75rem' }}>Order <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Confirmed</span></h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Order #{placedOrderId} has been placed successfully.</p>
            <div className="flex justify-center gap-4">
              <Link to="/" className="btn btn-secondary">Back to Home</Link>
              <Link to="/orders" className="btn btn-primary">View Orders</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Shop
