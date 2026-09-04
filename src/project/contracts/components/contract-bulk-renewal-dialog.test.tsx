import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Contract } from '../model/contract';
import { ContractBulkRenewalDialog } from './contract-bulk-renewal-dialog';

function createContract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: 'contract-1',
    tenantId: 'tenant-1',
    customerId: 'customer-1',
    createdBy: null,
    contractCode: 'HD-001',
    name: 'Hợp đồng dịch vụ',
    status: 'active',
    currencyCode: 'VND',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    autoRenew: false,
    note: '',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('ContractBulkRenewalDialog', () => {
  it('submits one bulk renewal input for all selected contracts', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ContractBulkRenewalDialog
        open
        contracts={[createContract(), createContract({ id: 'contract-2' })]}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    expect(
      screen.queryByText(/Hệ thống sẽ tạo bản nháp gia hạn/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('spinbutton', { name: 'Thời gian gia hạn' }),
    ).toHaveClass('rounded-e-none');

    await user.click(
      screen.getByRole('button', { name: /Tạo bản nháp gia hạn/ }),
    );

    expect(onConfirm).toHaveBeenCalledWith({
      contractIds: ['contract-1', 'contract-2'],
      durationValue: 12,
      durationUnit: 'month',
      feeIncreasePercent: 0,
    });
  });

  it('warns before overriding existing renewal drafts', () => {
    render(
      <ContractBulkRenewalDialog
        open
        contracts={[
          createContract({ hasRenewalDraft: true, renewalDraftVersionNo: 2 }),
        ]}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Có 1 hợp đồng đã có bản nháp gia hạn',
    );
    expect(screen.getByText(/HD-001/)).toHaveTextContent('v2');
  });
});
