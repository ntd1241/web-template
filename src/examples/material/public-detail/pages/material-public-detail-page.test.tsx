import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MaterialPublicDetailPage } from './material-public-detail-page';

describe('MaterialPublicDetailPage', () => {
  it('shows non-general tab content without keeping the gallery above it', async () => {
    const user = userEvent.setup();

    render(<MaterialPublicDetailPage />);

    expect(
      screen.getByRole('heading', { name: 'Thông số kỹ thuật' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Photo gallery' })).toBeVisible();

    await user.click(screen.getByRole('tab', { name: 'Lịch sử bàn giao' }));

    expect(
      screen.getByRole('heading', { name: 'Lịch sử bàn giao' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('region', { name: 'Photo gallery' }),
    ).not.toBeInTheDocument();
  });
});
