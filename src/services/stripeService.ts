import api from './api';
import { getApiUrl } from '../utils/apiConfig';

export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
}

export interface CreateCheckoutSessionData {
  userId: string;
  eventId: string;
  ticketId: string;
  quantity?: number;
  success_url?: string;
  cancel_url?: string;
}

export interface CheckoutResponse {
  success?: boolean;
  session_id?: string;
  sessionId?: string;
  id?: string;
  checkout_session_id?: string;
  url?: string;
  checkout_url?: string;
  redirect_url?: string;
  stripe_url?: string;
  payment_url?: string;
  message?: string;
  // 支持其他可能的響應格式
  [key: string]: any;
}

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

class StripeService {
  private getBaseUrl() {
    return `${getApiUrl()}/stripe`;
  }

  /**
   * 創建 Stripe Checkout Session
   * 使用系統建議的 /api/checkout 端點
   */
  async createCheckoutSession(data: CreateCheckoutSessionData): Promise<StripeCheckoutSession> {
    try {
      // 使用完整的 API URL，因為 /checkout 是 /api 下的端點
      const response = await fetch(`${getApiUrl()}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // 添加認證
        },
        body: JSON.stringify({
          userId: data.userId,
          eventId: data.eventId,
          ticketId: data.ticketId,
          quantity: data.quantity || 1,
          success_url: data.success_url,
          cancel_url: data.cancel_url,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const result: CheckoutResponse = await response.json();
      console.log('API Response:', result); // 調試日誌

      // 檢查響應格式，支持不同的響應結構
      if (result.success === false) {
        throw new Error(result.message || 'Failed to create checkout session');
      }

      // 支持更多的響應格式變體
      const sessionId = result.session_id || result.sessionId || result.id || result.checkout_session_id;
      const url = result.url || result.checkout_url || result.redirect_url || result.stripe_url || result.payment_url;

      console.log('Extracted sessionId:', sessionId);
      console.log('Extracted url:', url);

      // 如果沒有找到標準格式，嘗試從響應中尋找任何包含 'session' 或 'checkout' 的字段
      if (!sessionId || !url) {
        console.log('Standard fields not found, searching for alternative formats...');
        
        // 尋找可能的 session ID
        const possibleSessionId = Object.keys(result).find(key => 
          key.toLowerCase().includes('session') && 
          typeof result[key] === 'string' && 
          result[key].startsWith('cs_')
        );
        
        // 尋找可能的 URL
        const possibleUrl = Object.keys(result).find(key => 
          key.toLowerCase().includes('url') && 
          typeof result[key] === 'string' && 
          result[key].startsWith('http')
        );
        
        if (possibleSessionId && possibleUrl) {
          console.log('Found alternative format:', possibleSessionId, possibleUrl);
          return {
            sessionId: result[possibleSessionId],
            url: result[possibleUrl],
          };
        }
        
        console.error('Missing session_id or url in response:', result);
        console.error('Available keys in response:', Object.keys(result));
        throw new Error(`Invalid response format from server. Expected session_id and url, but got: ${JSON.stringify(result)}`);
      }

      return {
        sessionId,
        url,
      };
    } catch (error: any) {
      console.error('Failed to create Stripe checkout session:', error);
      throw new Error(error.message || 'Failed to create payment session');
    }
  }

  /**
   * 創建 Payment Intent
   * 用於自定義支付流程（如果需要）
   */
  async createPaymentIntent(data: {
    eventId: string;
    ticketId?: string;
    amount: number;
    currency?: string;
  }): Promise<StripePaymentIntent> {
    try {
      const response = await api.post(`${this.getBaseUrl()}/create-payment-intent`, {
        event_id: data.eventId,
        ticket_id: data.ticketId,
        amount: data.amount,
        currency: data.currency || 'hkd',
      });

      return response.data;
    } catch (error: any) {
      console.error('Failed to create payment intent:', error);
      throw new Error(error.response?.data?.message || 'Failed to create payment intent');
    }
  }

  /**
   * 驗證支付狀態
   * 用於確認支付是否成功
   */
  async verifyPayment(sessionId: string): Promise<{
    success: boolean;
    paymentStatus: string;
    eventId?: string;
    userId?: string;
  }> {
    try {
      const response = await api.get(`${this.getBaseUrl()}/verify-payment/${sessionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to verify payment:', error);
      throw new Error(error.response?.data?.message || 'Failed to verify payment');
    }
  }

  /**
   * 獲取支付歷史
   * 用於顯示用戶的支付記錄
   */
  async getPaymentHistory(userId: string): Promise<any[]> {
    try {
      const response = await api.get(`${this.getBaseUrl()}/payment-history/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to get payment history:', error);
      throw new Error(error.response?.data?.message || 'Failed to get payment history');
    }
  }

  /**
   * 取消支付
   * 用於取消未完成的支付
   */
  async cancelPayment(sessionId: string): Promise<boolean> {
    try {
      const response = await api.post(`${this.getBaseUrl()}/cancel-payment`, {
        session_id: sessionId,
      });
      return response.data.success;
    } catch (error: any) {
      console.error('Failed to cancel payment:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel payment');
    }
  }

  /**
   * 重定向到 Stripe Checkout
   */
  redirectToCheckout(sessionUrl: string, sessionId: string): void {
    // 在重定向前保存 session 信息
    this.saveCheckoutSession(sessionId, sessionUrl);
    window.location.href = sessionUrl;
  }

  /**
   * 保存 checkout session 信息到 localStorage
   */
  private saveCheckoutSession(sessionId: string, sessionUrl: string): void {
    const checkoutData = {
      sessionId,
      sessionUrl,
      timestamp: Date.now(),
      status: 'pending'
    };
    localStorage.setItem('stripe_checkout_session', JSON.stringify(checkoutData));
  }

  /**
   * 獲取保存的 checkout session 信息
   */
  getSavedCheckoutSession(): any | null {
    try {
      const saved = localStorage.getItem('stripe_checkout_session');
      if (!saved) return null;
      
      const data = JSON.parse(saved);
      
      // 檢查 session 是否過期（30分鐘）
      const thirtyMinutes = 30 * 60 * 1000;
      if (Date.now() - data.timestamp > thirtyMinutes) {
        this.clearCheckoutSession();
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error reading saved checkout session:', error);
      return null;
    }
  }

  /**
   * 清除保存的 checkout session 信息
   */
  clearCheckoutSession(): void {
    localStorage.removeItem('stripe_checkout_session');
  }

  /**
   * 檢查是否有進行中的 checkout session
   */
  hasActiveCheckoutSession(): boolean {
    const saved = this.getSavedCheckoutSession();
    return saved !== null && saved.status === 'pending';
  }

  /**
   * 處理 Stripe 錯誤
   */
  handleStripeError(error: any): string {
    // 處理 Stripe 特定錯誤
    if (error.type === 'card_error') {
      return 'Your card was declined. Please try a different payment method.';
    } else if (error.type === 'rate_limit_error') {
      return 'Too many requests. Please try again later.';
    } else if (error.type === 'invalid_request_error') {
      return 'Invalid request. Please check your information.';
    } else if (error.type === 'api_connection_error') {
      return 'Network error. Please check your connection.';
    } else if (error.type === 'api_error') {
      return 'Payment service error. Please try again.';
    } else if (error.type === 'authentication_error') {
      return 'Authentication error. Please try again.';
    }
    
    // 處理普通 JavaScript 錯誤
    if (error.message) {
      // 如果是我們自定義的錯誤訊息，直接返回
      if (error.message.includes('Failed to create') || 
          error.message.includes('Invalid response') ||
          error.message.includes('Missing required fields') ||
          error.message.includes('not found')) {
        return error.message;
      }
      
      // 處理網絡錯誤
      if (error.message.includes('fetch')) {
        return 'Network error. Please check your connection and try again.';
      }
      
      // 處理 JSON 解析錯誤
      if (error.message.includes('JSON') || error.message.includes('Unexpected token')) {
        return 'Server response error. Please try again.';
      }
      
      // 返回原始錯誤訊息
      return error.message;
    }
    
    // 默認錯誤訊息
    return 'An unexpected error occurred. Please try again.';
  }
}

export default new StripeService();
