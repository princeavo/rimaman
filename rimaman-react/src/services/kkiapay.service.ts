// KKiaPay Payment Service
// Documentation: https://docs.kkiapay.me/

import type { PaymentRequest, PaymentResponse, KKiaPayTransaction } from '../types/payment';

declare global {
  interface Window {
    kkiapay?: {
      open: (options: {
        amount: number;
        position: string;
        callback: string;
        data: string;
        theme: string;
        key: string;
        sandbox: boolean;
      }) => void;
    };
    addKkiapayListener?: (
      event: string,
      callback: (response: KKiaPayTransaction) => void
    ) => void;
  }
}

export class KKiaPayService {
  private publicKey: string;
  private sandbox: boolean;
  private initialized = false;

  constructor(publicKey: string, sandbox = true) {
    this.publicKey = publicKey;
    this.sandbox = sandbox;
  }

  /**
   * Load KKiaPay SDK script
   */
  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.kkiapay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.kkiapay.me/k.js';
      script.async = true;
      script.onload = () => {
        // Wait a bit for the SDK to initialize
        setTimeout(() => resolve(), 100);
      };
      script.onerror = () => reject(new Error('Failed to load KKiaPay SDK'));
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize KKiaPay
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.loadScript();

    if (!window.kkiapay || !window.addKkiapayListener) {
      throw new Error('KKiaPay SDK not loaded');
    }

    this.initialized = true;
  }

  /**
   * Process payment with KKiaPay
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      await this.initialize();

      if (!window.kkiapay || !window.addKkiapayListener) {
        throw new Error('KKiaPay not initialized');
      }

      return new Promise((resolve) => {
        // Setup success listener
        window.addKkiapayListener!('success', (response: KKiaPayTransaction) => {
          resolve({
            success: true,
            transactionId: response.transactionId,
            status: 'approved',
            message: 'Paiement effectué avec succès',
          });
        });

        // Setup failed listener
        window.addKkiapayListener!('failed', (response: KKiaPayTransaction) => {
          resolve({
            success: false,
            transactionId: response.transactionId,
            status: 'declined',
            error: response.reason || 'Paiement échoué',
          });
        });

        // Setup pending listener (for mobile money)
        window.addKkiapayListener!('pending', (response: KKiaPayTransaction) => {
          resolve({
            success: true,
            transactionId: response.transactionId,
            status: 'pending',
            message: 'Paiement en attente de confirmation',
          });
        });

        // Open payment modal
        window.kkiapay!.open({
          amount: request.amount,
          position: 'center',
          callback: window.location.origin + '/api/kkiapay/callback',
          data: JSON.stringify({
            orderId: request.orderId,
            customer: request.customer,
          }),
          theme: '#006b32', // RIMAMAN primary color
          key: this.publicKey,
          sandbox: this.sandbox,
        });
      });
    } catch (error) {
      console.error('KKiaPay Error:', error);
      return {
        success: false,
        status: 'declined',
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  /**
   * Verify transaction status
   */
  async verifyTransaction(transactionId: string): Promise<PaymentResponse> {
    try {
      // In production, this should call your backend API
      // which will verify the transaction with KKiaPay API
      const response = await fetch(`/api/payments/verify/kkiapay/${transactionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to verify transaction');
      }

      const data = await response.json();
      
      return {
        success: data.status === 'SUCCESS',
        transactionId: data.transactionId,
        status: data.status === 'SUCCESS' ? 'approved' : 'declined',
        message: data.message,
      };
    } catch (error) {
      console.error('Verification Error:', error);
      return {
        success: false,
        error: 'Impossible de vérifier la transaction',
      };
    }
  }

  /**
   * Close payment modal
   */
  close(): void {
    // KKiaPay doesn't expose a close method, but we can remove the iframe
    const iframe = document.querySelector('iframe[src*="widget.kkiapay.me"]');
    if (iframe) {
      iframe.remove();
    }
  }
}

// Singleton instance
let kkiaPayInstance: KKiaPayService | null = null;

export const getKKiaPayService = (): KKiaPayService => {
  if (!kkiaPayInstance) {
    const publicKey = import.meta.env.VITE_KKIAPAY_PUBLIC_KEY || '';
    const sandbox = import.meta.env.VITE_KKIAPAY_SANDBOX !== 'false';
    
    if (!publicKey) {
      console.warn('KKiaPay public key not configured');
    }
    
    kkiaPayInstance = new KKiaPayService(publicKey, sandbox);
  }
  
  return kkiaPayInstance;
};
