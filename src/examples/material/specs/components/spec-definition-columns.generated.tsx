/**
 * Scaffolded by table-builder from `src/examples/material/specs/table/spec-definition.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
 * You own this file now — fill the `cell: () => null` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  createColumnHelpers,
  type StatusBadgeConfig,
} from '@/components/ui/data-grid-columns';
import type { SpecDefinition } from '../../model/spec-definition';

export interface UseSpecDefinitionColumnsParams {
  onEdit: (row: SpecDefinition) => void;
  onDelete: (row: SpecDefinition) => void;
}

const dataTypeBadgeConfig: StatusBadgeConfig<string> = {
  text: { label: 'Văn bản', variant: 'secondary' },
  number: { label: 'Số + đơn vị', variant: 'info' },
  single_select: { label: 'Chọn 1', variant: 'primary' },
  multi_select: { label: 'Chọn nhiều', variant: 'primary' },
  dynamic_list: { label: 'Theo mẫu', variant: 'warning' },
  boolean: { label: 'Có / Không', variant: 'warning' },
  date: { label: 'Ngày tháng', variant: 'secondary' },
};

export function useSpecDefinitionColumns({
  onEdit,
  onDelete,
}: UseSpecDefinitionColumnsParams): ColumnDef<SpecDefinition>[] {
  return useMemo(() => {
    const col = createColumnHelpers<SpecDefinition>();

    return [
      col.index({
        header: 'STT',
        headerClassName: 'w-[64px]',
        size: 64,
      }),
      col.custom({
        id: 'identity',
        header: 'Thông số',
        headerClassName: 'min-w-[240px]',
        size: 300,
        cell: (row) => (
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-foreground">
              {row.name}
            </span>
            <span className="text-xs text-muted-foreground">{row.code}</span>
          </div>
        ),
      }),
      col.badge({
        id: 'dataType',
        header: 'Kiểu dữ liệu',
        get: (row) => row.dataType,
        config: dataTypeBadgeConfig,
        headerClassName: 'w-[150px]',
        size: 150,
      }),
      col.custom({
        id: 'unit',
        header: 'Đơn vị',
        headerClassName: 'w-[110px]',
        size: 110,
        cell: (row) =>
          row.unit ? (
            <span className="text-foreground">{row.unit}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      }),
      col.custom({
        id: 'optionsCount',
        header: 'Lựa chọn',
        headerClassName: 'w-[120px]',
        size: 120,
        cell: (row) =>
          row.options?.length ? (
            <span className="text-foreground">{row.options.length} mục</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      }),
      col.custom({
        id: 'status',
        header: 'Trạng thái',
        headerClassName: 'w-[130px]',
        size: 130,
        cell: (row) => (
          <Badge
            variant={row.isActive ? 'success' : 'secondary'}
            appearance="light"
          >
            {row.isActive ? 'Đang dùng' : 'Ngừng dùng'}
          </Badge>
        ),
      }),
      col.actions({
        header: 'Thao tác',
        headerClassName: 'w-[120px]',
        cellClassName: 'text-right',
        size: 120,
        cell: (row) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sửa thông số"
              onClick={() => onEdit(row)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Xóa thông số"
              className="text-muted-foreground"
              onClick={() => onDelete(row)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      }),
    ];
  }, [onEdit, onDelete]);
}
