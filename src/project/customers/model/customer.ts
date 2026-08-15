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

export const CUSTOMER_COUNTRY_OPTIONS = [
  { value: 'VN', label: 'Việt Nam' },
  { value: 'US', label: 'Hoa Kỳ' },
  { value: 'JP', label: 'Nhật Bản' },
  { value: 'KR', label: 'Hàn Quốc' },
  { value: 'CN', label: 'Trung Quốc' },
  { value: 'SG', label: 'Singapore' },
  { value: 'TH', label: 'Thái Lan' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'AU', label: 'Úc' },
  { value: 'GB', label: 'Vương quốc Anh' },
  { value: 'DE', label: 'Đức' },
  { value: 'FR', label: 'Pháp' },
  { value: 'CA', label: 'Canada' },
  { value: 'IN', label: 'Ấn Độ' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'PH', label: 'Philippines' },
  { value: 'TW', label: 'Đài Loan' },
  { value: 'HK', label: 'Hồng Kông' },
  { value: 'AE', label: 'Các Tiểu vương quốc Ả Rập Thống nhất' },
  { value: 'IT', label: 'Ý' },
  { value: 'ES', label: 'Tây Ban Nha' },
  { value: 'RU', label: 'Nga' },
  { value: 'BR', label: 'Brazil' },
  { value: 'CH', label: 'Thụy Sĩ' },
  { value: 'SE', label: 'Thụy Điển' },
  { value: 'NZ', label: 'New Zealand' },
] as const;

export const customerFormSchema = z.object({
  customerCode: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập mã khách hàng.')
    .regex(/^[A-Za-z0-9-]+$/, 'Mã chỉ gồm chữ, số và dấu gạch ngang.'),
  name: z.string().trim().min(1, 'Vui lòng nhập tên khách hàng.'),
  businessType: z.enum(BUSINESS_TYPES),
  businessRegistrationCode: z.string().trim(),
  imageUrl: z.string().trim(),
  countryCode: z
    .string()
    .trim()
    .regex(/^[A-Z]{2}$/, 'Mã quốc gia phải gồm 2 chữ cái viết hoa.'),
  regionCode: z.string().trim(),
  regionName: z.string().trim(),
  phone: z.string().trim(),
  email: z.string().trim().email('Email không hợp lệ.').or(z.literal('')),
  addressDetail: z.string().trim(),
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
  businessRegistrationCode: string;
  imageUrl: string | null;
  countryCode: string;
  regionCode: string | null;
  regionName: string;
  phone: string;
  email: string;
  addressDetail: string;
  status: CustomerStatus;
  note: string;
}

export interface CustomerRow {
  id: string;
  tenant_id: string;
  customer_code: string;
  name: string;
  business_type: BusinessType;
  business_registration_code: string;
  image_url: string | null;
  country_code: string;
  region_code: string | null;
  region_name: string;
  phone: string;
  email: string;
  address_detail: string;
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
  businessRegistrationCode: '',
  imageUrl: '',
  countryCode: 'VN',
  regionCode: '',
  regionName: '',
  phone: '',
  email: '',
  addressDetail: '',
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
    businessRegistrationCode: row.business_registration_code ?? '',
    imageUrl: row.image_url,
    countryCode: row.country_code ?? 'VN',
    regionCode: row.region_code,
    regionName: row.region_name ?? '',
    phone: row.phone,
    email: row.email,
    addressDetail: row.address_detail,
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
    businessRegistrationCode: customer.businessRegistrationCode,
    imageUrl: customer.imageUrl ?? '',
    countryCode: customer.countryCode,
    regionCode: customer.regionCode ?? '',
    regionName: customer.regionName,
    phone: customer.phone,
    email: customer.email,
    addressDetail: customer.addressDetail,
    status: customer.status,
    note: customer.note,
  };
}
