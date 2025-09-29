# Checkout API 使用示例

## 環境配置

### 環境變量設置
創建 `.env.local` 文件：
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Stripe Configuration (主要用於後端)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Environment
VITE_NODE_ENV=development
```

**重要**: 
- `VITE_API_BASE_URL` 應該指向你的後端服務器，包含 `/api` 路徑
- `/checkout` 端點是 `/api` 下的路徑，完整 URL 為 `http://localhost:3000/api/checkout`

## 前端調用示例

### 基本用法
```javascript
import stripeService from '../services/stripeService';

const handleCheckout = async () => {
  try {
    const sessionData = {
      userId: "64f1a2b3c4d5e6f7g8h9i0j1",  // 必填
      eventId: "64f1a2b3c4d5e6f7g8h9i0j2", // 必填
      ticketId: "64f1a2b3c4d5e6f7g8h9i0j3", // 必填
      quantity: 2,  // 可選，預設是 1
      success_url: "https://yourdomain.com/success",  // 可選，有預設值
      cancel_url: "https://yourdomain.com/cancel"     // 可選，有預設值
    };
    
    const session = await stripeService.createCheckoutSession(sessionData);
    stripeService.redirectToCheckout(session.url);
  } catch (error) {
    console.error('Checkout failed:', error);
  }
};
```

### 在 Checkout 頁面中的使用
```javascript
const handleCheckout = async () => {
  if (total === 0) {
    // 免費活動直接加入
    handleJoinEvent();
  } else {
    // 付費活動創建 Stripe session
    setLoading(true);
    setError('');
    
    try {
      const successUrl = `${window.location.origin}/checkout-success?event=${event._id}&user=${user?._id}`;
      const cancelUrl = `${window.location.origin}/checkout`;
      
      const sessionData = {
        userId: user._id,
        eventId: event._id,
        ticketId: ticket?._id || '',
        quantity: qty,
        success_url: successUrl,
        cancel_url: cancelUrl,
      };
      
      const session = await stripeService.createCheckoutSession(sessionData);
      stripeService.redirectToCheckout(session.url);
      
    } catch (err: any) {
      console.error('Stripe checkout error:', err);
      setError(stripeService.handleStripeError(err));
    } finally {
      setLoading(false);
    }
  }
};
```

## 後端 API 實現

### Express.js 路由
```javascript
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

app.post('/api/checkout', async (req, res) => {
  try {
    const { userId, eventId, ticketId, quantity = 1, success_url, cancel_url } = req.body;
    
    // 驗證必填欄位
    if (!userId || !eventId || !ticketId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, eventId, ticketId'
      });
    }
    
    // 獲取活動和票券資訊
    const event = await Event.findById(eventId);
    const ticket = await Ticket.findById(ticketId);
    
    if (!event || !ticket) {
      return res.status(404).json({
        success: false,
        message: 'Event or ticket not found'
      });
    }
    
    // 設置預設 URL
    const defaultSuccessUrl = `${process.env.FRONTEND_URL}/checkout-success?event=${eventId}&user=${userId}`;
    const defaultCancelUrl = `${process.env.FRONTEND_URL}/checkout`;
    
    // 創建 Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'hkd',
            product_data: {
              name: event.title,
              description: `Ticket: ${ticket.ticket_name}`,
            },
            unit_amount: ticket.cost * 100, // 轉換為分
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: success_url || defaultSuccessUrl,
      cancel_url: cancel_url || defaultCancelUrl,
      metadata: {
        event_id: eventId,
        ticket_id: ticketId,
        user_id: userId,
        quantity: quantity.toString(),
      },
    });

    res.json({
      success: true,
      session_id: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
    });
  }
});
```

### 環境變量設置
```env
# .env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
FRONTEND_URL=http://localhost:5173
```

## 錯誤處理

### 常見錯誤情況
1. **缺少必填欄位**
```json
{
  "success": false,
  "message": "Missing required fields: userId, eventId, ticketId"
}
```

2. **活動或票券不存在**
```json
{
  "success": false,
  "message": "Event or ticket not found"
}
```

3. **Stripe API 錯誤**
```json
{
  "success": false,
  "message": "Failed to create checkout session"
}
```

### 前端錯誤處理
```javascript
try {
  const session = await stripeService.createCheckoutSession(sessionData);
  stripeService.redirectToCheckout(session.url);
} catch (error) {
  if (error.message.includes('Missing required fields')) {
    setError('請填寫所有必填欄位');
  } else if (error.message.includes('not found')) {
    setError('活動或票券不存在');
  } else {
    setError('支付系統暫時無法使用，請稍後再試');
  }
}
```

## 測試

### 測試數據
```javascript
const testData = {
  userId: "64f1a2b3c4d5e6f7g8h9i0j1",
  eventId: "64f1a2b3c4d5e6f7g8h9i0j2", 
  ticketId: "64f1a2b3c4d5e6f7g8h9i0j3",
  quantity: 1
};
```

### 測試卡片
- **成功支付**: 4242 4242 4242 4242
- **需要驗證**: 4000 0025 0000 3155
- **被拒絕**: 4000 0000 0000 0002

## 完整流程

1. **用戶選擇票券** → 前端收集 userId, eventId, ticketId
2. **點擊結帳** → 調用 `/api/checkout`
3. **後端驗證** → 檢查活動和票券存在性
4. **創建 Session** → 調用 Stripe API
5. **返回 URL** → 前端重定向到 Stripe
6. **用戶付款** → 在 Stripe 頁面完成支付
7. **支付成功** → 重定向到 success_url
8. **處理結果** → 前端驗證並加入活動
