import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faCalendar, faChartBar, faUser, faQrcode } from '@fortawesome/free-solid-svg-icons';

const FooterNav = () => {
  const navigate = useNavigate();
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-white rounded-full shadow-lg flex justify-around items-center py-2 px-2 z-50">
      <button className="flex flex-col items-center text-xs text-[#133366]" onClick={() => navigate('/')}>
        <FontAwesomeIcon icon={faHouse} className="text-2xl" />
        <span>Home</span>
      </button>
      <button className="flex flex-col items-center text-xs text-[#133366]" onClick={() => navigate('/events')}>
        <FontAwesomeIcon icon={faCalendar} className="text-2xl" />
        <span>Events</span>
      </button>
      <button className="relative flex flex-col items-center text-xs">
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-[#D1A65E] rounded-full flex items-center justify-center shadow-lg border-4 border-white">
          <FontAwesomeIcon icon={faQrcode} className="text-2xl text-white" />
        </span>
        <span className="mt-8 text-[#D1A65E] font-bold" onClick={() => navigate('/manage')}>Manage</span>
      </button>
      <button className="flex flex-col items-center text-xs text-[#133366]" onClick={() => navigate('/report')}>
        <FontAwesomeIcon icon={faChartBar} className="text-2xl" />
        <span>Report</span>
      </button>
      <button className="flex flex-col items-center text-xs text-[#133366] font-bold" onClick={() => navigate('/profile')}>
        <FontAwesomeIcon icon={faUser} className="text-2xl" />
        <span>Profile</span>
      </button>
    </div>
  );
};

export default FooterNav;