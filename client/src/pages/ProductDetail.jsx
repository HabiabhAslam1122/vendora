import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [actionMsg, setActionMsg] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProductAndReviews();
    checkWishlist();
  }, [id]);

  const fetchProductAndReviews = async () => {
    try {
      setLoading(true);
      const [prodRes, revRes] = await Promise.all([
        API.get(`/products/${id}`),
        API.get(`/reviews/${id}`).catch(() => ({ data: [] })),
      ]);
      setProduct(prodRes.data);
      setReviews(revRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    if (!token) return;
    try {
      const res = await API.get('/wishlist', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ids = (res.data?.products || []).map((p) => (typeof p === 'object' && p ? p._id : p));
      setIsWishlisted(ids.includes(id));
    } catch (err) {
      console.error(err);
    }
  };

  const showNotification = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleAddToCart = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await API.post(
        '/cart',
        { productId: id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification(`Added ${quantity} item(s) to cart! 🛒`);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleToggleWishlist = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      if (isWishlisted) {
        await API.delete(`/wishlist/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsWishlisted(false);
        showNotification('Removed from Wishlist');
      } else {
        await API.post('/wishlist', { productId: id }, { headers: { Authorization: `Bearer ${token}` } });
        setIsWishlisted(true);
        showNotification('Added to Wishlist! ❤️');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    setReviewError('');
    try {
      await API.post(
        '/reviews',
        { productId: id, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment('');
      setRating(5);
      showNotification('Review submitted! ⭐');
      const res = await API.get(`/reviews/${id}`);
      setReviews(res.data || []);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to post review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
        <h2>Loading product details...</h2>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2>{error || 'Product not found'}</h2>
        <Link to="/products" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="app-container">
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link to="/products" style={{ color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          ← Back to Marketplace
        </Link>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/wishlist" className="btn-secondary">Wishlist ❤️</Link>
          <Link to="/cart" className="btn-secondary">Cart 🛒</Link>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          marginBottom: '4rem',
          alignItems: 'start',
        }}
      >
        <div
          className="card"
          style={{
            padding: 0,
            overflow: 'hidden',
            borderRadius: '24px',
            aspectRatio: '1 / 1',
            background: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No Image Provided</div>
          )}
        </div>

        <div>
          <span
            style={{
              background: 'rgba(79, 70, 229, 0.08)',
              color: 'var(--primary)',
              fontWeight: '700',
              fontSize: '0.8rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {product.category || 'General Store'}
          </span>

          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: 'var(--text-main)',
              margin: '0.75rem 0 0.5rem 0',
              lineHeight: 1.2,
            }}
          >
            {product.name}
          </h1>

          <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Merchant: <strong style={{ color: 'var(--text-main)' }}>{product.seller?.shopName || product.seller?.name || 'Verified Partner'}</strong>
          </div>

          <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '1.5rem' }}>
            Rs. {product.price}
          </div>

          <div
            style={{
              padding: '1.25rem',
              background: '#ffffff',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '2rem',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
            }}
          >
            {product.description}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: product.stock > 0 ? '#10b981' : '#ef4444',
                display: 'inline-block',
              }}
            />
            <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)' }}>
              {product.stock > 0 ? `${product.stock} units in stock` : 'Currently Out of Stock'}
            </span>
          </div>

          {product.stock > 0 && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: '700', fontSize: '0.9rem' }}>Qty:</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontWeight: '700',
                  outline: 'none',
                }}
              >
                {[...Array(Math.min(product.stock, 10)).keys()].map((n) => (
                  <option key={n + 1} value={n + 1}>
                    {n + 1}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAddToCart}
                className="btn-primary"
                style={{ flexGrow: 1, padding: '0.85rem 1.5rem', fontSize: '1rem' }}
              >
                Add to Cart 🛒
              </button>

              <button
                onClick={handleToggleWishlist}
                className="btn-secondary"
                style={{ padding: '0.85rem 1.1rem', fontSize: '1.1rem' }}
                title="Wishlist"
              >
                {isWishlisted ? '❤️' : '🤍'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '3rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
          Verified Reviews ({reviews.length})
        </h2>

        <div className="card" style={{ padding: '1.75rem', marginBottom: '2.5rem', maxWidth: '650px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem' }}>Write a Review</h3>
          {reviewError && <p style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>{reviewError}</p>}
          <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                Your Rating
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  outline: 'none',
                  fontWeight: '600',
                }}
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                <option value={4}>⭐⭐⭐⭐ (4 - Good)</option>
                <option value={3}>⭐⭐⭐ (3 - Average)</option>
                <option value={2}>⭐⭐ (2 - Poor)</option>
                <option value={1}>⭐ (1 - Terrible)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                Your Feedback
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your authentic thoughts about this product..."
                rows="3"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  outline: 'none',
                }}
              />
            </div>

            <button type="submit" disabled={submittingReview} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>

        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No customer reviews yet. Be the first to share your thoughts!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '650px' }}>
            {reviews.map((rev) => (
              <div key={rev._id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    {rev.buyer?.name || 'Verified Buyer'}
                  </span>
                  <span style={{ color: '#f59e0b', fontSize: '0.9rem' }}>
                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
