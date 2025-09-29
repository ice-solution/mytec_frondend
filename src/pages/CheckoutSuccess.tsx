import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import stripeService from '../services/stripeService';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const eventId = searchParams.get('event');
  const userId = searchParams.get('user');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (!eventId || !userId) {
        setError('Missing event or user information');
        setLoading(false);
        return;
      }

      try {
        // First verify the payment with Stripe
        if (sessionId) {
          const paymentVerification = await stripeService.verifyPayment(sessionId);
          
          if (!paymentVerification.success) {
            setError('Payment verification failed. Please contact support.');
            setLoading(false);
            return;
          }
        }

        // Call join event API after successful payment verification
        const response = await api.post('/event-guests/join', {
          event: eventId,
          user: userId
        });

        if (response.status === 200 || response.status === 201) {
          setSuccess(true);
          // 清除保存的 checkout session
          stripeService.clearCheckoutSession();
          // Redirect to event details after a short delay
          setTimeout(() => {
            navigate('/event-details', { 
              state: { 
                eventId: eventId,
                joined: true 
              } 
            });
          }, 2000);
        }
      } catch (err: any) {
        console.error('Payment success handling error:', err);
        setError(err.response?.data?.message || 'Failed to complete payment process');
      } finally {
        setLoading(false);
      }
    };

    handlePaymentSuccess();
  }, [eventId, userId, sessionId, navigate]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4">
        {loading ? (
          <div className="text-center">
            <FontAwesomeIcon 
              icon={faSpinner} 
              className="text-4xl text-[#133366] animate-spin mb-4" 
            />
            <h2 className="text-xl font-bold text-[#133366] mb-2">Processing Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/checkout')}
              className="bg-[#133366] text-white rounded-lg px-6 py-2 font-bold"
            >
              Try Again
            </button>
          </div>
        ) : success ? (
          <div className="text-center">
            <FontAwesomeIcon 
              icon={faCheckCircle} 
              className="text-4xl text-green-500 mb-4" 
            />
            <h2 className="text-xl font-bold text-[#133366] mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">You have successfully joined the event.</p>
            <div className="text-sm text-gray-500">Redirecting to event details...</div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CheckoutSuccess; 