import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHouse, 
  faCalendar, 
  faUser, 
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

const SidebarNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { path: '/', icon: faHouse, label: 'Home' },
    { path: '/events', icon: faCalendar, label: 'Events' },
    { path: '/my-favorites', icon: faHeart, label: 'Favorites' },
    { path: '/profile', icon: faUser, label: 'Profile' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const response = await api.get('/users/profile');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleUserClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img src="/logo.svg" alt="Logo" className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-bold text-[#133366]">MyTec</h1>
            <p className="text-sm text-gray-500">Event Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-[#133366] text-white shadow-md'
                    : 'text-[#133366] hover:bg-gray-100'
                }`}
              >
                <FontAwesomeIcon 
                  icon={item.icon} 
                  className={`text-lg ${isActive(item.path) ? 'text-white' : 'text-[#133366]'}`} 
                />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={handleUserClick}
          className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-10 h-10 bg-[#133366] rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faUser} className="text-white" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            {loading ? (
              <p className="text-sm font-medium text-gray-400">Loading...</p>
            ) : user ? (
              <>
                <p className="text-sm font-medium text-[#133366] truncate">
                  {`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email || ''}</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-[#133366]">請先登錄</p>
                <p className="text-xs text-gray-500">點擊登入</p>
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default SidebarNav;
