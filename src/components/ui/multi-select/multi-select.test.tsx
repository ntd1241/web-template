import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MultiSelect } from './multi-select';
import type { MultiSelectOption } from './multi-select';

const OPTIONS: Array<MultiSelectOption> = [
  {
    value: 'nhan-vien',
    label: 'Nhân viên',
    group: 'Vai trò',
    count: 12,
  },
  {
    value: 'quan-ly',
    label: 'Quản lý',
    group: 'Vai trò',
    count: 3,
  },
  {
    value: 'chu-so-huu',
    label: 'Chủ sở hữu',
    group: 'Quản trị',
    count: 1,
  },
];

describe('MultiSelect', () => {
  it('toggles options and keeps the popover open', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <MultiSelect
        options={OPTIONS}
        value={[]}
        onChange={handleChange}
        placeholder="Chọn vai trò"
      />,
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /Quản lý/ }));

    expect(handleChange).toHaveBeenCalledWith(['quan-ly']);
    expect(screen.getByPlaceholderText('Tìm...')).toBeInTheDocument();
  });

  it('renders selected chips and removes them from the trigger', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <MultiSelect
        options={OPTIONS}
        value={['nhan-vien', 'quan-ly']}
        onChange={handleChange}
        placeholder="Chọn vai trò"
      />,
    );

    expect(screen.getByText('Nhân viên')).toBeInTheDocument();
    expect(screen.getByText('Quản lý')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Bỏ Nhân viên' }));

    expect(handleChange).toHaveBeenCalledWith(['quan-ly']);
  });

  it('can keep selected options out of the trigger', () => {
    render(
      <MultiSelect
        options={OPTIONS}
        value={['nhan-vien']}
        placeholder="Chọn nhân viên"
        showSelectedOptionsInTrigger={false}
      />,
    );

    const trigger = screen.getByRole('combobox');

    expect(within(trigger).getByText('Chọn nhân viên')).toBeInTheDocument();
    expect(within(trigger).queryByText('Nhân viên')).not.toBeInTheDocument();
  });

  it('filters accented labels with an accent-free query', async () => {
    const user = userEvent.setup();

    render(<MultiSelect options={OPTIONS} placeholder="Chọn vai trò" />);

    await user.click(screen.getByRole('combobox'));
    await user.type(screen.getByPlaceholderText('Tìm...'), 'quan ly');

    const listbox = screen.getByRole('listbox');
    expect(
      within(listbox).getByRole('option', { name: /Quản lý/ }),
    ).toBeInTheDocument();
    expect(
      within(listbox).queryByRole('option', { name: /Nhân viên/ }),
    ).not.toBeInTheDocument();
  });

  it('selects the first matching option when pressing Enter in search', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <MultiSelect
        options={OPTIONS}
        value={[]}
        onChange={handleChange}
        placeholder="Chọn vai trò"
      />,
    );

    await user.click(screen.getByRole('combobox'));
    const input = screen.getByPlaceholderText('Tìm...');
    await user.type(input, 'quan ly');
    await user.keyboard('{Enter}');

    expect(handleChange).toHaveBeenCalledWith(['quan-ly']);
    expect(input).toHaveFocus();
  });

  it('clears inline tag input after adding a suggestion with Enter', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <MultiSelect
        options={OPTIONS}
        value={[]}
        onChange={handleChange}
        searchMode="inline"
        placeholder="Thêm nhãn"
        searchPlaceholder="Tìm nhãn..."
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Tìm nhãn...' });
    await user.click(input);
    await user.type(input, 'quan ly');
    expect(input).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(handleChange).toHaveBeenCalledWith(['quan-ly']);
    expect(input).toHaveValue('');
  });

  it('renders one-level groups and right-aligned counts', async () => {
    const user = userEvent.setup();

    render(<MultiSelect options={OPTIONS} placeholder="Chọn vai trò" />);

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByText('Vai trò')).toBeInTheDocument();
    expect(screen.getByText('Quản trị')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});
