import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MaterialPublicDetailPage } from './material-public-detail-page';

describe('MaterialPublicDetailPage', () => {
  it('shows non-general tab content without keeping general content around it', async () => {
    const user = userEvent.setup();

    render(<MaterialPublicDetailPage />);

    expect(
      screen.getByRole('heading', { name: 'Thông số kỹ thuật' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Photo gallery' })).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Thông tin vật tư' }),
    ).toBeVisible();
    const materialInfoCard = screen
      .getByRole('heading', { name: 'Thông tin vật tư' })
      .closest('[data-slot="card"]');

    expect(materialInfoCard).not.toBeNull();
    expect(
      within(materialInfoCard as HTMLElement)
        .getByRole('img', { name: 'QR Code PCCC-BC-00128' })
        .getAttribute('data-qr-value'),
    ).toBe(window.location.href);
    expect(screen.getByRole('heading', { name: 'Nhãn QR Code' })).toBeVisible();
    const qrLabelCard = screen
      .getByRole('heading', { name: 'Nhãn QR Code' })
      .closest('[data-slot="card"]');

    expect(qrLabelCard).not.toBeNull();
    expect(
      within(qrLabelCard as HTMLElement).getByRole('img', {
        name: 'QR Code PCCC-BC-00128',
      }),
    ).toBeVisible();
    expect(
      within(qrLabelCard as HTMLElement)
        .getByRole('img', { name: 'QR Code PCCC-BC-00128' })
        .getAttribute('data-qr-value'),
    ).toBe(window.location.href);
    expect(
      within(qrLabelCard as HTMLElement).getByText(
        'Bình chữa cháy bột ABC 4kg',
      ),
    ).toBeVisible();
    expect(
      within(qrLabelCard as HTMLElement).getByText('PCCC-BC-00128'),
    ).toBeVisible();
    expect(
      within(qrLabelCard as HTMLElement).getByText('Ngày cấp: 15/06/2026'),
    ).toBeVisible();

    await user.click(screen.getByRole('tab', { name: 'Lịch sử bàn giao' }));

    expect(
      screen.getByRole('heading', { name: 'Lịch sử bàn giao' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('region', { name: 'Photo gallery' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Thông tin vật tư' }),
    ).not.toBeInTheDocument();
  });

  it('shows safety management tab content from the public tab navigation', async () => {
    const user = userEvent.setup();

    render(<MaterialPublicDetailPage />);

    await user.click(screen.getByRole('tab', { name: 'Quản lý an toàn' }));

    expect(
      screen.getByRole('heading', { name: 'Quản lý an toàn' }),
    ).toBeVisible();
    expect(
      screen.getByRole('article', {
        name: 'Kiểm tra an toàn ngày 15/06/2026',
      }),
    ).toBeVisible();
  });

  it('toggles public auth state and opens the new safety inspection form', async () => {
    const user = userEvent.setup();

    render(<MaterialPublicDetailPage />);

    await user.click(screen.getByRole('tab', { name: 'Quản lý an toàn' }));

    expect(
      screen.queryByRole('button', { name: 'Phiếu kiểm tra mới' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));

    expect(
      screen.getByRole('button', { name: 'Đăng xuất' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Phiếu kiểm tra mới' }),
    ).toBeVisible();

    await user.click(
      screen.getByRole('button', { name: 'Phiếu kiểm tra mới' }),
    );

    expect(
      screen.getByRole('heading', { name: 'Phiếu kiểm tra mới' }),
    ).toBeVisible();
    expect(screen.getByLabelText('Ngày kiểm tra')).toBeInTheDocument();
    expect(screen.getByLabelText('Người kiểm tra')).toBeInTheDocument();
    expect(screen.getByLabelText('Nhận xét')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quay lại' })).toBeVisible();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Quay lại' }));

    expect(
      screen.getByRole('heading', { name: 'Quản lý an toàn' }),
    ).toBeVisible();
  });
});
