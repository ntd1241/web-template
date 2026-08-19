import { useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ExternalLink, FileText, Paperclip, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import { useNumberFormat } from '@/providers/number-format-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTable,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { CardEmptyState } from '@/components/ui/card-empty-state';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { SearchInput } from '@/components/ui/inputs/search-input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { recordContractPeriodPayment } from '../api/contracts.api';
import type { ContractDetail } from '../api/contracts.api';
import {
  useContractReceivableList,
  type ContractReceivableListFilters,
  type ContractReceivableSortOption,
} from '../hooks/use-contract-receivable-list';
import {
  BILLING_TYPE_LABELS,
  BILLING_UNIT_LABELS,
  CONTRACT_VERSION_STATUS_LABELS,
  type ContractVersionLine,
} from '../model/contract';
import {
  CONTRACT_CHARGE_DISPLAY_STATUSES,
  type ContractChargeBalance,
  type ContractPaymentHistory,
  type ContractReceivableTableRow,
} from '../model/receivable';
import { useContractPaymentHistoryColumns } from '../table/contract-payment-history.columns.generated';
import { useContractReceivableTableRowColumns } from '../table/contract-receivable.columns.generated';
import {
  ContractPaymentDialog,
  type ContractPaymentSubmission,
} from './contract-payment-dialog';
import { ContractStatusBadge } from './contract-status-badge';

const RECEIVABLE_SORT_OPTIONS: Array<{
  value: ContractReceivableSortOption;
  label: string;
}> = [
  { value: 'periodStart_desc', label: 'Kỳ mới nhất' },
  { value: 'periodStart_asc', label: 'Kỳ cũ nhất' },
  { value: 'dueDate_desc', label: 'Hạn thanh toán mới nhất' },
  { value: 'dueDate_asc', label: 'Hạn thanh toán cũ nhất' },
  { value: 'amount_desc', label: 'Số tiền cao nhất' },
  { value: 'amount_asc', label: 'Số tiền thấp nhất' },
];

function formatDate(value: string | null | undefined) {
  if (!value) return 'Chưa cập nhật';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(`${value}T00:00:00`));
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function FeeLine({
  line,
  formatAmount,
  currencyCode,
}: {
  line: ContractVersionLine;
  formatAmount: (value: number, currencyCode?: string) => string;
  currencyCode: string;
}) {
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
        {formatAmount(line.amount, currencyCode)}
      </p>
    </div>
  );
}

