import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type RowSelectionState,
} from '@tanstack/react-table';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridActionBar } from './data-grid-action-bar';

interface Row {
  id: string;
  name: string;
}

const rows: Row[] = [
  { id: 'r1', name: 'A' },
  { id: 'r2', name: 'B' },
];

function Harness({
  selection,
  onSelectionChange = () => {},
}: {
  selection: RowSelectionState;
  onSelectionChange?: (next: RowSelectionState) => void;
}) {
  const table = useReactTable({
    data: rows,
    columns: [{ id: 'name', accessorKey: 'name' }],
    getRowId: (row) => row.id,
    state: { rowSelection: selection },
    onRowSelectionChange: (updater) =>
      onSelectionChange(
        typeof updater === 'function' ? updater(selection) : updater,
      ),
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <DataGrid table={table} recordCount={rows.length}>
      <DataGridActionBar>
        <button type="button">Áp dụng</button>
      </DataGridActionBar>
    </DataGrid>
  );
}

describe('DataGridActionBar', () => {
  it('stays hidden when no row is selected', () => {
    render(<Harness selection={{}} />);
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
  });

  it('shows the selected count and action slot when rows are selected', () => {
    render(<Harness selection={{ r1: true, r2: true }} />);
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
    expect(screen.getByText('Đã chọn 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Áp dụng' })).toBeInTheDocument();
  });

  it('clears selection via the built-in clear button', () => {
    const onSelectionChange = vi.fn();
    render(
      <Harness
        selection={{ r1: true }}
        onSelectionChange={onSelectionChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Bỏ chọn' }));
    expect(onSelectionChange).toHaveBeenCalledWith({});
  });
});
