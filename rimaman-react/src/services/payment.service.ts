// Unified Payment Service
// Handles both FedaPay and KKiaPay

import type { PaymentProvider, PaymentRequest, PaymentResponse } from '../types/payment';
import { getFedaPayService } from './fedapay.service';
import { getKKiaPayService } from './kkiapay.service';

export class PaymentService {
  private provider: PaymentProvider;

  constructor(provider: PaymentProvider = 'fedapay') {
    this.provider = provider;
  }

  /**
   * Set payment provider
   */
  setProvider(provider: PaymentProvider): void {
    this.provider = provider;
  }

  /**
   * Get current provider
   */
  getProvider(): PaymentProvider {
    return this.provider;
  }

  /**
   * Process payment with selected provider
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (this.provider === 'fedapay') {
        const service = getFedaPayService();
        return await service.processPayment(request);
      } else {
        const service = getKKiaPayService();
        return await service.processPayment(request);
      }
    } catch (error) {
      console.error('Payment Error:', error);
      return {
        success: false,
        status: 'declined',
        error: error instanceof Error ? error.message : 'Erreur lors du paiement',
      };
    }
  }

  /**
   * Verify transaction
   */
  async verifyTransaction(transactionId: string): Promise<PaymentResponse> {
    try {
      if (this.provider === 'fedapay') {
        const service = getFedaPayService();
        return await service.verifyTransaction(transactionId);
      } else {
        const service = getKKiaPayService();
        return await service.verifyTransaction(transactionId);
      }
    } catch (error) {
      console.error('Verification Error:', error);
      return {
        success: false,
        error: 'Impossible de vérifier la transaction',
      };
    }
  }

  /**
   * Check if provider is configured
   */
  isConfigured(): boolean {
    if (this.provider === 'fedapay') {
      return !!import.meta.env.VITE_FEDAPAY_PUBLIC_KEY;
    } else {
      return !!import.meta.env.VITE_KKIAPAY_PUBLIC_KEY;
    }
  }

  /**
   * Get provider display name
   */
  getProviderName(): string {
    return this.provider === 'fedapay' ? 'FedaPay' : 'KKiaPay';
  }
}

// Singleton instance
let paymentServiceInstance: PaymentService | null = null;

export const getPaymentService = (): PaymentService => {
  if (!paymentServiceInstance) {
    // Default to FedaPay, but can be changed via setProvider()
    const defaultProvider = (import.meta.env.VITE_PAYMENT_PROVIDER as PaymentProvider) || 'fedapay';
    paymentServiceInstance = new PaymentService(defaultProvider);
  }
  
  return paymentServiceInstance;
};
