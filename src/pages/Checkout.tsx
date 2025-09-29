import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import stripeService from '../services/stripeService';
import CheckoutWarning from '../components/CheckoutWarning';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const event = location.state?.event;
  const ticket = location.state?.ticket || null;
  const API_URL = import.meta.env.VITE_API_URL || '';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [showWarning, setShowWarning] = useState(false);

  // Remove shipping and tax
  const qty = 1;
  const price = ticket?.cost ? Number(ticket.cost) : 0;
  const subtotal = price * qty;
  const total = subtotal; // Only subtotal, no tax or shipping

  // Get user profile and check for active checkout sessions
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/users/profile');
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };
    
    const checkActiveCheckout = () => {
      const activeSession = stripeService.getSavedCheckoutSession();
      if (activeSession) {
        console.log('Found active checkout session:', activeSession);
        setShowWarning(true);
      }
    };
    
    fetchUser();
    checkActiveCheckout();
  }, []);

  const handleBack = () => {
    // 如果沒有 ticket（免費活動），返回到 event details
    // 如果有 ticket，返回到 subscribe 頁面
    if (!ticket) {
      navigate('/event-details', { state: { eventId: event._id } });
    } else {
      navigate(-1);
    }
  };

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

  const handleCheckout = async () => {
    if (total === 0) {
      // Free event - directly join
      handleJoinEvent();
    } else {
      // Paid event - create Stripe session and redirect
      setLoading(true);
      setError('');
      
      try {
        const successUrl = `${window.location.origin}/checkout-success?event=${event._id}&user=${user?._id}`;
        const cancelUrl = `${window.location.origin}/checkout`;
        
        const sessionData = {
          userId: user._id,
          eventId: event._id,
          ticketId: ticket?._id || '',
          quantity: qty,
          success_url: successUrl,
          cancel_url: cancelUrl,
        };
        
        const session = await stripeService.createCheckoutSession(sessionData);
        stripeService.redirectToCheckout(session.url, session.sessionId);
        
      } catch (err: any) {
        console.error('Stripe checkout error:', err);
        setError(stripeService.handleStripeError(err));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleWarningContinue = () => {
    setShowWarning(false);
    handleCheckout();
  };

  const handleWarningCancel = () => {
    setShowWarning(false);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="bg-white rounded-b-2xl shadow px-4 py-4 flex items-center">
          <button className="mr-2" onClick={handleBack}>
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

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button 
              onClick={handleBack}
              className="flex items-center text-[#133366] hover:text-[#002e5d] transition-colors mb-4"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xl mr-2" />
              <span className="text-lg font-medium">Back</span>
            </button>
            <h1 className="text-3xl font-bold text-[#133366]">Shopping Cart</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Event Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-[#133366] mb-6">Event Details</h2>
                
                {/* Event Card */}
                <div className="bg-gray-50 rounded-xl p-6 flex items-start space-x-6">
                  {event?.event_img && (
                    <img 
                      src={`${API_URL}${event.event_img}`} 
                      alt="Event" 
                      className="w-32 h-32 object-cover rounded-lg flex-shrink-0" 
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#133366] mb-2">{event?.title}</h3>
                    <div className="text-gray-600 mb-2">{event?.date ? new Date(event.date).toLocaleString() : ''}</div>
                    <div className="text-gray-600 mb-2">{event?.location}</div>
                    {ticket && (
                      <div className="text-gray-600 mb-2">Ticket: {ticket.ticket_name}</div>
                    )}
                    <div className="text-gray-600">Quantity: {qty}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#133366] mb-2">${price.toFixed(2)}</div>
                    <button className="text-sm text-red-500 hover:text-red-700 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
                <h2 className="text-2xl font-bold text-[#133366] mb-6">Order Summary</h2>
                
                {/* Cost Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-lg">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-xl font-bold text-[#133366]">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-red-500 text-sm mb-4 text-center bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  className={`w-full text-white rounded-xl py-4 font-bold text-lg shadow-lg transition-all duration-200 ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : total === 0 
                        ? 'bg-green-600 hover:bg-green-700 hover:shadow-xl' 
                        : 'bg-[#133366] hover:bg-[#002e5d] hover:shadow-xl'
                  }`}
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : total === 0 ? 'JOIN EVENT' : 'PROCEED TO CHECKOUT'}
                </button>

                {/* Security Notice */}
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Secure checkout
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Warning Modal */}
      {showWarning && (
        <CheckoutWarning
          onContinue={handleWarningContinue}
          onCancel={handleWarningCancel}
        />
      )}
    </div>
  );
};

export default Checkout;

