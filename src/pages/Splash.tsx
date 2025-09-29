import { useNavigate } from 'react-router-dom';

const Splash = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col items-center px-4 pb-8">
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

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Side - Welcome Content */}
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="w-full max-w-md px-8 text-center">
            {/* Logo */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-[#133366] rounded-full flex items-center justify-center mx-auto mb-6">
                <img src="/logo.svg" alt="Logo" className="w-16 h-16" />
              </div>
              <h1 className="text-4xl font-bold text-[#133366] mb-4">Welcome to Event</h1>
              <p className="text-lg text-[#133366]/70 mb-8">Discover and book amazing events in your area</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                className="w-full py-4 bg-[#133366] text-white rounded-lg font-semibold text-lg hover:bg-[#0f2a4d] transition-colors"
                onClick={() => navigate('/login')}
              >
                Log In
              </button>
              <button
                className="w-full py-4 border-2 border-[#133366] text-[#133366] rounded-lg font-semibold text-lg hover:bg-[#133366] hover:text-white transition-colors"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </button>
            </div>

            {/* Features */}
            <div className="mt-12 text-left">
              <h3 className="text-lg font-semibold text-[#133366] mb-4">Why choose us?</h3>
              <ul className="space-y-2 text-[#133366]/70">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#133366] rounded-full mr-3"></span>
                  Easy event discovery
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#133366] rounded-full mr-3"></span>
                  Secure booking system
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#133366] rounded-full mr-3"></span>
                  Real-time notifications
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side - Background Image */}
        <div className="flex-1 relative">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/login.jpg)',
            }}
          />
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Overlay Content */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <div className="text-center text-white p-8">
              <h2 className="text-3xl font-bold mb-4">Join the Community</h2>
              <p className="text-lg opacity-90">Connect with like-minded people and create unforgettable memories</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Splash; 