export function ContractOverviewContent({
  contract,
}: {
  contract: ContractDetail;
}) {
  const { formatCurrency } = useNumberFormat();
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
          latestLines.map((line) => (
            <FeeLine
              key={line.id}
              line={line}
              formatAmount={formatCurrency}
              currencyCode={contract.currencyCode}
            />
          ))
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
  userId,
  contractId,
  customerId,
  currencyCode,
  onPaymentRecorded,
}: {
  charges: ContractChargeBalance[];
  lines: ContractVersionLine[];
  dueSoonDays: number;
  userId: string;
  contractId: string;
  customerId: string;
  currencyCode: string;
  onPaymentRecorded: () => Promise<void>;
}) {
  const {
    filters,
    keyword,
    setFilter,
    setKeyword,
    pagination,
    onPaginationChange,
    visibleRows,
  } = useContractReceivableList({ charges, lines, dueSoonDays });
  const [paymentRow, setPaymentRow] =
    useState<ContractReceivableTableRow | null>(null);
  const paymentMutation = useMutation({
    mutationFn: (submission: ContractPaymentSubmission) => {
      if (!paymentRow) throw new Error('Chưa chọn kỳ thanh toán.');
      return recordContractPeriodPayment(
        userId,
        contractId,
        customerId,
        currencyCode,
        {
          periodStart: paymentRow.periodStart,
          periodEnd: paymentRow.periodEnd,
          dueDate: paymentRow.dueDate,
          amount: submission.amount,
          allocations: submission.allocations,
        },
      );
    },
    onSuccess: async () => {
      toast.success('Đã ghi nhận thanh toán cho kỳ.');
      setPaymentRow(null);
      await onPaymentRecorded();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const handlePay = useCallback((row: ContractReceivableTableRow) => {
    setPaymentRow(row);
  }, []);
  const columns = useContractReceivableTableRowColumns({ onPay: handlePay });
  const table = useReactTable({
    data: visibleRows,
    columns,
    getRowId: (row) => row.id,
    state: { pagination },
    onPaginationChange,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <DataGrid
        table={table}
        recordCount={visibleRows.length}
        emptyMessage="Chưa có kỳ phải thu"
      >
        <Card className="min-h-0 overflow-hidden">
          <CardHeader className="flex-col items-stretch gap-4 xl:flex-row xl:items-center xl:justify-between">
            <CardHeading>
              <CardTitle>Kỳ thanh toán</CardTitle>
            </CardHeading>
            <CardToolbar className="flex-wrap">
              <SearchInput
                className="w-72"
                placeholder="Tìm theo khoản phí hoặc ngày"
                value={keyword}
                debounceMs={250}
                onSearch={setKeyword}
              />
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilter(
                    'status',
                    value as ContractReceivableListFilters['status'],
                  )
                }
              >
                <SelectTrigger
                  className="w-48"
                  aria-label="Lọc trạng thái kỳ thanh toán"
                >
                  <SelectValue label="Trạng thái" placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {CONTRACT_CHARGE_DISPLAY_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      <ContractStatusBadge
                        status={status}
                        direction="receivable"
                        size="sm"
                        showDot
                      />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.sort}
                onValueChange={(value) =>
                  setFilter(
                    'sort',
                    value as ContractReceivableListFilters['sort'],
                  )
                }
              >
                <SelectTrigger
                  className="w-52"
                  aria-label="Sắp xếp kỳ thanh toán"
                >
                  <SelectValue label="Sắp xếp" placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  {RECEIVABLE_SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardToolbar>
          </CardHeader>
          <CardTable className="min-h-0 flex-1">
            <ScrollArea className="h-full">
              <div className="min-w-[1360px]">
                <DataGridTable />
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardTable>
          <CardFooter className="justify-between">
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>
      <ContractPaymentDialog
        open={paymentRow !== null}
        row={paymentRow}
        currencyCode={currencyCode}
        isSubmitting={paymentMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !paymentMutation.isPending) setPaymentRow(null);
        }}
        onSubmit={(submission) => paymentMutation.mutate(submission)}
      />
    </>
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
}: {
  payments: ContractPaymentHistory[];
}) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const columns = useContractPaymentHistoryColumns();
  const table = useReactTable({
    data: payments,
    columns,
    getRowId: (row) => row.id,
    state: { pagination },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

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
    <DataGrid
      table={table}
      recordCount={payments.length}
      emptyMessage="Chưa có thanh toán"
    >
      <Card className="min-h-0 overflow-hidden">
        <CardHeader>
          <CardHeading>
            <CardTitle>Lịch sử thanh toán</CardTitle>
          </CardHeading>
        </CardHeader>
        <CardTable className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="min-w-[1180px]">
              <DataGridTable />
            </div>
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

export function ContractAttachmentsContent({
  contract,
}: {
  contract: ContractDetail;
}) {
  if (contract.attachments.length === 0) {
    return (
      <CardEmptyState
        icon={Paperclip}
        title="Chưa có tài liệu"
        description="Tài liệu đính kèm của hợp đồng sẽ hiển thị tại đây."
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardHeading>
          <CardTitle>Tài liệu đính kèm</CardTitle>
        </CardHeading>
      </CardHeader>
      <CardTable>
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">Tài liệu</th>
              <th className="px-5 py-3 font-medium">Dung lượng</th>
              <th className="px-5 py-3 font-medium">Ngày tải lên</th>
              <th className="px-5 py-3 text-right font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {contract.attachments.map((attachment) => (
              <tr
                key={attachment.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-5 py-3">
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-w-0 items-center gap-3 hover:text-primary"
                  >
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 truncate font-medium">
                      {attachment.fileName}
                    </span>
                  </a>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {formatFileSize(attachment.sizeBytes)}
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {formatDate(attachment.createdAt.slice(0, 10))}
                </td>
                <td className="px-5 py-3 text-right">
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <ExternalLink className="size-4" />
                    Mở file
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardTable>
    </Card>
  );
}
