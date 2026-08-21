import type { ContractFormValues, ContractVersionStatus } from './contract';

export interface ContractVersionComparableLine {
  id?: string;
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

export interface ContractChargeChangeItem {
  key: string;
  name: string;
  previousName?: string;
  currentName?: string;
  previousAmount?: number;
  currentAmount?: number;
}

export interface ContractChargeChanges {
  added: ContractChargeChangeItem[];
  removed: ContractChargeChangeItem[];
  changed: ContractChargeChangeItem[];
  unchanged: ContractChargeChangeItem[];
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
  chargeChanges: ContractChargeChanges;
  previousVersionNo?: number;
  nextVersionNo?: number;
}

export interface ContractVersionTermDifference {
  key: string;
  previous: unknown;
  current: unknown;
  equal: boolean;
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
];

function lineAmount(line: ContractVersionComparableLine) {
  return line.quantity * line.unitPrice;
}

function lineItem(
  line: ContractVersionComparableLine,
  key: string,
  previousLine?: ContractVersionComparableLine,
): ContractChargeChangeItem {
  return {
    key,
    name: line.name || previousLine?.name || 'Khoản thu chưa đặt tên',
    previousName: previousLine?.name,
    currentName: line.name,
    previousAmount: previousLine ? lineAmount(previousLine) : undefined,
    currentAmount: lineAmount(line),
  };
}

function removedLineItem(
  line: ContractVersionComparableLine,
): ContractChargeChangeItem {
  return {
    key: line.id ?? `removed-${line.sortOrder}-${line.name}`,
    name: line.name || 'Khoản thu chưa đặt tên',
    previousName: line.name,
    previousAmount: lineAmount(line),
  };
}

function compareChargeLines(
  previousLines: ContractVersionComparableLine[],
  currentLines: ContractVersionComparableLine[],
): ContractChargeChanges {
  const result: ContractChargeChanges = {
    added: [],
    removed: [],
    changed: [],
    unchanged: [],
  };
  const previousById = new Map(
    previousLines.filter((line) => line.id).map((line) => [line.id, line]),
  );
  const previousBySortOrder = new Map(
    previousLines.map((line) => [line.sortOrder, line]),
  );
  const matchedPreviousLines = new Set<ContractVersionComparableLine>();

  currentLines.forEach((line, index) => {
    const previous =
      (line.id ? previousById.get(line.id) : undefined) ??
      previousBySortOrder.get(line.sortOrder);
    if (!previous) {
      result.added.push(lineItem(line, `added-${index}`));
      return;
    }

    matchedPreviousLines.add(previous);
    const item = lineItem(line, previous.id!, previous);
    if (LINE_KEYS.every((key) => isEqual(previous[key], line[key]))) {
      result.unchanged.push(item);
    } else {
      result.changed.push(item);
    }
  });

  previousLines.forEach((line) => {
    if (!matchedPreviousLines.has(line)) {
      result.removed.push(removedLineItem(line));
    }
  });

  return result;
}

function normalize(value: unknown): unknown {
  return value === undefined ? null : value;
}

function isEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right));
}

export function getContractVersionTermDifferences({
  termsSnapshot,
  values,
}: {
  termsSnapshot: Record<string, unknown>;
  values: ContractFormValues;
}): ContractVersionTermDifference[] {
  const submittedTerms = values as unknown as Record<string, unknown>;

  return VERSION_TERM_KEYS.map(([key]) => ({
    key,
    previous: termsSnapshot[key],
    current: submittedTerms[key],
    equal: isEqual(termsSnapshot[key], submittedTerms[key]),
  }));
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
      chargeChanges: compareChargeLines([], lines),
    };
  }

  const changedAreas: string[] = [];
  const chargeChanges = compareChargeLines(latestLines, lines);
  const terms = latestVersion.termsSnapshot ?? {};

  if (
    getContractVersionTermDifferences({ termsSnapshot: terms, values }).some(
      (difference) => !difference.equal,
    )
  ) {
    changedAreas.push('Thông tin hợp đồng');
  }

  if (
    chargeChanges.added.length > 0 ||
    chargeChanges.removed.length > 0 ||
    chargeChanges.changed.length > 0
  ) {
    changedAreas.push('Khoản phí');
  }

  if (latestVersion.status === 'draft') {
    return {
      action: 'update-draft',
      requiresNewVersion: false,
      changedAreas,
      chargeChanges,
      previousVersionNo: latestVersion.versionNo,
      nextVersionNo: latestVersion.versionNo,
    };
  }

  return {
    action: changedAreas.length > 0 ? 'create-new' : 'keep-current',
    requiresNewVersion: changedAreas.length > 0,
    changedAreas,
    chargeChanges,
    previousVersionNo: latestVersion.versionNo,
    nextVersionNo:
      changedAreas.length > 0
        ? latestVersion.versionNo + 1
        : latestVersion.versionNo,
  };
}
