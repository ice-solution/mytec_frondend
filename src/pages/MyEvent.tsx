import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const MyEvent = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [data, setData] = useState<{ upcoming: any[]; past: any[] }>({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/events/me');
        setData({
          upcoming: Array.isArray(res.data?.upcoming) ? res.data.upcoming : [],
          past: Array.isArray(res.data?.past) ? res.data.past : [],
        });
      } catch (e) {
        setError('載入失敗');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const events = tab === 'upcoming' ? data.upcoming : data.past;
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
        <div className="bg-white rounded-b-2xl lg:rounded-none shadow px-4 py-4 lg:px-8 lg:py-6 flex items-center">
          <button className="mr-2 lg:hidden" onClick={() => navigate('/profile')}>
            <FontAwesomeIcon icon={faArrowLeft} className="text-2xl text-[#133366]" />
          </button>
          <span className="text-lg lg:text-2xl font-bold text-[#133366] mx-auto lg:mx-0">My Event</span>
        </div>
        
        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          {/* Tabs */}
          <div className="flex justify-center lg:justify-start mt-6 mb-2 px-4 lg:px-8">
            <div className="flex space-x-6">
              <button
                className={`px-4 py-2 lg:px-6 lg:py-3 font-bold border-b-2 text-sm lg:text-base ${tab === 'upcoming' ? 'border-[#bfa16a] text-[#133366]' : 'border-transparent text-gray-400'}`}
                onClick={() => setTab('upcoming')}
              >
                Upcoming
              </button>
              <button
                className={`px-4 py-2 lg:px-6 lg:py-3 font-bold border-b-2 text-sm lg:text-base ${tab === 'past' ? 'border-[#bfa16a] text-[#133366]' : 'border-transparent text-gray-400'}`}
                onClick={() => setTab('past')}
              >
                Past
              </button>
            </div>
          </div>
          
          {/* Event List */}
          <div className="px-4 lg:px-8 mt-2 flex-1">
            {loading ? (
              <div className="text-center text-gray-400 mt-8">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-400 mt-8">{error}</div>
            ) : events.length === 0 ? (
              <div className="text-center text-gray-400 mt-8">No events</div>
            ) : (
              <>
                {/* Mobile: List Layout */}
                <div className="lg:hidden space-y-4">
                  {events.map(event => (
                    <div key={event._id || event.id} className="bg-white rounded-2xl shadow mb-4 overflow-hidden flex">
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
                        <div className="text-xs text-gray-500 flex items-center">
                          <span className="mr-2">📍</span>{event.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Desktop: Grid Layout */}
                <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map(event => (
                    <div key={event._id || event.id} className="bg-white rounded-2xl shadow overflow-hidden hover:shadow-lg transition-shadow">
                      <img
                        src={event.event_img ? `${API_URL}${event.event_img}` : event.img || event.image || 'https://via.placeholder.com/400x200'}
                        alt="Event"
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <div className="font-semibold text-[#133366] text-lg mb-2">{event.title}</div>
                        <div className="text-sm text-gray-500 flex items-center mb-2">
                          <span className="mr-2">📅</span>{event.date}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <span className="mr-2">📍</span>{event.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* Create Event Button */}
          <div className="flex justify-center my-6 px-4 lg:px-8">
            <button className="bg-[#133366] text-white rounded-full px-8 py-3 lg:px-12 lg:py-4 font-bold text-lg lg:text-xl flex items-center shadow hover:shadow-lg transition-shadow">
              <span className="mr-2 text-xl lg:text-2xl">＋</span> Create Event
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MyEvent; 