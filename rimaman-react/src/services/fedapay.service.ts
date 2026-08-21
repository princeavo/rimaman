// FedaPay Payment Service
// Documentation: https://docs.fedapay.com/

import type { PaymentRequest, PaymentResponse, FedaPayTransaction } from '../types/payment';

declare global {
  interface Window {
    FedaPay?: {
      init: (config: { public_key: string; sandbox?: boolean }) => void;
      open: (options: {
        transaction: {
          amount: number;
          description: string;
        };
        customer: {
          firstname: string;
          lastname: string;
          email: string;
          phone_number: {
            number: string;
            country: string;
          };
        };
        onComplete: (transaction: FedaPayTransaction) => void;
        onError: (error: { message: string }) => void;
      }) => void;
    };
  }
}

export class FedaPayService {
  private publicKey: string;
  private sandbox: boolean;
  private initialized = false;

  constructor(publicKey: string, sandbox = true) {
    this.publicKey = publicKey;
    this.sandbox = sandbox;
  }

  /**
   * Load FedaPay SDK script
   */
  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.FedaPay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.fedapay.com/checkout.js?v=1.1.7';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load FedaPay SDK'));
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize FedaPay
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.loadScript();

    if (!window.FedaPay) {
      throw new Error('FedaPay SDK not loaded');
    }

    window.FedaPay.init({
      public_key: this.publicKey,
      sandbox: this.sandbox,
    });

    this.initialized = true;
  }

  /**
   * Process payment with FedaPay
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      await this.initialize();

      if (!window.FedaPay) {
        throw new Error('FedaPay not initialized');
      }

      return new Promise((resolve) => {
        const [firstname, ...lastnameArr] = request.customer.name.split(' ');
        const lastname = lastnameArr.join(' ') || firstname;

        window.FedaPay!.open({
          transaction: {
            amount: request.amount,
            description: request.description,
          },
          customer: {
            firstname,
            lastname,
            email: request.customer.email,
            phone_number: {
              number: request.customer.phone,
              country: 'BJ', // Bénin
            },
          },
          onComplete: (transaction: FedaPayTransaction) => {
            resolve({
              success: true,
              transactionId: transaction.reference,
              status: transaction.status === 'approved' ? 'approved' : 'pending',
              message: 'Paiement effectué avec succès',
            });
          },
          onError: (error: { message: string }) => {
            resolve({
              success: false,
              status: 'declined',
              error: error.message || 'Erreur lors du paiement',
            });
          },
        });
      });
    } catch (error) {
      console.error('FedaPay Error:', error);
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
      // which will verify the transaction with FedaPay API
      const response = await fetch(`/api/payments/verify/fedapay/${transactionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to verify transaction');
      }

      const data = await response.json();
      
      return {
        success: data.status === 'approved',
        transactionId: data.reference,
        status: data.status,
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
}

// Singleton instance
let fedaPayInstance: FedaPayService | null = null;

export const getFedaPayService = (): FedaPayService => {
  if (!fedaPayInstance) {
    const publicKey = import.meta.env.VITE_FEDAPAY_PUBLIC_KEY || '';
    const sandbox = import.meta.env.VITE_FEDAPAY_SANDBOX !== 'false';
    
    if (!publicKey) {
      console.warn('FedaPay public key not configured');
    }
    
    fedaPayInstance = new FedaPayService(publicKey, sandbox);
  }
  
  return fedaPayInstance;
};
