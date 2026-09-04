/**
 * Scaffolded by table-builder from `src/project/data-configuration/table/custom-field.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
 * You own this file now — fill the `cell: () => null` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useNumberFormat } from '@/providers/number-format-provider';
import { Badge } from '@/components/ui/badge';
import {
  createColumnHelpers,
  DataGridActionButton,
  getDataGridActionsColumnSize,
} from '@/components/ui/data-grid-columns';
import {
  CUSTOM_FIELD_TYPE_LABELS,
  type CustomField,
} from '../model/custom-field';

export interface UseCustomFieldColumnsParams {
  onEdit: (row: CustomField) => void;
  onDelete: (row: CustomField) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function useCustomFieldColumns(
  params: UseCustomFieldColumnsParams,
): ColumnDef<CustomField>[] {
  const { formatNumber, formatCurrency, formatPercent } = useNumberFormat();

  return useMemo(() => {
    const col = createColumnHelpers<CustomField>({
      formatNumber,
      formatCurrency,
      formatPercent,
    });

    return [
      col.text({
        id: 'label',
        header: 'Tên trường',
        get: (row) => row.label,
        headerClassName: 'min-w-[220px]',
        enableSorting: false,
      }),
      col.text({
        id: 'key',
        header: 'Mã trường',
        get: (row) => row.key,
        headerClassName: 'min-w-[180px]',
        enableSorting: false,
      }),
      col.custom({
        id: 'fieldType',
        header: 'Kiểu dữ liệu',
        headerClassName: 'min-w-[180px]',
        enableSorting: false,
        cell: (row) => (
          <span className="text-foreground">
            {CUSTOM_FIELD_TYPE_LABELS[row.fieldType]}
          </span>
        ),
      }),
      col.custom({
        id: 'isRequired',
        header: 'Bắt buộc',
        headerClassName: 'w-[120px]',
        enableSorting: false,
        cell: (row) => (
          <Badge
            variant={row.isRequired ? 'primary' : 'secondary'}
            appearance="light"
            size="sm"
          >
            {row.isRequired ? 'Có' : 'Không'}
          </Badge>
        ),
      }),
      col.custom({
        id: 'isActive',
        header: 'Trạng thái',
        headerClassName: 'w-[140px]',
        enableSorting: false,
        cell: (row) => (
          <Badge
            variant={row.isActive ? 'success' : 'secondary'}
            appearance="light"
            size="sm"
          >
            {row.isActive ? 'Đang dùng' : 'Đã tắt'}
          </Badge>
        ),
      }),
      col.number({
        id: 'sortOrder',
        header: 'Thứ tự',
        get: (row) => row.sortOrder,
        headerClassName: 'w-[100px]',
        enableSorting: false,
      }),
      col.actions({
        id: 'actions',
        header: '',
        size: getDataGridActionsColumnSize(2),
        enableSorting: false,
        cell: (row) => (
          <div
            className="flex justify-end gap-1"
            onClick={(event) => event.stopPropagation()}
          >
            {params.canEdit ? (
              <DataGridActionButton
                action="edit"
                tooltip="Sửa"
                aria-label={`Sửa trường ${row.label}`}
                type="button"
                mode="icon"
                size="sm"
                onClick={() => params.onEdit(row)}
              >
                <Pencil className="size-4" />
              </DataGridActionButton>
            ) : null}
            {params.canDelete ? (
              <DataGridActionButton
                action="delete"
                tooltip="Xóa"
                aria-label={`Xóa trường ${row.label}`}
                type="button"
                mode="icon"
                size="sm"
                onClick={() => params.onDelete(row)}
              >
                <Trash2 className="size-4" />
              </DataGridActionButton>
            ) : null}
          </div>
        ),
      }),
    ];
  }, [
    formatNumber,
    formatCurrency,
    formatPercent,
    params.canEdit,
    params.canDelete,
    params.onEdit,
    params.onDelete,
  ]);
}
