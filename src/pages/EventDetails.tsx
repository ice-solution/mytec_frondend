import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faShareNodes, faHeart, faCalendar, faLocationDot, faDollarSign, faClock, faPhone, faEnvelope, faCheck } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import { useApi } from '../hooks/useApi';
import EventParticipants from '../components/EventParticipants';

const EventDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const eventId = location.state?.eventId;
  const { data: eventData, loading, error, execute } = useApi<any>();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [isEventExpired, setIsEventExpired] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [checkingFavorite, setCheckingFavorite] = useState(false);
  
  useEffect(() => {
    console.log('eventId', eventId);
    if (eventId) {
      execute(api.get(`/events/${eventId}`));
      checkSubscriptionStatus();
      checkFavoriteStatus();
      fetchCurrentUser();
    }
  }, [eventId]);

  useEffect(() => {
    // 檢查活動是否已過期
    const event = eventData?.data || {};
    if (event.date) {
      const eventDate = new Date(event.date);
      const now = new Date();
      setIsEventExpired(eventDate < now);
    }
    
    // 檢查當前用戶是否為活動主辦方
    if (event.owner && currentUser) {
      const eventOwnerId = event.owner._id || event.owner.id;
      const currentUserId = currentUser._id || currentUser.id;
      setIsOwner(eventOwnerId === currentUserId);
    }
  }, [eventData, currentUser]);

  const checkSubscriptionStatus = async () => {
    if (!eventId) return;
    
    setCheckingSubscription(true);
    try {
      // 檢查用戶是否已登入
      const token = localStorage.getItem('token');
      if (!token) {
        setIsSubscribed(false);
        setCheckingSubscription(false);
        return;
      }

      // 直接檢查用戶對特定活動的參加狀態
      const statusRes = await api.get(`/event-guests/check-status/${eventId}`);
      
      // 根據 API 回傳的結果判斷是否已參加
      // API 回傳格式: { joined: boolean, status: "joined", joined_at: "...", checkin_at: null, event_ticket: null }
      const isParticipating = statusRes.data?.joined === true || 
                              statusRes.data?.status === 'joined' ||
                              false;
      
      setIsSubscribed(isParticipating);
    } catch (e) {
      console.error('Failed to check subscription status:', e);
      // 如果檢查失敗，默認為未訂閱
      setIsSubscribed(false);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!eventId) return;
    
    setCheckingFavorite(true);
    try {
      // 檢查用戶是否已登入
      const token = localStorage.getItem('token');
      if (!token) {
        setIsFavorited(false);
        setCheckingFavorite(false);
        return;
      }

      // 檢查用戶是否已收藏此活動
      const favoriteRes = await api.get(`/favorites/check/${eventId}`);
      setIsFavorited(favoriteRes.data?.isFavorited || false);
    } catch (e) {
      console.error('Failed to check favorite status:', e);
      // 如果檢查失敗，默認為未收藏
      setIsFavorited(false);
    } finally {
      setCheckingFavorite(false);
    }
  };

  const handleFavoriteClick = async () => {
    // 檢查用戶是否已登入
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please register and login first');
      navigate('/login');
      return;
    }

    if (!eventId) return;

    try {
      if (isFavorited) {
        // 取消收藏
        await api.delete(`/favorites/${eventId}`);
        setIsFavorited(false);
      } else {
        // 添加收藏
        await api.post(`/favorites/${eventId}`);
        setIsFavorited(true);
      }
    } catch (e) {
      console.error('Failed to toggle favorite:', e);
      alert('Failed to update favorite status');
    }
  };

  const handleSubscribeClick = () => {
    // 檢查用戶是否已登入
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please register and login first');
      navigate('/login');
      return;
    }
    
    // 如果已登入，導航到 subscribe 頁面
    navigate('/subscribe', { state: { event } });
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await api.get('/users/profile');
      setCurrentUser(response.data);
    } catch (e) {
      console.error('Failed to fetch current user:', e);
    }
  };

  const event = eventData?.data || {};
  const API_URL = import.meta.env.VITE_API_URL || '';

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="min-h-screen">
        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col">
          {/* Banner Section */}
          <div className="relative h-64 bg-gray-300 overflow-hidden">
            <img
              src={event.event_img ? `${API_URL}${event.event_img}` : 'https://via.placeholder.com/600x400/808080/ffffff?text=Event+Banner'}
              alt="Event Banner"
              className="w-full h-full object-cover"
            />
            
            {/* Top Overlay Icons */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
              <button onClick={() => navigate(-1)} className="bg-white rounded-full p-2 shadow-md">
                <FontAwesomeIcon icon={faArrowLeft} className="text-lg text-gray-700" />
              </button>
              <div className="flex space-x-2">
                <button className="bg-white rounded-full p-2 shadow-md">
                  <FontAwesomeIcon icon={faShareNodes} className="text-lg text-gray-700" />
                </button>
                <button 
                  className={`rounded-full p-2 shadow-md transition-colors ${
                    isFavorited 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-red-50'
                  }`}
                  onClick={handleFavoriteClick}
                  disabled={checkingFavorite}
                >
                  <FontAwesomeIcon 
                    icon={faHeart} 
                    className={`text-lg ${isFavorited ? 'text-white' : 'text-gray-700'}`} 
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="relative bg-white rounded-t-3xl -mt-8 p-6 shadow-lg flex-grow overflow-y-auto z-20">
            {loading ? (
              <div className="text-center text-gray-400 py-8">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-400 py-8">載入失敗</div>
            ) : (
              <>
                {/* Date */}
                <p className="text-sm text-gray-500 mb-2">
                  <FontAwesomeIcon icon={faCalendar} className="text-sm mr-1" />
                  {event.date ? new Date(event.date).toLocaleString() : '--'}
                </p>
                {/* Subscribe 按鈕或狀態指示 */}
                <div className="flex justify-center mb-2">
                  {checkingSubscription ? (
                    <div className="text-center text-gray-500 py-2">
                      檢查參與狀態中...
                    </div>
                  ) : isEventExpired ? (
                    <div className="bg-gray-100 border border-gray-400 text-gray-700 rounded-xl px-6 py-3 flex items-center space-x-2">
                      <span className="font-semibold">已結束</span>
                    </div>
                  ) : isSubscribed ? (
                    <div className="bg-green-100 border border-green-400 text-green-700 rounded-xl px-6 py-3 flex items-center space-x-2">
                      <FontAwesomeIcon icon={faCheck} className="text-green-600" />
                      <span className="font-semibold">已參加此活動</span>
                    </div>
                  ) : (
                    <button
                      className="bg-[#133366] text-white rounded-full px-6 py-2 font-bold text-base shadow hover:bg-[#002e5d] transition"
                      onClick={handleSubscribeClick}
                    >
                      Subscribe
                    </button>
                  )}
                </div>
                
                {/* 活動管理按鈕（僅主辦方可見） */}
                {isOwner && currentUser && (
                  <div className="flex justify-center mb-4">
                    <button
                      className="bg-orange-500 text-white rounded-full px-6 py-2 font-bold text-base shadow hover:bg-orange-600 transition"
                      onClick={() => navigate('/event-management', { state: { event, eventId } })}
                    >
                      🎯 管理活動
                    </button>
                  </div>
                )}
                
                {/* Title */}
                <h1 className="text-2xl font-bold text-[#133366] mb-1">{event.title || '--'}</h1>
                <p className="text-base text-[#002e5d] font-semibold mb-4">{event.category ? `[${event.category}] ` : ''}{event.description || ''}</p>

                {/* Owner/Organizer Info */}
                {event.owner ? (
                  <div className="bg-[#e6eff8] rounded-xl p-4 flex items-center space-x-4 mb-6">
                    <img src={event.owner.avatar ? `${API_URL}${event.owner.avatar}` : 'https://via.placeholder.com/50'} alt="Owner Avatar" className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-[#133366]">{`${event.owner.first_name || ''} ${event.owner.last_name || ''}`.trim() || '--'}</p>
                      <p className="text-sm text-gray-600">{event.owner.email || ''}</p>
                    </div>
                    <div className="flex space-x-2 ml-auto">
                      {event.owner.phone && (
                        <a href={`tel:${event.owner.country_code || ''}${event.owner.phone}`} className="bg-white rounded-full p-2 shadow-sm">
                          <FontAwesomeIcon icon={faPhone} className="text-[#002e5d]" />
                        </a>
                      )}
                      {event.owner.email && (
                        <a href={`mailto:${event.owner.email}`} className="bg-white rounded-full p-2 shadow-sm">
                          <FontAwesomeIcon icon={faEnvelope} className="text-[#002e5d]" />
                        </a>
                      )}
                    </div>
                  </div>
                ) : null}

                <h2 className="text-lg font-bold text-[#133366] mb-3">Location</h2>
                <div className="flex items-center space-x-2 mb-4">
                  <FontAwesomeIcon icon={faLocationDot} className="text-xl text-[#002e5d]" />
                  <div>
                    <p className="text-base text-[#133366]">{event.location || '--'}</p>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-[#133366] mb-3">Admission Fee</h2>
                <p className="text-base text-[#133366] flex items-center space-x-2 mb-4">
                  <FontAwesomeIcon icon={faDollarSign} className="text-xl font-bold text-gray-700" />
                  <span>{event.cost !== undefined ? event.cost : 'Free (But appointment is needed)'}</span>
                </p>

                <h2 className="text-lg font-bold text-[#133366] mb-3">Register Date & Time</h2>
                <p className="text-base text-[#133366] flex items-center space-x-2 mb-4">
                  <FontAwesomeIcon icon={faCalendar} className="text-xl" />
                  <span>{event.date ? new Date(event.date).toLocaleString() : '--'}</span>
                </p>

                <h2 className="text-lg font-bold text-[#133366] mb-3">About this event</h2>
                <p className="text-base text-[#133366] flex items-center space-x-2 mb-2">
                  <FontAwesomeIcon icon={faClock} className="text-xl" />
                  <span>{event.duration || 'Event lasts 1 hour 30 minutes'}</span>
                </p>
                <p className="text-base text-gray-600 mb-4">
                  {event.description || 'No description.'}
                </p>

                {/* Event Participants */}
                <EventParticipants eventId={eventId} />

                {/* About the organizer */}
                <h2 className="text-lg font-bold text-[#133366] mb-3">About the organizer</h2>
                {event.owner ? (
                  <div className="bg-[#e6eff8] rounded-xl p-4 flex items-start space-x-4 mb-6">
                    <img src={event.owner.avatar ? `${API_URL}${event.owner.avatar}` : 'https://via.placeholder.com/60'} alt="Organizer Avatar" className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-[#133366]">{`${event.owner.first_name || ''} ${event.owner.last_name || ''}`.trim() || '--'}</p>
                      <p className="text-sm text-gray-600 mb-2">{event.owner.email || ''}</p>
                      {event.owner.phone && (
                        <p className="text-sm text-gray-600 mb-2">{`${event.owner.country_code || ''}${event.owner.phone}`}</p>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Subscribe Button 或狀態指示 */}
                {!isSubscribed && !checkingSubscription && !isEventExpired && (
                  <div className="flex justify-center mt-6 mb-8">
                    <button
                      className="bg-[#133366] text-white rounded-full px-6 py-2 font-bold text-base shadow hover:bg-[#002e5d] transition"
                      onClick={handleSubscribeClick}
                    >
                      Subscribe
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="p-4 lg:p-8">
            {/* Header with Back Button */}
            <div className="flex items-center mb-6">
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center text-[#133366] hover:text-[#002e5d] transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                <span>Back</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center text-gray-400 py-8">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-400 py-8">載入失敗</div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column - Main Content */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Event Image */}
                  <div className="relative">
                    <img
                      src={event.event_img ? `${API_URL}${event.event_img}` : 'https://via.placeholder.com/800x400/808080/ffffff?text=Event+Banner'}
                      alt="Event Banner"
                      className="w-full h-96 object-cover rounded-lg shadow-lg"
                    />
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button className="bg-white rounded-full p-3 shadow-md hover:bg-gray-50 transition-colors">
                        <FontAwesomeIcon icon={faShareNodes} className="text-lg text-gray-700" />
                      </button>
                      <button 
                        className={`rounded-full p-3 shadow-md transition-colors ${
                          isFavorited 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white text-gray-700 hover:bg-red-50'
                        }`}
                        onClick={handleFavoriteClick}
                        disabled={checkingFavorite}
                      >
                        <FontAwesomeIcon 
                          icon={faHeart} 
                          className={`text-lg ${isFavorited ? 'text-white' : 'text-gray-700'}`} 
                        />
                      </button>
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-500">
                        <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                        {event.date ? new Date(event.date).toLocaleString() : '--'}
                      </p>
                      {event.category && (
                        <span className="bg-[#133366] text-white px-3 py-1 rounded-full text-sm">
                          {event.category}
                        </span>
                      )}
                    </div>

                    <h1 className="text-3xl font-bold text-[#133366] mb-2">{event.title || '--'}</h1>
                    <p className="text-lg text-gray-600 mb-6">{event.description || ''}</p>

                    {/* Event Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-[#133366] mb-2 flex items-center">
                          <FontAwesomeIcon icon={faLocationDot} className="mr-2 text-[#002e5d]" />
                          Location
                        </h3>
                        <p className="text-gray-600">{event.location || '--'}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#133366] mb-2 flex items-center">
                          <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-[#002e5d]" />
                          Admission Fee
                        </h3>
                        <p className="text-gray-600">{event.cost !== undefined ? event.cost : 'Free (But appointment is needed)'}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#133366] mb-2 flex items-center">
                          <FontAwesomeIcon icon={faClock} className="mr-2 text-[#002e5d]" />
                          Duration
                        </h3>
                        <p className="text-gray-600">{event.duration || 'Event lasts 1 hour 30 minutes'}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#133366] mb-2 flex items-center">
                          <FontAwesomeIcon icon={faCalendar} className="mr-2 text-[#002e5d]" />
                          Date & Time
                        </h3>
                        <p className="text-gray-600">{event.date ? new Date(event.date).toLocaleString() : '--'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Event Participants */}
                  <EventParticipants eventId={eventId} />

                  {/* About the organizer */}
                  {event.owner && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h2 className="text-xl font-bold text-[#133366] mb-4">About the organizer</h2>
                      <div className="flex items-start space-x-4">
                        <img 
                          src={event.owner.avatar ? `${API_URL}${event.owner.avatar}` : 'https://via.placeholder.com/80'} 
                          alt="Organizer Avatar" 
                          className="w-20 h-20 rounded-full object-cover flex-shrink-0" 
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#133366] mb-1">
                            {`${event.owner.first_name || ''} ${event.owner.last_name || ''}`.trim() || '--'}
                          </h3>
                          <p className="text-gray-600 mb-2">{event.owner.email || ''}</p>
                          {event.owner.phone && (
                            <p className="text-gray-600 mb-3">{`${event.owner.country_code || ''}${event.owner.phone}`}</p>
                          )}
                          <div className="flex space-x-2">
                            {event.owner.phone && (
                              <a 
                                href={`tel:${event.owner.country_code || ''}${event.owner.phone}`} 
                                className="bg-[#133366] text-white px-4 py-2 rounded-lg hover:bg-[#002e5d] transition-colors"
                              >
                                <FontAwesomeIcon icon={faPhone} className="mr-2" />
                                Call
                              </a>
                            )}
                            {event.owner.email && (
                              <a 
                                href={`mailto:${event.owner.email}`} 
                                className="bg-gray-100 text-[#133366] px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                                Email
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Action Panel */}
                <div className="xl:col-span-1">
                  <div className="sticky top-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      {/* Status or Subscribe Button */}
                      <div className="mb-6">
                        {checkingSubscription ? (
                          <div className="text-center text-gray-500 py-4">
                            檢查參與狀態中...
                          </div>
                        ) : isEventExpired ? (
                          <div className="bg-gray-100 border border-gray-400 text-gray-700 rounded-lg px-4 py-3 text-center">
                            <span className="font-semibold">已結束</span>
                          </div>
                        ) : isSubscribed ? (
                          <div className="bg-green-100 border border-green-400 text-green-700 rounded-lg px-4 py-3 text-center">
                            <FontAwesomeIcon icon={faCheck} className="text-green-600 mr-2" />
                            <span className="font-semibold">已參加此活動</span>
                          </div>
                        ) : (
                          <button
                            className="w-full bg-[#133366] text-white rounded-lg px-6 py-3 font-bold text-lg shadow hover:bg-[#002e5d] transition-colors"
                            onClick={handleSubscribeClick}
                          >
                            Subscribe
                          </button>
                        )}
                      </div>

                      {/* Event Management Button (for owners) */}
                      {isOwner && currentUser && (
                        <div className="mb-6">
                          <button
                            className="w-full bg-orange-500 text-white rounded-lg px-6 py-3 font-bold text-lg shadow hover:bg-orange-600 transition-colors"
                            onClick={() => navigate('/event-management', { state: { event, eventId } })}
                          >
                            🎯 管理活動
                          </button>
                        </div>
                      )}

                      {/* Quick Info */}
                      <div className="space-y-4">
                        <div className="border-t pt-4">
                          <h3 className="font-semibold text-[#133366] mb-2">Event Details</h3>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                              <span>Date:</span>
                              <span>{event.date ? new Date(event.date).toLocaleDateString() : '--'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Time:</span>
                              <span>{event.date ? new Date(event.date).toLocaleTimeString() : '--'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cost:</span>
                              <span>{event.cost !== undefined ? event.cost : 'Free'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventDetails; 