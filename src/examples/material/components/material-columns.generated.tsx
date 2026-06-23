/**
 * Scaffolded by table-builder from `src/examples/material/table/material.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
 * You own this file now — fill the `cell: () => null` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */
import { useMemo } from 'react';
import { buildPath, ROUTES } from '@/constants/routes';
import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, Package, Pencil, QrCode, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createColumnHelpers } from '@/components/ui/data-grid-columns';
import type { Material } from '../model/material';

export interface UseMaterialColumnsParams {
  modelNameById: Map<string, string>;
  groupNameByModelId: Map<string, string>;
  onEdit: (row: Material) => void;
  onDelete: (row: Material) => void;
}

export function useMaterialColumns({
  modelNameById,
  groupNameByModelId,
  onEdit,
  onDelete,
}: UseMaterialColumnsParams): ColumnDef<Material>[] {
  return useMemo(() => {
    const col = createColumnHelpers<Material>();

    return [
      col.index({
        header: 'STT',
        headerClassName: 'w-[64px]',
        size: 64,
      }),
      col.custom({
        id: 'qr',
        header: 'QR',
        headerClassName: 'w-[88px]',
        size: 88,
        cell: (row) => (
          <span
            title={row.code}
            className="flex size-10 items-center justify-center rounded-admin-control border border-border bg-admin-surface-alt text-admin-blue-dark"
          >
            <QrCode className="size-5" />
          </span>
        ),
      }),
      col.custom({
        id: 'identity',
        header: 'Vật tư',
        headerClassName: 'min-w-[280px]',
        size: 340,
        cell: (row) => (
          <div className="flex items-center gap-3">
            {row.imageUrl ? (
              <img
                src={row.imageUrl}
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
        id: 'model',
        header: 'Mẫu',
        headerClassName: 'w-[200px]',
        size: 200,
        cell: (row) => (
          <span className="text-foreground">
            {modelNameById.get(row.modelId) ?? '—'}
          </span>
        ),
      }),
      col.custom({
        id: 'group',
        header: 'Nhóm',
        headerClassName: 'w-[180px]',
        size: 180,
        cell: (row) => (
          <span className="text-foreground">
            {groupNameByModelId.get(row.modelId) ?? '—'}
          </span>
        ),
      }),
      col.custom({
        id: 'tags',
        header: 'Thẻ',
        headerClassName: 'min-w-[220px]',
        size: 260,
        cell: (row) => (
          <div className="flex flex-wrap items-center gap-1.5">
            {row.tags.map((tag) => (
              <Badge key={tag} variant="secondary" appearance="light">
                {tag}
              </Badge>
            ))}
          </div>
        ),
      }),
      col.actions({
        header: 'Thao tác',
        headerClassName: 'w-[120px]',
        cellClassName: 'text-right',
        size: 120,
        cell: (row) => (
          <div className="flex items-center justify-end gap-1">
            <Button asChild variant="ghost" size="icon" aria-label="Mở public">
              <Link
                to={buildPath(ROUTES.EXAMPLE.MATERIAL_PUBLIC_DETAIL, {
                  id: row.id,
                })}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="size-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sửa thiết bị"
              onClick={() => onEdit(row)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Xóa thiết bị"
              className="text-muted-foreground"
              onClick={() => onDelete(row)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      }),
    ];
  }, [groupNameByModelId, modelNameById, onDelete, onEdit]);
}
