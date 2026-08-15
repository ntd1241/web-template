import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Customer } from '../model/customer';
import { CustomerCell } from './customer-cell';

const customer: Customer = {
  id: 'customer-1',
  tenantId: 'tenant-1',
  customerCode: 'KH-001',
  name: 'Công ty Ánh Dương',
  businessType: 'organization',
  businessRegistrationCode: '0123456789',
  imageUrl: null,
  countryCode: 'VN',
  regionCode: '01',
  regionName: 'Hà Nội',
  phone: '0900000000',
  email: 'contact@example.com',
  addressDetail: '1 Đường Mẫu',
  status: 'active',
  note: '',
};

describe('CustomerCell', () => {
  it('links the customer avatar and name to the detail page', () => {
    render(
      <MemoryRouter>
        <CustomerCell customer={customer} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', {
        name: 'Xem chi tiết khách hàng Công ty Ánh Dương',
      }),
    ).toHaveAttribute('href', '/customers/customer-1');
    expect(screen.getByText('Công ty Ánh Dương')).toBeInTheDocument();
    expect(screen.getByText('KH-001')).toBeInTheDocument();
  });
});
