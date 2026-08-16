import { useState } from 'react';
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type PaginationState,
} from '@tanstack/react-table';
import { FileText, WalletCards } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTable,
  CardTitle,
} from '@/components/ui/card';
import { CardEmptyState } from '@/components/ui/card-empty-state';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { formatContractAmount } from '../api/contracts.api';
import type { ContractDetail } from '../api/contracts.api';
import {
  BILLING_TYPE_LABELS,
  BILLING_UNIT_LABELS,
  CONTRACT_VERSION_STATUS_LABELS,
  type ContractVersionLine,
} from '../model/contract';
import {
  mapContractReceivableTableRows,
  PAYMENT_METHOD_LABELS,
  type ContractChargeBalance,
  type CustomerPayment,
} from '../model/receivable';
import { useContractReceivableTableRowColumns } from '../table/contract-receivable.columns.generated';
import { ContractStatusBadge } from './contract-status-badge';

function formatDate(value: string | null | undefined) {
  if (!value) return 'Chưa cập nhật';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(`${value}T00:00:00`));
}

function FeeLine({ line }: { line: ContractVersionLine }) {
  const cycle =
    line.billingType === 'recurring'
      ? `${line.billingInterval ?? 1} ${BILLING_UNIT_LABELS[line.billingUnit ?? 'month'].toLowerCase()}`
      : `Ngày ${formatDate(line.chargeDate)}`;
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {line.name}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {BILLING_TYPE_LABELS[line.billingType]} · {cycle}
        </p>
      </div>
      <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
        {formatContractAmount(line.amount)}
      </p>
    </div>
  );
}

export function ContractOverviewContent({
  contract,
}: {
  contract: ContractDetail;
}) {
  const latestVersion = contract.versions[0];
  const latestLines = contract.lines.filter(
    (line) => line.contractVersionId === latestVersion?.id,
  );
  return (
    <Card>
      <CardHeader>
        <CardHeading>
          <CardTitle>Khoản phí phiên bản hiện tại</CardTitle>
          <CardDescription>
            Phiên bản {latestVersion?.versionNo ?? '—'} ·{' '}
            {latestVersion
              ? CONTRACT_VERSION_STATUS_LABELS[latestVersion.status]
              : 'Chưa có'}
          </CardDescription>
        </CardHeading>
      </CardHeader>
      <CardContent className="space-y-3">
        {latestLines.length > 0 ? (
          latestLines.map((line) => <FeeLine key={line.id} line={line} />)
        ) : (
          <p className="text-sm text-muted-foreground">Chưa có khoản phí.</p>
        )}
      </CardContent>
    </Card>
  );
}

export function ContractReceivablesContent({
  charges,
  lines,
  dueSoonDays,
}: {
  charges: ContractChargeBalance[];
  lines: ContractVersionLine[];
  dueSoonDays: number;
}) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const rows = mapContractReceivableTableRows(charges, lines, dueSoonDays);
  const columns = useContractReceivableTableRowColumns();
  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    state: { pagination },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataGrid
      table={table}
      recordCount={rows.length}
      emptyMessage="Chưa có kỳ phải thu"
    >
      <Card className="min-h-0 overflow-hidden">
        <CardHeader>
          <CardHeading>
            <CardTitle>Kỳ thanh toán</CardTitle>
          </CardHeading>
        </CardHeader>
        <CardTable className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardTable>
        <CardFooter className="justify-between">
          <DataGridPagination />
        </CardFooter>
      </Card>
    </DataGrid>
  );
}

export function ContractVersionsContent({
  contract,
}: {
  contract: ContractDetail;
}) {
  if (contract.versions.length === 0) {
    return (
      <CardEmptyState
        icon={FileText}
        title="Chưa có phiên bản"
        description="Hợp đồng chưa có phiên bản chính sách."
      />
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardHeading>
          <CardTitle>Lịch sử phiên bản</CardTitle>
          <CardDescription>
            Chính sách được lưu thành snapshot để không làm thay đổi lịch sử
            công nợ.
          </CardDescription>
        </CardHeading>
      </CardHeader>
      <CardTable>
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">Phiên bản</th>
              <th className="px-5 py-3 font-medium">Có hiệu lực từ</th>
              <th className="px-5 py-3 font-medium">Lý do thay đổi</th>
              <th className="px-5 py-3 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {contract.versions.map((version) => (
              <tr
                key={version.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-5 py-3 font-semibold">
                  v{version.versionNo}
                </td>
                <td className="px-5 py-3">
                  {formatDate(version.effectiveFrom)}
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {version.changeReason || '—'}
                </td>
                <td className="px-5 py-3">
                  <ContractStatusBadge status={version.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardTable>
    </Card>
  );
}

export function ContractPaymentsContent({
  payments,
  currencyCode,
}: {
  payments: CustomerPayment[];
  currencyCode: string;
}) {
  if (payments.length === 0) {
    return (
      <CardEmptyState
        icon={WalletCards}
        title="Chưa có thanh toán"
        description="Các khoản khách hàng đã thanh toán sẽ hiển thị tại đây."
      />
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardHeading>
          <CardTitle>Lịch sử thanh toán</CardTitle>
          <CardDescription>
            Thanh toán được ghi nhận ở cấp khách hàng và tự động phân bổ vào các
            kỳ còn nợ.
          </CardDescription>
        </CardHeading>
      </CardHeader>
      <CardTable>
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">Ngày nhận</th>
              <th className="px-5 py-3 font-medium">Phương thức</th>
              <th className="px-5 py-3 font-medium">Mã tham chiếu</th>
              <th className="px-5 py-3 text-right font-medium">Số tiền</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-5 py-3">
                  {formatDate(payment.receivedAt.slice(0, 10))}
                </td>
                <td className="px-5 py-3">
                  {PAYMENT_METHOD_LABELS[payment.paymentMethod]}
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {payment.reference || '—'}
                </td>
                <td className="px-5 py-3 text-right font-semibold tabular-nums">
                  {formatContractAmount(payment.amount, currencyCode)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardTable>
    </Card>
  );
}
