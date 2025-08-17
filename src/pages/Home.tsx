import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
// @ts-ignore

import 'swiper/css';
// @ts-ignore

import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faBell, faFilter, faCalendar, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import { useApi } from '../hooks/useApi';

const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');


  // Upcoming events
  const { data: eventsData, loading: eventsLoading, error: eventsError, execute: fetchEvents } = useApi<any>();
  // Categories
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError, execute: fetchCategories } = useApi<any>();
  // User profile
  const { data: userData, loading: userLoading, execute: fetchUser } = useApi<any>();

  useEffect(() => {
    fetchEvents(api.get('/events?list=upcoming&page=1&limit=10'));
    fetchCategories(api.get('/categories'));
    fetchUser(api.get('/users/profile'));
    // debug: 檢查 API 回傳
    api.get('/events?list=upcoming&page=1&limit=10').then(res => console.log('API events data', res.data));
  }, []);

  // 保證 upcomingEvents 一定是 array
  const upcomingEvents = Array.isArray(eventsData?.data?.data)
    ? eventsData.data.data
    : [];
  const categories = categoriesData?.data || [];
  const user = userData?.data || {};

  // 取得 API baseURL
  const API_URL = import.meta.env.VITE_API_URL || '';

  // 搜尋事件
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!search.trim()) return;
    navigate('/search', { state: { q: search } });
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
        {/* Top Banner Section */}
        <div className="relative h-64 bg-[#002e5d] text-white p-4 flex flex-col justify-end overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(\'https://via.placeholder.com/600x400/002e5d/ffffff?text=Event+Banner\')', filter: 'brightness(0.6)' }}></div>
          <div className="relative z-10 flex justify-between items-center mb-4">
            <img src="/logo.svg" alt="Logo" className="w-10 h-10" />
            <div className="flex space-x-4">
              <button className="w-8 h-8 rounded-full flex items-center justify-center border border-white text-white text-sm">
                <FontAwesomeIcon icon={faQrcode} className="text-xl"/>
              </button>
              <button className="w-8 h-8 rounded-full flex items-center justify-center border border-white text-white text-sm" onClick={() => navigate('/notification')}>
                <FontAwesomeIcon icon={faBell} className="text-xl" />
              </button>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-lg">
              {userLoading ? 'Loading...' : user && (user.first_name || user.last_name) ? `Welcome ${user.first_name || ''} ${user.last_name || ''}` : 'Welcome'}
            </p>
            <h1 className="text-2xl font-bold mb-4">Book your next event:</h1>
            <form className="flex items-center space-x-2 bg-white rounded-full p-2" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search events"
                className="flex-grow bg-transparent outline-none text-gray-800 px-2"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" className="bg-[#002e5d] text-white px-4 py-2 rounded-full flex items-center space-x-2">
                <span>Filter</span>
                <FontAwesomeIcon icon={faFilter} className="text-sm" />
              </button>
            </form>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto pb-20">
          {/* Upcoming Bookings Section */}
          <section className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#133366]">Upcoming Bookings</h2>
              <button className="text-[#002e5d]">View All</button>
            </div>
            {eventsLoading ? (
              <div className="text-center text-gray-400">Loading...</div>
            ) : eventsError ? (
              <div className="text-center text-red-400">載入失敗</div>
            ) : (
              <Swiper
                spaceBetween={16}
                slidesPerView={'auto'}
                modules={[Pagination]}
                className="my-2"
              >
                {upcomingEvents.map((event: any) => (
                  <SwiperSlide key={event._id || event.id} style={{ width: 260 }}>
                    <div
                      className="bg-white rounded-lg shadow-md p-4 cursor-pointer"
                      onClick={() => navigate('/event-details', { state: { eventId: event._id } })}
                    >
                      <img
                        src={
                          event.event_img
                            ? `${API_URL}${event.event_img}`
                            : event.img || event.image || 'https://via.placeholder.com/250x150'
                        }
                        alt="Event"
                        className="w-full h-32 object-cover rounded-md mb-2"
                      />
                      <h3 className="font-semibold text-[#133366] mb-1">{event.title}</h3>
                      <p className="text-sm text-gray-600 flex items-center mb-1">
                        <FontAwesomeIcon icon={faCalendar} className="text-xl mr-1" /> <span>{event.date}</span>
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <FontAwesomeIcon icon={faLocationDot} className="text-xl mr-1" /> <span>{event.location}</span>
                      </p>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </section>

          {/* Category List Section */}
          <section className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#133366]">Category</h2>
              <button
                className="text-[#002e5d]"
                onClick={() => navigate('/events/filter')}
              >
                View All
              </button>
            </div>
            {categoriesLoading ? (
              <div className="text-center text-gray-400">Loading...</div>
            ) : categoriesError ? (
              <div className="text-center text-red-400">載入失敗</div>
            ) : (
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {categories.map((cat: any) => (
                  <button
                    key={cat._id || cat.id || cat.name}
                    className="flex-shrink-0 bg-white border border-gray-300 px-4 py-2 rounded-full text-[#133366]"
                    onClick={() => navigate('/events', { state: { category: cat.name } })}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </section>
          {/* Recommended Events Section */}
          <section className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#133366]">Recommended Events</h2>
              <button className="text-[#002e5d]">View All</button>
            </div>
            <Swiper
              spaceBetween={16}
              slidesPerView={'auto'}
              modules={[Pagination]}
              className="my-2"
            >
              {/* Mock data for recommended events */}
              {upcomingEvents.map((event: any) => (
                <SwiperSlide key={event._id || event.id} style={{ width: 260 }}>
                  <div
                    className="bg-white rounded-lg shadow-md p-4 cursor-pointer"
                    onClick={() => navigate('/event-details')}
                  >
                    <img
                      src={
                        event.event_img
                          ? `${API_URL}${event.event_img}`
                          : event.img || event.image || 'https://via.placeholder.com/250x150'
                      }
                      alt="Event"
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                    <h3 className="font-semibold text-[#133366] mb-1">{event.title}</h3>
                    <p className="text-sm text-gray-600 flex items-center mb-1">
                      <FontAwesomeIcon icon={faCalendar} className="text-sm " /> <span>{event.date}</span>
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <FontAwesomeIcon icon={faLocationDot} className="text-sm " /> <span>{event.location}</span>
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default Home; 