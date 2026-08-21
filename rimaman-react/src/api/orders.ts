import { apiClient } from './client';
import type { Order, OrderItem, ShippingAddress } from '../types';

export interface CreateOrderInput {
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount?: number;
  total: number;
  shippingAddress: ShippingAddress;
  deliveryMethod: Order['deliveryMethod'];
  paymentMethod: Order['paymentMethod'];
  promoCode?: string;
}

export function createOrder(input: CreateOrderInput): Promise<Order> {
  return apiClient.post<Order>('/orders', input);
}

export function fetchOrderByNumber(orderNumber: string): Promise<Order> {
  return apiClient.get<Order>(`/orders/${orderNumber}`);
}

// --- Administration ---

export function fetchAllOrders(): Promise<Order[]> {
  return apiClient.get<Order[]>('/orders');
}

export function updateOrderStatus(
  id: string,
  status: Partial<Pick<Order, 'orderStatus' | 'paymentStatus'>>,
): Promise<Order> {
  return apiClient.patch<Order>(`/orders/${id}/status`, status);
}
