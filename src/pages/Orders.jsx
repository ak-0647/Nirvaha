import React, { useState, useEffect } from 'react';
import { Package, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAllOrders = async () => {
    try {
      const token = localStorage.getItem('nirvaha_token');
      if (!token) throw new Error('Authentication required. Please sign in.');
      
      const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`;
      
      // Fetch both standard and bespoke orders
      const [resStd, resCust] = await Promise.all([
        fetch(`${API_BASE}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/custom/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (!resStd.ok) {
        const d = await resStd.json();
        throw new Error(d.message || 'Failed to fetch standard orders');
      }
      if (!resCust.ok) {
        const d = await resCust.json();
        throw new Error(d.message || 'Failed to fetch bespoke inquiries');
      }
      
      const stdData = await resStd.json();
      const custData = await resCust.json();
      
      // Standardize custom data for the list if needed, or just merge
      // Sort merged by createdAt descending
      const merged = [...stdData, ...custData].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setOrders(merged);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  return (
    <div style={{ minHeight: '80vh', padding: '4rem 2rem' }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '3rem' }}>
          <Link to="/account" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', marginBottom: '1.5rem', transition: 'color 0.3s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--gold)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-dim)'}>
            <ArrowLeft size={16} /> Back to Profile
          </Link>
          
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 500, color: 'var(--cream)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Package size={32} color="var(--gold)" />
            Order History
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Track, manage and view your recent purchases & bespoke inquiries.</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '2rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(231,76,90,0.1)', color: '#e74c5a', border: '1px solid rgba(231,76,90,0.2)' }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: 'var(--gold)' }}>
            <Loader2 size={40} className="spin" style={{ marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading History...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
            <Package size={48} color="var(--text-dim)" strokeWidth={1} style={{ margin: '0 auto 1.5rem' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--cream)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>No History Yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>When you place an order or inquiry, it will appear here.</p>
            <Link to="/collections" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
              Explore Collections
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map(order => {
              const isBespoke = !!(order.bespokeId || order.requirements);
              const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
              const displayId = order.orderId || order.bespokeId || `REQ-${order._id.substring(order._id.length-6).toUpperCase()}`;

              return (
                <div key={order._id} className="glass order-card animate-fade-in" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', borderTop: `3px solid ${order.statusColor || 'var(--gold)'}` }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--cream)', fontFamily: 'monospace' }}>{displayId}</span>
                        {isBespoke && <span style={{ background: 'rgba(201,169,110,0.1)', color: 'var(--gold)', fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, letterSpacing: '0.05em' }}>BESPOKE</span>}
                      </div>
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                        {isBespoke ? 'Inquiry made' : 'Placed'} on {orderDate}
                      </div>
                    </div>
                    <span style={{ 
                      padding: '0.4rem 1rem', 
                      borderRadius: 'var(--radius-full)', 
                      fontSize: '0.75rem', 
                      fontWeight: 600, 
                      textTransform: 'uppercase', 
                      background: `${order.statusColor || 'var(--gold)'}15`, 
                      color: order.statusColor || 'var(--gold)', 
                      border: `1px solid ${order.statusColor || 'var(--gold)'}30`, 
                      letterSpacing: '0.05em' 
                    }}>
                      {order.status}
                    </span>
                  </div>
                  
                  {isBespoke ? (
                    /* Render Bespoke Details */
                    <div className="flex gap-6 items-start" style={{ padding: '1rem 0' }}>
                      {order.referenceImageId ? (
                        <div style={{ width: '90px', height: '120px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-subtle)' }}>
                           <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/media/image/${order.referenceImageId._id}`} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div style={{ width: '90px', height: '120px', borderRadius: 'var(--radius-sm)', background: 'var(--noir-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           <Package size={24} color="var(--text-dim)" />
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: 'var(--cream)', fontSize: '1.05rem', fontWeight: 500, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Design Requirements</h4>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>{order.requirements}</p>
                        <div className="flex gap-6" style={{ flexWrap: 'wrap' }}>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Price Range</span>
                            <span style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '0.9rem' }}>{order.priceRange}</span>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Payment Method</span>
                            <span style={{ color: 'var(--cream-muted)', fontWeight: 500, fontSize: '0.9rem', textTransform: 'uppercase' }}>{order.paymentMethod || 'Credit Card'}</span>
                          </div>
                        </div>
                        {order.adminNotes && (
                           <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--gold)' }}>
                              <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Designer Feedback</p>
                              <p style={{ fontSize: '0.85rem', color: 'var(--cream-muted)', lineHeight: 1.5 }}>{order.adminNotes}</p>
                           </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Render Standard Items */
                    <>
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-4" style={{ padding: '1rem 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                          <div style={{ width: '70px', height: '90px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-subtle)' }}>
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ color: 'var(--cream)', fontSize: '1.05rem', fontWeight: 500, fontFamily: 'var(--font-display)', marginBottom: '0.2rem' }}>{item.name}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Size: {item.size}</p>
                          </div>
                          <div style={{ fontWeight: 600, color: 'var(--cream)', fontSize: '1.1rem' }}>
                            {item.price}
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex justify-between items-center" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)', flexWrap: 'wrap', gap: '1rem' }}>
                        <div className="flex items-center gap-2">
                           <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em' }}>Total Amount</span>
                           <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>via {order.paymentMethod?.toUpperCase() || 'CARD'}</span>
                        </div>
                        <span style={{ color: 'var(--gold)', fontSize: '1.5rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{order.total}</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
