import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { Customer } from '../model/customer';
import { CustomerDetailTabs } from './customer-detail-tabs';

const customer: Customer = {
  id: 'customer-1',
  tenantId: 'tenant-1',
  customerCode: 'KH-001',
  name: 'Công ty Ánh Dương',
  businessType: 'organization',
  businessRegistrationCode: '',
  imageUrl: null,
  countryCode: 'VN',
  regionCode: null,
  regionName: '',
  phone: '',
  email: '',
  addressDetail: '',
  status: 'active',
  note: '',
};

describe('CustomerDetailTabs', () => {
  it('switches between customer detail sections', async () => {
    const user = userEvent.setup();

    render(<CustomerDetailTabs customer={customer} />);

    expect(
      screen.getByRole('heading', { name: 'Hợp đồng' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: /Nhân viên/ }));

    expect(
      screen.getByRole('heading', { name: 'Nhân viên' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        'Dữ liệu của khách hàng Công ty Ánh Dương sẽ hiển thị tại đây.',
      ),
    ).toBeInTheDocument();
  });
});
