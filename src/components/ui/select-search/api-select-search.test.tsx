import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiSelectSearch } from './api-select-search';

describe('ApiSelectSearch', () => {
  it('loads options when opened and searches through the loader', async () => {
    const user = userEvent.setup();
    const loadOptions = vi.fn(async ({ search }: { search: string }) => [
      {
        value: search ? 'quan-ly' : 'nhan-vien',
        label: search ? 'Quản lý' : 'Nhân viên',
      },
    ]);

    render(
      <ApiSelectSearch
        loadOptions={loadOptions}
        debounceMs={0}
        placeholder="Chọn vai trò"
      />,
    );

    await user.click(screen.getByRole('combobox'));
    await waitFor(() =>
      expect(loadOptions).toHaveBeenCalledWith(
        expect.objectContaining({ search: '' }),
      ),
    );
    expect(
      screen.getByRole('option', { name: 'Nhân viên' }),
    ).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Tìm...'), 'quan');
    await waitFor(() =>
      expect(loadOptions).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'quan' }),
      ),
    );

    const listbox = screen.getByRole('listbox');
    expect(
      within(listbox).getByRole('option', { name: 'Quản lý' }),
    ).toBeInTheDocument();
  });

  it('keeps the selected option visible while the API result is empty', async () => {
    const user = userEvent.setup();
    const loadOptions = vi.fn(async () => []);

    render(
      <ApiSelectSearch
        value="nhan-vien"
        selectedOption={{ value: 'nhan-vien', label: 'Nhân viên' }}
        loadOptions={loadOptions}
        debounceMs={0}
      />,
    );

    await user.click(screen.getByRole('combobox'));

    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Nhân viên' }),
      ).toBeInTheDocument();
    });
  });
});
