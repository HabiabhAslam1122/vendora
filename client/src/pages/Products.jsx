import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlistIds, setWishlistIds] = useState([]);
  const [actionMsg, setActionMsg] = useState('');
  const [addingId, setAddingId] = useState(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const token = localStorage.getItem('token');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await API.get('/products', { params });
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setError(err.response?.data?.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!token) return;
    try {
      const res = await API.get('/wishlist', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data?.products || [];
      const ids = list.map((p) => (typeof p === 'object' && p ? p._id : p)).filter(Boolean);
      setWishlistIds(ids);
    } catch (err) {
      console.error('Fetch wishlist error:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    API.get('/products')
      .then((res) => {
        if (Array.isArray(res.data)) setProducts(res.data);
      })
      .catch((err) => console.error(err));
  };

  const showNotification = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleToggleWishlist = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      navigate('/login');
      return;
    }

    const isWishlisted = wishlistIds.includes(productId);
    try {
      if (isWishlisted) {
        await API.delete(`/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
        showNotification('Removed from Wishlist');
      } else {
        await API.post(
          '/wishlist',
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlistIds((prev) => [...prev, productId]);
        showNotification('Added to Wishlist! ❤️');
      }
    } catch (err) {
      console.error('Toggle wishlist error:', err);
      showNotification(err.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const handleAddToCart = async (productId) => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      setAddingId(productId);
      await API.post(
        '/cart',
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification('Added to Cart! 🛒');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingId(null);
    }
  };

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

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Explore Marketplace
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Find unique creations curated across independent stores.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/wishlist" className="btn-secondary" style={{ color: 'var(--accent)' }}>
            ❤️ Wishlist
          </Link>
          <Link to="/cart" className="btn-secondary">
            🛒 Cart
          </Link>
          <Link to="/" className="btn-secondary">
            Home
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <form
        onSubmit={handleFilterSubmit}
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '2.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.85rem',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: '2 1 200px',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            outline: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            flex: '1 1 140px',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            outline: 'none',
          }}
        />
        <input
          type="number"
          placeholder="Min Rs."
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{
            width: '110px',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            outline: 'none',
          }}
        />
        <input
          type="number"
          placeholder="Max Rs."
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{
            width: '110px',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            outline: 'none',
          }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
          Filter
        </button>
        <button type="button" onClick={handleReset} className="btn-secondary" style={{ padding: '0.65rem 1rem' }}>
          Reset
        </button>
      </form>

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          Loading products...
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--accent)' }}>
          {error}
        </div>
      ) : !products || products.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>No products found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or adding items from the seller panel.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {products.map((product) => {
            if (!product || !product._id) return null;
            const isWishlisted = wishlistIds.includes(product._id);
            return (
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
                      style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                    />
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No preview</span>
                  )}

                  {/* Wishlist Button with high z-index & explicit cursor */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleWishlist(e, product._id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: '#ffffff',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      borderRadius: '50%',
                      width: '38px',
                      height: '38px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)',
                      fontSize: '1.1rem',
                      zIndex: 10,
                      pointerEvents: 'auto',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {isWishlisted ? '❤️' : '🤍'}
                  </button>
                </div>

                {/* Details */}
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

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                      Rs. {product.price}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: product.stock > 0 ? '#10b981' : 'var(--accent)',
                      }}
                    >
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleAddToCart(product._id)}
                      disabled={product.stock <= 0 || addingId === product._id}
                      className="btn-primary"
                      style={{ padding: '0.55rem 0.5rem', fontSize: '0.85rem' }}
                    >
                      {addingId === product._id ? 'Adding...' : '🛒 Add to Cart'}
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
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Products;
