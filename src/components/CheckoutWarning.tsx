import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';
import stripeService from '../services/stripeService';

interface CheckoutWarningProps {
  onContinue: () => void;
  onCancel: () => void;
}

const CheckoutWarning = ({ onContinue, onCancel }: CheckoutWarningProps) => {
  const [showWarning, setShowWarning] = useState(true);

  const handleContinue = () => {
    stripeService.clearCheckoutSession();
    onContinue();
  };

  const handleCancel = () => {
    setShowWarning(false);
    onCancel();
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 text-lg" />
            </div>
            <h3 className="text-lg font-bold text-[#133366]">Payment in Progress</h3>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-3">
            We detected that you have an active payment session. If you just returned from Stripe, 
            please wait a moment for the payment to be processed.
          </p>
          <p className="text-gray-600 mb-3">
            If you want to start a new payment, please note that this will cancel your previous session.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> Starting a new payment may result in duplicate charges if your previous payment was successful.
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
          >
            Wait for Payment
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 bg-[#133366] text-white rounded-lg py-3 font-medium hover:bg-[#002e5d] transition-colors"
          >
            Start New Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutWarning;
