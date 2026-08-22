/**
 * Scaffolded by table-builder from `src/project/contracts/templates/contract-template.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
 * You own this file now — fill the `cell: () => null` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Archive, Eye, Pencil } from 'lucide-react';
import { useNumberFormat } from '@/providers/number-format-provider';
import { Button } from '@/components/ui/button';
import { createColumnHelpers } from '@/components/ui/data-grid-columns';
import type { ContractTemplate } from '../model/contract-template';
import { ContractTemplateStatusBadge } from './contract-template-status-badge';

export interface UseContractTemplateColumnsParams {
  onView: (template: ContractTemplate) => void;
  onEdit: (template: ContractTemplate) => void;
  onArchive: (template: ContractTemplate) => void;
}

export function useContractTemplateColumns(
  params: UseContractTemplateColumnsParams,
): ColumnDef<ContractTemplate>[] {
  const { formatNumber, formatCurrency, formatPercent } = useNumberFormat();

  return useMemo(() => {
    const col = createColumnHelpers<ContractTemplate>({
      formatNumber,
      formatCurrency,
      formatPercent,
    });

    return [
      col.custom({
        id: 'template',
        header: 'Mẫu hợp đồng',
        headerClassName: 'min-w-[300px]',
        size: 340,
        enableSorting: false,
        cell: (row) => (
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-semibold text-foreground">
              {row.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {row.code}
            </span>
          </div>
        ),
      }),
      col.custom({
        id: 'status',
        header: 'Trạng thái',
        headerClassName: 'w-[150px]',
        size: 150,
        enableSorting: false,
        cell: (row) => <ContractTemplateStatusBadge status={row.status} />,
      }),
      col.number({
        id: 'lineCount',
        header: 'Khoản phí',
        get: (row) => row.lineCount,
        headerClassName: 'w-[120px]',
        size: 120,
        enableSorting: false,
      }),
      col.number({
        id: 'contractCount',
        header: 'Hợp đồng đã tạo',
        get: (row) => row.contractCount,
        headerClassName: 'w-[160px]',
        size: 160,
        enableSorting: false,
      }),
      col.custom({
        id: 'version',
        header: 'Phiên bản',
        headerClassName: 'w-[130px]',
        size: 130,
        enableSorting: false,
        cell: (row) =>
          row.latestVersionNo ? (
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              v{row.latestVersionNo}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Chưa có</span>
          ),
      }),
      col.date({
        id: 'updatedAt',
        header: 'Cập nhật gần nhất',
        get: (row) => row.updatedAt,
        headerClassName: 'w-[170px]',
        size: 170,
        enableSorting: false,
      }),
      col.actions({
        id: 'actions',
        header: '',
        headerClassName: 'w-[100px]',
        cellClassName: 'text-right',
        size: 100,
        enableSorting: false,
        cell: (row) => (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              mode="icon"
              size="sm"
              aria-label={`Xem mẫu ${row.name}`}
              onClick={() => params.onView(row)}
            >
              <Eye className="size-4" />
            </Button>
            {row.status !== 'archived' ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  aria-label={`Sửa mẫu ${row.name}`}
                  onClick={() => params.onEdit(row)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  aria-label={`Lưu trữ mẫu ${row.name}`}
                  onClick={() => params.onArchive(row)}
                >
                  <Archive className="size-4" />
                </Button>
              </>
            ) : null}
          </div>
        ),
      }),
    ];
  }, [formatNumber, formatCurrency, formatPercent, params]);
}
