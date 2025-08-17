import { useNavigate } from 'react-router-dom';

const Splash = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pb-8">
      {/* 頂部固定高度佔位，推動內容下來 */}
      <div className="h-32 flex-shrink-0"></div>

      {/* 頂部內容區塊 (Logo + Welcome message) */}
      <div className="flex flex-col items-center">
        {/* Logo 區塊 */}
        <div className="mb-8">
          {/* 這裡可換成您的 SVG logo */}
          <img src="/logo.svg" alt="Logo" className="w-20 h-20 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-[#133366] mb-2 text-center">Welcome to Event</h1>
        {/* 這裡的 <p>&nbsp;</p> 用於佔位一行，模仿Figma中的文字下方空白 */}
        <p className="text-center text-[#133366]/70">&nbsp;</p>
      </div>

      {/* 中間主要彈性空間，將按鈕推到底部 */}

      {/* 底部按鈕區塊 */}
      <div className="flex flex-col items-center w-full px-4">
        <button
          className="w-full max-w-xs py-4 rounded-full bg-[#002e5d] text-white text-lg font-semibold mb-4 border-none shadow-none"
          onClick={() => navigate('/login')}
        >
          Log In
        </button>
        <button
          className="w-full max-w-xs py-4 rounded-full border-2 border-[#002e5d] text-[#002e5d] text-lg font-semibold bg-white shadow-none"
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Splash; 