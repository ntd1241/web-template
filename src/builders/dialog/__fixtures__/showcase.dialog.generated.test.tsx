import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ShowcaseDialog } from './showcase.dialog.generated';

describe('generated dialog render proof', () => {
  it('renders title, description, content and footer actions', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onSubmit = vi.fn();

    render(
      <ShowcaseDialog
        open
        onOpenChange={vi.fn()}
        onCancel={onCancel}
        onSubmit={onSubmit}
      >
        <div>Dialog content</div>
      </ShowcaseDialog>,
    );

    expect(screen.getByRole('dialog')).toHaveTextContent('Tạo bản ghi');
    expect(
      screen.getByText('Nhập thông tin để tạo bản ghi mới.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Dialog content')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Hủy' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
