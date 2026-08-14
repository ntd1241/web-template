import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ColorInput } from './color-input';

describe('ColorInput', () => {
  it('keeps the input and swatch as one group and commits a preset color', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<ColorInput defaultValue="#1677ff" onValueChange={handleChange} />);

    expect(
      screen.queryByRole('textbox', { name: 'Mã màu HEX' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Mở bảng chọn màu' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Mở bảng chọn màu' }));
    expect(screen.getByRole('textbox', { name: 'Mã màu HEX' })).toHaveValue(
      '#1677ff',
    );
    expect(screen.getByText('Màu hệ thống')).toBeInTheDocument();
    expect(screen.queryByText('Màu chủ đề')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Xanh biển' }));

    expect(handleChange).toHaveBeenLastCalledWith('#2196f3');
    expect(screen.getByRole('textbox', { name: 'Mã màu HEX' })).toHaveValue(
      '#2196f3',
    );
  });

  it('commits valid HEX text and native color picker values', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<ColorInput defaultValue="#000000" onValueChange={handleChange} />);

    await user.click(screen.getByRole('button', { name: 'Mở bảng chọn màu' }));
    const textInput = screen.getByRole('textbox', { name: 'Mã màu HEX' });
    await user.clear(textInput);
    await user.type(textInput, '#12abef');

    expect(handleChange).toHaveBeenLastCalledWith('#12abef');

    await user.clear(textInput);
    await user.type(textInput, '#fff');
    await user.tab();

    expect(handleChange).toHaveBeenLastCalledWith('#ffffff');

    fireEvent.change(screen.getByLabelText('Màu tùy chỉnh'), {
      target: { value: '#ffffff' },
    });

    expect(handleChange).toHaveBeenLastCalledWith('#ffffff');
    expect(textInput).toHaveValue('#ffffff');
  });
});
