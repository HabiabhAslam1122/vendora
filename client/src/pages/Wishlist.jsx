import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const token = localStorage.getItem('token');

  const fetchWishlist = async () => {
    if (!token) {
      setError('Please log in to view your wishlist');
      setLoading(false);
      return;
    }

    try {
      const res = await API.get('/wishlist', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const showNotification = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleRemove = async (productId) => {
    setProcessingId(productId);
    try {
      const res = await API.delete(`/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(res.data);
      showNotification('Removed from wishlist');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to remove product');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddToCart = async (product) => {
    setProcessingId(product._id);
    try {
      await API.post(
        '/cart',
        { productId: product._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const wishRes = await API.delete(`/wishlist/${product._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(wishRes.data);

      showNotification(`Moved "${product.name}" to cart! 🛒`);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to move to cart');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
        <h2>Loading saved items...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2 style={{ color: 'var(--accent)', marginBottom: '1.5rem' }}>{error}</h2>
        <Link to="/login" className="btn-primary">
          Log In
        </Link>
      </div>
    );
  }

  const rawProducts = wishlist?.products || [];
  const products = Array.isArray(rawProducts) ? rawProducts.filter((p) => p && typeof p === 'object') : [];

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)', fontWeight: '700', fontSize: '0.85rem' }}>
            <span>❤️ SAVED FOR LATER</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)', marginTop: '0.2rem' }}>
            My Wishlist ({products.length})
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Favorite finds curated across the marketplace.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/products" className="btn-primary">
            Marketplace
          </Link>
          <Link to="/cart" className="btn-secondary">
            🛒 Cart
          </Link>
          <Link to="/" className="btn-secondary">
            Home
          </Link>
        </div>
      </div>

      {/* Empty State */}
      {products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤍</div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            Your wishlist is empty
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Tap the heart on any product in the store to save it here for later.
          </p>
          <Link to="/products" className="btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
            Explore Collection
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {products.map((product) => (
            <div
              key={product._id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: 0,
                transition: 'var(--transition)',
              }}
            >
              {/* Image Box */}
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '1 / 0.85',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No preview</span>
                )}

                {/* Remove Icon */}
                <button
                  type="button"
                  onClick={() => handleRemove(product._id)}
                  disabled={processingId === product._id}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-md)',
                    fontSize: '0.9rem',
                    color: 'var(--accent)',
                  }}
                  title="Remove from wishlist"
                >
                  ✕
                </button>
              </div>

              {/* Product Info */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {product.category || 'General'}
                </span>

                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: '700',
                    color: 'var(--text-main)',
                    margin: '0.25rem 0 0.5rem 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {product.name}
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    Rs. {product.price}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={processingId === product._id}
                    className="btn-primary"
                    style={{ padding: '0.55rem 0.5rem', fontSize: '0.85rem' }}
                  >
                    Move to Cart 🛒
                  </button>
                  <Link
                    to={`/products/${product._id}`}
                    className="btn-secondary"
                    style={{ padding: '0.55rem 0.5rem', fontSize: '0.85rem', textAlign: 'center' }}
                  >
                    Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
