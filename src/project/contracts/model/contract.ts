import { z } from 'zod';

export const CONTRACT_STATUSES = [
  'draft',
  'active',
  'suspended',
  'expired',
  'terminated',
] as const;
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export const CONTRACT_VERSION_STATUSES = [
  'draft',
  'effective',
  'superseded',
  'cancelled',
] as const;
export type ContractVersionStatus = (typeof CONTRACT_VERSION_STATUSES)[number];

export const BILLING_TYPES = ['recurring', 'one_time'] as const;
export type BillingType = (typeof BILLING_TYPES)[number];

export const BILLING_UNITS = ['month', 'quarter', 'year'] as const;
export type BillingUnit = (typeof BILLING_UNITS)[number];

export const DUE_RULES = [
  'on_period_start',
  'on_period_end',
  'after_days',
] as const;
export type DueRule = (typeof DUE_RULES)[number];

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Bản nháp',
  active: 'Đang hiệu lực',
  suspended: 'Tạm dừng',
  expired: 'Hết hạn',
  terminated: 'Đã chấm dứt',
};

export const CONTRACT_VERSION_STATUS_LABELS: Record<
  ContractVersionStatus,
  string
> = {
  draft: 'Bản nháp',
  effective: 'Đang áp dụng',
  superseded: 'Đã thay thế',
  cancelled: 'Đã hủy',
};

export const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  recurring: 'Định kỳ',
  one_time: 'Một lần',
};

export const BILLING_UNIT_LABELS: Record<BillingUnit, string> = {
  month: 'Tháng',
  quarter: 'Quý',
  year: 'Năm',
};

export const DUE_RULE_LABELS: Record<DueRule, string> = {
  on_period_start: 'Đầu kỳ',
  on_period_end: 'Cuối kỳ',
  after_days: 'Sau số ngày',
};

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ.');

export const contractFormSchema = z
  .object({
    customerId: z.string().uuid('Khách hàng không hợp lệ.'),
    contractCode: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập mã hợp đồng.')
      .regex(/^[A-Za-z0-9-]+$/, 'Mã chỉ gồm chữ, số và dấu gạch ngang.'),
    name: z.string().trim().min(1, 'Vui lòng nhập tên hợp đồng.'),
    currencyCode: z
      .string()
      .trim()
      .regex(/^[A-Z]{3}$/, 'Mã tiền tệ phải gồm 3 chữ cái viết hoa.'),
    startDate: isoDate,
    endDate: isoDate.nullable(),
    autoRenew: z.boolean(),
    renewalNoticeDays: z.number().int().min(0).nullable(),
    paymentPriority: z.number().int().min(0),
    note: z.string().trim().max(1000, 'Ghi chú không được quá 1000 ký tự.'),
  })
  .superRefine((values, context) => {
    if (values.endDate && values.endDate < values.startDate) {
      context.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.',
      });
    }

    if (values.autoRenew && values.renewalNoticeDays === null) {
      context.addIssue({
        code: 'custom',
        path: ['renewalNoticeDays'],
        message: 'Vui lòng nhập số ngày nhắc gia hạn.',
      });
    }
  });

export type ContractFormValues = z.infer<typeof contractFormSchema>;

export const contractVersionLineSchema = z
  .object({
    name: z.string().trim().min(1, 'Vui lòng nhập tên khoản phí.'),
    quantity: z.number().positive('Số lượng phải lớn hơn 0.'),
    unitPrice: z.number().nonnegative('Đơn giá không được âm.'),
    billingType: z.enum(BILLING_TYPES),
    billingUnit: z.enum(BILLING_UNITS).nullable(),
    billingInterval: z.number().int().positive().nullable(),
    chargeDate: isoDate.nullable(),
    dueRule: z.enum(DUE_RULES),
    dueDays: z.number().int().min(0).nullable(),
    startDate: isoDate,
    endDate: isoDate.nullable(),
    sortOrder: z.number().int().min(0),
  })
  .superRefine((values, context) => {
    if (values.billingType === 'recurring') {
      if (!values.billingUnit) {
        context.addIssue({
          code: 'custom',
          path: ['billingUnit'],
          message: 'Phí định kỳ cần có đơn vị lặp.',
        });
      }
      if (!values.billingInterval) {
        context.addIssue({
          code: 'custom',
          path: ['billingInterval'],
          message: 'Phí định kỳ cần có khoảng lặp.',
        });
      }
      if (values.chargeDate) {
        context.addIssue({
          code: 'custom',
          path: ['chargeDate'],
          message: 'Phí định kỳ không dùng ngày phát sinh một lần.',
        });
      }
    }

    if (values.billingType === 'one_time') {
      if (!values.chargeDate) {
        context.addIssue({
          code: 'custom',
          path: ['chargeDate'],
          message: 'Phí một lần cần có ngày phát sinh.',
        });
      }
      if (values.billingUnit || values.billingInterval) {
        context.addIssue({
          code: 'custom',
          path: ['billingType'],
          message: 'Phí một lần không có chu kỳ lặp.',
        });
      }
    }

    if (values.dueRule === 'after_days' && values.dueDays === null) {
      context.addIssue({
        code: 'custom',
        path: ['dueDays'],
        message: 'Vui lòng nhập số ngày đến hạn.',
      });
    }

    if (values.dueRule !== 'after_days' && values.dueDays !== null) {
      context.addIssue({
        code: 'custom',
        path: ['dueDays'],
        message: 'Chỉ nhập số ngày khi chọn quy tắc sau số ngày.',
      });
    }

    if (values.endDate && values.endDate < values.startDate) {
      context.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.',
      });
    }
  });

