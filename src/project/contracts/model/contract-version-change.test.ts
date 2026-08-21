import { describe, expect, it } from 'vitest';
import { contractDefaultValues } from '../forms/contract-form.generated';
import { getContractVersionChangeCheck } from './contract-version-change';
import type { ContractVersionComparableLine } from './contract-version-change';

const line: ContractVersionComparableLine = {
  direction: 'receivable',
  name: 'Phí dịch vụ',
  quantity: 1,
  unitPrice: 1000000,
  billingType: 'recurring',
  billingUnit: 'month',
  billingInterval: 1,
  chargeDate: null,
  dueRule: 'on_period_start',
  dueDays: null,
  startDate: '2026-08-21',
  endDate: null,
  sortOrder: 0,
};

const latestVersion = {
  versionNo: 1,
  status: 'effective' as const,
  termsSnapshot: { ...contractDefaultValues },
};

describe('getContractVersionChangeCheck', () => {
  it('requires the initial version when creating a contract', () => {
    expect(
      getContractVersionChangeCheck({
        latestLines: [],
        lines: [line],
        values: contractDefaultValues,
      }),
    ).toMatchObject({ action: 'create', requiresNewVersion: true });
  });

  it('keeps the effective version when only non-version data changes', () => {
    expect(
      getContractVersionChangeCheck({
        latestVersion,
        latestLines: [line],
        lines: [line],
        values: contractDefaultValues,
      }),
    ).toMatchObject({
      action: 'keep-current',
      requiresNewVersion: false,
      previousVersionNo: 1,
      nextVersionNo: 1,
    });
  });

  it('ignores a persisted sort-order offset when line content is unchanged', () => {
    expect(
      getContractVersionChangeCheck({
        latestVersion,
        latestLines: [{ ...line, id: 'line-1', sortOrder: 1 }],
        lines: [{ ...line, id: 'line-1', sortOrder: 0 }],
        values: contractDefaultValues,
      }),
    ).toMatchObject({ action: 'keep-current', requiresNewVersion: false });
  });

  it('requires a new version when a fee line changes', () => {
    expect(
      getContractVersionChangeCheck({
        latestVersion,
        latestLines: [line],
        lines: [{ ...line, unitPrice: 1200000 }],
        values: contractDefaultValues,
      }),
    ).toMatchObject({
      action: 'create-new',
      requiresNewVersion: true,
      changedAreas: ['Khoản phí'],
    });
  });

  it('updates the existing draft instead of creating another version', () => {
    expect(
      getContractVersionChangeCheck({
        latestVersion: { ...latestVersion, status: 'draft' },
        latestLines: [line],
        lines: [{ ...line, unitPrice: 1200000 }],
        values: contractDefaultValues,
      }),
    ).toMatchObject({ action: 'update-draft', requiresNewVersion: false });
  });
});
