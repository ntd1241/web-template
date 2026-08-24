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
import {
  createColumnHelpers,
  DataGridActionButton,
} from '@/components/ui/data-grid-columns';
import type { ContractTemplate } from '../model/contract-template';
import { CONTRACT_TEMPLATE_STATUS_FILTER_OPTIONS } from './contract-template-column-filters';
import {
  ContractTemplateContractCountColumnFilter,
  ContractTemplateLineCountColumnFilter,
  ContractTemplateStatusColumnFilter,
  ContractTemplateTextColumnFilter,
  ContractTemplateUpdatedAtColumnFilter,
  ContractTemplateVersionNoColumnFilter,
} from './contract-template-column-filters.generated';
import { ContractTemplateStatusBadge } from './contract-template-status-badge';

export interface UseContractTemplateColumnsParams {
  onView: (template: ContractTemplate) => void;
  onEdit: (template: ContractTemplate) => void;
  onArchive: (template: ContractTemplate) => void;
  templateSearch: string;
  onTemplateSearchChange: (value: string) => void;
  statuses: string[];
  onStatusesChange: (value: string[]) => void;
  lineCount: { min?: number; max?: number };
  onLineCountChange: (value: { min?: number; max?: number }) => void;
  contractCount: { min?: number; max?: number };
  onContractCountChange: (value: { min?: number; max?: number }) => void;
  versionNo: { min?: number; max?: number };
  onVersionNoChange: (value: { min?: number; max?: number }) => void;
  updatedAt: { from?: string; to?: string };
  onUpdatedAtChange: (value: { from?: string; to?: string }) => void;
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
        headerFilter: (
          <ContractTemplateTextColumnFilter
            value={params.templateSearch}
            onChange={params.onTemplateSearchChange}
          />
        ),
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
        headerFilter: (
          <ContractTemplateStatusColumnFilter
            value={params.statuses}
            options={CONTRACT_TEMPLATE_STATUS_FILTER_OPTIONS}
            onChange={params.onStatusesChange}
          />
        ),
        headerClassName: 'w-[150px]',
        size: 150,
        enableSorting: false,
        cell: (row) => <ContractTemplateStatusBadge status={row.status} />,
      }),
      col.number({
        id: 'lineCount',
        header: 'Khoản phí',
        get: (row) => row.lineCount,
        headerFilter: (
          <ContractTemplateLineCountColumnFilter
            value={params.lineCount}
            onChange={params.onLineCountChange}
          />
        ),
        headerClassName: 'w-[120px]',
        size: 120,
        enableSorting: false,
      }),
      col.number({
        id: 'contractCount',
        header: 'Hợp đồng đã tạo',
        get: (row) => row.contractCount,
        headerFilter: (
          <ContractTemplateContractCountColumnFilter
            value={params.contractCount}
            onChange={params.onContractCountChange}
          />
        ),
        headerClassName: 'w-[160px]',
        size: 160,
        enableSorting: false,
      }),
      col.custom({
        id: 'version',
        header: 'Phiên bản',
        headerFilter: (
          <ContractTemplateVersionNoColumnFilter
            value={params.versionNo}
            onChange={params.onVersionNoChange}
          />
        ),
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
        headerFilter: (
          <ContractTemplateUpdatedAtColumnFilter
            value={params.updatedAt}
            onChange={params.onUpdatedAtChange}
          />
        ),
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
            <DataGridActionButton
              action="view"
              tooltip="Xem"
              type="button"
              mode="icon"
              size="sm"
              aria-label={`Xem mẫu ${row.name}`}
              onClick={() => params.onView(row)}
            >
              <Eye className="size-4" />
            </DataGridActionButton>
            {row.status !== 'archived' ? (
              <>
                <DataGridActionButton
                  action="edit"
                  tooltip="Sửa"
                  type="button"
                  mode="icon"
                  size="sm"
                  aria-label={`Sửa mẫu ${row.name}`}
                  onClick={() => params.onEdit(row)}
                >
                  <Pencil className="size-4" />
                </DataGridActionButton>
                <DataGridActionButton
                  action="archive"
                  tooltip="Lưu trữ"
                  type="button"
                  mode="icon"
                  size="sm"
                  aria-label={`Lưu trữ mẫu ${row.name}`}
                  onClick={() => params.onArchive(row)}
                >
                  <Archive className="size-4" />
                </DataGridActionButton>
              </>
            ) : null}
          </div>
        ),
      }),
    ];
  }, [formatNumber, formatCurrency, formatPercent, params]);
}
