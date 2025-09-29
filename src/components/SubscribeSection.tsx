import { useState } from 'react';
import api from '../services/api';

const SubscribeSection = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      // 調用真實的 API
      const response = await api.post('/subscriptions/subscribe', {
        email: email.trim()
      });
      
      if (response.status === 200 || response.status === 201) {
        setIsSubscribed(true);
        setEmail('');
      }
    } catch (error: any) {
      console.error('Subscribe error:', error);
      // 可以在這裡添加錯誤提示
      alert('訂閱失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-700 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8 italic" style={{ fontFamily: 'serif' }}>
            Subscribe To Our Newsletter
          </h2>
          
          {isSubscribed ? (
            <div className="bg-green-600 text-white px-6 py-4 rounded-lg max-w-md mx-auto">
              <p className="font-medium">感謝訂閱！您將收到最新的活動資訊。</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-gray-600 text-white placeholder-gray-300 rounded-l-lg border-0 focus:outline-none"
                style={{ 
                  '--tw-ring-color': 'rgb(19 51 102 / var(--tw-bg-opacity))'
                } as React.CSSProperties}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgb(19 51 102 / var(--tw-bg-opacity))'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="text-white px-6 py-3 rounded-r-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                style={{ backgroundColor: 'rgb(19 51 102 / var(--tw-bg-opacity))' }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgb(0 46 93)'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgb(19 51 102 / var(--tw-bg-opacity))'}
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscribeSection;
