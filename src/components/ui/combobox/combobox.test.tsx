import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Combobox } from './combobox';
import type { ComboboxOption } from './combobox';

const OPTIONS: Array<ComboboxOption> = [
  { value: 'nhan-vien', label: 'Nhân viên' },
  { value: 'quan-ly', label: 'Quản lý' },
  { value: 'chu-so-huu', label: 'Chủ sở hữu' },
];

describe('Combobox', () => {
  it('opens when clicking the trigger', async () => {
    const user = userEvent.setup();

    render(<Combobox options={OPTIONS} placeholder="Chọn vai trò" />);

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByPlaceholderText('Tìm...')).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Nhân viên' }),
    ).toBeInTheDocument();
  });

  it('filters accented options with an accent-free query', async () => {
    const user = userEvent.setup();

    render(<Combobox options={OPTIONS} placeholder="Chọn vai trò" />);

    await user.click(screen.getByRole('combobox'));
    await user.type(screen.getByPlaceholderText('Tìm...'), 'quan');

    const listbox = screen.getByRole('listbox');
    expect(
      within(listbox).getByRole('option', { name: 'Quản lý' }),
    ).toBeInTheDocument();
    expect(
      within(listbox).queryByRole('option', { name: 'Nhân viên' }),
    ).not.toBeInTheDocument();
  });

  it('selects an option, fires callbacks, and closes', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const handleSelect = vi.fn();

    render(
      <Combobox
        options={OPTIONS}
        placeholder="Chọn vai trò"
        onChange={handleChange}
        onSelect={handleSelect}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Quản lý' }));

    expect(handleChange).toHaveBeenCalledWith('quan-ly');
    expect(handleSelect).toHaveBeenCalledWith(OPTIONS[1]);

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Tìm...')).not.toBeInTheDocument();
    });
  });

  it('shows an empty state for no matches', async () => {
    const user = userEvent.setup();

    render(
      <Combobox
        options={OPTIONS}
        placeholder="Chọn vai trò"
        emptyMessage="Không tìm thấy vai trò"
      />,
    );

    await user.click(screen.getByRole('combobox'));
    await user.type(screen.getByPlaceholderText('Tìm...'), 'ke toan');

    expect(screen.getByText('Không tìm thấy vai trò')).toBeInTheDocument();
  });

  it('keeps all passed options visible with manualFilter', async () => {
    const user = userEvent.setup();

    render(
      <Combobox options={OPTIONS} placeholder="Chọn vai trò" manualFilter />,
    );

    await user.click(screen.getByRole('combobox'));
    await user.type(screen.getByPlaceholderText('Tìm...'), 'ke toan');

    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getAllByRole('option')).toHaveLength(3);
  });
});
