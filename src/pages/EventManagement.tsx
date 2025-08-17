import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';


const managementOptions = [
  {
    id: 1,
    title: 'QR Code Check In',
    description: '掃描 QR Code 進行參加者報到',
    route: '/qr-checkin',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 2,
    title: 'Attendance Report',
    description: '查看參與人數統計報告',
    route: '/attendance-report',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 3,
    title: 'Guest List',
    description: '管理活動參加者名單',
    route: '/guest-list',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

const EventManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;

  const handleOptionClick = (option: typeof managementOptions[0]) => {
    if (option.route === '/qr-checkin' || option.route === '/guest-list') {
      // 導航到對應頁面，傳遞活動資訊
      navigate(option.route, { 
        state: { 
          event: event,
          eventId: event?._id || event?.id
        } 
      });
    } else {
      // 其他功能暫時顯示開發中
      alert(`即將前往：${option.title}\n功能：${option.description}\n\n此功能正在開發中...`);
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
          <button 
            onClick={() => navigate(-1)} 
            className="absolute left-2 top-1/2 -translate-y-1/2 text-2xl text-[#133366]"
          >
            ←
          </button>
          <span className="flex-1 text-center text-lg font-bold text-[#133366]">活動管理</span>
        </div>

        {/* Event Info */}
        {event && (
          <div className="px-4 py-3">
            <div className="bg-white rounded-xl px-4 py-3 shadow">
              <div className="font-semibold text-[#133366] text-base">{event.title}</div>
              <div className="text-sm text-gray-500">
                {event.date ? new Date(event.date).toLocaleString() : '--'}
              </div>
              <div className="text-sm text-gray-500">{event.location}</div>
            </div>
          </div>
        )}

        {/* Management Options */}
        <div className="flex-1 px-4 py-2">
          {managementOptions.map((option) => (
            <div
              key={option.id}
              className="bg-white rounded-xl px-4 py-4 mb-3 shadow cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleOptionClick(option)}
            >
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full ${option.bgColor} flex items-center justify-center mr-4`}>
                  <span className={`text-xl ${option.color} font-bold`}>
                    {option.id === 1 ? '📱' : option.id === 2 ? '📊' : '👥'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[#133366] text-base">{option.title}</div>
                  <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                </div>
                <div className="text-gray-400">
                  →
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="px-4 py-4">
          <div className="text-center text-sm text-gray-400">
            管理您的活動參加者和相關數據
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventManagement;
