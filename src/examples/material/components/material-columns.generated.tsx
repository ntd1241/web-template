/**
 * Scaffolded by table-builder from `src/examples/material/table/material.table.fixture.ts`.
 * You own this file now — edit it freely (add buttons, badges, inline cell logic).
 * To refresh after the builder changes: re-run the builder to a scratch path and
 * reconcile your edits. The builder does NOT merge back into this file.
 *
 * OWNED: the `group` badge column is generated as-is; the `qr` / `identity` /
 * `tags` / `actions` cell stubs have been filled in place.
 */
import { useMemo } from 'react';
import { buildPath, ROUTES } from '@/constants/routes';
import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, Package, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  createColumnHelpers,
  type StatusBadgeConfig,
} from '@/components/ui/data-grid-columns';
import type { Material } from '../model/material';

const groupBadgeConfig: StatusBadgeConfig<string> = {
  'kiem-ke': { label: 'Thiết bị kiểm kê', variant: 'primary' },
  'van-phong': { label: 'Văn phòng', variant: 'secondary' },
  'an-toan': { label: 'An toàn lao động', variant: 'warning' },
  'cong-cu': { label: 'Công cụ - dụng cụ', variant: 'info' },
};

export function useMaterialColumns(): ColumnDef<Material>[] {
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
      col.badge({
        id: 'group',
        header: 'Nhóm',
        get: (row) => row.group,
        config: groupBadgeConfig,
        headerClassName: 'w-[180px]',
        size: 180,
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
          <Button asChild variant="outline" size="sm">
            <Link
              to={buildPath(ROUTES.EXAMPLE.MATERIAL_PUBLIC_DETAIL, {
                id: row.id,
              })}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="size-3.5" />
              Public
            </Link>
          </Button>
        ),
      }),
    ];
  }, []);
}
