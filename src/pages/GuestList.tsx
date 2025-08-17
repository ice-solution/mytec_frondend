import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCheck, faUser, faCrown } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

interface Guest {
  _id: string;
  user: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
  };
  status: string;
  joined_at: string;
  checkin_at?: string;
  event_ticket?: string;
}

const GuestList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;
  const eventId = location.state?.eventId || event?._id;

  const [guests, setGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'joinDate'>('name');
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    const fetchGuestList = async () => {
      if (!eventId) {
        setError('找不到活動 ID');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching guest list for event:', eventId);
        const response = await api.get(`/event-guests/event/${eventId}`);
        console.log('Guest list response:', response.data);

        let guestData = [];
        
        // 處理不同的 API 回應格式
        if (Array.isArray(response.data)) {
          guestData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          guestData = response.data.data;
        } else if (response.data.guests && Array.isArray(response.data.guests)) {
          guestData = response.data.guests;
        }

        setGuests(guestData);
        setFilteredGuests(guestData);
        setError('');
      } catch (err: any) {
        console.error('Failed to fetch guest list:', err);
        setError('載入訪客清單失敗');
      } finally {
        setLoading(false);
      }
    };

    fetchGuestList();
  }, [eventId]);

  // 搜尋功能
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredGuests(guests);
      return;
    }

    const filtered = guests.filter(guest => {
      const fullName = `${guest.user.first_name} ${guest.user.last_name}`.toLowerCase();
      const email = guest.user.email.toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return fullName.includes(search) || email.includes(search);
    });

    setFilteredGuests(filtered);
  }, [searchTerm, guests]);

  // 排序功能
  const sortGuests = (criteria: 'name' | 'status' | 'joinDate') => {
    setSortBy(criteria);
    setShowSortMenu(false);

    const sorted = [...filteredGuests].sort((a, b) => {
      switch (criteria) {
        case 'name':
          const nameA = `${a.user.first_name} ${a.user.last_name}`;
          const nameB = `${b.user.first_name} ${b.user.last_name}`;
          return nameA.localeCompare(nameB);
          
        case 'status':
          // 已簽到的排在前面
          const statusA = a.checkin_at ? 0 : 1;
          const statusB = b.checkin_at ? 0 : 1;
          return statusA - statusB;
          
        case 'joinDate':
          return new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime();
          
        default:
          return 0;
      }
    });

    setFilteredGuests(sorted);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'name': return '姓名';
      case 'status': return '狀態';
      case 'joinDate': return '註冊時間';
      default: return '排序';
    }
  };

  const getCheckedInCount = () => {
    return guests.filter(guest => guest.checkin_at).length;
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
          <button
            onClick={() => navigate(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-xl text-[#133366]"
          >
            ←
          </button>
          <span className="flex-1 text-center text-lg font-bold text-[#133366]">
            Guest List
          </span>
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-lg text-[#133366]"
          >
            📊
          </button>
        </div>

        {/* Event Info */}
        {event && (
          <div className="px-4 mt-4 mb-2">
            <div className="bg-white rounded-xl shadow p-4">
              <div className="font-semibold text-[#133366] text-lg mb-1">
                {event.title}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                {event.date ? new Date(event.date).toLocaleString() : ''}
              </div>
              <div className="text-sm text-gray-600">
                {event.location}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 px-4">
          <div className="bg-white rounded-xl shadow">
            
            {/* Header Section */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#133366]">Guest List</h2>
                
                {/* Sort Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center space-x-2 bg-[#F0F2F5] px-3 py-2 rounded-lg text-sm"
                  >
                    🔄
                    <span>Sort By</span>
                  </button>
                  
                  {/* Sort Menu */}
                  {showSortMenu && (
                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={() => sortGuests('name')}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'name' ? 'bg-blue-50 text-blue-600' : ''}`}
                      >
                        姓名
                      </button>
                      <button
                        onClick={() => sortGuests('status')}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'status' ? 'bg-blue-50 text-blue-600' : ''}`}
                      >
                        簽到狀態
                      </button>
                      <button
                        onClick={() => sortGuests('joinDate')}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'joinDate' ? 'bg-blue-50 text-blue-600' : ''}`}
                      >
                        註冊時間
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search guest"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Stats */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <span>總參加者: {guests.length}</span>
                <span>已簽到: {getCheckedInCount()}</span>
              </div>
            </div>

            {/* Guest List */}
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#133366]"></div>
                  <span className="ml-2 text-gray-600">載入中...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">
                  {error}
                </div>
              ) : filteredGuests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? '找不到符合條件的訪客' : '暫無訪客資料'}
                </div>
              ) : (
                filteredGuests.map((guest) => (
                  <div key={guest._id} className="p-4 flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      {guest.user.avatar ? (
                        <img 
                          src={guest.user.avatar} 
                          alt="Avatar" 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <FontAwesomeIcon icon={faUser} className="text-gray-500 text-xl" />
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-medium text-gray-900 truncate">
                          {guest.user.first_name} {guest.user.last_name}
                        </h3>
                        {/* Premium/VIP indicator (if needed) */}
                        {guest.event_ticket && (
                          <FontAwesomeIcon icon={faCrown} className="text-orange-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {guest.user.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        註冊: {new Date(guest.joined_at).toLocaleDateString()}
                        {guest.checkin_at && (
                          <span className="ml-2">
                            簽到: {new Date(guest.checkin_at).toLocaleString()}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Check-in Status */}
                    <div className="flex-shrink-0">
                      {guest.checkin_at ? (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        {!loading && (
          <div className="text-center text-gray-500 text-sm mt-4 mb-8 px-4">
            顯示 {filteredGuests.length} / {guests.length} 位訪客
            {searchTerm && ` (搜尋: "${searchTerm}")`}
            {sortBy && ` • 排序: ${getSortLabel()}`}
          </div>
        )}

        {/* Sort Menu Overlay */}
        {showSortMenu && (
          <div 
            className="fixed inset-0 z-5"
            onClick={() => setShowSortMenu(false)}
          />
        )}
      </div>
    </motion.div>
  );
};

export default GuestList;