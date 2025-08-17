
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotificationDetails = () => {
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
          <span className="flex-1 text-center text-lg font-bold text-[#133366]">Notification Details</span>
        </div>
        {/* Details Content */}
        <div className="flex-1 px-4 py-4">
          <div className="font-bold text-[#133366] text-lg mb-1">ABC Wine: You are being invited!!<br/>Join our new event on August 8, 2024.</div>
          <div className="text-xs text-gray-400 mb-2">August 4 2024</div>
          <div className="text-base text-[#133366] mb-4">Dear Mary,</div>
          <div className="text-gray-700 mb-4">
            A new grand event held by ABC Wine Event will be held on August 8 2024, 3:00PM at The Executive Centre (TEC).<br/><br/>
            The purpose of this event is to let everybody try the new wine imported from Italy.<br/><br/>
            Looking forward to see you there!!<br/><br/>
            ABC Wine
          </div>
          {/* Event Card */}
          <div className="bg-white rounded-xl shadow p-4 flex items-center mb-4">
            <img src="https://images.unsplash.com/photo-1514361892635-cebb9b6c7ca5?auto=format&fit=crop&w=100&q=80" alt="Event" className="w-20 h-20 object-cover rounded-lg mr-4" />
            <div>
              <div className="font-semibold text-[#133366]">Flexible Workspace Formula</div>
              <div className="text-sm text-gray-600 flex items-center mb-1">
                <span className="mr-1">📅</span> <span>Tuesday, August 8 2024</span>
              </div>
              <div className="text-sm text-gray-600 flex items-center">
                <span className="mr-1">📍</span> <span>The Executive Centre (TEC)</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mb-2">
            Registration is opened now and will be ends on August 8 2024, 12:00 AM
          </div>
          <div className="text-xs text-gray-500">
            If you have any further queries please do not hesitate to contact ABC Wine.
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationDetails; 