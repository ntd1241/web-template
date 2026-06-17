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

  it('selects all visible enabled options and clears selection', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    const { rerender } = render(
      <MultiSelect
        options={OPTIONS}
        value={[]}
        onChange={handleChange}
        placeholder="Chọn vai trò"
      />,
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Chọn tất cả' }));

    expect(handleChange).toHaveBeenCalledWith([
      'nhan-vien',
      'quan-ly',
      'chu-so-huu',
    ]);

    rerender(
      <MultiSelect
        options={OPTIONS}
        value={['nhan-vien', 'quan-ly', 'chu-so-huu']}
        onChange={handleChange}
        placeholder="Chọn vai trò"
      />,
    );

    await user.click(screen.getByRole('option', { name: 'Bỏ chọn tất cả' }));

    expect(handleChange).toHaveBeenLastCalledWith([]);
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
