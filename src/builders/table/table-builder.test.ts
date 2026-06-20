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

  it('emits editable select columns with params, static options, and memo deps', () => {
    const out = buildColumnsModule({
      entity: 'Employee',
      modelImport: '../model/employee',
      columns: [
        {
          kind: 'editableSelect',
          id: 'statusSelect',
          header: 'Đổi trạng thái',
          field: 'status',
          placeholder: 'Chọn trạng thái',
          options: [
            { value: 'active', label: 'Đang hoạt động' },
            { value: 'locked', label: 'Đã khóa' },
          ],
        },
      ],
    });

    expect(out).toContain('const statusSelectOptions = [');
    expect(out).toContain('export interface UseEmployeeColumnsParams {');
    expect(out).toContain(
      'onStatusSelectEdit: (row: Employee, value: string) => void;',
    );
    expect(out).toContain(
      'export function useEmployeeColumns(params: UseEmployeeColumnsParams): ColumnDef<Employee>[] {',
    );
    expect(out).toContain('col.editableSelect({');
    expect(out).toContain('options: statusSelectOptions,');
    expect(out).toContain('onEdit: params.onStatusSelectEdit,');
    expect(out).toContain('placeholder: \'Chọn trạng thái\',');
    expect(out).toContain('}, [params.onStatusSelectEdit]);');
  });

  it('emits prop-fed editable select options as hook params and deps', () => {
    const out = buildColumnsModule({
      entity: 'Employee',
      modelImport: '../model/employee',
      columns: [
        {
          kind: 'editableSelect',
          id: 'statusSelect',
          header: 'Đổi trạng thái',
          field: 'status',
          optionsFrom: 'prop',
        },
      ],
    });

    expect(out).not.toContain('const statusSelectOptions = [');
    expect(out).toContain(
      'statusSelectOptions: { value: string; label: string }[];',
    );
    expect(out).toContain('options: params.statusSelectOptions,');
    expect(out).toContain(
      '}, [params.onStatusSelectEdit, params.statusSelectOptions]);',
    );
  });

  it('keeps hooks without editable columns parameter-less for backward compatibility', () => {
    const out = buildColumnsModule({
      entity: 'Product',
      modelImport: '../model/product',
      columns: [{ kind: 'text', id: 'name', header: 'Tên', field: 'name' }],
    });

    expect(out).toContain(
      'export function useProductColumns(): ColumnDef<Product>[] {',
    );
    expect(out).toContain('}, []);');
    expect(out).not.toContain('Params');
  });

  it('requires static editable select options', () => {
    expect(() =>
      buildColumnsModule({
        entity: 'Employee',
        modelImport: '../model/employee',
        columns: [
          {
            kind: 'editableSelect',
            id: 'statusSelect',
            header: 'Đổi trạng thái',
            field: 'status',
          },
        ],
      }),
    ).toThrow('Cột editableSelect dùng options tĩnh');
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
