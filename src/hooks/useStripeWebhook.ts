import { useEffect } from 'react';
// import api from '../services/api';

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

export const useStripeWebhook = () => {
  useEffect(() => {
    // 監聽來自 Stripe 的 webhook 事件
    // const handleStripeEvent = async (event: StripeWebhookEvent) => {
    //   try {
    //     switch (event.type) {
    //       case 'checkout.session.completed':
    //         await handleCheckoutCompleted(event.data.object);
    //         break;
    //       case 'payment_intent.succeeded':
    //         await handlePaymentSucceeded(event.data.object);
    //         break;
    //       case 'payment_intent.payment_failed':
    //         await handlePaymentFailed(event.data.object);
    //         break;
    //       case 'invoice.payment_succeeded':
    //         await handleInvoicePaymentSucceeded(event.data.object);
    //         break;
    //       case 'invoice.payment_failed':
    //         await handleInvoicePaymentFailed(event.data.object);
    //         break;
    //       default:
    //         console.log(`Unhandled event type: ${event.type}`);
    //     }
    //   } catch (error) {
    //     console.error('Error handling Stripe webhook event:', error);
    //   }
    // };

    // 這裡可以添加實際的 webhook 監聽器設置
    // 目前只是定義了處理函數，實際使用時需要根據具體需求來設置

    // 處理結帳完成事件
    // const handleCheckoutCompleted = async (session: any) => {
    //   try {
    //     await api.post('/stripe/webhook/checkout-completed', {
    //       session_id: session.id,
    //       customer_email: session.customer_email,
    //       amount_total: session.amount_total,
    //       metadata: session.metadata,
    //     });
    //     console.log('Checkout completed webhook processed');
    //   } catch (error) {
    //     console.error('Failed to process checkout completed webhook:', error);
    //   }
    // };

    // 處理支付成功事件
    // const handlePaymentSucceeded = async (paymentIntent: any) => {
    //   try {
    //     await api.post('/stripe/webhook/payment-succeeded', {
    //       payment_intent_id: paymentIntent.id,
    //       amount: paymentIntent.amount,
    //       currency: paymentIntent.currency,
    //       metadata: paymentIntent.metadata,
    //     });
    //     console.log('Payment succeeded webhook processed');
    //   } catch (error) {
    //     console.error('Failed to process payment succeeded webhook:', error);
    //   }
    // };

    // 處理支付失敗事件
    // const handlePaymentFailed = async (paymentIntent: any) => {
    //   try {
    //     await api.post('/stripe/webhook/payment-failed', {
    //       payment_intent_id: paymentIntent.id,
    //       amount: paymentIntent.amount,
    //       currency: paymentIntent.currency,
    //       metadata: paymentIntent.metadata,
    //       failure_reason: paymentIntent.last_payment_error?.message,
    //     });
    //     console.log('Payment failed webhook processed');
    //   } catch (error) {
    //     console.error('Failed to process payment failed webhook:', error);
    //   }
    // };

    // 處理發票支付成功事件
    // const handleInvoicePaymentSucceeded = async (invoice: any) => {
    //   try {
    //     await api.post('/stripe/webhook/invoice-payment-succeeded', {
    //       invoice_id: invoice.id,
    //       customer_id: invoice.customer,
    //       amount_paid: invoice.amount_paid,
    //       metadata: invoice.metadata,
    //     });
    //     console.log('Invoice payment succeeded webhook processed');
    //   } catch (error) {
    //     console.error('Failed to process invoice payment succeeded webhook:', error);
    //   }
    // };

    // 處理發票支付失敗事件
    // const handleInvoicePaymentFailed = async (invoice: any) => {
    //   try {
    //     await api.post('/stripe/webhook/invoice-payment-failed', {
    //       invoice_id: invoice.id,
    //       customer_id: invoice.customer,
    //       amount_due: invoice.amount_due,
    //       metadata: invoice.metadata,
    //     });
    //     console.log('Invoice payment failed webhook processed');
    //   } catch (error) {
    //     console.error('Failed to process invoice payment failed webhook:', error);
    //   }
    // };

    // 返回清理函數
    return () => {
      // 清理 webhook 監聽器（如果需要）
    };
  }, []);
};

export default useStripeWebhook;
