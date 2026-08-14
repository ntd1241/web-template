import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  it('runs the confirmation action and allows cancelling', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <ConfirmDialog
        open
        onOpenChange={onOpenChange}
        title="Đóng chỉnh sửa?"
        description="Các thay đổi chưa lưu sẽ bị mất."
        confirmLabel="Đóng"
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole('alertdialog')).toHaveTextContent(
      'Các thay đổi chưa lưu sẽ bị mất.',
    );

    await user.click(screen.getByRole('button', { name: 'Hủy' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);

    await user.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
