import { useEffect, useState } from 'react';
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
import { useAuth } from '../hooks/useAuth';
import LoginModal from '../components/LoginModal';
import HomeFooter from '../components/HomeFooter';

const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  // 登入檢查 - 不強制要求登入，但會顯示提示
  const { showLoginModal, handleLoginRedirect, handleCloseModal } = useAuth(false, '/', false);
  
  // 檢查是否已經選擇稍後再說
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);


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
    
    // 檢查是否已經選擇稍後再說
    const checkLoginPrompt = () => {
      const token = localStorage.getItem('token');
      const hasChosenLater = document.cookie.includes('loginPromptDismissed=true');
      
      if (!token && !hasChosenLater) {
        setShowLoginPrompt(true);
      }
    };
    
    checkLoginPrompt();
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

  // 處理稍後再說
  const handleLater = () => {
    // 設置 cookie，30天過期
    const expires = new Date();
    expires.setTime(expires.getTime() + (30 * 24 * 60 * 60 * 1000));
    document.cookie = `loginPromptDismissed=true; expires=${expires.toUTCString()}; path=/`;
    setShowLoginPrompt(false);
  };

  // 處理登入
  const handleLogin = () => {
    setShowLoginPrompt(false);
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
        {/* Top Banner Section */}
        <div className="relative h-64 lg:h-80 bg-[#002e5d] text-white p-4 lg:p-8 flex flex-col justify-end overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(\'https://via.placeholder.com/1200x400/002e5d/ffffff?text=Event+Banner\')', filter: 'brightness(0.6)' }}></div>
          <div className="relative z-10 flex justify-between items-center mb-4">
            <img src="/logo.svg" alt="Logo" className="w-10 h-10 lg:w-12 lg:h-12" />
            <div className="flex space-x-4">
              <button className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border border-white text-white text-sm">
                <FontAwesomeIcon icon={faQrcode} className="text-xl"/>
              </button>
              <button className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border border-white text-white text-sm" onClick={() => navigate('/notification')}>
                <FontAwesomeIcon icon={faBell} className="text-xl" />
              </button>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-lg lg:text-lg">
              {userLoading ? 'Loading...' : user && (user.first_name || user.last_name) ? `Welcome ${user.first_name || ''} ${user.last_name || ''}` : 'Welcome'}
            </p>
            <h1 className="text-2xl lg:text-2xl font-bold mb-4">Book your next event:</h1>
            <form className="flex items-center space-x-2 bg-white rounded-full p-2 lg:p-3 max-w-7xl mx-auto" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search events"
                className="flex-grow bg-transparent outline-none text-gray-800 px-2 lg:px-4 text-sm lg:text-base"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" className="bg-[#002e5d] text-white px-4 py-2 lg:px-6 lg:py-3 rounded-full flex items-center space-x-2 text-sm lg:text-base">
                <span>Filter</span>
                <FontAwesomeIcon icon={faFilter} className="text-sm" />
              </button>
            </form>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto pb-20 lg:pb-8">
          {/* Main Content Container */}
          <div className="max-w-7xl mx-auto">
            {/* Upcoming Bookings Section */}
            <section className="p-4 lg:p-8">
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-xl font-bold text-[#133366]">Upcoming Bookings</h2>
                <button className="text-[#002e5d] hover:underline text-sm lg:text-sm">View All</button>
              </div>
              {eventsLoading ? (
                <div className="text-center text-gray-400">Loading...</div>
              ) : eventsError ? (
                <div className="text-center text-red-400">載入失敗</div>
              ) : (
                <>
                  {/* Mobile: Swiper */}
                  <div className="lg:hidden">
                    <Swiper
                      spaceBetween={16}
                      slidesPerView={'auto'}
                      modules={[Pagination]}
                      className="my-2"
                    >
                      {upcomingEvents.map((event: any) => (
                        <SwiperSlide key={event._id || event.id} style={{ width: 260 }}>
                          <div
                            className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
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
                  </div>
                  
                  {/* Desktop: Grid Layout */}
                  <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {upcomingEvents.map((event: any) => (
                      <div
                        key={event._id || event.id}
                        className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => navigate('/event-details', { state: { eventId: event._id } })}
                      >
                        <img
                          src={
                            event.event_img
                              ? `${API_URL}${event.event_img}`
                              : event.img || event.image || 'https://via.placeholder.com/400x200'
                          }
                          alt="Event"
                          className="w-full h-48 object-cover rounded-md mb-4"
                        />
                        <h3 className="font-semibold text-[#133366] mb-2 text-base">{event.title}</h3>
                        <p className="text-sm text-gray-600 flex items-center mb-2">
                          <FontAwesomeIcon icon={faCalendar} className="mr-2" /> <span>{event.date}</span>
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <FontAwesomeIcon icon={faLocationDot} className="mr-2" /> <span>{event.location}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* Category List Section */}
            <section className="p-4 lg:p-8">
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-xl font-bold text-[#133366]">Category</h2>
                <button
                  className="text-[#002e5d] hover:underline text-sm lg:text-sm"
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
                <div className="flex overflow-x-auto lg:flex-wrap lg:overflow-visible space-x-2 lg:space-x-4 lg:space-y-2 pb-2">
                  {categories.map((cat: any) => (
                    <button
                      key={cat._id || cat.id || cat.name}
                      className="flex-shrink-0 lg:flex-shrink bg-white border border-gray-300 px-4 py-2 lg:px-6 lg:py-3 rounded-full text-[#133366] hover:bg-gray-50 transition-colors"
                      onClick={() => navigate('/events', { state: { category: cat.name } })}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </section>
            
            {/* Recommended Events Section */}
            <section className="p-4 lg:p-8">
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-xl font-bold text-[#133366]">Recommended Events</h2>
                <button className="text-[#002e5d] hover:underline text-sm lg:text-sm">View All</button>
              </div>
              <>
                {/* Mobile: Swiper */}
                <div className="lg:hidden">
                  <Swiper
                    spaceBetween={16}
                    slidesPerView={'auto'}
                    modules={[Pagination]}
                    className="my-2"
                  >
                    {upcomingEvents.map((event: any) => (
                      <SwiperSlide key={event._id || event.id} style={{ width: 260 }}>
                        <div
                          className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
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
                            <FontAwesomeIcon icon={faCalendar} className="text-sm mr-1" /> <span>{event.date}</span>
                          </p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <FontAwesomeIcon icon={faLocationDot} className="text-sm mr-1" /> <span>{event.location}</span>
                          </p>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
                
                {/* Desktop: Grid Layout */}
                <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {upcomingEvents.map((event: any) => (
                    <div
                      key={event._id || event.id}
                      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate('/event-details')}
                    >
                      <img
                        src={
                          event.event_img
                            ? `${API_URL}${event.event_img}`
                            : event.img || event.image || 'https://via.placeholder.com/400x200'
                        }
                        alt="Event"
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                      <h3 className="font-semibold text-[#133366] mb-2 text-base">{event.title}</h3>
                      <p className="text-sm text-gray-600 flex items-center mb-2">
                        <FontAwesomeIcon icon={faCalendar} className="mr-2" /> <span>{event.date}</span>
                      </p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <FontAwesomeIcon icon={faLocationDot} className="mr-2" /> <span>{event.location}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </>
            </section>
          </div>
        </div>
        
        {/* Footer Section */}
        <HomeFooter />
      </div>
      
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onLogin={handleLoginRedirect}
        onClose={handleCloseModal}
      />

      {/* Custom Login Prompt */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-[#133366] mb-4">
                歡迎使用 Timable
              </h3>
              <p className="text-gray-600 mb-6">
                登入後可以享受更多功能，包括個人化推薦和活動管理。
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleLater}
                  className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-3 font-medium hover:bg-gray-200 transition-colors"
                >
                  稍後再說
                </button>
                <button
                  onClick={handleLogin}
                  className="flex-1 bg-[#133366] text-white rounded-lg py-3 font-medium hover:bg-[#002e5d] transition-colors"
                >
                  立即登入
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Home; 