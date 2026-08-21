// Payment Types for FedaPay and KKiaPay

export type PaymentProvider = 'fedapay' | 'kkiapay';

export type PaymentMethod = 'mtn' | 'moov' | 'card' | 'cash';

export interface PaymentConfig {
  provider: PaymentProvider;
  publicKey: string;
  sandbox?: boolean;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  orderId: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  status?: 'pending' | 'approved' | 'declined' | 'canceled';
  message?: string;
  error?: string;
}

export interface FedaPayTransaction {
  id: number;
  reference: string;
  amount: number;
  status: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface KKiaPayTransaction {
  transactionId: string;
  amount: number;
  status: string;
  reason?: string;
}
