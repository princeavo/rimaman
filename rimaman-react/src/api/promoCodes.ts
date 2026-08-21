import { apiClient } from './client';

export interface PromoValidation {
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  discountAmount: number;
}

export function validatePromoCode(
  code: string,
  orderAmount: number,
): Promise<PromoValidation> {
  return apiClient.get<PromoValidation>(
    `/promo-codes/validate/${encodeURIComponent(code)}?orderAmount=${orderAmount}`,
  );
}
