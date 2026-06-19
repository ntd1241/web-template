import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataGrid } from '@/components/ui/data-grid';
import type { Employee } from './employee';
import { useEmployeeColumns } from './employee.columns.generated';

/**
 * Render-proof for the table-builder golden: the generated `useEmployeeColumns`
 * hook must actually mount in a `DataGrid` and render real cell content (accessor
 * + badge cells), not just typecheck. Co-located with the fixture so the whole
 * proof lives next to the builder. (`custom`/`actions` cells are `() => null`
 * stubs by design — they render nothing until the owner fills them.)
 */
const rows: Employee[] = [
  {
    id: 'e1',
    name: 'Nguyễn Văn A',
    email: 'a@example.com',
    salary: 25_000_000,
    performance: 0.92,
    startDate: '2026-01-15T00:00:00+07:00',
    status: 'active',
  },
  {
    id: 'e2',
    name: 'Trần Thị B',
    email: 'b@example.com',
    salary: 18_000_000,
    performance: 0.74,
    startDate: '2025-09-01T00:00:00+07:00',
    status: 'locked',
  },
];

function DemoGrid() {
  const columns = useEmployeeColumns();
  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataGrid table={table} recordCount={rows.length}>
      {table.getRowModel().rows.map((tableRow) => (
        <div key={tableRow.id}>
          {tableRow.getVisibleCells().map((cell) => (
            <div key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
          ))}
        </div>
      ))}
    </DataGrid>
  );
}

describe('table-builder golden — render proof', () => {
  it('mounts the generated columns and renders cell content', () => {
    render(<DemoGrid />);

    // Accessor (text) cells.
    expect(screen.getByText('a@example.com')).toBeInTheDocument();
    expect(screen.getByText('b@example.com')).toBeInTheDocument();

    // Badge cells render the configured labels.
    expect(screen.getByText('Đang hoạt động')).toBeInTheDocument();
    expect(screen.getByText('Đã khóa')).toBeInTheDocument();
  });
});
