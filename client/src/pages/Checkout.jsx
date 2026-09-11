import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import API from '../api/axios';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function Checkout() {
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const res = await API.post(
        '/orders/create-payment-intent',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClientSecret(res.data.clientSecret);
      setTotalAmount(res.data.totalAmount);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
        <h2>Securing checkout session...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2 style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Checkout Error</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/cart" className="btn-primary">
          Return to Cart
        </Link>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#4f46e5',
        borderRadius: '12px',
        colorText: '#1e293b',
      },
    },
  };

  return (
    <div className="app-container" style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem' }}>
            <span>🔒 ENCRYPTED CHECKOUT</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)', marginTop: '0.2rem' }}>
            Payment & Confirmation
          </h1>
        </div>

        <Link to="/cart" className="btn-secondary" style={{ fontSize: '0.85rem' }}>
          ← Back to Cart
        </Link>
      </div>

      {/* Test Card Info Callout */}
      <div
        style={{
          background: 'rgba(79, 70, 229, 0.08)',
          border: '1px solid rgba(79, 70, 229, 0.2)',
          borderRadius: 'var(--radius-sm)',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: '1.4rem' }}>💳</div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
          <strong>Sandbox Demo Mode:</strong> Use test card{' '}
          <code style={{ background: '#ffffff', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontWeight: '700', color: 'var(--primary)' }}>
            4242 4242 4242 4242
          </code>
          , any future expiry date, and any 3-digit CVC.
        </div>
      </div>

      {/* Card Wrapper for Form */}
      <div className="card" style={{ padding: '2rem' }}>
        {clientSecret && (
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm totalAmount={totalAmount} />
          </Elements>
        )}
      </div>
    </div>
  );
}

export default Checkout;
