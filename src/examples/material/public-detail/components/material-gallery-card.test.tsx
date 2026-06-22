import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MaterialGalleryCard } from './material-gallery-card';

describe('MaterialGalleryCard', () => {
  it('đồng bộ carousel inline với thumbnail đang chọn', async () => {
    const user = userEvent.setup();
    const { container } = render(<MaterialGalleryCard />);

    await user.click(
      screen.getByRole('button', {
        name: 'Xem ảnh Bình chữa cháy CO₂ MT5 5kg',
      }),
    );

    expect(
      container.querySelector('.material-gallery-inline'),
    ).toBeInTheDocument();
    expect(screen.getByText('2/2')).toBeInTheDocument();
  });

  it('mở lightbox từ ảnh đang hiển thị', async () => {
    const user = userEvent.setup();
    render(<MaterialGalleryCard />);

    await user.click(
      screen.getByRole('button', {
        name: 'Mở ảnh Bình chữa cháy bột và CO₂',
      }),
    );

    expect(document.querySelector('.yarl__portal')).toBeInTheDocument();
  });
});