export type ContractVersionLineValues = z.infer<
  typeof contractVersionLineSchema
>;

export interface Contract {
  id: string;
  tenantId: string;
  customerId: string;
  contractCode: string;
  name: string;
  status: ContractStatus;
  currencyCode: string;
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
  renewalNoticeDays: number | null;
  paymentPriority: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractVersion {
  id: string;
  contractId: string;
  versionNo: number;
  status: ContractVersionStatus;
  effectiveFrom: string;
  effectiveTo: string | null;
  changeReason: string;
  termsSnapshot: Record<string, unknown>;
  createdBy: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContractVersionLine {
  id: string;
  contractVersionId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  billingType: BillingType;
  billingUnit: BillingUnit | null;
  billingInterval: number | null;
  chargeDate: string | null;
  dueRule: DueRule;
  dueDays: number | null;
  startDate: string;
  endDate: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContractRow {
  id: string;
  tenant_id: string;
  customer_id: string;
  contract_code: string;
  name: string;
  status: ContractStatus;
  currency_code: string;
  start_date: string;
  end_date: string | null;
  auto_renew: boolean;
  renewal_notice_days: number | null;
  payment_priority: number;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface ContractVersionRow {
  id: string;
  contract_id: string;
  version_no: number;
  status: ContractVersionStatus;
  effective_from: string;
  effective_to: string | null;
  change_reason: string;
  terms_snapshot: Record<string, unknown>;
  created_by: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractVersionLineRow {
  id: string;
  contract_version_id: string;
  name: string;
  quantity: number | string;
  unit_price: number | string;
  amount: number | string;
  billing_type: BillingType;
  billing_unit: BillingUnit | null;
  billing_interval: number | null;
  charge_date: string | null;
  due_rule: DueRule;
  due_days: number | null;
  start_date: string;
  end_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function numericValue(value: number | string): number {
  return typeof value === 'number' ? value : Number(value);
}

export function mapContractRow(row: ContractRow): Contract {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    customerId: row.customer_id,
    contractCode: row.contract_code,
    name: row.name,
    status: row.status,
    currencyCode: row.currency_code,
    startDate: row.start_date,
    endDate: row.end_date,
    autoRenew: row.auto_renew,
    renewalNoticeDays: row.renewal_notice_days,
    paymentPriority: row.payment_priority,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapContractVersionRow(
  row: ContractVersionRow,
): ContractVersion {
  return {
    id: row.id,
    contractId: row.contract_id,
    versionNo: row.version_no,
    status: row.status,
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
    changeReason: row.change_reason,
    termsSnapshot: row.terms_snapshot ?? {},
    createdBy: row.created_by,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapContractVersionLineRow(
  row: ContractVersionLineRow,
): ContractVersionLine {
  return {
    id: row.id,
    contractVersionId: row.contract_version_id,
    name: row.name,
    quantity: numericValue(row.quantity),
    unitPrice: numericValue(row.unit_price),
    amount: numericValue(row.amount),
    billingType: row.billing_type,
    billingUnit: row.billing_unit,
    billingInterval: row.billing_interval,
    chargeDate: row.charge_date,
    dueRule: row.due_rule,
    dueDays: row.due_days,
    startDate: row.start_date,
    endDate: row.end_date,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
