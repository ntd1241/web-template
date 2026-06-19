import type { PaginationParams } from '@/types/api.types';

export type SupplierStatus = 'active' | 'paused' | 'stopped';

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact: string;
  phone: string;
  debt: number;
  status: SupplierStatus;
  startDate: string;
}

export interface SupplierListParams extends PaginationParams {
  keyword?: string;
}

export const SUPPLIER_STATUS_LABELS: Record<SupplierStatus, string> = {
  active: 'Đang hợp tác',
  paused: 'Tạm dừng',
  stopped: 'Ngừng hợp tác',
};
