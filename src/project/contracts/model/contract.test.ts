import { describe, expect, it } from 'vitest';
import { contractVersionLineSchema, mapContractRow } from './contract';
import {
  customerPaymentSchema,
  getContractChargeDisplayStatus,
  getContractReceivableStats,
  mapCustomerReceivableSummaryRow,
} from './receivable';

describe('contract model', () => {
  it('maps a database contract row to the domain model', () => {
    expect(
      mapContractRow({
        id: 'contract-1',
        tenant_id: 'tenant-1',
        customer_id: 'customer-1',
        contract_code: 'HD-001',
        name: 'Hợp đồng dịch vụ',
        status: 'active',
        currency_code: 'VND',
        start_date: '2026-01-01',
        end_date: null,
        auto_renew: true,
        note: '',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      }),
    ).toMatchObject({
      id: 'contract-1',
      customerId: 'customer-1',
      contractCode: 'HD-001',
      autoRenew: true,
    });
  });

  it('accepts a one-time fee without a recurrence period', () => {
    const result = contractVersionLineSchema.safeParse({
      name: 'Phí khởi tạo',
      quantity: 1,
      unitPrice: 5_000_000,
      billingType: 'one_time',
      billingUnit: null,
      billingInterval: null,
      chargeDate: '2026-06-01',
      dueRule: 'on_period_start',
      dueDays: null,
      startDate: '2026-06-01',
      endDate: null,
      sortOrder: 0,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.direction).toBe('receivable');
    }
  });

  it('rejects a recurring fee without a recurrence period', () => {
    const result = contractVersionLineSchema.safeParse({
      name: 'Phí duy trì',
      quantity: 1,
      unitPrice: 10_000_000,
      billingType: 'recurring',
      billingUnit: null,
      billingInterval: null,
      chargeDate: null,
      dueRule: 'on_period_end',
      dueDays: null,
      startDate: '2026-06-01',
      endDate: null,
      sortOrder: 0,
    });

    expect(result.success).toBe(false);
  });

  it('keeps the recurrence values invalid for one-time fees until submit formatting', () => {
    const result = contractVersionLineSchema.safeParse({
      name: 'Phí khởi tạo',
      quantity: 1,
      unitPrice: 5_000_000,
      billingType: 'one_time',
      billingUnit: 'month',
      billingInterval: 1,
      chargeDate: '2026-06-01',
      dueRule: 'on_period_start',
      dueDays: null,
      startDate: '2026-06-01',
      endDate: null,
      sortOrder: 0,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          path: ['billingType'],
          message: 'Phí một lần không có chu kỳ lặp.',
        }),
      );
    }
  });

  it('maps database numeric values in receivable summaries', () => {
    expect(
      mapCustomerReceivableSummaryRow({
        tenant_id: 'tenant-1',
        customer_id: 'customer-1',
        currency_code: 'VND',
        total_billed: '30000000.00',
        total_paid: '25000000.00',
        total_outstanding: '5000000.00',
        overdue_outstanding: '0.00',
        unapplied_credit: '0.00',
      }),
    ).toMatchObject({
      totalBilled: 30_000_000,
      totalPaid: 25_000_000,
      totalOutstanding: 5_000_000,
    });
  });

  it('derives the user-facing charge status from payment and due-date data', () => {
    const today = new Date('2026-08-16T12:00:00Z');
    const baseCharge = {
      status: 'open' as const,
      paidAmount: 0,
      outstandingAmount: 1_000_000,
    };

    expect(
      getContractChargeDisplayStatus(
        { ...baseCharge, dueDate: '2026-08-16' },
        today,
      ),
    ).toBe('unpaid');
    expect(
      getContractChargeDisplayStatus(
        { ...baseCharge, dueDate: '2026-08-23' },
        today,
      ),
    ).toBe('upcoming');
    expect(
      getContractChargeDisplayStatus(
        { ...baseCharge, dueDate: '2026-08-24' },
        today,
      ),
    ).toBe('not_due');
    expect(
      getContractChargeDisplayStatus(
        { ...baseCharge, dueDate: '2026-08-15' },
        today,
      ),
    ).toBe('overdue');
    expect(
      getContractChargeDisplayStatus(
        { ...baseCharge, dueDate: '2026-08-16', outstandingAmount: 0 },
        today,
      ),
    ).toBe('paid');
    expect(
      getContractChargeDisplayStatus(
        { ...baseCharge, status: 'voided', dueDate: '2026-08-16' },
        today,
      ),
    ).toBe('voided');
  });

  it('counts only due receivables in contract outstanding stats', () => {
    const stats = getContractReceivableStats(
      [
        {
          direction: 'receivable',
          status: 'open',
          amount: 10_000_000,
          paidAmount: 0,
          outstandingAmount: 10_000_000,
          dueDate: '2026-08-16',
        },
        {
          direction: 'receivable',
          status: 'open',
          amount: 20_000_000,
          paidAmount: 0,
          outstandingAmount: 20_000_000,
          dueDate: '2026-08-23',
        },
        {
          direction: 'receivable',
          status: 'partially_paid',
          amount: 15_000_000,
          paidAmount: 5_000_000,
          outstandingAmount: 10_000_000,
          dueDate: '2026-08-15',
        },
        {
          direction: 'payable',
          status: 'open',
          amount: 50_000_000,
          paidAmount: 0,
          outstandingAmount: 50_000_000,
          dueDate: '2026-08-15',
        },
      ],
      new Date('2026-08-16T12:00:00Z'),
    );

    expect(stats).toEqual({
      totalBilled: 45_000_000,
      totalPaid: 5_000_000,
      totalOutstanding: 20_000_000,
      overdueOutstanding: 10_000_000,
    });
  });

  it('validates payment amount and currency before API submission', () => {
    expect(
      customerPaymentSchema.safeParse({
        customerId: 'not-a-uuid',
        receivedAt: '2026-06-01T00:00:00+07:00',
        amount: 0,
        currencyCode: 'vnd',
        paymentMethod: 'cash',
        reference: '',
        note: '',
      }).success,
    ).toBe(false);
  });
});
