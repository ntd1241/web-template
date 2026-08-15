import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CustomerDetailLayout } from './__fixtures__/customer-detail-layout.generated';

describe('generated detail layout render proof', () => {
  it('renders the profile, information and generated tabs', () => {
    render(
      <CustomerDetailLayout
        profile={<div>Hồ sơ khách hàng</div>}
        information={<div>Thông tin khách hàng</div>}
        contractsContent={<div>Nội dung hợp đồng</div>}
        employeesContent={<div>Nội dung nhân viên</div>}
        reportsContent={<div>Nội dung báo cáo</div>}
      />,
    );

    expect(screen.getByText('Hồ sơ khách hàng')).toBeInTheDocument();
    expect(screen.getByText('Thông tin khách hàng')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Hợp đồng/ })).toBeInTheDocument();
    expect(screen.getByText('Nội dung hợp đồng')).toBeInTheDocument();
  });
});
