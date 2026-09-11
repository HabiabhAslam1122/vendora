import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

function SellerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!token || !user || user.role !== 'seller') {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders/seller-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load merchant orders');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await API.put(
        `/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification(`Order status updated to ${newStatus.toUpperCase()}`);
      await fetchOrders();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getMyItems = (order) => {
    if (!order.items) return [];
    return order.items.filter((item) => {
      const sellerId = typeof item.seller === 'object' ? item.seller?._id : item.seller;
      return sellerId === user._id;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: 'rgba(16, 185, 129, 0.2)' };
      case 'shipped':
        return { bg: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', border: 'rgba(79, 70, 229, 0.2)' };
      case 'cancelled':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: 'rgba(239, 68, 68, 0.2)' };
      default:
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: 'rgba(245, 158, 11, 0.2)' };
    }
  };

  if (loading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
        <h2>Loading incoming merchant orders...</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Toast Alert */}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem' }}>
            <span>📦 VENDOR FULFILLMENT</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)', marginTop: '0.2rem' }}>
            Orders for Your Products
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Manage delivery milestones and track your catalog sales.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/seller/dashboard" className="btn-secondary">
            Dashboard
          </Link>
          <Link to="/products" className="btn-secondary">
            Marketplace
          </Link>
          <Link to="/" className="btn-secondary">
            Home
          </Link>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            No incoming orders yet
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            When customers purchase items from your catalog, their orders will appear here for fulfillment.
          </p>
          <Link to="/seller/dashboard" className="btn-primary">
            View My Listings
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => {
            const myItems = getMyItems(order);
            const myTotal = myItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const statusStyle = getStatusColor(order.orderStatus);

            return (
              <div
                key={order._id}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                {/* Top Meta Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                      Order #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.75rem' }}>
                      Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background: order.paymentStatus === 'paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: order.paymentStatus === 'paid' ? '#059669' : '#dc2626',
                        border: `1px solid ${order.paymentStatus === 'paid' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                      }}
                    >
                      {order.paymentStatus}
                    </span>

                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`,
                      }}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {myItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.65rem 0.85rem',
                        background: '#f8fafc',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                          {item.name}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                          × {item.quantity}
                        </span>
                      </div>
                      <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                        Rs. {item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom Row: Total & Status Selector */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                      Your Portion Total:{' '}
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)', marginLeft: '0.25rem' }}>
                      Rs. {myTotal}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                      Update Status:
                    </label>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={updatingId === order._id}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: '#ffffff',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        color: 'var(--text-main)',
                        cursor: updatingId === order._id ? 'not-allowed' : 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="processing">⚙️ Processing</option>
                      <option value="shipped">🚚 Shipped</option>
                      <option value="delivered">✅ Delivered</option>
                      <option value="cancelled">❌ Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SellerOrders;
