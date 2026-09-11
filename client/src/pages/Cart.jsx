import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await API.get('/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const res = await API.put(
        '/cart/update',
        { productId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemove = async (productId) => {
    try {
      const res = await API.delete(`/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
        <h2>Loading your cart...</h2>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="app-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Shopping Cart ({items.length})
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Review your selected products before completing your order.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/products" className="btn-secondary">
            Continue Shopping
          </Link>
          <Link to="/wishlist" className="btn-danger-subtle" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>❤️</span> Wishlist
          </Link>
        </div>
      </div>

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

      {items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛒</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Your cart is empty</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Looks like you haven't added anything yet.
          </p>
          <Link to="/products" className="btn-primary">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="cart-layout-grid">
          {/* Cart Item List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item) => (
              <div
                key={item._id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  padding: '1.2rem',
                }}
              >
                {/* Product Image */}
                <div
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.product?.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No img</span>
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: '700',
                      color: 'var(--text-main)',
                      marginBottom: '0.25rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.product?.name}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Rs. {item.product?.price} each
                  </p>
                </div>

                {/* Stepper Controls */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: 'var(--bg-page)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.2rem',
                  }}
                >
                  <button
                    onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                    style={{
                      width: '28px',
                      height: '28px',
                      border: 'none',
                      background: '#fff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-main)',
                    }}
                  >
                    −
                  </button>
                  <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: '700', fontSize: '0.95rem' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                    style={{
                      width: '28px',
                      height: '28px',
                      border: 'none',
                      background: '#fff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-main)',
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div style={{ minWidth: '95px', textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    Rs. {item.product?.price * item.quantity}
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.product._id)}
                  className="btn-danger-subtle"
                  title="Remove item"
                  style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              position: 'sticky',
              top: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>Order Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Rs. {calculateTotal()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Shipping</span>
                <span style={{ fontWeight: '600', color: '#16a34a' }}>Free</span>
              </div>
              <div
                style={{
                  height: '1px',
                  background: 'var(--border-subtle)',
                  margin: '0.5rem 0',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>Rs. {calculateTotal()}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
            >
              Proceed to Checkout →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;