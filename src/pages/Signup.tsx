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
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col items-center justify-between px-4 py-8">
        {/* 頂部內容區塊 */}
        <div className="w-full max-w-xs flex flex-col items-center">
          <div className="mb-8"> 
            <img src="/logo.svg" alt="Logo" className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-[#133366] mb-1 text-center">Sign Up</h2>
          <p className="text-[#133366]/70 mb-6 text-sm text-center">Please fill-in your personal data to sign up</p>
        </div>

        {/* 表單卡片 */}
        <div className="w-full max-w-xs bg-white rounded-2xl shadow p-6 space-y-4">
          {error && (
            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-center">
              {error}
              {apiErrorMsg && <div className="mt-1 text-xs">{apiErrorMsg}</div>}
            </div>
          )}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Last Name */}
            <div>
              <label className="block text-xs text-[#133366] mb-1">Last Name</label>
              <input
                className="w-full border rounded-lg px-2 py-2 text-[#133366]"
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
            <div className="flex gap-2">
              <div className="w-1/3">
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
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-[#002e5d]"
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
                  className="w-full border rounded-lg px-2 py-2 text-[#133366] pr-10"
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
              className="w-full py-3 rounded-full bg-[#002e5d] text-white text-lg font-semibold mt-2"
            >
              Sign Up
            </button>
          </form>
        </div>

        {/* 底部內容區塊 */}
        <div className="mt-4 text-sm text-[#133366]/70 text-center">
          Already a Member?{' '}
          <button className="underline text-[#002e5d] font-semibold" onClick={() => navigate('/login')}>Log in now</button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Side - Signup Form */}
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="w-full max-w-md px-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[#133366] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl font-bold">M</span>
              </div>
              <h1 className="text-3xl font-bold text-[#133366] mb-2">Join MyTec!</h1>
              <p className="text-[#133366]/70">Create your account to get started</p>
            </div>

            {/* Signup Form */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-center">
                {error}
                {apiErrorMsg && <div className="mt-1 text-sm">{apiErrorMsg}</div>}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#133366] mb-2">First Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#133366] focus:border-transparent outline-none"
                    placeholder="Enter first name"
                    value={first_name}
                    onChange={e => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#133366] mb-2">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#133366] focus:border-transparent outline-none"
                    placeholder="Enter last name"
                    value={last_name}
                    onChange={e => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Phone Number Field */}
              <div>
                <label className="block text-sm font-medium text-[#133366] mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <div className="w-1/3">
                    <select
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#133366] focus:border-transparent outline-none text-[#133366]"
                      value={country_code}
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

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-[#133366] mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#133366] focus:border-transparent outline-none"
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Gender and Birth Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#133366] mb-2">Gender</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-[#133366]"
                        name="gender"
                        value="M"
                        checked={gender === 'M'}
                        onChange={e => setGender(e.target.value)}
                      />
                      <span className="ml-2 text-[#133366]">Male</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-[#133366]"
                        name="gender"
                        value="F"
                        checked={gender === 'F'}
                        onChange={e => setGender(e.target.value)}
                      />
                      <span className="ml-2 text-[#133366]">Female</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#133366] mb-2">Date of Birth</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#133366] focus:border-transparent outline-none"
                    value={birth}
                    onChange={e => setBirth(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Fields */}
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

              <div>
                <label className="block text-sm font-medium text-[#133366] mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#133366] focus:border-transparent outline-none pr-12"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#133366]/60 hover:text-[#133366]"
                    onClick={() => setShowConfirmPassword(v => !v)}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#133366] text-white rounded-lg font-semibold text-lg hover:bg-[#0f2a4d] transition-colors"
              >
                Create Account
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-8">
              <p className="text-[#133366]/70">
                Already have an account?{' '}
                <button
                  className="text-[#133366] font-semibold hover:underline"
                  onClick={() => navigate('/login')}
                >
                  Sign in
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