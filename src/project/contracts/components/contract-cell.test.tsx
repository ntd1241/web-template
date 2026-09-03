import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Contract } from '../model/contract';
import { ContractCustomerCell } from './contract-cell';

const contract: Contract = {
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
  autoRenew: true,
  note: '',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  customerName: 'Công ty Ánh Dương',
  customerCode: 'KH-001',
  customerImageUrl: null,
};

describe('ContractCustomerCell', () => {
  it('shows the customer avatar tooltip while keeping the contract link', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ContractCustomerCell contract={contract} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', {
        name: 'Xem chi tiết hợp đồng Hợp đồng dịch vụ',
      }),
    ).toHaveAttribute('href', '/contracts/contract-1');
    expect(
      screen.queryByRole('link', { name: /chi tiết khách hàng/i }),
    ).not.toBeInTheDocument();

    await user.hover(screen.getByLabelText('Công ty Ánh Dương (KH-001)'));

    expect(
      await screen.findByRole('tooltip', {
        name: 'Công ty Ánh Dương (KH-001)',
      }),
    ).toBeInTheDocument();
  });
});
