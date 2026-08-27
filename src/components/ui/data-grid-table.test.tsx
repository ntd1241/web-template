import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridTable } from './data-grid-table';

interface TestRow {
  id: string;
  name: string;
}

function LoadingTable({ columns }: { columns: ColumnDef<TestRow>[] }) {
  const table = useReactTable({
    data: [],
    columns,
    state: { pagination: { pageIndex: 0, pageSize: 3 } },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataGrid table={table} recordCount={0} isLoading>
      <DataGridTable />
    </DataGrid>
  );
}

function FetchingTable() {
  const table = useReactTable({
    data: [{ id: '1', name: 'Nhân viên cũ' }],
    columns: [{ id: 'name', accessorKey: 'name', header: 'Tên' }],
    state: { pagination: { pageIndex: 0, pageSize: 3 } },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataGrid table={table} recordCount={1} isFetching>
      <DataGridTable />
    </DataGrid>
  );
}

describe('DataGridTable loading state', () => {
  it('renders default skeleton cells for every loading row and column', () => {
    render(
      <LoadingTable
        columns={[
          { id: 'name', accessorKey: 'name', header: 'Tên' },
          { id: 'total', accessorKey: 'total', header: 'Tổng tiền' },
        ]}
      />,
    );

    expect(document.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(6);
    expect(
      document.querySelector('[data-slot="data-grid-fetching-overlay"]'),
    ).not.toBeInTheDocument();
  });

  it('keeps a column-specific skeleton override', () => {
    render(
      <LoadingTable
        columns={[
          {
            id: 'name',
            accessorKey: 'name',
            header: 'Tên',
            meta: { skeleton: <span data-testid="custom-skeleton" /> },
          },
        ]}
      />,
    );

    expect(screen.getAllByTestId('custom-skeleton')).toHaveLength(3);
    expect(
      document.querySelector('[data-slot="skeleton"]'),
    ).not.toBeInTheDocument();
  });

  it('keeps previous rows visible with a fetching shimmer state', () => {
    render(<FetchingTable />);

    expect(screen.getByText('Nhân viên cũ')).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="data-grid-fetching-overlay"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="data-grid-table-body"]'),
    ).toHaveAttribute('data-fetching', 'true');
  });

  it('renders an inline header filter below the column label', () => {
    render(
      <LoadingTable
        columns={[
          {
            id: 'name',
            accessorKey: 'name',
            header: 'Tên',
            meta: {
              headerFilter: (
                <input aria-label="Lọc theo tên" data-testid="header-filter" />
              ),
            },
          },
        ]}
      />,
    );

    const header = screen.getByRole('columnheader');
    expect(header).toHaveTextContent('Tên');
    expect(header).toContainElement(screen.getByTestId('header-filter'));
  });
});
