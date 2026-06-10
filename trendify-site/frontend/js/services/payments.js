/**
 * Payments Service
 * Handles payment processing via Stripe
 */

import { apiService } from './api.js';
import { API_ENDPOINTS } from '../utils/config.js';

class PaymentsService {
  /**
   * Create payment intent
   */
  async createPaymentIntent(amount, orderId, currency = 'usd') {
    try {
      return await apiService.post(API_ENDPOINTS.payments.createIntent, {
        amount,
        order_id: orderId,
        currency,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Confirm payment
   */
  async confirmPayment(paymentIntentId, orderId) {
    try {
      return await apiService.post(API_ENDPOINTS.payments.confirmPayment, {
        payment_intent_id: paymentIntentId,
        order_id: orderId,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user orders
   */
  async getOrders(skip = 0, limit = 10) {
    try {
      return await apiService.get(`${API_ENDPOINTS.payments.orders}?skip=${skip}&limit=${limit}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user payments
   */
  async getPayments(skip = 0, limit = 10) {
    try {
      return await apiService.get(`${API_ENDPOINTS.payments.payments}?skip=${skip}&limit=${limit}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle Stripe webhook
   */
  async handleStripeWebhook(eventData) {
    try {
      return await apiService.post(API_ENDPOINTS.payments.webhook, eventData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Load Stripe script
   */
  async loadStripe(publishableKey) {
    try {
      if (!window.Stripe) {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        document.head.appendChild(script);
        
        return new Promise((resolve) => {
          script.onload = () => {
            resolve(window.Stripe(publishableKey));
          };
        });
      }
      return window.Stripe(publishableKey);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Process payment with Stripe
   */
  async processPayment(stripe, elements, clientSecret, amount, orderId) {
    try {
      const cardElement = elements.getElement('card');
      
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Confirm with backend
      const result = await this.confirmPayment(paymentIntent.id, orderId);
      
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        result,
      };
    } catch (error) {
      throw error;
    }
  }
}

export const paymentsService = new PaymentsService();
export default paymentsService;
