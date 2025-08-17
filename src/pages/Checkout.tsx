import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const event = location.state?.event;
  const ticket = location.state?.ticket || null;
  const API_URL = import.meta.env.VITE_API_URL || '';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  // Remove shipping and tax
  const qty = 1;
  const price = ticket?.cost ? Number(ticket.cost) : 0;
  const subtotal = price * qty;
  const total = subtotal; // Only subtotal, no tax or shipping

  // Get user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/users/profile');
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };
    fetchUser();
  }, []);

  const handleJoinEvent = async () => {
    if (!event?._id || !user?._id) {
      setError('Missing event or user information');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call join event API with correct format
      const response = await api.post('/event-guests/join', {
        event: event._id,
        user: user._id
      });

      if (response.status === 200 || response.status === 201) {
        // Success - navigate to success page or back to event details
        navigate('/event-details', { 
          state: { 
            eventId: event._id,
            joined: true 
          } 
        });
      }
    } catch (err: any) {
      console.error('Join event error:', err);
      setError(err.response?.data?.message || 'Failed to join event');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (total === 0) {
      // Free event - directly join
      handleJoinEvent();
    } else {
      // Paid event - go to Stripe with success callback
      const successUrl = `${window.location.origin}/checkout-success?event=${event._id}&user=${user?._id}`;
      const cancelUrl = `${window.location.origin}/checkout`;
      
      // Redirect to Stripe with success callback URL
      window.location.href = `https://checkout.stripe.com/pay/cs_test_example?success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
      <div className="bg-white rounded-b-2xl shadow px-4 py-4 flex items-center">
        <button className="mr-2" onClick={() => window.history.back()}>
          <FontAwesomeIcon icon={faArrowLeft} className="text-2xl text-[#133366]" />
        </button>
        <span className="text-lg font-bold text-[#133366] mx-auto">Shopping Cart</span>
      </div>
      <div className="px-4 mt-6 flex-1">
        {/* 商品卡片 */}
        <div className="bg-white rounded-xl shadow mb-4 p-4 flex items-center">
          {event?.event_img && (
            <img src={`${API_URL}${event.event_img}`} alt="Event" className="w-20 h-20 object-cover rounded-lg mr-4" />
          )}
          <div className="flex-1">
            <div className="font-semibold text-[#133366] text-base mb-1">{event?.title}</div>
            <div className="text-xs text-gray-500 mb-1">{ticket?.ticket_name}</div>
            <div className="text-xs text-gray-500 mb-1">QTY: {qty}</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="font-bold text-[#133366] text-base mb-2">${price.toFixed(2)}</div>
            <button className="text-xs text-[#1e90ff]">Remove</button>
          </div>
        </div>
        {/* Cost Summary */}
        <div className="bg-white rounded-xl shadow mb-4 p-4">
          <div className="text-xs text-gray-500 mb-2 font-bold">COST SUMMARY</div>
          <div className="flex justify-between text-sm mb-1">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold mt-2">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
          )}
          
          <button
            className={`w-full text-white rounded-lg py-3 font-bold text-lg shadow mt-6 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : total === 0 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-[#133366] hover:bg-[#002e5d]'
            }`}
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? 'Processing...' : total === 0 ? 'JOIN EVENT' : 'CHECK OUT'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

