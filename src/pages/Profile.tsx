import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faQrcode, faCog, faArrowRight, faCalendar, faBookmark, faBook, faRightFromBracket, faHeart } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import { useApi } from '../hooks/useApi';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const { data: userData, execute } = useApi<any>();
  useEffect(() => {
    execute(api.get('/users/profile'));
  }, []);
  const user = userData?.data || {};
  const API_URL = import.meta.env.VITE_API_URL || '';

  // 登出功能
  const handleLogout = async () => {
    if (!window.confirm('是否真的要登出？')) return;
    try {
      await axios.post(`${API_URL}/api/users/logout`);
    } catch (e) {
      // 可選：顯示錯誤訊息
    }
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-b-2xl shadow px-4 py-4 flex justify-between items-center">
          <span className="text-lg font-bold text-[#133366]">Profile</span>
          <button>
            {/* 設定 icon，可用 SVG 或 emoji 佔位 */}
            <FontAwesomeIcon icon={faCog} className="text-2xl text-[#133366]" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="px-4 mt-4">
          <div className="relative bg-gradient-to-br from-[#1a3c6c] to-[#1e5ba1] rounded-2xl p-6 shadow-lg">
            {/* Logo */}
            <img src="/logo.svg" alt="Logo" className="w-8 h-8 absolute top-4 left-4" />
            {/* QR code */}
            <button
              className="absolute top-4 right-4 bg-white rounded-lg p-1"
              onClick={() => navigate('/member-card')}
            >
              <FontAwesomeIcon icon={faQrcode} className="text-xl" />
            </button>
            {/* 會員姓名與號碼 */}
            <div className="mt-8">
              <div className="text-white text-xl font-bold text-right">{user.first_name || ''} {user.last_name || ''}</div>
              <div className="text-white text-right text-sm tracking-widest">{user._id || ''}</div>
            </div>
            <div className="text-sm text-white flex items-center mt-1">
              <FontAwesomeIcon icon={faPhone} className="mr-2" />
              {user.country_code || ''} {user.phone || ''}
            </div>
            <div className="text-sm text-white flex items-center mt-1">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
              {user.email || ''}
            </div>
          </div>
        </div>

        {/* 功能列表 */}
        <div className="mt-6 px-4 space-y-2">
          <button className="w-full flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow" onClick={() => navigate('/my-event')}>
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faCalendar} className="text-xl text-[#133366]" />
              <span className="text-[#133366] font-medium">My Events</span>
            </div>
            <FontAwesomeIcon icon={faArrowRight} className="text-[#133366] text-lg" />
          </button>
          <button className="w-full flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow" onClick={() => navigate('/my-subscribe')}>
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faBookmark} className="text-xl text-[#133366]" />
              <span className="text-[#133366] font-medium">My Subscriptions</span>
            </div>
            <FontAwesomeIcon icon={faArrowRight} className="text-[#133366] text-lg" />
          </button>
          <button className="w-full flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow" onClick={() => navigate('/my-favorites')}>
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faHeart} className="text-xl text-[#133366]" />
              <span className="text-[#133366] font-medium">My Favorites</span>
            </div>
            <FontAwesomeIcon icon={faArrowRight} className="text-[#133366] text-lg" />
          </button>
          <button className="w-full flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow">
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faBook} className="text-xl text-[#133366]" />
              <span className="text-[#133366] font-medium">Booking History</span>
            </div>
            <FontAwesomeIcon icon={faArrowRight} className="text-[#133366] text-lg" />
          </button>
          {/* Logout 按鈕 */}
          <button
            className="w-full flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow mt-2 text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faRightFromBracket} className="text-xl" />
              <span className="font-medium">Logout</span>
            </div>
          </button>
        </div>

        {/* 底部導航欄（如已共用可省略） */}
        {/* ...你的底部導航欄... */}
      </div>
    </motion.div>
  );
};

export default Profile;
