// API 配置工具
export const getApiUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (!apiUrl) {
    console.warn('VITE_API_BASE_URL not set, using default: http://localhost:3000/api');
    return 'http://localhost:3000/api';
  }
  
  return apiUrl;
};

export const getStripePublishableKey = (): string | undefined => {
  return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
};

// 驗證 API URL 配置
export const validateApiConfig = (): boolean => {
  const apiUrl = getApiUrl();
  
  // 檢查是否指向前端服務器
  if (apiUrl.includes('localhost:5173') || (apiUrl.includes('localhost:3000') && !apiUrl.includes('/api'))) {
    console.error('❌ API URL 配置錯誤: 指向了前端服務器或缺少 /api 路徑');
    console.error('當前配置:', apiUrl);
    console.error('正確配置應該是: http://localhost:3000/api');
    return false;
  }
  
  console.log('✅ API URL 配置正確:', apiUrl);
  return true;
};

// 在開發環境中自動驗證配置
if (import.meta.env.DEV) {
  validateApiConfig();
}
