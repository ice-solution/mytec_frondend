import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useApi } from '../hooks/useApi';

const MemberCard = () => {
  const navigate = useNavigate();
  const { data: userData, loading, error, execute } = useApi<any>();
  useEffect(() => {
    execute(api.get('/users/profile'));
  }, []);
  const user = userData?.data || {};
  const API_URL = import.meta.env.VITE_API_URL || '';
  const qrValue = user._id || '';

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="min-h-screen bg-[#1a3c6c] flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-b-2xl shadow px-4 py-4 flex items-center relative">
          <button onClick={() => navigate(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 text-2xl text-[#133366]">←</button>
          <span className="flex-1 text-center text-lg font-bold text-[#133366]">Member Card</span>
        </div>
        {/* Card */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-bold text-[#133366] text-lg">{user.first_name || ''} {user.last_name || ''}</div>
                <div className="text-sm text-[#133366] flex items-center mt-1">
                  <span className="mr-2">📞</span>{user.country_code || ''} {user.phone || ''}
                </div>
                <div className="text-sm text-[#133366] flex items-center mt-1">
                  <span className="mr-2">✉️</span>{user.email || ''}
                </div>
              </div>
              <img src={user.avatar ? `${API_URL}${user.avatar}` : '/avatar1.jpg'} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#133366]" />
            </div>
            <hr className="my-4 border-dashed border-gray-300" />
            {/* QRCode */}
            <div className="flex flex-col items-center">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrValue}`} alt="QR Code" className="w-40 h-40 mb-4" />
              <div className="bg-[#F0F2F5] rounded-full px-6 py-2 text-[#133366] font-semibold text-sm border border-gray-300">會員號碼：{user._id || ''}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MemberCard; 