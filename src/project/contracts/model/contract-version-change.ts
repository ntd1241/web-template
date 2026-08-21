import type { ContractFormValues, ContractVersionStatus } from './contract';

export interface ContractVersionComparableLine {
  direction: 'receivable' | 'payable';
  name: string;
  quantity: number;
  unitPrice: number;
  billingType: 'recurring' | 'one_time';
  billingUnit: 'month' | 'quarter' | 'year' | null;
  billingInterval: number | null;
  chargeDate: string | null;
  dueRule: 'on_period_start' | 'on_period_end' | 'after_days';
  dueDays: number | null;
  startDate: string;
  endDate: string | null;
  sortOrder: number;
}

export type ContractVersionChangeAction =
  | 'create'
  | 'keep-current'
  | 'update-draft'
  | 'create-new';

export interface ContractVersionChangeCheck {
  action: ContractVersionChangeAction;
  requiresNewVersion: boolean;
  changedAreas: string[];
  previousVersionNo?: number;
  nextVersionNo?: number;
}

interface LatestVersionForCheck {
  versionNo: number;
  status: ContractVersionStatus;
  termsSnapshot: Record<string, unknown>;
}

const VERSION_TERM_KEYS = [
  ['customerId', 'Khách hàng'],
  ['contractCode', 'Mã hợp đồng'],
  ['name', 'Tên hợp đồng'],
  ['currencyCode', 'Đơn vị tiền tệ'],
  ['startDate', 'Ngày bắt đầu'],
  ['endDate', 'Ngày kết thúc'],
  ['autoRenew', 'Tự động gia hạn'],
  ['note', 'Ghi chú'],
] as const;

const LINE_KEYS: Array<keyof ContractVersionComparableLine> = [
  'direction',
  'name',
  'quantity',
  'unitPrice',
  'billingType',
  'billingUnit',
  'billingInterval',
  'chargeDate',
  'dueRule',
  'dueDays',
  'startDate',
  'endDate',
  'sortOrder',
];

function normalize(value: unknown): unknown {
  return value === undefined ? null : value;
}

function isEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right));
}

function comparableLinesEqual(
  current: ContractVersionComparableLine[],
  submitted: ContractVersionComparableLine[],
) {
  if (current.length !== submitted.length) return false;

  return current.every((line, index) => {
    const nextLine = submitted[index];
    return LINE_KEYS.every((key) => isEqual(line[key], nextLine?.[key]));
  });
}

export function getContractVersionChangeCheck({
  latestVersion,
  latestLines,
  values,
  lines,
}: {
  latestVersion?: LatestVersionForCheck;
  latestLines: ContractVersionComparableLine[];
  values: ContractFormValues;
  lines: ContractVersionComparableLine[];
}): ContractVersionChangeCheck {
  if (!latestVersion) {
    return {
      action: 'create',
      requiresNewVersion: true,
      changedAreas: [],
    };
  }

  const changedAreas: string[] = [];
  const terms = latestVersion.termsSnapshot ?? {};
  const submittedTerms = values as unknown as Record<string, unknown>;

  if (
    VERSION_TERM_KEYS.some(([key]) => !isEqual(terms[key], submittedTerms[key]))
  ) {
    changedAreas.push('Thông tin hợp đồng');
  }

  const sortedLatestLines = [...latestLines].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );
  const sortedSubmittedLines = [...lines].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );
  if (!comparableLinesEqual(sortedLatestLines, sortedSubmittedLines)) {
    changedAreas.push('Khoản phí');
  }

  if (latestVersion.status === 'draft') {
    return {
      action: 'update-draft',
      requiresNewVersion: false,
      changedAreas,
    };
  }

  return {
    action: changedAreas.length > 0 ? 'create-new' : 'keep-current',
    requiresNewVersion: changedAreas.length > 0,
    changedAreas,
    previousVersionNo:
      changedAreas.length > 0 ? latestVersion.versionNo : undefined,
    nextVersionNo:
      changedAreas.length > 0 ? latestVersion.versionNo + 1 : undefined,
  };
}
