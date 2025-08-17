import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const countryCodes = ['+852', '+853', '+86'];

const Signup = () => {
  const navigate = useNavigate();

  // State for form fields
  const [last_name, setLastName] = useState('');
  const [first_name, setFirstName] = useState('');
  const [country_code, setCountryCode] = useState(countryCodes[0]);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState(''); // 'M' or 'F'
  const [birth, setBirth] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [apiErrorMsg, setApiErrorMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setApiErrorMsg('');
    if (!gender) {
      setError('請選擇性別');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/auth/register`, {
        first_name,
        last_name,
        country_code,
        phone,
        email,
        gender,
        birth,
        password,
      });
      if (res.status === 200 || res.status === 201) {
        setShowSuccess(true);
      } else {
        setError('Sign up failed');
        setApiErrorMsg(res.data?.error?.msg || '');
      }
    } catch (err: any) {
      setError('Sign up failed');
      let apiMsg = '';
      const errorData = err.response?.data?.error;
      if (typeof errorData === 'string') {
        apiMsg = errorData;
      } else if (typeof errorData === 'object' && errorData?.msg) {
        apiMsg = errorData.msg;
      }
      setApiErrorMsg(apiMsg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-[#e6eff8] px-4 py-8"> {/* 最外層容器，確保全高、垂直排列、水平置中，並提供整體內邊距和分佈 */}
      {/* 頂部內容區塊 */}
      <div className="w-full max-w-xs flex flex-col items-center"> {/* 使用 max-w-xs 限制寬度並水平置中 */}
        <div className="mb-8"> 
          <img src="/logo.svg" alt="Logo" className="w-16 h-16 mx-auto" />
        </div>
        <h2 className="text-xl font-bold text-[#133366] mb-1 text-center">Sign Up</h2>
        <p className="text-[#133366]/70 mb-6 text-sm text-center">Please fill-in your personal data to sign up</p>
      </div>

      {/* 表單卡片 */}
      <div className="w-full max-w-xs bg-white rounded-2xl shadow p-6 space-y-4"> {/* 白色背景框，圓角，陰影，內邊距，垂直間距 */}
        {error && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-center">
            {error}
            {apiErrorMsg && <div className="mt-1 text-xs">{apiErrorMsg}</div>}
          </div>
        )}
        <form onSubmit={handleSignup} className="space-y-4"> {/* 表單內部元素垂直間距 */}
          {/* Last Name */}
          <div>
            <label className="block text-xs text-[#133366] mb-1">Last Name</label>
            <input
              className="w-full border rounded-lg px-2 py-2 text-[#133366]" // 輸入框樣式
              type="text"
              value={last_name}
              onChange={e => setLastName(e.target.value)}
              required
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block text-xs text-[#133366] mb-1">First Name</label>
            <input
              className="w-full border rounded-lg px-2 py-2 text-[#133366]"
              type="text"
              value={first_name}
              onChange={e => setFirstName(e.target.value)}
              required
            />
          </div>

          {/* Country Codes & Phone Number */}
          <div className="flex gap-2"> {/* 水平排列，元素間距 */}
            <div className="w-1/3"> {/* 國家代碼佔1/3寬度 */}
              <label className="block text-xs text-[#133366] mb-1">Country Codes</label>
              <select
                className="w-full border rounded-lg px-2 py-2 text-[#133366]"
                value={country_code}
                onChange={e => setCountryCode(e.target.value)}
              >
                {countryCodes.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>
            <div className="flex-1"> {/* 電話號碼佔剩餘空間 */}
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

          {/* Email */}
          <div>
            <label className="block text-xs text-[#133366] mb-1">Email</label>
            <input
              className="w-full border rounded-lg px-2 py-2 text-[#133366]"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Gender Radio Buttons */}
          <div>
            <label className="block text-xs text-[#133366] mb-1">Gender</label>
            <div className="flex gap-4"> {/* 水平排列，元素間距 */}
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-[#002e5d]" // 注意：form-radio 類別可能需要 @tailwindcss/forms 插件
                  name="gender"
                  value="M"
                  checked={gender === 'M'}
                  onChange={e => setGender(e.target.value)}
                />
                <span className="ml-2 text-[#133366]">M</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-[#002e5d]"
                  name="gender"
                  value="F"
                  checked={gender === 'F'}
                  onChange={e => setGender(e.target.value)}
                />
                <span className="ml-2 text-[#133366]">F</span>
              </label>
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs text-[#133366] mb-1">Date of Birth</label>
            <input
              className="w-full border rounded-lg px-2 py-2 text-[#133366]"
              type="date"
              value={birth}
              onChange={e => setBirth(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs text-[#133366] mb-1">Password</label>
            <div className="relative">
              <input
                className="w-full border rounded-lg px-2 py-2 text-[#133366] pr-10" // 預留眼睛圖示空間
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
                {showPassword ? '🙈' : '👁️'} {/* 眼睛圖示，可替換為 Heroicons */}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs text-[#133366] mb-1">Confirm Password</label>
            <div className="relative">
              <input
                className="w-full border rounded-lg px-2 py-2 text-[#133366] pr-10"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#133366]/60"
                onClick={() => setShowConfirmPassword(v => !v)}
                tabIndex={-1}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[#002e5d] text-white text-lg font-semibold mt-2" // 按鈕樣式
          >
            Sign Up
          </button>
        </form>
      </div>

      {/* 底部內容區塊 */}
      <div className="mt-4 text-sm text-[#133366]/70 text-center"> {/* 與上方表單間距，文字樣式 */}
        Already a Member?{' '}
        <button className="underline text-[#002e5d] font-semibold" onClick={() => navigate('/login')}>Log in now</button> {/* 連結樣式 */}
      </div>

      {/* Overlay for Register Success */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center w-72">
            <div className="text-lg font-bold text-[#133366] mb-6 text-center">Register Successed!</div>
            <button
              className="w-full py-3 rounded-full bg-[#002e5d] text-white text-base font-semibold"
              onClick={() => navigate('/login')}
            >
              Log In
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup; 