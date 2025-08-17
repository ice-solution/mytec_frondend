import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // 支援從 location.state 傳入 search 關鍵字
  const initialQ = location.state?.q || '';
  const [search, setSearch] = useState(initialQ);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (search) {
      handleSearch();
    }
    // eslint-disable-next-line
  }, [search]);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/events/search?q=${encodeURIComponent(search)}&page=1&limit=10`);
      setEvents(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      setError('搜尋失敗');
      setEvents([]);
    } finally {
      setLoading(false);
    }
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
        <div className="bg-white rounded-b-2xl shadow px-4 py-4 flex items-center relative">
          <span className="flex-1 text-center text-lg font-bold text-[#133366]">Search Result</span>
        </div>
        {/* Events List */}
        <div className="px-4 mt-4 space-y-4">
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : events.length === 0 ? (
            <div className="text-center text-gray-400">No events found</div>
          ) : (
            events.map((event: any) => (
              <div key={event._id || event.id} className="bg-white rounded-2xl shadow mb-4 overflow-hidden cursor-pointer" onClick={() => navigate('/event-details', { state: { eventId: event._id || event.id } })}>
                <img src={event.event_img ? `${import.meta.env.VITE_API_URL}${event.event_img}` : event.img || event.image || 'https://via.placeholder.com/250x150'} alt="Event" className="w-full h-40 object-cover" />
                <div className="flex items-center px-4 py-2">
                  <div className="flex flex-col items-center mr-4">
                    {/* 可加日期標籤 */}
                  </div>
                  <div>
                    <div className="font-semibold text-[#133366]">{event.title}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                      {event.date}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Search; 