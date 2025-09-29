import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const countryCodes = ['+852', '+853', '+86'];

const Login = () => {
  const navigate = useNavigate();
  const [countryCode, setCountryCode] = useState(countryCodes[0]);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // 預留 API 呼叫位置
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/login`, {
        country_code: countryCode,
        phone,
        password,
      });
      if (res.status === 200 || res.status === 201) {
        localStorage.setItem('token', res.data.token); // 儲存 JWT token
        navigate('/');
      } else {
        setError('登入失敗，請檢查電話號碼及密碼');
      }
    } catch (err: any) {
      // 處理 API 回傳錯誤格式
      let msg = '登入失敗，請檢查電話號碼及密碼';
      if (err.response && err.response.data) {
        if (typeof err.response.data.error === 'string') {
          msg = err.response.data.error;
        } else if (err.response.data.error && err.response.data.error.msg) {
          msg = err.response.data.error.msg;
        }
      }
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col items-center justify-between px-4 py-8">
        <div className="w-full max-w-xs flex flex-col items-center">
          <div className="mb-8">
            <img src="/logo.svg" alt="Logo" className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-[#133366] mb-1 text-center">Welcome to Event</h2>
          <p className="text-[#133366]/70 mb-6 text-sm text-center">Please enter phone number and password to log in</p>
        </div>

        <div className="w-full max-w-xs flex flex-col items-center">
          {error && (
            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="w-full bg-white rounded-2xl shadow p-6 space-y-4">
            <div className="flex gap-2">
              <div className="w-1/3">
                <label className="block text-xs text-[#133366] mb-1">Country Codes</label>
                <select
                  className="w-full border rounded-lg px-2 py-2 text-[#133366]"
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                >
                  {countryCodes.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-[#133366] mb-1">Phone Number</label>
                <input
                  className="w-full border rounded-lg px-2 py-2 text-[#133366]"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#133366] mb-1">Password</label>
              <div className="relative">
                <input
                  className={`w-full border rounded-lg px-2 py-2 text-[#133366] pr-10 ${error ? 'border-red-500' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#133366]/60"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <div className="text-right mt-1">
                <button type="button" className="text-xs text-[#133366]/70 underline" onClick={() => navigate('/forgot-password')}>Forgot Password</button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#002e5d] text-white text-lg font-semibold mt-2"
            >
              Log In
            </button>
          </form>
          <div className="mt-4 text-sm text-[#133366]/70 text-center">
            Not a Member yet?{' '}
            <button className="underline text-[#002e5d] font-semibold" onClick={() => navigate('/signup')}>Sign Up now</button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="w-full max-w-md px-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[#133366] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl font-bold">M</span>
              </div>
              <h1 className="text-3xl font-bold text-[#133366] mb-2">Welcome Back!</h1>
              <p className="text-[#133366]/70">Please sign in to your account</p>
            </div>

            {/* Login Form */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Phone Number Field */}
              <div>
                <label className="block text-sm font-medium text-[#133366] mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <div className="w-1/3">
                    <select
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#133366] focus:border-transparent outline-none text-[#133366]"
                      value={countryCode}
                      onChange={e => setCountryCode(e.target.value)}
                    >
                      {countryCodes.map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#133366] focus:border-transparent outline-none"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-[#133366] mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#133366] focus:border-transparent outline-none pr-12"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#133366]/60 hover:text-[#133366]"
                    onClick={() => setShowPassword(v => !v)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm text-[#133366] hover:underline"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#133366] text-white rounded-lg font-semibold text-lg hover:bg-[#0f2a4d] transition-colors"
              >
                Sign in
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center mt-8">
              <p className="text-[#133366]/70">
                Don't have an account?{' '}
                <button
                  className="text-[#133366] font-semibold hover:underline"
                  onClick={() => navigate('/signup')}
                >
                  Sign up
                </button>
              </p>
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
        </div>
      </div>
    </div>
  );
};

export default Login;