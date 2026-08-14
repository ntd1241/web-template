import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TagForm, useTagForm } from './tag-form.generated';

function TagFormHarness() {
  const form = useTagForm({
    defaultValues: {
      groupId: '',
      name: '',
      description: '',
      code: '',
      color: '#2563eb',
    },
  });

  return (
    <TagForm
      form={form}
      onSubmit={vi.fn()}
      groupIdOptions={[{ value: 'group-id', label: 'Nhóm mặc định' }]}
    />
  );
}

describe('TagForm color field', () => {
  it('expands the tag name field to the same width as the group field', () => {
    render(<TagFormHarness />);

    expect(
      screen
        .getByRole('textbox', { name: /Tên nhãn/ })
        .closest('[data-slot="form-item"]'),
    ).toHaveClass('md:col-span-12');
  });

  it('uses ColorInput and keeps preset selection in the RHF field', async () => {
    const user = userEvent.setup();

    render(<TagFormHarness />);

    expect(
      screen.queryByRole('textbox', { name: 'Mã màu HEX' }),
    ).not.toBeInTheDocument();

    const colorTrigger = screen.getByRole('button', {
      name: 'Mở bảng chọn màu',
    });
    expect(colorTrigger).toHaveClass('w-full');
    expect(colorTrigger.querySelector('span')).toHaveClass(
      'absolute',
      'inset-1',
    );

    await user.click(colorTrigger);
    expect(screen.getByRole('textbox', { name: 'Mã màu HEX' })).toHaveValue(
      '#2563eb',
    );
    expect(screen.getByText('Màu hệ thống')).toBeInTheDocument();
    expect(screen.queryByText('Màu chủ đề')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Xanh biển' }));

    expect(screen.getByRole('textbox', { name: 'Mã màu HEX' })).toHaveValue(
      '#2196f3',
    );
  });
});
