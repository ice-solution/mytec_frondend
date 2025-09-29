import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faCheckCircle, faTimesCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import stripeService from '../services/stripeService';

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'canceled';
  event_title: string;
  ticket_name?: string;
  created_at: string;
  payment_method: string;
}

interface PaymentHistoryProps {
  userId: string;
}

const PaymentHistory = ({ userId }: PaymentHistoryProps) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const history = await stripeService.getPaymentHistory(userId);
        setPayments(history);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPaymentHistory();
    }
  }, [userId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case 'pending':
        return <FontAwesomeIcon icon={faClock} className="text-yellow-500" />;
      case 'failed':
      case 'canceled':
        return <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />;
      default:
        return <FontAwesomeIcon icon={faCreditCard} className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'Payment Successful';
      case 'pending':
        return 'Payment Pending';
      case 'failed':
        return 'Payment Failed';
      case 'canceled':
        return 'Payment Canceled';
      default:
        return 'Unknown Status';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-HK', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-HK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-bold text-[#133366] mb-4">Payment History</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#133366]"></div>
          <span className="ml-2 text-gray-500">Loading payment history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-bold text-[#133366] mb-4">Payment History</h3>
        <div className="text-center text-red-500 py-8">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6">
        <h3 className="text-lg font-bold text-[#133366] mb-4">Payment History</h3>
        <div className="text-center text-gray-500 py-8">
          <FontAwesomeIcon icon={faCreditCard} className="text-4xl mb-4" />
          <p>No payment history found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <h3 className="text-lg font-bold text-[#133366] mb-4">Payment History</h3>
      <div className="space-y-4">
        {payments.map((payment) => (
          <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(payment.status)}
                <span className="font-medium text-[#133366]">
                  {getStatusText(payment.status)}
                </span>
              </div>
              <span className="font-bold text-[#133366]">
                {formatAmount(payment.amount, payment.currency)}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 mb-2">
              <p className="font-medium">{payment.event_title}</p>
              {payment.ticket_name && (
                <p className="text-gray-500">Ticket: {payment.ticket_name}</p>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatDate(payment.created_at)}</span>
              <span>{payment.payment_method}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentHistory;
