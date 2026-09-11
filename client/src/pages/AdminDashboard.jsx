import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const headers = { Authorization: `Bearer ${token}` };

  const loadAllData = async () => {
    if (!token || user?.role !== 'admin') {
      setError('Administrative clearance required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const [statsRes, usersRes, prodRes] = await Promise.all([
        API.get('/admin/stats', { headers }),
        API.get('/admin/users', { headers }),
        API.get('/admin/products', { headers }),
      ]);
      setStats(statsRes.data);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load administrative control center');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showNotification = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 3500);
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Permanently remove user "${name}"?`)) return;
    try {
      await API.delete(`/admin/users/${id}`, { headers });
      setUsers((prev) => prev.filter((u) => u._id !== id));
      showNotification(`User "${name}" removed.`);
      const updatedStats = await API.get('/admin/stats', { headers });
      setStats(updatedStats.data);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Permanently remove product "${name}"?`)) return;
    try {
      await API.delete(`/admin/products/${id}`, { headers });
      setProducts((prev) => prev.filter((p) => p._id !== id));
      showNotification(`Product "${name}" deleted.`);
      const updatedStats = await API.get('/admin/stats', { headers });
      setStats(updatedStats.data);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
        <h2>Loading Administrative Console...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/" className="btn-primary">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {actionMsg && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--primary)',
            color: '#fff',
            padding: '0.75rem 1.25rem',
            borderRadius: '999px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 9999,
            fontWeight: '700',
            fontSize: '0.9rem',
          }}
        >
          {actionMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem' }}>
            <span>⚡ PLATFORM OVERSIGHT</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)', marginTop: '0.2rem' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage platform metrics, monitor vendor activity, and oversee product listings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/products" className="btn-secondary">
            Marketplace
          </Link>
          <Link to="/" className="btn-secondary">
            Home
          </Link>
        </div>
      </div>

      {/* Navigation Pills */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('stats')}
          className={activeTab === 'stats' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.65rem 1.25rem' }}
        >
          Overview & Stats
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.65rem 1.25rem' }}
        >
          Manage Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.65rem 1.25rem' }}
        >
          Manage Products ({products.length})
        </button>
      </div>

      {/* Overview Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>
              Total Registered Users
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.5rem' }}>
              {stats.totalUsers ?? 0}
            </div>
          </div>
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>
              Catalog Products
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.5rem' }}>
              {stats.totalProducts ?? 0}
            </div>
          </div>
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>
              Orders Placed
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.5rem' }}>
              {stats.totalOrders ?? 0}
            </div>
          </div>
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>
              Gross Sales Volume
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#10b981', marginTop: '0.5rem' }}>
              Rs. {typeof stats.totalSales === 'number' ? stats.totalSales.toFixed(2) : (stats.totalSales ?? 0)}
            </div>
          </div>
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem' }}>User Name</th>
                <th style={{ padding: '0.85rem' }}>Email Address</th>
                <th style={{ padding: '0.85rem' }}>Account Role</th>
                <th style={{ padding: '0.85rem' }}>Shop Name</th>
                <th style={{ padding: '0.85rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem' }}>
                  <td style={{ padding: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>{u.name}</td>
                  <td style={{ padding: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '0.85rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background:
                          u.role === 'admin'
                            ? 'rgba(239, 68, 68, 0.1)'
                            : u.role === 'seller'
                            ? 'rgba(245, 158, 11, 0.1)'
                            : 'rgba(79, 70, 229, 0.1)',
                        color:
                          u.role === 'admin'
                            ? '#dc2626'
                            : u.role === 'seller'
                            ? '#d97706'
                            : 'var(--primary)',
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem', color: 'var(--text-muted)' }}>{u.shopName || '—'}</td>
                  <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#dc2626',
                          border: 'none',
                          padding: '0.4rem 0.8rem',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Products Management Tab */}
      {activeTab === 'products' && (
        <div className="card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem' }}>Preview</th>
                <th style={{ padding: '0.85rem' }}>Product Name</th>
                <th style={{ padding: '0.85rem' }}>Category</th>
                <th style={{ padding: '0.85rem' }}>Unit Price</th>
                <th style={{ padding: '0.85rem' }}>Merchant</th>
                <th style={{ padding: '0.85rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem' }}>
                  <td style={{ padding: '0.85rem' }}>
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    ) : (
                      <div style={{ width: '44px', height: '44px', background: '#f1f5f9', borderRadius: '8px' }} />
                    )}
                  </td>
                  <td style={{ padding: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>{p.name}</td>
                  <td style={{ padding: '0.85rem', color: 'var(--text-muted)' }}>{p.category}</td>
                  <td style={{ padding: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>Rs. {p.price}</td>
                  <td style={{ padding: '0.85rem', color: 'var(--text-muted)' }}>
                    {p.seller?.shopName || p.seller?.name || '—'}
                  </td>
                  <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteProduct(p._id, p.name)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#dc2626',
                        border: 'none',
                        padding: '0.4rem 0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
