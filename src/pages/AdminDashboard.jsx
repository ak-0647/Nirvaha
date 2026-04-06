import React, { useState, useEffect } from 'react';
import { Package, Users, Activity, Crown, Search, Loader2, LayoutDashboard, ImagePlus, MoreVertical, CheckCircle2, XCircle, Trash2, Edit3, Plus, X, Upload, ShoppingBag, AlertTriangle, Scissors } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, totalProducts: 0, siteHealth: 'Optimal' });
  const [userList, setUserList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [customOrderList, setCustomOrderList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Product Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', category: 'Cotton', price: '', collection: ''
  });
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Custom Order Modal State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [selectedCustomOrder, setSelectedCustomOrder] = useState(null);
  const [customStatusUpdate, setCustomStatusUpdate] = useState('');
  const [customNotesUpdate, setCustomNotesUpdate] = useState('');

  // Delete Confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: '', id: '', name: '' });

  const getFetchOptions = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('nirvaha_token')}` }
  });

  // Show temporary success messages
  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // ═══ DATA FETCHING ═══
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, usersRes, ordersRes, productsRes, customRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/stats`, getFetchOptions()),
        fetch(`${API_BASE}/api/admin/users`, getFetchOptions()),
        fetch(`${API_BASE}/api/admin/orders`, getFetchOptions()),
        fetch(`${API_BASE}/api/admin/products`, getFetchOptions()),
        fetch(`${API_BASE}/api/admin/custom-orders`, getFetchOptions()),
      ]);

      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      setStats(await statsRes.json());
      if (usersRes.ok) setUserList(await usersRes.json());
      if (ordersRes.ok) setOrderList(await ordersRes.json());
      if (productsRes.ok) setProductList(await productsRes.json());
      if (customRes.ok) setCustomOrderList(await customRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ═══ PRODUCT CRUD ═══
  const resetProductForm = () => {
    setProductForm({ name: '', category: 'Cotton', price: '', originalPrice: '', description: '', sizes: ['S', 'M', 'L'], badge: '', collection: '', rating: '4.5' });
    setProductImage(null);
    setImagePreview(null);
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      description: product.description || '',
      sizes: product.sizes || ['S', 'M', 'L'],
      badge: product.badge || '',
      collection: product.collection || '',
      rating: String(product.rating || 4.5)
    });
    setImagePreview(product.imageId ? `${API_BASE}/api/media/image/${product.imageId}` : null);
    setProductImage(null);
    setShowProductForm(true);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleSize = (size) => {
    setProductForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('category', productForm.category);
      formData.append('price', productForm.price);
      if (productForm.originalPrice) formData.append('originalPrice', productForm.originalPrice);
      formData.append('description', productForm.description);
      formData.append('sizes', JSON.stringify(productForm.sizes));
      formData.append('badge', productForm.badge);
      formData.append('collection', productForm.collection);
      formData.append('rating', productForm.rating);
      if (productImage) formData.append('image', productImage);

      const url = editingProduct
        ? `${API_BASE}/api/admin/products/${editingProduct._id}`
        : `${API_BASE}/api/admin/products`;

      const res = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('nirvaha_token')}` },
        body: formData
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save product');
      }

      flash(editingProduct ? 'Product updated successfully! ✨' : 'Product created successfully! 🎉');
      resetProductForm();
      fetchDashboardData();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // ═══ DELETE HANDLERS ═══
  const confirmDelete = (type, id, name) => {
    setDeleteConfirm({ show: true, type, id, name });
  };

  const executeDelete = async () => {
    const { type, id } = deleteConfirm;
    try {
      const endpoint = type === 'product' ? `/api/admin/products/${id}`
        : type === 'user' ? `/api/admin/users/${id}` : '';
      
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('nirvaha_token')}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      flash(`${type === 'product' ? 'Product' : 'User'} deleted successfully! 🗑️`);
      setDeleteConfirm({ show: false, type: '', id: '', name: '' });
      fetchDashboardData();
    } catch (err) {
      setError(err.message);
      setDeleteConfirm({ show: false, type: '', id: '', name: '' });
    }
  };

  // ═══ ORDER STATUS UPDATE ═══
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('nirvaha_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update order');
      
      const updated = await res.json();
      setOrderList(prev => prev.map(o => o._id === orderId ? updated : o));
      flash(`Order status updated to "${newStatus}" — notification sent! 📧`);
    } catch (err) {
      setError(err.message);
    }
  };

  // ═══ FILTERS ═══
  const filteredUsers = userList.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orderList.filter(o =>
    o.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.user?.firstName + ' ' + o.user?.lastName).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = productList.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomOrders = customOrderList.filter(o =>
    o._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.user?.firstName + ' ' + o.user?.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.requirements?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ═══ CUSTOM ORDER STATUS UPDATE ═══
  const updateCustomOrderStatus = async (orderId, newStatus, adminNotes = '') => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/custom-orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('nirvaha_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, adminNotes })
      });

      if (!res.ok) throw new Error('Failed to update custom order');
      
      const { order: updated } = await res.json();
      setCustomOrderList(prev => prev.map(o => o._id === orderId ? updated : o));
      flash(`Custom Request updated to "${newStatus}" — notification sent! 📧`);
      setShowCustomModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // ═══ LOADING STATE ═══
  if (isLoading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(201,169,110,0.2)', animation: 'goldPulse 2s infinite' }}></div>
          <Loader2 size={48} className="spin" style={{ marginBottom: '1rem', animation: 'spin 1.5s linear infinite' }} />
        </div>
        <h3 className="animate-fade-in" style={{ fontFamily: 'var(--font-display)', color: 'var(--cream)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '1rem' }}>Authenticating Admin Clearance</h3>
      </div>
    );
  }

  const statusColorMap = {
    'Accepted': '#8eb69b',
    'Processing': 'var(--gold)',
    'In Transit': '#60a5fa',
    'Delivered': '#4ecb8d',
    'Cancelled': '#e74c5a'
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap', background: 'var(--noir)', overflow: 'hidden' }}>

      {/* ═══ DELETE CONFIRMATION MODAL ═══ */}
      {deleteConfirm.show && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setDeleteConfirm({ show: false, type: '', id: '', name: '' })}>
          <div className="glass animate-fade-scale" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', maxWidth: '420px', width: '90%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(231,76,90,0.1)', border: '2px solid rgba(231,76,90,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <AlertTriangle size={28} color="var(--danger)" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--cream)' }}>Confirm Deletion</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              Are you sure you want to delete <strong style={{ color: 'var(--danger)' }}>{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm({ show: false, type: '', id: '', name: '' })}>Cancel</button>
              <button className="btn" style={{ background: 'var(--danger)', color: '#fff' }} onClick={executeDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PRODUCT FORM MODAL ═══ */}
      {showProductForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 998, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', overflowY: 'auto', padding: '2rem 0' }} onClick={resetProductForm}>
          <div className="glass animate-fade-scale" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', margin: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--cream)' }}>
                {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
              </h3>
              <button onClick={resetProductForm} style={{ color: 'var(--text-dim)', transition: 'color 0.3s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--danger)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-dim)'}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={submitProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Image Upload */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Product Image {!editingProduct && '*'}</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {imagePreview && (
                    <div style={{ width: '80px', height: '100px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <label style={{ flex: 1, padding: '1.5rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.3s', background: 'var(--noir-surface)' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <Upload size={24} color="var(--text-dim)" style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{productImage ? productImage.name : 'Click to upload image'}</p>
                    <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Product Name *</label>
                <input className="luxury-input" required placeholder="e.g. Blush Cotton A-Line Kurti" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} />
              </div>

              {/* Category & Collection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Category *</label>
                  <select className="luxury-input" value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="Cotton">Cotton</option>
                    <option value="Rayon">Rayon</option>
                    <option value="Chikankari">Chikankari</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Collection Name</label>
                  <input className="luxury-input" placeholder="e.g. Cotton Collection" value={productForm.collection} onChange={e => setProductForm(p => ({ ...p, collection: e.target.value }))} />
                </div>
              </div>

              {/* Price */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Price (₹) *</label>
                <input className="luxury-input" type="number" required placeholder="1299" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} />
              </div>

              {/* Sizes */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Available Sizes</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <button key={size} type="button" onClick={() => toggleSize(size)} style={{
                      padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: 600,
                      border: productForm.sizes.includes(size) ? '1px solid var(--gold)' : '1px solid var(--border)',
                      background: productForm.sizes.includes(size) ? 'rgba(201,169,110,0.15)' : 'transparent',
                      color: productForm.sizes.includes(size) ? 'var(--gold)' : 'var(--text-dim)',
                      cursor: 'pointer', transition: 'all 0.3s'
                    }}>{size}</button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Description</label>
                <textarea className="luxury-input" rows={3} placeholder="Product description..." value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>

              {/* Submit */}
              <button type="submit" className="btn btn-primary" disabled={formLoading} style={{ padding: '1rem', marginTop: '0.5rem' }}>
                {formLoading ? <><Loader2 size={16} className="spin" /> Saving...</> : editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══ CUSTOM ORDER MANAGEMENT MODAL ═══ */}
      {showCustomModal && selectedCustomOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 998, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setShowCustomModal(false)}>
          <div className="glass animate-fade-scale" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', maxWidth: '500px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--cream)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Scissors size={20} color="var(--gold)" /> Manage Bespoke Request
              </h3>
              <button onClick={() => setShowCustomModal(false)} style={{ color: 'var(--text-dim)' }}><X size={24} /></button>
            </div>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Customer Info</p>
              <p style={{ color: 'var(--cream)', fontWeight: 600 }}>{selectedCustomOrder.user?.firstName} {selectedCustomOrder.user?.lastName}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{selectedCustomOrder.user?.email}</p>
              <p style={{ color: 'var(--gold)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{selectedCustomOrder.user?.phone || 'No phone provided'}</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Update Status</label>
              <select 
                className="luxury-input" 
                value={customStatusUpdate} 
                onChange={e => setCustomStatusUpdate(e.target.value)}
                style={{ color: 'var(--gold)' }}
              >
                <option value="Pending Assessment">Pending Assessment</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="In Production">In Production</option>
                <option value="Shipped">Shipped</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Designer Feedback (adminNotes)</label>
              <textarea 
                className="luxury-input" 
                rows={4} 
                placeholder="e.g. Price quote: ₹18,500. Can complete by next Friday." 
                value={customNotesUpdate}
                onChange={e => setCustomNotesUpdate(e.target.value)}
                style={{ resize: 'none' }}
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>User will receive this via email and see it on their dashboard.</p>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem' }}
              onClick={() => updateCustomOrderStatus(selectedCustomOrder._id, customStatusUpdate, customNotesUpdate)}
            >
              Update Request & Notify User
            </button>
          </div>
        </div>
      )}

      {/* ═══ SIDEBAR ═══ */}
      <aside className="glass" style={{ width: '280px', minHeight: 'calc(100vh - 80px)', borderRight: '1px solid var(--border)', borderTop: 'none', borderBottom: 'none', borderLeft: 'none', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', position: 'sticky', top: '80px', zIndex: 10 }}>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }} className="animate-slide-left">
          <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(201,169,110,0.1), rgba(201,169,110,0.02))', border: '1px solid var(--border)', marginBottom: '1rem', boxShadow: 'var(--shadow-gold)' }}>
            <Crown size={36} color="var(--gold)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--cream)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Command Center</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ecb8d', boxShadow: '0 0 10px #4ecb8d', animation: 'pulse 2s infinite' }}></div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Secure Connection</span>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
            { id: 'collection', label: 'Collection', icon: <ImagePlus size={18} /> },
            { id: 'users', label: 'Users Grid', icon: <Users size={18} /> },
            { id: 'orders', label: 'Global Orders', icon: <Package size={18} /> },
            { id: 'custom', label: 'Bespoke Requests', icon: <Scissors size={18} /> }
          ].map((item, index) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSearchQuery(''); }}
              className={`animate-slide-left animate-delay-${(index + 1) * 100}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', width: '100%', borderRadius: 'var(--radius-lg)', cursor: 'pointer', transition: 'all 0.4s var(--ease-luxury)', outline: 'none', border: 'none',
                background: activeTab === item.id ? 'linear-gradient(90deg, rgba(201,169,110,0.15), transparent)' : 'transparent',
                color: activeTab === item.id ? 'var(--gold)' : 'var(--text-dim)',
                borderLeft: activeTab === item.id ? '3px solid var(--gold)' : '3px solid transparent',
                fontWeight: activeTab === item.id ? 600 : 500,
                letterSpacing: '0.05em'
              }}
            >
              <div style={{ color: activeTab === item.id ? 'var(--gold)' : 'var(--text-dim)' }}>{item.icon}</div>
              <span style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', textAlign: 'center' }} className="animate-fade-in animate-delay-500">
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Logged in as</p>
          <p style={{ color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 600, wordBreak: 'break-all' }}>{user?.email}</p>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main style={{ flex: 1, padding: '3rem', maxWidth: 'calc(100% - 280px)', minWidth: '320px' }}>

        {/* Header Actions / Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }} className="animate-fade-in">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--cream)', fontWeight: 500 }}>
              {activeTab === 'overview' && 'System Overview'}
              {activeTab === 'collection' && 'Collection Manager'}
              {activeTab === 'users' && 'Enrolled Users'}
              {activeTab === 'orders' && 'Global Operations'}
              {activeTab === 'custom' && 'Bespoke Requests'}
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', letterSpacing: '0.05em' }}>
              Real-time monitoring and administrative tools.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {activeTab === 'collection' && (
              <button className="btn btn-primary animate-fade-in" style={{ padding: '0.7rem 1.5rem', fontSize: '0.8rem' }} onClick={() => { resetProductForm(); setShowProductForm(true); }}>
                <Plus size={16} /> Add Product
              </button>
            )}
            {(activeTab !== 'overview') && (
              <div style={{ position: 'relative', width: '280px' }} className="animate-fade-in animate-delay-200">
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="luxury-input"
                  style={{ paddingLeft: '3rem', background: 'var(--noir-card)', borderRadius: 'var(--radius-full)' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="glass animate-fade-in" style={{ padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--success)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle2 color="var(--success)" />
            <span style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{successMsg}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="glass animate-fade-in" style={{ padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--danger)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <XCircle color="var(--danger)" />
            <span style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{error}</span>
            <button onClick={() => setError('')} style={{ marginLeft: 'auto', color: 'var(--text-dim)' }}><X size={16} /></button>
          </div>
        )}

        {/* ═══ GRID STYLES ═══ */}
        <style dangerouslySetInnerHTML={{__html: `
          .luxury-grid-row {
            display: grid;
            align-items: center;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-md);
            margin-bottom: 0.8rem;
            padding: 1rem 1.5rem;
            transition: all 0.4s var(--ease-luxury);
            position: relative;
            overflow: hidden;
          }
          .luxury-grid-row::before {
            content: ''; position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: var(--gold);
            transform: scaleY(0); transition: transform 0.4s var(--ease-luxury); transform-origin: center;
          }
          .luxury-grid-row:hover {
            background: rgba(255, 255, 255, 0.04);
            transform: scale(1.01) translateX(4px);
            border-color: rgba(201, 169, 110, 0.3);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }
          .luxury-grid-row:hover::before {
            transform: scaleY(1);
          }
          .status-badge {
            padding: 0.4rem 1rem;
            border-radius: var(--radius-full);
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
          }
          .admin-status-select {
            padding: 0.4rem 0.8rem;
            border-radius: var(--radius-md);
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            cursor: pointer;
            border: 1px solid var(--border);
            background: var(--noir-surface);
            color: var(--text-main);
            transition: all 0.3s;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%238a8478' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.5rem center;
            padding-right: 2rem;
          }
          .admin-status-select:hover, .admin-status-select:focus {
            border-color: var(--gold);
          }
          .admin-status-select option {
            background: var(--noir-surface);
            color: var(--text-main);
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.1); }
          }
        `}} />

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {[
              { label: 'Total Enrolled Users', value: stats.totalUsers, icon: <Users size={32} />, color: '#4ecb8d', delay: 100 },
              { label: 'Total Orders', value: stats.totalOrders, icon: <Package size={32} />, color: 'var(--gold)', delay: 200 },
              { label: 'Collection Products', value: stats.totalProducts, icon: <ShoppingBag size={32} />, color: '#a78bfa', delay: 300 },
              { label: 'System Status', value: stats.siteHealth, icon: <Activity size={32} />, color: '#60a5fa', delay: 400 }
            ].map((stat, i) => (
              <div key={i} className={`glass animate-fade-scale animate-delay-${stat.delay}`} style={{
                padding: '2.5rem', borderRadius: 'var(--radius-xl)',
                position: 'relative', overflow: 'hidden', cursor: 'default',
                transition: 'all 0.5s var(--ease-luxury)'
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = `0 15px 40px ${typeof stat.color === 'string' && stat.color.startsWith('#') ? stat.color + '15' : 'rgba(201,169,110,0.1)'}`; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}>
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '150px', height: '150px', background: `radial-gradient(circle, ${typeof stat.color === 'string' && stat.color.startsWith('#') ? stat.color + '20' : 'rgba(201,169,110,0.12)'} 0%, transparent 70%)`, filter: 'blur(30px)', zIndex: 0 }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <div style={{ background: `linear-gradient(135deg, ${typeof stat.color === 'string' && stat.color.startsWith('#') ? stat.color + '20' : 'rgba(201,169,110,0.12)'}, ${typeof stat.color === 'string' && stat.color.startsWith('#') ? stat.color + '05' : 'rgba(201,169,110,0.03)'})`, padding: '1rem', borderRadius: '16px', border: `1px solid ${typeof stat.color === 'string' && stat.color.startsWith('#') ? stat.color + '30' : 'rgba(201,169,110,0.2)'}` }}>
                      {React.cloneElement(stat.icon, { color: stat.color, strokeWidth: 1.5 })}
                    </div>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '0.5rem' }}>{stat.label}</h4>
                    <div style={{ fontSize: '3.5rem', fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--cream)', lineHeight: 1 }}>
                      {i === 3 && stat.value === 'Optimal' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '2rem' }}>
                          <CheckCircle2 color={stat.color} />
                          <span style={{ color: stat.color }}>{stat.value}</span>
                        </div>
                      ) : stat.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ COLLECTION TAB ═══ */}
        {activeTab === 'collection' && (
          <div className="animate-fade-in">
            {filteredProducts.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                <ImagePlus size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>No products in collection yet.</p>
                <p style={{ fontSize: '0.85rem', marginBottom: '2rem' }}>Start adding products to your store.</p>
                <button className="btn btn-primary" onClick={() => { resetProductForm(); setShowProductForm(true); }}>
                  <Plus size={16} /> Add First Product
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredProducts.map((p, i) => (
                  <div key={p._id} className={`glass animate-fade-scale animate-delay-${Math.min(i * 100, 800)}`} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'all 0.4s var(--ease-luxury)' }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}>
                    {/* Product Image */}
                    <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={`${API_BASE}/api/media/image/${p.imageId}`}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      {p.badge && (
                        <span style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'var(--gold)', color: 'var(--noir)', padding: '0.2rem 0.6rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 'var(--radius-sm)' }}>{p.badge}</span>
                      )}
                      {!p.isActive && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inactive</span>
                        </div>
                      )}
                    </div>
                    {/* Product Info */}
                    <div style={{ padding: '1.25rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--gold)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{p.category}</div>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--cream)' }}>{p.name}</h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>{p.collection || `${p.category} Collection`}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--cream)' }}>₹{p.price?.toLocaleString('en-IN')}</span>
                          {p.originalPrice && <span style={{ textDecoration: 'line-through', color: 'var(--text-dim)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>₹{p.originalPrice?.toLocaleString('en-IN')}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => openEditProduct(p)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', cursor: 'pointer', transition: 'all 0.3s' }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.2)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.1)'; }}>
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => confirmDelete('product', p._id, p.name)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(231,76,90,0.1)', border: '1px solid rgba(231,76,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', cursor: 'pointer', transition: 'all 0.3s' }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(231,76,90,0.2)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(231,76,90,0.1)'; }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ USERS TAB ═══ */}
        {activeTab === 'users' && (
          <div className="animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 80px', padding: '0 1.5rem 1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
              <div>User Profile</div>
              <div>Contact</div>
              <div>Join Date</div>
              <div>Role</div>
              <div>Actions</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredUsers.map((u, i) => (
                <div key={u._id} className={`luxury-grid-row animate-fade-scale animate-delay-${Math.min(i * 100, 800)}`} style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 80px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--noir-elevated), var(--noir-card))', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                      {(u.firstName?.[0] || '') + (u.lastName?.[0] || '')}
                    </div>
                    <div>
                      <div style={{ color: 'var(--cream)', fontWeight: 600, fontSize: '0.95rem' }}>{u.firstName} {u.lastName}</div>
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.2rem' }}>ID: {u._id.substring(0, 8)}</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--cream-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{u.email}</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{u.phone || 'N/A'}</div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div>
                    <span className="status-badge" style={{
                      background: u.email === 'nirvahawaves@gmail.com' ? 'rgba(201,169,110,0.1)' : 'rgba(255,255,255,0.03)',
                      color: u.email === 'nirvahawaves@gmail.com' ? 'var(--gold)' : 'var(--text-dim)',
                      border: `1px solid ${u.email === 'nirvahawaves@gmail.com' ? 'rgba(201,169,110,0.3)' : 'var(--border-subtle)'}`
                    }}>
                      {u.email === 'nirvahawaves@gmail.com' ? (<><Crown size={12} color="var(--gold)" /> SUPER ADMIN</>) : (u.role || 'User')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    {u.email !== 'nirvahawaves@gmail.com' && (
                      <button onClick={() => confirmDelete('user', u._id, `${u.firstName} ${u.lastName}`)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(231,76,90,0.08)', border: '1px solid rgba(231,76,90,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', cursor: 'pointer', transition: 'all 0.3s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(231,76,90,0.2)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(231,76,90,0.08)'}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                  <Search size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
                  <p>No valid user records found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ ORDERS TAB ═══ */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr 1fr 50px', padding: '0 1.5rem 1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
              <div>Order Intel</div>
              <div>Customer</div>
              <div>Total</div>
              <div>Status</div>
              <div></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredOrders.map((o, i) => (
                <div key={o._id} className={`luxury-grid-row animate-fade-scale animate-delay-${Math.min(i * 100, 800)}`} style={{ gridTemplateColumns: '1.2fr 1fr 0.8fr 1fr 50px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={18} color="var(--text-muted)" />
                    </div>
                    <div>
                      <div style={{ color: 'var(--cream)', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{o.orderId || o._id.substring(0, 8).toUpperCase()}</div>
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                        {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--cream)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{o.user?.firstName} {o.user?.lastName}</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{o.user?.email}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--gold)', fontWeight: 600, fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                      {typeof o.total === 'number' ? `₹${o.total.toLocaleString('en-IN')}` : o.total || '₹0'}
                    </div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{o.items?.length || 0} items</div>
                  </div>
                  <div>
                    <select
                      className="admin-status-select"
                      value={o.status || 'Processing'}
                      onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                      style={{ color: statusColorMap[o.status] || 'var(--gold)', borderColor: statusColorMap[o.status] || 'var(--gold)' }}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Accepted">Accepted</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div></div>
                </div>
              ))}
              {filteredOrders.length === 0 && (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                  <Package size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
                  <p>No orders found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ CUSTOM ORDERS (BESPOKE REQUESTS) TAB ═══ */}
        {activeTab === 'custom' && (
          <div className="animate-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', padding: '0 1.5rem 1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
              <div>Customer details</div>
              <div>Requirements</div>
              <div>Price Range / Ref</div>
              <div>Status</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredCustomOrders.map((o, i) => {
                const cStatusColor = {
                  'Pending Assessment': 'var(--gold)',
                  'Accepted': '#4ecb8d',
                  'Rejected': '#e74c5a',
                  'In Production': 'var(--gold)',
                  'Shipped': '#60a5fa',
                  'Completed': '#4ecb8d',
                  'Cancelled': '#e74c5a'
                };
                return (
                <div key={o._id} className={`luxury-grid-row animate-fade-scale animate-delay-${Math.min(i * 100, 800)}`} style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr', alignItems: 'start' }}>
                  <div>
                    <div style={{ color: 'var(--cream)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{o.user?.firstName} {o.user?.lastName}</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{o.user?.email}</div>
                    <div style={{ color: 'var(--gold)', fontSize: '0.7rem', marginTop: '0.5rem', letterSpacing: '0.05em' }}>DATE: {new Date(o.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ paddingRight: '2rem' }}>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      {o.requirements}
                    </p>
                  </div>
                  <div>
                    <div style={{ color: 'var(--cream)', fontWeight: 600, fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                      {o.priceRange}
                    </div>
                    {o.referenceImageId ? (
                      <a href={`${API_BASE}/api/media/image/${o.referenceImageId._id}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', padding: '0.4rem 0.8rem', background: 'rgba(201,169,110,0.1)', color: 'var(--gold)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
                        View Image
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>No image</span>
                    )}
                  </div>
                  <div>
                    <button 
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      onClick={() => {
                        setSelectedCustomOrder(o);
                        setCustomStatusUpdate(o.status || 'Pending Assessment');
                        setCustomNotesUpdate(o.adminNotes || '');
                        setShowCustomModal(true);
                      }}
                    >
                      <Edit3 size={14} /> Manage
                    </button>
                  </div>
                </div>
              )})}
              {filteredCustomOrders.length === 0 && (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                  <Scissors size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
                  <p>No bespoke requests found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
