import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommonTab } from './index';

describe('CommonTab', () => {
  it('hiển thị bảng thông số kỹ thuật không phân trang', () => {
    const { container } = render(<CommonTab />);

    expect(
      screen.getByRole('heading', { name: 'Thông số kỹ thuật' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Thông số' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Giá trị' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Khối lượng chất chữa cháy')).toBeInTheDocument();
    expect(screen.getByText('4 kg')).toBeInTheDocument();
    expect(screen.queryByText('Tìm kiếm')).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Đi tới trang tiếp theo'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('table')).toHaveClass('table-fixed', 'w-full');
    expect(
      screen.getByText('Khối lượng chất chữa cháy').closest('td'),
    ).toHaveClass('whitespace-normal', 'break-words');
    expect(
      container.querySelector('[class~="min-w-[560px]"]'),
    ).not.toBeInTheDocument();
    expect(container.querySelector('.overflow-x-auto')).not.toBeInTheDocument();
  });
});
