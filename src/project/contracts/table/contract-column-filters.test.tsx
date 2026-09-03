import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ContractIdentityColumnFilter } from './contract-column-filters';

describe('ContractIdentityColumnFilter', () => {
  it('combines the contract and customer filters in one header filter', () => {
    render(
      <ContractIdentityColumnFilter
        contractSearch=""
        onContractSearchChange={vi.fn()}
        customerId=""
        customerOptions={[]}
        onCustomerIdChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('searchbox', {
        name: 'Tìm theo tên hoặc mã hợp đồng',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: 'Khách hàng' }),
    ).toBeInTheDocument();
  });
});
