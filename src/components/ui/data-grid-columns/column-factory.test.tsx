import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataGrid } from '@/components/ui/data-grid';
import { createColumnHelpers } from './column-factory';

interface TestRow {
  id: string;
  name: string;
  amount: number;
  price: number;
  ratio: number;
  createdAt: string;
  status: 'active' | 'locked';
}

const row: TestRow = {
  id: 'row-1',
  name: 'Nguyen Van A',
  amount: 1234567,
  price: 2500000,
  ratio: 0.125,
  createdAt: '2026-06-17T08:30:00+07:00',
  status: 'active',
};

function TestGrid({
  columns,
  data = [row],
}: {
  columns: ColumnDef<TestRow>[];
  data?: TestRow[];
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataGrid table={table} recordCount={data.length}>
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

describe('createColumnHelpers', () => {
  const col = createColumnHelpers<TestRow>();

  it('creates text columns with an id and typed accessor', () => {
    const column = col.text({
      id: 'name',
      header: 'Ten',
      get: (item) => item.name,
    });

    expect(column.id).toBe('name');
    expect('accessorFn' in column).toBe(true);

    if ('accessorFn' in column && column.accessorFn) {
      expect(column.accessorFn(row, 0)).toBe('Nguyen Van A');
    }
  });

  it('renders shared number, currency, percent, and date formatting', () => {
    const columns = [
      col.number({
        id: 'amount',
        header: 'So luong',
        get: (item) => item.amount,
      }),
      col.currency({
        id: 'price',
        header: 'Gia',
        get: (item) => item.price,
      }),
      col.percent({
        id: 'ratio',
        header: 'Ti le',
        get: (item) => item.ratio,
        fractionDigits: 1,
      }),
      col.date({
        id: 'createdAt',
        header: 'Ngay tao',
        get: (item) => item.createdAt,
        mode: 'datetime',
      }),
    ];

    render(<TestGrid columns={columns} />);

    expect(screen.getByText('1.234.567')).toBeInTheDocument();
    expect(screen.getByText(/^2\.500\.000\s*₫$/)).toBeInTheDocument();
    expect(screen.getByText('12,5%')).toBeInTheDocument();
    expect(screen.getByText('17/06/2026 08:30')).toBeInTheDocument();
  });

  it('does not wrap text cells in Tooltip unless requested', () => {
    const columns = [
      col.text({
        id: 'name',
        header: 'Ten',
        get: (item) => item.name,
        tooltipOnTruncate: false,
      }),
    ];

    const { container } = render(<TestGrid columns={columns} />);

    expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="tooltip"]')).toBeNull();
  });

  it('renders editable select cells and commits on change', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const columns = [
      col.editableSelect({
        id: 'status',
        header: 'Trang thai',
        get: (item) => item.status,
        options: [
          { value: 'active', label: 'Dang hoat dong' },
          { value: 'locked', label: 'Da khoa' },
        ],
        onEdit,
        placeholder: 'Chon trang thai',
      }),
    ];

    render(<TestGrid columns={columns} />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Da khoa' }));

    expect(onEdit).toHaveBeenCalledWith(row, 'locked');
  });
});
