import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import API from '../api/axios';

function CheckoutForm({ totalAmount }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message || 'Payment failed. Please try again.');
      setProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await API.post(
          '/orders/confirm',
          { paymentIntentId: paymentIntent.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        navigate('/orders');
      } catch (err) {
        setError(err.response?.data?.message || 'Payment succeeded but order could not be saved.');
      }
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
      <PaymentElement />

      {error && (
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.75rem 1rem',
            background: 'var(--accent-soft)',
            color: 'var(--accent)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            fontWeight: '600',
            border: '1px solid rgba(244, 63, 94, 0.2)',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            Total Payment
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary)' }}>
            Rs. {Number(totalAmount).toFixed(2)}
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || processing}
          className="btn-primary"
          style={{ padding: '0.85rem 2rem', fontSize: '1rem', cursor: processing ? 'not-allowed' : 'pointer' }}
        >
          {processing ? 'Processing Order...' : `Authorize & Pay Rs. ${Number(totalAmount).toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}

export default CheckoutForm;
