// Payment Service for handling different payment gateways

export interface PaymentRequest {
  amount: number;
  phoneNumber?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCVV?: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  status?: string;
}

export class PaymentService {
  // bKash Payment
  static async processBkashPayment(data: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch('/api/payment/bkash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'bKash payment failed. Please try again.',
      };
    }
  }

  // Nagad Payment
  static async processNagadPayment(data: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch('/api/payment/nagad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Nagad payment failed. Please try again.',
      };
    }
  }

  // Card Payment
  static async processCardPayment(data: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch('/api/payment/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Card payment failed. Please try again.',
      };
    }
  }

  // Rocket Payment (similar to bKash/Nagad)
  static async processRocketPayment(data: PaymentRequest): Promise<PaymentResponse> {
    try {
      // For now, using similar logic as bKash
      const response = await fetch('/api/payment/bkash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return {
        ...result,
        transactionId: result.transactionId?.replace('BKH', 'RKT'),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Rocket payment failed. Please try again.',
      };
    }
  }
}
