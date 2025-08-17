import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faHeart, faCalendar, faLocationDot } from '@fortawesome/free-solid-svg-icons';

const MyFavorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      setError('');
      try {
        // 獲取用戶收藏的活動
        const res = await api.get('/favorites');
        
        console.log('Favorites API Response:', res.data);
        
        if (res.data && typeof res.data === 'object') {
          // 檢查是否有 data 欄位
          if (Array.isArray(res.data.data)) {
            console.log('Using res.data.data:', res.data.data);
            setFavorites(res.data.data);
          } 
          // 如果 API 直接回傳陣列
          else if (Array.isArray(res.data)) {
            console.log('Using direct array:', res.data);
            setFavorites(res.data);
          }
          // 其他可能的結構
          else if (Array.isArray(res.data.favorites)) {
            console.log('Using res.data.favorites:', res.data.favorites);
            setFavorites(res.data.favorites);
          }
          else {
            console.log('No recognizable data structure, setting empty array');
            setFavorites([]);
          }
        } else {
          console.log('Invalid response data structure');
          setFavorites([]);
        }
      } catch (e) {
        setError('載入失敗');
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (eventId: string) => {
    try {
      await api.delete(`/favorites/${eventId}`);
      // 從本地狀態中移除
      setFavorites(prev => prev.filter(fav => fav._id !== eventId && fav.id !== eventId));
    } catch (e) {
      console.error('Failed to remove favorite:', e);
      alert('Failed to remove from favorites');
    }
  };

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
          <span className="text-lg font-bold text-[#133366] mx-auto">我的收藏</span>
        </div>

        {/* Favorites List */}
        <div className="px-4 mt-6 flex-1">
          {loading ? (
            <div className="text-center text-gray-400 mt-8">載入中...</div>
          ) : error ? (
            <div className="text-center text-red-400 mt-8">{error}</div>
          ) : favorites.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              還沒有收藏任何活動
            </div>
          ) : (
            favorites.map(favorite => (
              <div 
                key={favorite._id || favorite.id} 
                className="bg-white rounded-2xl shadow mb-4 overflow-hidden flex cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate('/event-details', { state: { eventId: favorite._id || favorite.id } })}
              >
                <img
                  src={favorite.event_img ? `${API_URL}${favorite.event_img}` : favorite.img || favorite.image || 'https://via.placeholder.com/120x80'}
                  alt="Event"
                  className="w-28 h-28 object-cover rounded-l-2xl"
                />
                <div className="flex flex-col justify-center px-4 py-2 flex-1">
                  <div className="font-semibold text-[#133366] text-base mb-1">{favorite.title}</div>
                  <div className="text-xs text-gray-500 flex items-center mb-1">
                    <span className="mr-2">📅</span>{favorite.date ? new Date(favorite.date).toLocaleString() : '--'}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center mb-1">
                    <span className="mr-2">📍</span>{favorite.location}
                  </div>
                  <div className="text-xs text-red-600 flex items-center">
                    <FontAwesomeIcon icon={faHeart} className="text-red-500 mr-1" />
                    已收藏
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(favorite._id || favorite.id);
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full m-2"
                >
                  <FontAwesomeIcon icon={faHeart} className="text-lg" />
                </button>
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

export default MyFavorites;
