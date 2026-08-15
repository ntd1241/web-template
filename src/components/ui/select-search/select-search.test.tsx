import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SelectSearch } from './select-search';

const OPTIONS = [
  { value: 'nhan-vien', label: 'Nhân viên' },
  { value: 'quan-ly', label: 'Quản lý' },
  { value: 'chu-so-huu', label: 'Chủ sở hữu' },
];

describe('SelectSearch', () => {
  it('filters local options without Vietnamese accents', async () => {
    const user = userEvent.setup();

    render(<SelectSearch options={OPTIONS} placeholder="Chọn vai trò" />);

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

  it('supports grouped and custom option rendering', async () => {
    const user = userEvent.setup();

    render(
      <SelectSearch
        options={OPTIONS.map((option) => ({ ...option, group: 'Nhân sự' }))}
        renderOption={(option) => (
          <span data-testid="custom-option">{option.label}</span>
        )}
      />,
    );

    await user.click(screen.getByRole('combobox'));

    expect(screen.getByText('Nhân sự')).toBeInTheDocument();
    expect(screen.getAllByTestId('custom-option')).toHaveLength(3);
  });

  it('selects and clears an option by clicking the selected option again', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <SelectSearch
        value="quan-ly"
        options={OPTIONS}
        onChange={handleChange}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Quản lý' }));

    expect(handleChange).toHaveBeenCalledWith('');
  });
});
