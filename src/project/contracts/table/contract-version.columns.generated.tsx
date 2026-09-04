/**
 * Scaffolded by table-builder from `src/project/contracts/table/contract-version.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
 * You own this file now — fill the `cell: () => null` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { CalendarDays, CirclePlay, Eye, Pencil } from 'lucide-react';
import {
  createColumnHelpers,
  DataGridActionButton,
} from '@/components/ui/data-grid-columns';
import { ContractStatusBadge } from '../components/contract-status-badge';
import { ContractVersionBadge } from '../components/contract-version-badge';
import type { ContractVersion } from '../model/contract';

export interface UseContractVersionColumnsParams {
  onView: (row: ContractVersion) => void;
  onPrimary: (row: ContractVersion) => void;
  onEdit: (row: ContractVersion) => void;
  onEditDate: (row: ContractVersion) => void;
}

export function useContractVersionColumns(
  params: UseContractVersionColumnsParams,
): ColumnDef<ContractVersion>[] {
  return useMemo(() => {
    const { onView, onPrimary, onEdit, onEditDate } = params;
    const col = createColumnHelpers<ContractVersion>();

    return [
      col.custom({
        id: 'version',
        header: 'Phiên bản',
        headerClassName: 'min-w-[150px]',
        size: 170,
        enableSorting: false,
        cell: (row) => (
          <ContractVersionBadge
            versionNo={row.versionNo}
            status={row.status}
            label={row.versionKind === 'renewal' ? 'Gia hạn' : undefined}
          />
        ),
      }),
      col.custom({
        id: 'effectiveFrom',
        header: 'Ngày áp dụng',
        headerClassName: 'min-w-[150px]',
        size: 170,
        enableSorting: false,
        cell: (row) => (
          <span>
            {row.status === 'draft' || row.status === 'scheduled'
              ? row.effectiveFrom
                ? `Dự kiến ${new Intl.DateTimeFormat('vi-VN').format(new Date(`${row.effectiveFrom}T00:00:00`))}`
                : 'Chưa đặt'
              : row.effectiveFrom
                ? new Intl.DateTimeFormat('vi-VN').format(
                    new Date(`${row.effectiveFrom}T00:00:00`),
                  )
                : 'Chưa xác định'}
          </span>
        ),
      }),
      col.custom({
        id: 'effectiveTo',
        header: 'Ngày kết thúc',
        headerClassName: 'min-w-[150px]',
        size: 170,
        enableSorting: false,
        cell: (row) => (
          <span>
            {row.effectiveTo
              ? new Intl.DateTimeFormat('vi-VN').format(
                  new Date(`${row.effectiveTo}T00:00:00`),
                )
              : 'Không giới hạn'}
          </span>
        ),
      }),
      col.custom({
        id: 'changeReason',
        header: 'Lý do thay đổi',
        headerClassName: 'min-w-[320px]',
        size: 420,
        enableSorting: false,
        cell: (row) => <span>{row.changeReason || '—'}</span>,
      }),
      col.custom({
        id: 'status',
        header: 'Trạng thái',
        headerClassName: 'min-w-[160px]',
        size: 180,
        enableSorting: false,
        cell: (row) => <ContractStatusBadge status={row.status} />,
      }),
      col.actions({
        id: 'actions',
        header: '',
        headerClassName: 'w-[250px]',
        cellClassName: 'text-right',
        size: 320,
        enableSorting: false,
        cell: (row) => (
          <div className="flex justify-end gap-1">
            <DataGridActionButton
              action="view"
              tooltip="Xem"
              aria-label={`Xem chi tiết phiên bản v${row.versionNo}`}
              type="button"
              mode="icon"
              size="sm"
              onClick={() => onView(row)}
            >
              <Eye className="size-4" />
            </DataGridActionButton>
            {row.status === 'draft' ? (
              <>
                <DataGridActionButton
                  action="other"
                  tooltip="Đổi ngày dự kiến áp dụng"
                  aria-label={`Đổi ngày dự kiến áp dụng cho phiên bản v${row.versionNo}`}
                  type="button"
                  mode="icon"
                  size="sm"
                  onClick={() => onEditDate(row)}
                >
                  <CalendarDays className="size-4" />
                </DataGridActionButton>
                <DataGridActionButton
                  action="primary"
                  tooltip="Áp dụng phiên bản ngay"
                  aria-label={`Áp dụng phiên bản v${row.versionNo} ngay`}
                  type="button"
                  size="sm"
                  onClick={() => onPrimary(row)}
                >
                  <CirclePlay className="size-4" />
                  Áp dụng ngay
                </DataGridActionButton>
                <DataGridActionButton
                  action="edit"
                  tooltip="Sửa phiên bản nháp"
                  aria-label={`Sửa phiên bản nháp v${row.versionNo}`}
                  type="button"
                  mode="icon"
                  size="sm"
                  onClick={() => onEdit(row)}
                >
                  <Pencil className="size-4" />
                </DataGridActionButton>
              </>
            ) : null}
          </div>
        ),
      }),
    ];
  }, [params]);
}
