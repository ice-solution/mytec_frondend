# Stripe API 整合指南

## 概述
本文檔描述了前端與後端 Stripe API 整合的完整流程和所需的 API 端點。

## 環境變量配置

### 前端環境變量 (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Stripe Configuration (可選，主要用於後端)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Environment
VITE_NODE_ENV=development
```

### 後端環境變量
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# API Configuration
API_URL=http://localhost:3000/api
```

## 後端 API 端點

### 1. 創建 Stripe Checkout Session
**端點**: `POST /api/checkout`

**請求體**:
```json
{
  "userId": "string (必填)",
  "eventId": "string (必填)",
  "ticketId": "string (必填)",
  "quantity": "number (可選，預設是 1)",
  "success_url": "string (可選，有預設值)",
  "cancel_url": "string (可選，有預設值)"
}
```

**響應**:
```json
{
  "success": true,
  "session_id": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

**後端實現示例**:
```javascript
// Express.js 示例
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
    
    // 計算總金額
    const amount = ticket.cost * quantity * 100; // 轉換為分
    
    // 設置預設 URL
    const defaultSuccessUrl = `${process.env.FRONTEND_URL}/checkout-success?event=${eventId}&user=${userId}`;
    const defaultCancelUrl = `${process.env.FRONTEND_URL}/checkout`;
    
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
      customer_email: req.user.email, // 如果有用戶認證
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

### 2. 創建 Payment Intent
**端點**: `POST /api/stripe/create-payment-intent`

**請求體**:
```json
{
  "event_id": "string",
  "ticket_id": "string (optional)",
  "amount": "number (in cents)",
  "currency": "string (default: 'hkd')"
}
```

**響應**:
```json
{
  "id": "pi_...",
  "amount": 2000,
  "currency": "hkd",
  "status": "requires_payment_method",
  "client_secret": "pi_..._secret_..."
}
```

### 3. 驗證支付狀態
**端點**: `GET /api/stripe/verify-payment/:sessionId`

**響應**:
```json
{
  "success": true,
  "paymentStatus": "succeeded",
  "eventId": "string",
  "userId": "string",
  "amount": 2000,
  "currency": "hkd"
}
```

### 4. 獲取支付歷史
**端點**: `GET /api/stripe/payment-history/:userId`

**響應**:
```json
{
  "success": true,
  "payments": [
    {
      "id": "pi_...",
      "amount": 2000,
      "currency": "hkd",
      "status": "succeeded",
      "event_title": "Event Name",
      "ticket_name": "VIP Ticket",
      "created_at": "2024-01-01T00:00:00Z",
      "payment_method": "card"
    }
  ]
}
```

### 5. 取消支付
**端點**: `POST /api/stripe/cancel-payment`

**請求體**:
```json
{
  "session_id": "string"
}
```

**響應**:
```json
{
  "success": true,
  "message": "Payment canceled successfully"
}
```

## Stripe Webhook 端點

### 1. 結帳完成 Webhook
**端點**: `POST /api/stripe/webhook/checkout-completed`

**請求體** (來自 Stripe):
```json
{
  "session_id": "cs_test_...",
  "customer_email": "user@example.com",
  "amount_total": 2000,
  "metadata": {
    "event_id": "string",
    "ticket_id": "string",
    "user_id": "string"
  }
}
```

### 2. 支付成功 Webhook
**端點**: `POST /api/stripe/webhook/payment-succeeded`

### 3. 支付失敗 Webhook
**端點**: `POST /api/stripe/webhook/payment-failed`

### 4. 發票支付成功 Webhook
**端點**: `POST /api/stripe/webhook/invoice-payment-succeeded`

### 5. 發票支付失敗 Webhook
**端點**: `POST /api/stripe/webhook/invoice-payment-failed`

## Webhook 處理示例

```javascript
// Express.js Webhook 處理示例
app.post('/api/stripe/webhook/checkout-completed', async (req, res) => {
  try {
    const { session_id, customer_email, amount_total, metadata } = req.body;
    
    // 驗證 webhook 簽名
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // 處理結帳完成事件
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // 自動加入活動
      await joinEvent({
        eventId: session.metadata.event_id,
        userId: session.metadata.user_id,
        paymentId: session.id,
        amount: session.amount_total,
      });
      
      // 發送確認郵件
      await sendConfirmationEmail({
        email: session.customer_email,
        eventId: session.metadata.event_id,
        amount: session.amount_total,
      });
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});
```

## 錯誤處理

### 常見錯誤類型
1. **card_error**: 卡片被拒絕
2. **rate_limit_error**: 請求過於頻繁
3. **invalid_request_error**: 無效請求
4. **api_connection_error**: 網絡連接錯誤
5. **api_error**: Stripe API 錯誤
6. **authentication_error**: 認證錯誤

### 錯誤響應格式
```json
{
  "success": false,
  "error": {
    "type": "card_error",
    "message": "Your card was declined.",
    "code": "card_declined"
  }
}
```

## 安全考慮

1. **Webhook 簽名驗證**: 始終驗證 Stripe webhook 簽名
2. **環境變量**: 不要在代碼中硬編碼 API 密鑰
3. **HTTPS**: 生產環境必須使用 HTTPS
4. **金額驗證**: 在後端驗證支付金額
5. **用戶認證**: 確保只有認證用戶可以創建支付會話

## 測試

### 測試卡片號碼
- **成功支付**: 4242 4242 4242 4242
- **需要驗證**: 4000 0025 0000 3155
- **被拒絕**: 4000 0000 0000 0002

### 測試流程
1. 使用測試 API 密鑰
2. 使用測試卡片號碼
3. 檢查 webhook 事件
4. 驗證支付狀態

## 部署檢查清單

- [ ] 設置生產環境 Stripe API 密鑰
- [ ] 配置 webhook 端點 URL
- [ ] 設置 webhook 簽名密鑰
- [ ] 測試完整的支付流程
- [ ] 設置錯誤監控
- [ ] 配置日誌記錄
