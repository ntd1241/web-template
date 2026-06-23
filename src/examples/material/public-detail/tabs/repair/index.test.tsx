import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RepairTab } from './index';

describe('RepairTab', () => {
  it('renders repair history as status cards with date filters', async () => {
    const user = userEvent.setup();

    render(<RepairTab />);

    expect(
      screen.getByRole('heading', { name: 'Lịch sử sửa chữa' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Số lượng: 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Từ ngày')).toHaveAttribute(
      'placeholder',
      'dd/MM/yyyy',
    );
    expect(screen.getByLabelText('Đến ngày')).toHaveAttribute(
      'placeholder',
      'dd/MM/yyyy',
    );
    expect(screen.getByRole('button', { name: 'Lọc' })).toBeInTheDocument();

    const articleNames = screen
      .getAllByRole('article')
      .map((article) => article.getAttribute('aria-label'));

    expect(articleNames).toEqual([
      'Thay vòi phun bị nứt',
      'Kiểm tra rò rỉ van xả',
      'Nạp sạc bình và thay tem kiểm định',
    ]);
    expect(screen.getByText('Hoàn tất')).toBeInTheDocument();
    expect(screen.getByText('Đang xử lý')).toBeInTheDocument();
    expect(screen.getByText('Không đạt')).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Văn Hùng')).toBeInTheDocument();
    expect(screen.getByText('Đội kỹ thuật PCCC Gia Phú')).toBeInTheDocument();
    await user.hover(screen.getByText('Nguyễn Văn Hùng'));
    expect(await screen.findAllByText('Người phụ trách')).toHaveLength(2);
    await user.hover(screen.getByText('Đội kỹ thuật PCCC Gia Phú'));
    expect(await screen.findAllByText('Đơn vị nhận sửa chữa')).toHaveLength(2);
    expect(
      screen.getByText(/18\/03\/2026 - 20\/03\/2026 \(Dự kiến\)/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Người phụ trách:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Đơn vị nhận sửa chữa:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Thời gian dừng/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Kỹ thuật viên/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Đơn vị:/)).not.toBeInTheDocument();
    expect(screen.queryByText('Chi phí')).not.toBeInTheDocument();
    expect(screen.queryByText(/Kết quả:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Bước tiếp theo:/)).not.toBeInTheDocument();
  });

  it('filters repair cards by date range when applying filters', () => {
    render(<RepairTab />);

    fireEvent.change(screen.getByLabelText('Từ ngày'), {
      target: { value: '01/01/2026' },
    });
    fireEvent.change(screen.getByLabelText('Đến ngày'), {
      target: { value: '31/12/2026' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Lọc' }));

    expect(
      screen.getByRole('article', { name: 'Thay vòi phun bị nứt' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('article', {
        name: 'Nạp sạc bình và thay tem kiểm định',
      }),
    ).not.toBeInTheDocument();
  });
});
