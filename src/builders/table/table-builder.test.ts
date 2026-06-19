import { describe, expect, it } from 'vitest';
import type { TableSpec } from './column-spec';
import { buildColumnsModule } from './table-builder';

const employeesSpec: TableSpec = {
  entity: 'Employee',
  modelImport: '../model/employee',
  columns: [
    { kind: 'index', header: 'STT' },
    {
      kind: 'custom',
      id: 'name',
      header: 'Nhân viên',
      headerClassName: 'min-w-[260px]',
    },
    {
      kind: 'badge',
      id: 'status',
      header: 'Trạng thái',
      field: 'status',
      headerClassName: 'w-[140px]',
      config: {
        active: {
          label: 'Đang hoạt động',
          className: 'bg-admin-success-bg text-admin-success-text',
          dotClassName: 'bg-admin-success-dot',
        },
        locked: { label: 'Đã khóa', variant: 'outline' },
      },
    },
    { kind: 'currency', id: 'salary', header: 'Lương', field: 'salary' },
    { kind: 'date', id: 'startDate', header: 'Ngày vào', field: 'startDate' },
    { kind: 'actions', header: 'Thao tác', headerClassName: 'w-[120px]' },
  ],
};

describe('buildColumnsModule', () => {
  const source = buildColumnsModule(employeesSpec);

  it('emits the scaffold-and-own banner and default hook name', () => {
    expect(source).toContain('Scaffolded by table-builder');
    expect(source).toContain('You own this file now');
    expect(source).toContain(
      'export function useEmployeeColumns(): ColumnDef<Employee>[] {',
    );
  });

  it('imports only what the columns use (no ReactNode, no callbacks)', () => {
    expect(source).toContain("import { useMemo } from 'react';");
    expect(source).not.toContain('ReactNode');
    expect(source).toContain('type StatusBadgeConfig');
    expect(source).toContain(
      "import type { Employee } from '../model/employee';",
    );
  });

  it('projects accessor fields via get', () => {
    expect(source).toContain('col.currency({');
    expect(source).toContain('get: (row) => row.salary,');
    expect(source).toContain('col.date({');
  });

  it('emits a standalone badge config and references it', () => {
    expect(source).toContain(
      'const statusBadgeConfig: StatusBadgeConfig<string> = {',
    );
    expect(source).toContain("active: { label: 'Đang hoạt động'");
    expect(source).toContain(
      "locked: { label: 'Đã khóa', variant: 'outline' },",
    );
    expect(source).toContain('config: statusBadgeConfig,');
  });

  it('emits inline cell stubs for actions/custom (no callbacks, deps stay [])', () => {
    expect(source).toContain('col.custom({');
    expect(source).toContain('col.actions({');
    expect(source).toContain('// TODO(scaffold): điền nội dung cell');
    expect(source).toContain('cell: () => null,');
    expect(source).toContain('}, []);');
    expect(source).not.toContain('options');
  });

  it('quotes badge config keys that are not valid identifiers', () => {
    const out = buildColumnsModule({
      entity: 'Material',
      modelImport: '../model/material',
      columns: [
        {
          kind: 'badge',
          id: 'group',
          header: 'Nhóm',
          field: 'group',
          config: { 'kiem-ke': { label: 'Kiểm kê', variant: 'primary' } },
        },
      ],
    });
    expect(out).toContain(
      "'kiem-ke': { label: 'Kiểm kê', variant: 'primary' },",
    );
  });

  it('records the spec path in the banner when provided', () => {
    const withPath = buildColumnsModule({
      entity: 'Product',
      modelImport: '../model/product',
      specPath: '../product.table.spec.ts',
      columns: [{ kind: 'text', id: 'name', header: 'Tên', field: 'name' }],
    });
    expect(withPath).toContain(
      'Scaffolded by table-builder from `../product.table.spec.ts`.',
    );
    expect(withPath).toContain(
      'export function useProductColumns(): ColumnDef<Product>[] {',
    );
  });

  it('rejects an invalid spec', () => {
    expect(() =>
      buildColumnsModule({
        entity: 'Bad',
        modelImport: '../x',
        columns: [{ kind: 'text', id: '1bad', header: 'x', field: 'name' }],
      } as never),
    ).toThrow();
  });

  it('matches the snapshot', () => {
    expect(source).toMatchSnapshot();
  });
});
