import { z } from 'zod';
import type { BillingType, BillingUnit, DueRule } from './contract';

export const CONTRACT_CHARGE_STATUSES = [
  'open',
  'partially_paid',
  'paid',
  'overdue',
  'voided',
] as const;
export type ContractChargeStatus = (typeof CONTRACT_CHARGE_STATUSES)[number];

export const PAYMENT_STATUSES = ['posted', 'reversed'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ['bank_transfer', 'cash', 'other'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const CONTRACT_CHARGE_STATUS_LABELS: Record<
  ContractChargeStatus,
  string
> = {
  open: 'Chưa thanh toán',
  partially_paid: 'Thanh toán một phần',
  paid: 'Đã thanh toán',
  overdue: 'Quá hạn',
  voided: 'Đã hủy',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  posted: 'Đã ghi nhận',
  reversed: 'Đã đảo ngược',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: 'Chuyển khoản',
  cash: 'Tiền mặt',
  other: 'Khác',
};

export const customerPaymentSchema = z.object({
  customerId: z.string().uuid('Khách hàng không hợp lệ.'),
  receivedAt: z.string().datetime({ offset: true }),
  amount: z.number().positive('Số tiền phải lớn hơn 0.'),
  currencyCode: z
    .string()
    .trim()
    .regex(/^[A-Z]{3}$/, 'Mã tiền tệ phải gồm 3 chữ cái viết hoa.'),
  paymentMethod: z.enum(PAYMENT_METHODS),
  reference: z.string().trim().max(120, 'Mã giao dịch quá dài.'),
  note: z.string().trim().max(1000, 'Ghi chú quá dài.'),
});

export type CustomerPaymentValues = z.infer<typeof customerPaymentSchema>;

export interface ContractCharge {
  id: string;
  tenantId: string;
  customerId: string;
  contractId: string;
  contractVersionId: string;
  contractVersionLineId: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  amount: number;
  currencyCode: string;
  status: ContractChargeStatus;
  voidReason: string | null;
  createdAt: string;
}

export interface ContractChargeBalance extends ContractCharge {
  paidAmount: number;
  outstandingAmount: number;
}

export interface CustomerPayment {
  id: string;
  tenantId: string;
  customerId: string;
  receivedAt: string;
  amount: number;
  currencyCode: string;
  paymentMethod: PaymentMethod;
  reference: string;
  note: string;
  status: PaymentStatus;
  createdBy: string | null;
  reversedAt: string | null;
  reversalReason: string | null;
  createdAt: string;
}

export interface CustomerPaymentAllocation {
  id: string;
  paymentId: string;
  chargeId: string;
  allocatedAmount: number;
  createdAt: string;
}

export interface CustomerReceivableSummary {
  tenantId: string;
  customerId: string;
  currencyCode: string;
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueOutstanding: number;
  unappliedCredit: number;
}

export interface ContractChargeRow {
  id: string;
  tenant_id: string;
  customer_id: string;
  contract_id: string;
  contract_version_id: string;
  contract_version_line_id: string;
  period_start: string;
  period_end: string;
  due_date: string;
  amount: number | string;
  currency_code: string;
  status: ContractChargeStatus;
  void_reason: string | null;
  created_at: string;
}

export interface ContractChargeBalanceRow extends ContractChargeRow {
  paid_amount: number | string;
  outstanding_amount: number | string;
}

export interface CustomerPaymentRow {
  id: string;
  tenant_id: string;
  customer_id: string;
  received_at: string;
  amount: number | string;
  currency_code: string;
  payment_method: PaymentMethod;
  reference: string;
  note: string;
  status: PaymentStatus;
  created_by: string | null;
  reversed_at: string | null;
  reversal_reason: string | null;
  created_at: string;
}

export interface CustomerReceivableSummaryRow {
  tenant_id: string;
  customer_id: string;
  currency_code: string;
  total_billed: number | string;
  total_paid: number | string;
  total_outstanding: number | string;
  overdue_outstanding: number | string;
  unapplied_credit: number | string;
}

function numericValue(value: number | string): number {
  return typeof value === 'number' ? value : Number(value);
}

export function mapContractChargeRow(row: ContractChargeRow): ContractCharge {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    customerId: row.customer_id,
    contractId: row.contract_id,
    contractVersionId: row.contract_version_id,
    contractVersionLineId: row.contract_version_line_id,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    dueDate: row.due_date,
    amount: numericValue(row.amount),
    currencyCode: row.currency_code,
    status: row.status,
    voidReason: row.void_reason,
    createdAt: row.created_at,
  };
}

export function mapContractChargeBalanceRow(
  row: ContractChargeBalanceRow,
): ContractChargeBalance {
  return {
    ...mapContractChargeRow(row),
    paidAmount: numericValue(row.paid_amount),
    outstandingAmount: numericValue(row.outstanding_amount),
  };
}

export function mapCustomerPaymentRow(
  row: CustomerPaymentRow,
): CustomerPayment {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    customerId: row.customer_id,
    receivedAt: row.received_at,
    amount: numericValue(row.amount),
    currencyCode: row.currency_code,
    paymentMethod: row.payment_method,
    reference: row.reference,
    note: row.note,
    status: row.status,
    createdBy: row.created_by,
    reversedAt: row.reversed_at,
    reversalReason: row.reversal_reason,
    createdAt: row.created_at,
  };
}

export function mapCustomerReceivableSummaryRow(
  row: CustomerReceivableSummaryRow,
): CustomerReceivableSummary {
  return {
    tenantId: row.tenant_id,
    customerId: row.customer_id,
    currencyCode: row.currency_code,
    totalBilled: numericValue(row.total_billed),
    totalPaid: numericValue(row.total_paid),
    totalOutstanding: numericValue(row.total_outstanding),
    overdueOutstanding: numericValue(row.overdue_outstanding),
    unappliedCredit: numericValue(row.unapplied_credit),
  };
}

export type ContractBillingProjection = {
  billingType: BillingType;
  billingUnit: BillingUnit | null;
  dueRule: DueRule;
};
