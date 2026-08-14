import { z } from 'zod';
import type { TagFilterOption } from '../../shared/tag-filter';

export const CUSTOMER_STATUSES = ['active', 'inactive'] as const;
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

export const BUSINESS_TYPES = ['individual', 'organization'] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  active: 'Đang hoạt động',
  inactive: 'Ngừng hoạt động',
};

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  individual: 'Cá nhân',
  organization: 'Doanh nghiệp',
};

export const customerFormSchema = z.object({
  customerCode: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập mã khách hàng.')
    .regex(/^[A-Za-z0-9-]+$/, 'Mã chỉ gồm chữ, số và dấu gạch ngang.'),
  name: z.string().trim().min(1, 'Vui lòng nhập tên khách hàng.'),
  businessType: z.enum(BUSINESS_TYPES),
  phone: z.string().trim(),
  email: z.string().trim().email('Email không hợp lệ.').or(z.literal('')),
  address: z.string().trim(),
  status: z.enum(CUSTOMER_STATUSES),
  note: z.string().trim().max(500, 'Ghi chú không được quá 500 ký tự.'),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export interface Customer {
  id: string;
  tenantId: string;
  customerCode: string;
  name: string;
  businessType: BusinessType;
  phone: string;
  email: string;
  address: string;
  status: CustomerStatus;
  note: string;
}

export interface CustomerRow {
  id: string;
  tenant_id: string;
  customer_code: string;
  name: string;
  business_type: BusinessType;
  phone: string;
  email: string;
  address: string;
  status: CustomerStatus;
  note: string;
}

export interface CustomerTagFilterData {
  options: TagFilterOption[];
  customerIdsByTagId: Record<string, string[]>;
}

export const emptyCustomerForm: CustomerFormValues = {
  customerCode: '',
  name: '',
  businessType: 'individual',
  phone: '',
  email: '',
  address: '',
  status: 'active',
  note: '',
};

export function mapCustomerRow(row: CustomerRow): Customer {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    customerCode: row.customer_code,
    name: row.name,
    businessType: row.business_type,
    phone: row.phone,
    email: row.email,
    address: row.address,
    status: row.status,
    note: row.note,
  };
}

export function mapCustomerToFormValues(
  customer: Customer,
): CustomerFormValues {
  return {
    customerCode: customer.customerCode,
    name: customer.name,
    businessType: customer.businessType,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    status: customer.status,
    note: customer.note,
  };
}
