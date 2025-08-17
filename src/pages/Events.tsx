import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faCalendar, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

// 產生前後各7天的日期陣列
function getDateArray(centerDate: Date, range: number) {
  const arr = [];
  for (let i = -range; i <= range; i++) {
    const d = new Date(centerDate);
    d.setDate(centerDate.getDate() + i);
    arr.push({
      date: d.toISOString().slice(0, 10),
      isToday: i === 0,
      week: d.toLocaleDateString('en-US', { weekday: 'short' })
    });
  }
  return arr;
}

const Events = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.toISOString().slice(0, 10));
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const dateArray = getDateArray(today, 7);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/events?date=${selectedDate}`);
        setEvents(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err) {
        setError('載入失敗');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [selectedDate]);

  // 搜尋功能（可選，若要保留）
  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(search.toLowerCase())
  );

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
          <span className="flex-1 text-center text-lg font-bold text-[#133366]">Events</span>
        </div>
        {/* 日期橫向 scroll */}
        <div className="flex overflow-x-auto px-4 mt-4 space-x-2 no-scrollbar">
          {dateArray.map(d => {
            const day = d.date.slice(8, 10);
            return (
              <button
                key={d.date}
                className={`flex flex-col items-center px-3 py-2 rounded-xl min-w-[48px] ${
                  selectedDate === d.date
                    ? 'bg-[#133366] text-white font-bold'
                    : 'bg-[#e6eff8] text-[#133366]'
                }`}
                onClick={() => setSelectedDate(d.date)}
              >
                <span className="text-lg font-bold">{day}</span>
                <span className="text-xs">{d.isToday ? '今天' : d.week}</span>
              </button>
            );
          })}
        </div>
        {/* 搜尋與 Filter（可選，若要保留） */}
        <div className="px-4 mt-4 flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              className="w-full bg-[#F0F2F5] border rounded-full px-4 py-2 pl-10"
              placeholder="Search events"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          </div>
          <button
            className="bg-[#002e5d] text-white px-4 py-2 rounded-full flex items-center"
            onClick={() => navigate('/events/filter')}
          >
            <FontAwesomeIcon icon={faFilter} className="text-lg mr-2" />
            Filter
          </button>
        </div>
        {/* Events List */}
        <div className="px-4 mt-4 space-y-4">
          <div className="text-[#133366] font-bold mb-2 flex items-center">
            {selectedDate === today.toISOString().slice(0, 10) ? 'Today' : selectedDate}
            <button className="ml-auto flex items-center text-[#133366] text-sm">
              <FontAwesomeIcon icon={faChevronDown} className="mr-1" /> Sort By
            </button>
          </div>
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-400">{error}</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center text-gray-400">
              當天暫時沒有活動<br />No Event on the day
            </div>
          ) : (
            filteredEvents.map(event => (
              <div key={event._id || event.id} className="bg-white rounded-2xl shadow mb-4 overflow-hidden cursor-pointer" onClick={() => navigate('/event-details', { state: { eventId: event._id || event.id } })}>
                <img src={event.event_img ? `${import.meta.env.VITE_API_URL}${event.event_img}` : event.img || event.image || 'https://via.placeholder.com/250x150'} alt="Event" className="w-full h-40 object-cover" />
                <div className="flex items-center px-4 py-2">
                  <div className="flex flex-col items-center mr-4">
                    <span className="bg-[#e6eff8] text-[#133366] rounded px-2 py-1 text-xs font-bold">
                      {event.date ? event.date.slice(8, 10) : ''} {event.date ? event.date.slice(5, 7) : ''}
                    </span>
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

export default Events;
