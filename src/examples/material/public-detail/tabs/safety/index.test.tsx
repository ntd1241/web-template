import { fireEvent, render, screen } from '@testing-library/react';
import { SafetyTab } from './index';

describe('SafetyTab', () => {
  it('renders safety inspection history newest first', () => {
    render(<SafetyTab />);

    expect(
      screen.getByRole('heading', { name: 'Quản lý an toàn' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Số lượng: 3')).toBeInTheDocument();

    const articleNames = screen
      .getAllByRole('article')
      .map((article) => article.getAttribute('aria-label'));

    expect(articleNames).toEqual([
      'Kiểm tra an toàn ngày 15/06/2026',
      'Kiểm tra an toàn ngày 12/03/2026',
      'Kiểm tra an toàn ngày 15/12/2025',
    ]);

    expect(screen.getByText('Phạm Anh Dũng')).toBeInTheDocument();
    expect(screen.getByText('31/32 chỉ tiêu')).toBeInTheDocument();
    expect(screen.getByText('29/32 chỉ tiêu')).toBeInTheDocument();
    expect(screen.getAllByText('Đạt')).toHaveLength(2);
    expect(screen.getByText('Chưa đạt')).toBeInTheDocument();
    expect(
      screen.getByText(/Cần vệ sinh nhẹ phần quai xách/),
    ).toBeInTheDocument();
  });

  it('filters safety inspection cards by date range', () => {
    render(<SafetyTab />);

    fireEvent.change(screen.getByLabelText('Từ ngày'), {
      target: { value: '01/01/2026' },
    });
    fireEvent.change(screen.getByLabelText('Đến ngày'), {
      target: { value: '31/03/2026' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Lọc' }));

    expect(screen.getByText('Số lượng: 1')).toBeInTheDocument();
    expect(
      screen.getByRole('article', {
        name: 'Kiểm tra an toàn ngày 12/03/2026',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('article', {
        name: 'Kiểm tra an toàn ngày 15/06/2026',
      }),
    ).not.toBeInTheDocument();
  });

  it('shows create inspection action only for authenticated users', () => {
    const handleCreateInspection = vi.fn();

    const { rerender } = render(<SafetyTab />);

    expect(
      screen.queryByRole('button', { name: 'Phiếu kiểm tra mới' }),
    ).not.toBeInTheDocument();

    rerender(
      <SafetyTab isAuthenticated onCreateInspection={handleCreateInspection} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Phiếu kiểm tra mới' }));

    expect(handleCreateInspection).toHaveBeenCalledTimes(1);
  });
});
