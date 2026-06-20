export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipping'
  | 'completed'
  | 'cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'shipping',
  'completed',
  'cancelled',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export interface Order {
  id: string;
  code: string;
  customerName: string;
  total: number;
  createdAt: string;
  status: OrderStatus;
}

export interface OrderItem {
  id: string;
  sku: string;
  name: string;
  unit: string;
  warehouse: string;
  lotNumber: string;
  expiryDate: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  note: string;
}

export interface OrderListParams {
  page: number;
  pageSize: number;
}
