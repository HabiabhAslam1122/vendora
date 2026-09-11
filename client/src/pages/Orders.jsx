import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      processing: { bg: 'rgba(245, 158, 11, 0.12)', color: '#d97706', label: 'Processing ⚙️' },
      shipped: { bg: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', label: 'Shipped 🚚' },
      delivered: { bg: 'rgba(16, 185, 129, 0.12)', color: '#059669', label: 'Delivered 📦' },
      cancelled: { bg: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', label: 'Cancelled ❌' },
    };
    const s = styles[status] || styles.processing;
    return (
      <span
        style={{
          background: s.bg,
          color: s.color,
          fontSize: '0.78rem',
          fontWeight: '700',
          padding: '0.28rem 0.75rem',
          borderRadius: '999px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
        <h2>Loading your orders...</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem' }}>
            <span>📦 PURCHASE LOG</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)', marginTop: '0.2rem' }}>
            My Orders
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Review past purchases, delivery milestones, and order receipts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/products" className="btn-primary">
            Browse Marketplace
          </Link>
          <Link to="/cart" className="btn-secondary">
            🛒 Cart
          </Link>
          <Link to="/" className="btn-secondary">
            Home
          </Link>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '0.85rem 1.25rem',
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            borderRadius: 'var(--radius-sm)',
            fontWeight: '600',
            border: '1px solid rgba(244, 63, 94, 0.2)',
          }}
        >
          {error}
        </div>
      )}

      {/* Empty State */}
      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            No orders placed yet
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Looks like you haven't bought anything from the marketplace yet.
          </p>
          <Link to="/products" className="btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {orders.map((order) => (
            <div
              key={order._id}
              className="card"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              {/* Order Card Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    Order #{order._id.slice(-6).toUpperCase()}
                  </span>
                  {getStatusBadge(order.orderStatus)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Placed: {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <span
                    style={{
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      fontWeight: '700',
                      fontSize: '0.75rem',
                      background: order.paymentStatus === 'paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: order.paymentStatus === 'paid' ? '#059669' : '#dc2626',
                      textTransform: 'uppercase',
                    }}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-sm)', padding: '1.15rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                  Purchased Products
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.95rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Link
                          to={item.product ? `/products/${typeof item.product === 'object' ? item.product._id : item.product}` : '#'}
                          style={{ fontWeight: '700', color: 'var(--primary)', textDecoration: 'none' }}
                        >
                          {item.name}
                        </Link>
                        <span style={{ color: 'var(--text-muted)' }}>× {item.quantity}</span>
                      </div>
                      <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                        Rs. {item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Action Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  paddingTop: '0.25rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                    Total Amount Paid
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    Rs. {order.totalAmount}
                  </div>
                </div>

                <Link
                  to="/products"
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  Buy Again 🛍️
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
