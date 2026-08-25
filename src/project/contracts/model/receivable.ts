import { z } from 'zod';
import type {
  BillingType,
  BillingUnit,
  ContractCashflowDirection,
  DueRule,
} from './contract';

export const CONTRACT_CHARGE_STATUSES = [
  'open',
  'partially_paid',
  'paid',
  'overdue',
  'voided',
] as const;
export type ContractChargeStatus = (typeof CONTRACT_CHARGE_STATUSES)[number];

export const CONTRACT_CHARGE_DISPLAY_STATUSES = [
  'projected',
  'upcoming',
  'unpaid',
  'partially_paid',
  'not_due',
  'paid',
  'overdue',
  'voided',
] as const;
export type ContractChargeDisplayStatus =
  (typeof CONTRACT_CHARGE_DISPLAY_STATUSES)[number];

export const CONTRACT_CHARGE_DUE_SOON_DAYS = 7;

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

export const CONTRACT_CHARGE_DISPLAY_STATUS_LABELS: Record<
  ContractChargeDisplayStatus,
  string
> = {
  projected: 'Dự kiến',
  upcoming: 'Sắp tới hạn',
  unpaid: 'Chưa thu',
  partially_paid: 'Đã thu một phần',
  not_due: 'Chưa tới hạn',
  paid: 'Đã thu',
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
  direction: ContractCashflowDirection;
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

export interface ContractReceivableTableFee {
  id: string;
  chargeId: string;
  name: string;
  amount: number;
  outstandingAmount: number;
  currencyCode: string;
  isProjected?: boolean;
}

export interface ContractPaymentAllocation {
  chargeId: string;
  allocatedAmount: number;
}

export function roundCurrencyAmount(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateContractPaymentAllocations(
  fees: Array<
    Pick<ContractReceivableTableFee, 'chargeId' | 'outstandingAmount'>
  >,
  amount: number,
): ContractPaymentAllocation[] {
  let remaining = Math.max(0, roundCurrencyAmount(amount));

  return fees.map((fee) => {
    const allocatedAmount = roundCurrencyAmount(
      Math.min(remaining, fee.outstandingAmount),
    );
    remaining = roundCurrencyAmount(remaining - allocatedAmount);
    return { chargeId: fee.chargeId, allocatedAmount };
  });
}

export interface ContractReceivableTableRow {
  id: string;
  direction: ContractCashflowDirection;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  amount: number;
  currencyCode: string;
  status: ContractChargeStatus;
  paidAmount: number;
  outstandingAmount: number;
  displayStatus: ContractChargeDisplayStatus;
  fees: ContractReceivableTableFee[];
  groupLabel?: string | null;
  isAggregated?: boolean;
  isProjected?: boolean;
  source?: 'actual' | 'projected' | 'mixed';
  plannedOutstandingAmount?: number;
}

export const CONTRACT_RECEIVABLE_VIEW_MODES = [
  'period',
  'month',
  'year',
] as const;
export type ContractReceivableViewMode =
  (typeof CONTRACT_RECEIVABLE_VIEW_MODES)[number];

export type ContractReceivableSortOption =
  | 'periodStart_desc'
  | 'periodStart_asc'
  | 'dueDate_desc'
  | 'dueDate_asc'
  | 'amount_desc'
  | 'amount_asc';

export interface ContractReceivablePeriodListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: ContractChargeDisplayStatus;
  sort: ContractReceivableSortOption;
  view: ContractReceivableViewMode;
  dueSoonDays: number;
  year: number;
}

export interface ContractReceivablePeriodListResult {
  rows: ContractReceivableTableRow[];
  total: number;
}

export interface ContractReceivablePeriodRpcFee {
  id: string;
  charge_id: string;
  name: string;
  amount: number | string;
  outstanding_amount: number | string;
  currency_code: string;
  is_projected?: boolean;
}

export interface ContractReceivablePeriodRpcRow {
  period_start: string;
  period_end: string;
  due_date: string;
  amount: number | string;
  currency_code: string;
  direction: ContractCashflowDirection;
  status: ContractChargeStatus;
  paid_amount: number | string;
  outstanding_amount: number | string;
  display_status: ContractChargeDisplayStatus;
  fees: ContractReceivablePeriodRpcFee[];
  group_label?: string | null;
  is_aggregated?: boolean;
  is_projected?: boolean;
  source?: 'actual' | 'projected' | 'mixed';
  actual_amount?: number | string;
  projected_amount?: number | string;
  planned_outstanding_amount?: number | string;
}

export interface ContractReceivablePeriodRpcResponse {
  items: ContractReceivablePeriodRpcRow[];
  total: number | string;
}

export function mapContractReceivablePeriodRpcRow(
  row: ContractReceivablePeriodRpcRow,
): ContractReceivableTableRow {
  return {
    id: [
      row.period_start,
      row.period_end,
      row.due_date,
      row.currency_code,
      row.direction,
    ].join('|'),
    direction: row.direction,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    dueDate: row.due_date,
    amount: numericValue(row.amount),
    currencyCode: row.currency_code,
    status: row.status,
    paidAmount: numericValue(row.paid_amount),
    outstandingAmount: numericValue(row.outstanding_amount),
    displayStatus: row.display_status,
    fees: row.fees.map((fee) => ({
      id: fee.id,
      chargeId: fee.charge_id,
      name: fee.name,
      amount: numericValue(fee.amount),
      outstandingAmount: numericValue(fee.outstanding_amount),
      currencyCode: fee.currency_code,
      isProjected: fee.is_projected ?? false,
    })),
    groupLabel: row.group_label,
    isAggregated: row.is_aggregated ?? false,
    isProjected: row.is_projected ?? false,
    source: row.source ?? 'actual',
    plannedOutstandingAmount: numericValue(
      row.planned_outstanding_amount ?? row.outstanding_amount,
    ),
  };
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function dateOnly(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getContractChargeDisplayStatus(
  charge: Pick<
    ContractChargeBalance,
    'status' | 'paidAmount' | 'outstandingAmount' | 'dueDate'
  >,
  today = new Date(),
  dueSoonDays = CONTRACT_CHARGE_DUE_SOON_DAYS,
): ContractChargeDisplayStatus {
  if (charge.status === 'voided') return 'voided';
  if (charge.outstandingAmount <= 0 || charge.status === 'paid') {
    return 'paid';
  }
  if (charge.paidAmount > 0) return 'partially_paid';

  const todayIso = dateOnly(today);
  if (charge.dueDate < todayIso) return 'overdue';
  if (
    charge.dueDate > todayIso &&
    charge.dueDate <= addDays(todayIso, dueSoonDays)
  ) {
    return 'upcoming';
  }
  if (charge.dueDate > todayIso) return 'not_due';
  return 'unpaid';
}

export function mapContractReceivableTableRows(
  charges: ContractChargeBalance[],
  lines: Array<{ id: string; name: string; sortOrder?: number }>,
  dueSoonDays: number,
  today = new Date(),
): ContractReceivableTableRow[] {
  const lineById = new Map(lines.map((line) => [line.id, line]));
  const chargeById = new Map(charges.map((charge) => [charge.id, charge]));
  const groups = new Map<string, ContractReceivableTableRow>();

  for (const charge of charges) {
    const key = [
      charge.periodStart,
      charge.periodEnd,
      charge.dueDate,
      charge.currencyCode,
      charge.direction,
    ].join('|');
    const existing = groups.get(key);

    if (existing) {
      existing.amount += charge.amount;
      existing.paidAmount += charge.paidAmount;
      existing.outstandingAmount += charge.outstandingAmount;
      if (charge.status !== 'voided') existing.status = 'open';
      const line = lineById.get(charge.contractVersionLineId);
      existing.fees.push({
        id: charge.id,
        chargeId: charge.id,
        name: line?.name ?? 'Khoản phí',
        amount: charge.amount,
        outstandingAmount: charge.outstandingAmount,
        currencyCode: charge.currencyCode,
      });
      existing.displayStatus = getContractChargeDisplayStatus(
        existing,
        today,
        dueSoonDays,
      );
      continue;
    }

    const line = lineById.get(charge.contractVersionLineId);
    const row: ContractReceivableTableRow = {
      id: key,
      direction: charge.direction,
      periodStart: charge.periodStart,
      periodEnd: charge.periodEnd,
      dueDate: charge.dueDate,
      amount: charge.amount,
      currencyCode: charge.currencyCode,
      status: charge.status === 'voided' ? 'voided' : 'open',
      paidAmount: charge.paidAmount,
      outstandingAmount: charge.outstandingAmount,
      displayStatus: getContractChargeDisplayStatus(charge, today, dueSoonDays),
      fees: [
        {
          id: charge.id,
          chargeId: charge.id,
          name: line?.name ?? 'Khoản phí',
          amount: charge.amount,
          outstandingAmount: charge.outstandingAmount,
          currencyCode: charge.currencyCode,
        },
      ],
    };
    groups.set(key, row);
  }

  return [...groups.values()]
    .map((row) => ({
      ...row,
      fees: [...row.fees].sort((a, b) => {
        const aLine = lineById.get(
          chargeById.get(a.chargeId)?.contractVersionLineId ?? '',
        );
        const bLine = lineById.get(
          chargeById.get(b.chargeId)?.contractVersionLineId ?? '',
        );
        return (
          (aLine?.sortOrder ?? Number.MAX_SAFE_INTEGER) -
            (bLine?.sortOrder ?? Number.MAX_SAFE_INTEGER) ||
          a.name.localeCompare(b.name) ||
          a.chargeId.localeCompare(b.chargeId)
        );
      }),
    }))
    .sort(
      (a, b) =>
        b.periodStart.localeCompare(a.periodStart) ||
        b.periodEnd.localeCompare(a.periodEnd) ||
        b.dueDate.localeCompare(a.dueDate) ||
        a.direction.localeCompare(b.direction) ||
        a.id.localeCompare(b.id),
    );
}

export interface ContractReceivableStats {
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueOutstanding: number;
}

export function getContractReceivableStats(
  charges: Array<
    Pick<
      ContractChargeBalance,
      | 'direction'
      | 'status'
      | 'amount'
      | 'paidAmount'
      | 'outstandingAmount'
      | 'dueDate'
    >
  >,
  today = new Date(),
): ContractReceivableStats {
  const todayIso = dateOnly(today);
  const receivableCharges = charges.filter(
    (charge) => charge.direction === 'receivable' && charge.status !== 'voided',
  );

  return receivableCharges.reduce<ContractReceivableStats>(
    (stats, charge) => {
      stats.totalBilled += charge.amount;
      stats.totalPaid += charge.paidAmount;

      if (charge.outstandingAmount > 0 && charge.dueDate <= todayIso) {
        stats.totalOutstanding += charge.outstandingAmount;
      }

      if (charge.outstandingAmount > 0 && charge.dueDate < todayIso) {
        stats.overdueOutstanding += charge.outstandingAmount;
      }

      return stats;
    },
    {
      totalBilled: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      overdueOutstanding: 0,
    },
  );
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

export interface ContractPaymentAllocationDetail extends CustomerPaymentAllocation {
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  feeName: string;
  chargeAmount: number;
  currencyCode: string;
}

export interface ContractPaymentHistory extends CustomerPayment {
  allocations: ContractPaymentAllocationDetail[];
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
  direction: ContractCashflowDirection;
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

export interface CustomerPaymentAllocationRow {
  id: string;
  payment_id: string;
  charge_id: string;
  allocated_amount: number | string;
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
    direction: row.direction ?? 'receivable',
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

export function mapCustomerPaymentAllocationRow(
  row: CustomerPaymentAllocationRow,
): CustomerPaymentAllocation {
  return {
    id: row.id,
    paymentId: row.payment_id,
    chargeId: row.charge_id,
    allocatedAmount: numericValue(row.allocated_amount),
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
