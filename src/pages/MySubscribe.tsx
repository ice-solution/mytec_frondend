import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const MySubscribe = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // 獲取用戶已參加的活動
        const res = await api.get('/event-guests/my-subscriptions');
        
        // 處理 API 回傳的資料結構
        // API 回傳格式: { success: true, count: 1, data: [...] }
        console.log('API Response:', res.data);
        
        if (res.data && typeof res.data === 'object') {
          // 檢查是否有 data 欄位（新格式）
          if (Array.isArray(res.data.data)) {
            console.log('Using res.data.data:', res.data.data);
            setEvents(res.data.data);
          } 
          // 如果 API 已經分組好了（upcoming 和 past），合併所有活動
          else if (res.data.upcoming && res.data.past) {
            const allEvents = [
              ...(Array.isArray(res.data.upcoming) ? res.data.upcoming : []),
              ...(Array.isArray(res.data.past) ? res.data.past : [])
            ];
            console.log('Using grouped data:', allEvents);
            setEvents(allEvents);
          } 
          // 如果 API 回傳的是單一陣列，直接使用
          else if (Array.isArray(res.data)) {
            console.log('Using direct array:', res.data);
            setEvents(res.data);
          }
          // 其他可能的結構
          else if (Array.isArray(res.data.events)) {
            console.log('Using res.data.events:', res.data.events);
            setEvents(res.data.events);
          }
          else {
            console.log('No recognizable data structure, setting empty array');
            setEvents([]);
          }
        } else {
          console.log('Invalid response data structure');
          setEvents([]);
        }
      } catch (e) {
        setError('載入失敗');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const API_URL = import.meta.env.VITE_API_URL || '';

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-b-2xl shadow px-4 py-4 flex items-center">
          <button className="mr-2" onClick={() => navigate('/profile')}>
            <FontAwesomeIcon icon={faArrowLeft} className="text-2xl text-[#133366]" />
          </button>
          <span className="text-lg font-bold text-[#133366] mx-auto">我的訂閱</span>
        </div>
        {/* Event List */}
        <div className="px-4 mt-6 flex-1">
          {loading ? (
            <div className="text-center text-gray-400 mt-8">載入中...</div>
          ) : error ? (
            <div className="text-center text-red-400 mt-8">{error}</div>
          ) : events.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              還沒有訂閱任何活動
            </div>
          ) : (
            events.map(event => (
              <div 
                key={event._id || event.id} 
                className="bg-white rounded-2xl shadow mb-4 overflow-hidden flex cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate('/event-details', { state: { eventId: event._id || event.id } })}
              >
                <img
                  src={event.event_img ? `${API_URL}${event.event_img}` : event.img || event.image || 'https://via.placeholder.com/120x80'}
                  alt="Event"
                  className="w-28 h-28 object-cover rounded-l-2xl"
                />
                <div className="flex flex-col justify-center px-4 py-2 flex-1">
                  <div className="font-semibold text-[#133366] text-base mb-1">{event.title}</div>
                  <div className="text-xs text-gray-500 flex items-center mb-1">
                    <span className="mr-2">📅</span>{event.date}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center mb-1">
                    <span className="mr-2">📍</span>{event.location}
                  </div>
                  <div className="text-xs text-green-600 flex items-center">
                    <span className="mr-2">✓</span>已訂閱
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Browse Events Button */}
        <div className="flex justify-center my-6">
          <button 
            className="bg-[#133366] text-white rounded-full px-8 py-3 font-bold text-lg flex items-center shadow hover:bg-[#002e5d] transition"
            onClick={() => navigate('/events')}
          >
            <span className="mr-2">🔍</span> 瀏覽更多活動
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MySubscribe; 