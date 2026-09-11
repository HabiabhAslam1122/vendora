import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Signup from './pages/Signup';
import Login from './pages/Login';
import SellerDashboard from './pages/SellerDashboard';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import SellerOrders from './pages/SellerOrders';
import ProductDetail from './pages/ProductDetail';
import AdminDashboard from './pages/AdminDashboard';
import Wishlist from './pages/Wishlist';
import NotificationsDropdown from './NotificationsDropdown';

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      
      {/* Global Navigation Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 90,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0.85rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--primary-gradient)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: '800',
                fontSize: '1.2rem',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
              }}
            >
              V
            </span>
            <span style={{ fontSize: '1.45rem', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text-main)' }}>
              Vendora
            </span>
          </Link>

          {/* Center Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
            <Link to="/products" style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.95rem' }}>
              Marketplace
            </Link>
            <Link to="/wishlist" style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.95rem' }}>
              Wishlist ❤️
            </Link>
            <Link to="/cart" style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '0.95rem' }}>
              Cart 🛒
            </Link>
            {user?.role === 'seller' && (
              <Link to="/seller/dashboard" style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.95rem' }}>
                Seller Hub
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" style={{ color: 'var(--text-main)', fontWeight: '700', fontSize: '0.95rem' }}>
                Admin
              </Link>
            )}
          </nav>

          {/* Auth Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {user ? (
              <>
                <NotificationsDropdown />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#ffffff',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '999px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    {user.name}
                  </span>
                  <span
                    style={{
                      background: 'rgba(79, 70, 229, 0.1)',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      padding: '0.1rem 0.45rem',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {user.role}
                  </span>
                </div>
                <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary" style={{ padding: '0.55rem 1.1rem' }}>
                  Log in
                </Link>
                <Link to="/signup" className="btn-primary" style={{ padding: '0.55rem 1.25rem' }}>
                  Get Started →
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '3.5rem 1.5rem 4.5rem 1.5rem', flexGrow: 1 }}>
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center',
          }}
        >
          {/* Left Column */}
          <div>
            {/* Creator Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: '#ffffff',
                border: '1px solid #e0e7ff',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.08)',
                padding: '0.4rem 1rem',
                borderRadius: '999px',
                marginBottom: '1.25rem',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                Architected & Engineered by{' '}
                <strong style={{ color: 'var(--primary)', fontWeight: '800' }}>Habibah Aslam</strong>
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.85rem)',
                fontWeight: '800',
                lineHeight: 1.1,
                letterSpacing: '-0.035em',
                color: 'var(--text-main)',
                marginBottom: '1.5rem',
              }}
            >
              Discover products or build your own store on{' '}
              <span
                style={{
                  background: 'var(--primary-gradient)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Vendora.
              </span>
            </h1>

            <p
              style={{
                fontSize: '1.15rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                marginBottom: '2.25rem',
                maxWidth: '520px',
              }}
            >
              Join independent merchants and shoppers. Seamless multi-vendor transactions, real-time inventory tracking, and curated goods in one unified ecosystem.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <Link to="/products" className="btn-primary" style={{ padding: '0.85rem 1.85rem', fontSize: '1rem' }}>
                Explore Marketplace
              </Link>
              {user?.role === 'seller' ? (
                <Link to="/seller/dashboard" className="btn-secondary" style={{ padding: '0.85rem 1.6rem', fontSize: '1rem' }}>
                  Manage Storefront
                </Link>
              ) : (
                <Link to="/signup" className="btn-secondary" style={{ padding: '0.85rem 1.6rem', fontSize: '1rem' }}>
                  Start Selling →
                </Link>
              )}
            </div>

            {/* Social Proof */}
            <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <div>
                <strong style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>10k+</strong> Verified Items
              </div>
              <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)' }} />
              <div>
                <strong style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>99.9%</strong> Uptime Guarantee
              </div>
              <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)' }} />
              <div>
                <strong style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>Instant</strong> Order Alerts
              </div>
            </div>
          </div>

          {/* Right Hero Graphic (Custom Dynamic Visual) */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.18)',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
                padding: '2.5rem 2rem',
                minHeight: '380px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                color: '#ffffff',
              }}
            >
              {/* Header inside graphic */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1', marginLeft: '0.5rem', fontWeight: '500' }}>
                    vendora-hub://live-feed
                  </span>
                </div>
              </div>

              {/* Graphic Center Mockup */}
              <div style={{ margin: '2rem 0' }}>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#c7d2fe', fontWeight: '600' }}>Recent Checkout Activity</span>
                    <span style={{ fontSize: '0.75rem', background: '#10b981', color: '#fff', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>
                      Processed
                    </span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: '700' }}>Order #VN-8942 Completed</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>Buyer: Verified Member • Dispatched via Vendora Logistics</div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '0.85rem 1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Stock Sync Status</span>
                  <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: '700' }}>Optimal (99.8%)</span>
                </div>
              </div>

              {/* Footer inside graphic */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
                <span>Multi-Vendor Architecture</span>
                <span style={{ color: '#a5b4fc', fontWeight: '600' }}>Auth: Habibah Aslam</span>
              </div>
            </div>

            {/* Floating Metric Card */}
            <div
              className="card"
              style={{
                position: 'absolute',
                bottom: '-25px',
                left: '-20px',
                padding: '1.1rem 1.5rem',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                }}
              >
                📈
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Marketplace Volume
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  $1,420,800 <span style={{ fontSize: '0.8rem', color: '#10b981' }}>+24%</span>
                </div>
              </div>
            </div>

            {/* Floating Live Badge */}
            <div
              style={{
                position: 'absolute',
                top: '18px',
                right: '-10px',
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              Live Multi-Vendor Sync
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--border-subtle)', padding: '4.5rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              Engineered for Modern E-Commerce
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              High-performance tools for independent buyers and sellers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛍️</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Independent Stores</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Browse diverse inventory sourced directly from authentic creators and specialized sellers.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❤️</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Direct Wishlist-to-Cart</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Save favorite products with one tap and seamlessly transfer items to your shopping cart when ready.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔔</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>In-App Notifications</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Real-time tracking notifications for order dispatches, status changes, and seller inventory alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer with Creator Attribution */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', background: '#f8fafc', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-main)', fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
          Vendora Marketplace Platform
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Designed, Developed & Maintained by{' '}
          <strong style={{ color: 'var(--primary)' }}>Habibah Aslam</strong> • © 2026 All Rights Reserved
        </p>
      </footer>

    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/seller/dashboard" element={<SellerDashboard />} />
      <Route path="/products" element={<Products />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/seller/orders" element={<SellerOrders />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/wishlist" element={<Wishlist />} />
    </Routes>
  );
}

export default App;
