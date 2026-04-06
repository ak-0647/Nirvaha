import React, { useState, useEffect } from 'react'
import { Package, Crown, Loader2, UploadCloud, Scissors, Info, CheckCircle2, AlertCircle, CreditCard, Wallet, Truck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Bespoke = () => {
  const { user, isAuthenticated } = useAuth();
  const [customOrders, setCustomOrders] = useState([]);
  const [customForm, setCustomForm] = useState({ requirements: '', priceRange: '', image: null, paymentMethod: 'card' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [customPreview, setCustomPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomOrders();
    }
  }, [isAuthenticated]);

  const fetchCustomOrders = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch(`${API_URL}/api/orders/custom/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('nirvaha_token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch order history');
      const data = await response.json();
      setCustomOrders(data);
    } catch (err) {
      console.error('Fetch history error:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomForm(prev => ({ ...prev, image: file }));
      setCustomPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!customForm.requirements || !customForm.priceRange) {
      return setError('Requirements and Price Range are required');
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('requirements', customForm.requirements);
      fd.append('priceRange', customForm.priceRange);
      fd.append('paymentMethod', customForm.paymentMethod);
      if (customForm.image) {
        fd.append('image', customForm.image);
      }

      const response = await fetch(`${API_URL}/api/orders/custom`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('nirvaha_token')}` 
        },
        body: fd
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Submission failed');

      setSuccess('Bespoke request submitted! Check your email for updates.');
      setCustomForm({ requirements: '', priceRange: '', image: null, paymentMethod: 'card' });
      setCustomPreview(null);
      fetchCustomOrders();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccess(''), 6000);
    } catch (err) {
      setError(err.message || 'Failed to submit custom request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass" style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px' }}>
          <Info size={40} color="var(--gold)" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>Auth Required</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please sign in to access our bespoke design services.</p>
          <a href="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>Sign In Now</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '8rem' }}>
      {/* Hero Header */}
      <section style={{
        padding: '8rem 0 6rem',
        background: 'linear-gradient(180deg, var(--noir-surface) 0%, var(--noir) 100%)',
        textAlign: 'center',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container">
          <div className="animate-fade-in">
             <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(201,169,110,0.05)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                <Scissors size={28} color="var(--gold)" />
             </div>
             <p style={{ color: 'var(--gold)', letterSpacing: '0.4em', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 600 }}>Exclusive Service</p>
             <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 500, color: 'var(--cream)', marginBottom: '1rem' }}>Bespoke <span style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Order</span></h1>
             <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.8 }}>Collaborate with our designers to create something uniquely yours. From custom sizing to exclusive fabric choices, we bring your vision to life.</p>
          </div>
        </div>
      </section>

      <div className="container" style={{ marginTop: '-3rem', position: 'relative', zIndex: 5 }}>
        <div className="grid-2" style={{ gap: '3rem', alignItems: 'start' }}>
          
          {/* Submission Form */}
          <div className="glass animate-slide-up" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <Crown size={24} color="var(--gold)" /> Design Inquiry
            </h2>
            
            {error && (
              <div className="animate-fade-in" style={{ padding: '1rem', background: 'rgba(231,76,90,0.1)', border: '1px solid rgba(231,76,90,0.2)', borderRadius: 'var(--radius-md)', color: '#e74c5a', display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                <AlertCircle size={20} /> <span style={{ fontSize: '0.9rem' }}>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="animate-fade-in" style={{ padding: '1.25rem', background: 'rgba(78,203,141,0.1)', border: '1px solid rgba(78,203,141,0.2)', borderRadius: 'var(--radius-md)', color: '#4ecb8d', display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                <CheckCircle2 size={22} /> <span style={{ fontSize: '0.95rem' }}>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>Your Vision & Requirements *</label>
                <textarea 
                  className="luxury-input" 
                  rows="6" 
                  placeholder="Describe your design in detail. Include color preferences, fabric type, and any specific measurements or style inspirations."
                  value={customForm.requirements}
                  onChange={e => setCustomForm(p => ({...p, requirements: e.target.value}))}
                  required
                  style={{ minHeight: '150px' }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>Target Price Range (₹) *</label>
                <input 
                  className="luxury-input" 
                  placeholder="e.g. ₹15,000 - ₹25,000"
                  value={customForm.priceRange}
                  onChange={e => setCustomForm(p => ({...p, priceRange: e.target.value}))}
                  required
                />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Helping us understand your budget allows for better design recommendations.</p>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>Upload Reference Design (Optional)</label>
                <div style={{ position: 'relative', overflow: 'hidden', height: '140px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--noir-surface)', cursor: 'pointer', transition: 'all 0.3s' }}
                     onMouseOver={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                     onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <input type="file" accept="image/*" onChange={handleImageSelect} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  {customPreview ? (
                     <img src={customPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                     <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                        <UploadCloud size={32} style={{ marginBottom: '0.75rem' }} />
                        <span style={{ fontSize: '0.85rem' }}>Drag or click to upload Reference Image</span>
                     </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, display: 'block', marginBottom: '1rem' }}>Preferred Payment Method</label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {[
                    { value: 'card', label: 'Credit Card', icon: <CreditCard size={18} /> },
                    { value: 'upi', label: 'UPI / Wallet', icon: <Wallet size={18} /> },
                    { value: 'cod', label: 'Cash on Delivery', icon: <Truck size={18} /> }
                  ].map(pm => (
                    <button key={pm.value} type="button" onClick={() => setCustomForm(p => ({ ...p, paymentMethod: pm.value }))}
                      style={{
                        flex: 1, minWidth: '140px', padding: '1rem', borderRadius: 'var(--radius-md)',
                        border: customForm.paymentMethod === pm.value ? '1px solid var(--gold)' : '1px solid var(--border)',
                        background: customForm.paymentMethod === pm.value ? 'rgba(201,169,110,0.08)' : 'var(--noir-surface)',
                        color: customForm.paymentMethod === pm.value ? 'var(--gold)' : 'var(--text-muted)',
                        cursor: 'pointer', transition: 'all 0.3s', fontSize: '0.85rem', fontWeight: 500,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                      }}
                    >
                      {pm.icon} {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '1.2rem', fontSize: '0.9rem', letterSpacing: '0.1em', fontWeight: 600 }}>
                {isSubmitting ? <><Loader2 size={18} className="spin" /> Sending Inquiry...</> : 'Send Request to Design Team'}
              </button>
            </form>
          </div>

          {/* Inquiry Status History */}
          <div className="animate-slide-up animate-delay-200">
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <Package size={22} color="var(--gold)" />
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--cream)' }}>Active <span style={{ color: 'var(--gold)' }}>Requests</span></h2>
             </div>

             {isLoadingHistory ? (
                <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                   <Loader2 size={32} className="spin" style={{ margin: '0 auto' }} />
                   <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>Gathering your bespoke history...</p>
                </div>
             ) : customOrders.length === 0 ? (
                <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
                   <Package size={48} style={{ opacity: 0.1, margin: '0 auto 1.5rem' }} />
                   <h3 style={{ color: 'var(--cream)', marginBottom: '0.5rem' }}>No Requests Yet</h3>
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Your custom design journey begins with a single inquiry. Submit the form to start.</p>
                </div>
             ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                   {customOrders.map((order, i) => (
                      <div key={order._id} className="glass animate-fade-in" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'grid', gridTemplateColumns: 'min-content 1fr', gap: '1.5rem', animationDelay: `${i * 100}ms` }}>
                         {order.referenceImageId ? (
                            <div style={{ width: '80px', height: '100px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                               <img src={`${API_URL}/api/media/image/${order.referenceImageId._id}`} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                         ) : (
                            <div style={{ width: '80px', height: '100px', borderRadius: 'var(--radius-md)', background: 'var(--noir-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               <Package size={24} color="var(--text-dim)" />
                            </div>
                         )}
                         <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                               <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.2em' }}>REQ-{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                               <span style={{ 
                                  fontSize: '0.65rem', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                                  background: order.status === 'Accepted' ? 'rgba(78,203,141,0.1)' : order.status === 'Rejected' ? 'rgba(231,76,90,0.1)' : 'rgba(201,169,110,0.1)',
                                  color: order.status === 'Accepted' ? '#4ecb8d' : order.status === 'Rejected' ? '#e74c5a' : 'var(--gold)',
                                  border: `1px solid ${order.status === 'Accepted' ? 'rgba(78,203,141,0.2)' : order.status === 'Rejected' ? 'rgba(231,76,90,0.2)' : 'rgba(201,169,110,0.2)'}`
                               }}>
                                  {order.status}
                               </span>
                            </div>
                            <p style={{ color: 'var(--cream)', fontSize: '0.95rem', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                               {order.requirements}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                               <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.85rem' }}>Est: {order.priceRange}</span>
                               <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            {order.adminNotes && (
                               <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--gold)' }}>
                                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Designer Feedback</p>
                                  <p style={{ fontSize: '0.85rem', color: 'var(--cream-muted)', lineHeight: 1.5 }}>{order.adminNotes}</p>
                               </div>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: rotate 1.5s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default Bespoke;
