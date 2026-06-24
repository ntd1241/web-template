/**
 * Scaffolded by table-builder from `src/examples/material/models/table/material-model.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
 * You own this file now — fill the `cell: () => null` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Package, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createColumnHelpers } from '@/components/ui/data-grid-columns';
import type { MaterialModel } from '../../model/material-model';

export interface UseMaterialModelColumnsParams {
  groupNameById: Map<string, string>;
  deviceCountByModel: Map<string, number>;
  onEdit: (row: MaterialModel) => void;
  onDelete: (row: MaterialModel) => void;
}

export function useMaterialModelColumns({
  groupNameById,
  deviceCountByModel,
  onEdit,
  onDelete,
}: UseMaterialModelColumnsParams): ColumnDef<MaterialModel>[] {
  return useMemo(() => {
    const col = createColumnHelpers<MaterialModel>();

    return [
      col.index({
        header: 'STT',
        headerClassName: 'w-[64px]',
        size: 64,
      }),
      col.custom({
        id: 'identity',
        header: 'Mẫu vật tư',
        headerClassName: 'min-w-[260px]',
        size: 320,
        cell: (row) => (
          <div className="flex items-center gap-3">
            {row.imageUrls[0] ? (
              <img
                src={row.imageUrls[0]}
                alt={row.name}
                className="size-10 shrink-0 rounded-admin-control border border-border object-cover"
              />
            ) : (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-admin-control border border-border bg-admin-surface-alt text-muted-foreground">
                <Package className="size-5" />
              </span>
            )}
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium text-foreground">
                {row.name}
              </span>
              <span className="text-xs text-muted-foreground">{row.code}</span>
            </div>
          </div>
        ),
      }),
      col.custom({
        id: 'group',
        header: 'Nhóm',
        headerClassName: 'w-[170px]',
        size: 170,
        cell: (row) => (
          <span className="text-foreground">
            {groupNameById.get(row.groupId) ?? '—'}
          </span>
        ),
      }),
      col.custom({
        id: 'origin',
        header: 'Xuất xứ',
        headerClassName: 'w-[140px]',
        size: 140,
        cell: (row) =>
          row.origin ? (
            <span className="text-foreground">{row.origin}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      }),
      col.custom({
        id: 'specCount',
        header: 'Thông số',
        headerClassName: 'w-[110px]',
        size: 110,
        cell: (row) => (
          <span className="text-foreground">{row.specs.length}</span>
        ),
      }),
      col.custom({
        id: 'deviceCount',
        header: 'Thiết bị',
        headerClassName: 'w-[110px]',
        size: 110,
        cell: (row) => (
          <span className="text-foreground">
            {deviceCountByModel.get(row.id) ?? 0}
          </span>
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
              aria-label="Sửa mẫu"
              onClick={() => onEdit(row)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Xóa mẫu"
              className="text-muted-foreground"
              onClick={() => onDelete(row)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      }),
    ];
  }, [groupNameById, deviceCountByModel, onEdit, onDelete]);
}
