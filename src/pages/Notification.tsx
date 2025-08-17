
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const notifications = [
  {
    id: 1,
    title: 'Seminar Time Changed',
    content: 'Dear members,',
    date: 'August 5 2024',
    unread: true,
  },
  {
    id: 2,
    title: 'ABC Wine: You are being invited!!',
    content: 'Dear Mary,',
    date: 'August 4 2024',
    unread: false,
  },
  {
    id: 3,
    title: 'New events by ABC Wine',
    content: 'Dear members,',
    date: 'August 1 2024',
    unread: false,
  },
  {
    id: 4,
    title: 'APP Updates at midnight',
    content: 'Dear members,',
    date: 'August 1 2024',
    unread: false,
  },
];

const Notification = () => {
  const navigate = useNavigate();
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
          <button onClick={() => navigate(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 text-2xl text-[#133366]">←</button>
          <span className="flex-1 text-center text-lg font-bold text-[#133366]">Notifications</span>
        </div>
        {/* Notification List */}
        <div className="flex-1 px-4 py-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="bg-white rounded-xl px-4 py-3 mb-2 shadow cursor-pointer relative"
              onClick={() => navigate('/notification-details')}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-[#133366]">{n.title}</div>
                  <div className="text-sm text-gray-500">{n.content}</div>
                </div>
                {n.unread && <span className="w-3 h-3 bg-yellow-400 rounded-full inline-block"></span>}
              </div>
              <div className="text-xs text-gray-400 mt-1">{n.date}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Notification; 