import { useState } from 'react';
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { DataGridColumnVisibility } from './data-grid-column-visibility';

interface TestRow {
  name: string;
  email: string;
}

const columns: ColumnDef<TestRow>[] = [
  { accessorKey: 'name', header: 'Tên', meta: { headerTitle: 'Tên' } },
  { accessorKey: 'email', header: 'Email', meta: { headerTitle: 'Email' } },
  { id: 'actions', header: 'Thao tác', enableHiding: false },
];

function TestColumnVisibility({
  mode = 'popover',
}: {
  mode?: 'popover' | 'drawer';
}) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const table = useReactTable({
    data: [{ name: 'Nguyễn Văn A', email: 'a@example.com' }],
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <DataGridColumnVisibility table={table} mode={mode} />
      <output data-testid="visible-columns">
        {table
          .getVisibleLeafColumns()
          .map((column) => column.id)
          .join(',')}
      </output>
    </>
  );
}

describe('DataGridColumnVisibility', () => {
  beforeEach(() => {
    if (window.matchMedia) return;

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  });

  it('shows hideable columns and toggles their visibility', async () => {
    const user = userEvent.setup();
    render(<TestColumnVisibility />);

    await user.click(screen.getByRole('button', { name: 'Hiển thị cột' }));

    expect(screen.getByText('Hiển thị cột')).toBeInTheDocument();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Tên' })).toBeChecked();
    expect(
      screen.getByRole('menuitemcheckbox', { name: 'Email' }),
    ).toBeChecked();
    expect(
      screen.queryByRole('menuitemcheckbox', { name: 'Thao tác' }),
    ).toBeNull();

    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Email' }));

    expect(
      screen.getByRole('menuitemcheckbox', { name: 'Email' }),
    ).not.toBeChecked();
    expect(screen.getByTestId('visible-columns')).toHaveTextContent('name');
  });

  it('opens the main-table drawer with reorder handles', async () => {
    const user = userEvent.setup();
    render(<TestColumnVisibility mode="drawer" />);

    await user.click(screen.getByRole('button', { name: 'Hiển thị cột' }));

    expect(
      screen.getByRole('heading', { name: 'Hiển thị và sắp xếp cột' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Sắp xếp cột Tên' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Hiển thị cột Email' }),
    ).toBeChecked();
  });
});
