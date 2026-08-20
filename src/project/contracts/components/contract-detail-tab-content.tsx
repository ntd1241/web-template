import { useCallback, useState, type ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { PaginationState } from '@tanstack/react-table';
import type { LucideIcon } from 'lucide-react';
import {
  CircleCheck,
  ExternalLink,
  FileImage,
  FileSpreadsheet,
  FileText,
  Grid2X2,
  List,
  Trash2,
  TriangleAlert,
  WalletCards,
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import { useNumberFormat } from '@/providers/number-format-provider';
import { Button } from '@/components/ui/button';
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { FileUploadContent } from '@/components/ui/file-upload/file-upload-content';
import { SearchInput } from '@/components/ui/inputs/search-input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  deleteContractAttachment,
  recordContractPeriodPayment,
  uploadContractAttachments,
} from '../api/contracts.api';
import type { ContractDetail } from '../api/contracts.api';
import { ContractFeeReceivableChart } from '../charts/contract-fee-receivable.chart.generated';
import { ContractPaymentPeriodChart } from '../charts/contract-payment-period.chart.generated';
import {
  useContractReceivableList,
  type ContractReceivableListFilters,
  type ContractReceivableSortOption,
} from '../hooks/use-contract-receivable-list';
import {
  buildContractFeeReceivableChartData,
  buildContractPaymentPeriodChartData,
} from '../model/contract-chart';
import {
  CONTRACT_CHARGE_DISPLAY_STATUSES,
  getContractReceivableStats,
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

function getAttachmentOpenUrl(
  attachment: ContractDetail['attachments'][number],
) {
  const isOfficeDocument =
    attachment.mimeType.includes('msword') ||
    attachment.mimeType.includes('wordprocessingml') ||
    attachment.mimeType.includes('ms-excel') ||
    attachment.mimeType.includes('spreadsheetml') ||
    attachment.mimeType.includes('ms-powerpoint') ||
    attachment.mimeType.includes('presentationml') ||
    /\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(attachment.fileName);

  if (!isOfficeDocument) return attachment.url;

  return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(attachment.url)}&wdOrigin=BROWSELINK`;
}

const PAYMENT_METRIC_TONE_CLASSES = {
  info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  danger: 'bg-destructive/10 text-destructive',
} as const;

function PaymentMetric({
  icon: Icon,
  iconTone,
  label,
  value,
  emphasis = false,
}: {
  icon: LucideIcon;
  iconTone: keyof typeof PAYMENT_METRIC_TONE_CLASSES;
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 px-4 py-3.5">
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${PAYMENT_METRIC_TONE_CLASSES[iconTone]}`}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p
          className={`mt-1 truncate text-sm font-semibold tabular-nums ${emphasis ? 'text-primary' : 'text-foreground'}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function getLatestFinancialUpdate(contract: ContractDetail) {
  return [
    contract.updatedAt,
    ...contract.charges.map((charge) => charge.createdAt),
    ...contract.payments.flatMap((payment) => [
      payment.receivedAt,
      payment.createdAt,
    ]),
  ].reduce((latest, value) => (value > latest ? value : latest), '');
}

function formatTimestampDate(value: string) {
  if (!value) return 'Chưa cập nhật';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value));
}

function ContractFinancialOverview({ contract }: { contract: ContractDetail }) {
  const { formatCurrency } = useNumberFormat();
  const stats = getContractReceivableStats(contract.charges);
  const remainingAmount = Math.max(0, stats.totalBilled - stats.totalPaid);
  const progress =
    stats.totalBilled > 0
      ? Math.min(100, Math.max(0, (stats.totalPaid / stats.totalBilled) * 100))
      : 0;
  const formattedProgress = new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 2,
  }).format(progress);
  const latestFinancialUpdate = getLatestFinancialUpdate(contract);

  return (
    <Card className="mt-6 overflow-hidden">
      <CardHeader>
        <CardHeading>
          <CardTitle className="text-lg">Tình hình thanh toán</CardTitle>
        </CardHeading>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="grid overflow-hidden rounded-lg border border-border sm:grid-cols-2 xl:grid-cols-4 xl:divide-x xl:divide-border">
          <PaymentMetric
            icon={FileText}
            iconTone="info"
            label="Tổng đã lập"
            value={formatCurrency(stats.totalBilled, contract.currencyCode)}
          />
          <PaymentMetric
            icon={CircleCheck}
            iconTone="success"
            label="Đã thanh toán"
            value={formatCurrency(stats.totalPaid, contract.currencyCode)}
          />
          <PaymentMetric
            icon={WalletCards}
            iconTone="warning"
            label="Còn phải thu"
            value={formatCurrency(remainingAmount, contract.currencyCode)}
            emphasis
          />
          <PaymentMetric
            icon={TriangleAlert}
            iconTone="danger"
            label="Quá hạn"
            value={formatCurrency(
              stats.overdueOutstanding,
              contract.currencyCode,
            )}
          />
        </div>
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
          aria-label={`Đã thanh toán ${formattedProgress}%`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            <strong className="font-semibold text-emerald-600">
              {formattedProgress}%
            </strong>{' '}
            đã thanh toán
          </span>
          <span>Cập nhật đến {formatTimestampDate(latestFinancialUpdate)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ContractChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardHeading>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeading>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function ContractChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function ContractOverviewContent({
  contract,
}: {
  contract: ContractDetail;
}) {
  const { formatCompactCurrency } = useNumberFormat();
  const paymentPeriodData = buildContractPaymentPeriodChartData(
    contract.charges,
  );
  const feeReceivableData = buildContractFeeReceivableChartData(
    contract.charges,
    contract.lines,
  );
  const valueFormatter = (value: number) =>
    formatCompactCurrency(value, contract.currencyCode);
  const axisValueFormatter = (value: number) =>
    formatCompactCurrency(value, contract.currencyCode);

  return (
    <>
      <ContractFinancialOverview contract={contract} />
      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-2">
        <ContractChartCard
          title="Tình hình thu theo kỳ"
          description="Theo dõi số đã thu, còn phải thu và quá hạn theo từng kỳ thanh toán."
        >
          {paymentPeriodData.length > 0 ? (
            <ContractPaymentPeriodChart
              data={paymentPeriodData}
              valueFormatter={valueFormatter}
              axisValueFormatter={axisValueFormatter}
            />
          ) : (
            <ContractChartEmptyState message="Chưa có dữ liệu kỳ thanh toán để hiển thị." />
          )}
        </ContractChartCard>
        <ContractChartCard
          title="Công nợ theo khoản phí"
          description="So sánh số đã thu và số còn phải thu của từng khoản phí."
        >
          {feeReceivableData.length > 0 ? (
            <ContractFeeReceivableChart
              data={feeReceivableData}
              valueFormatter={valueFormatter}
            />
          ) : (
            <ContractChartEmptyState message="Chưa có dữ liệu khoản phí để hiển thị." />
          )}
        </ContractChartCard>
      </div>
    </>
  );
}

export function ContractReceivablesContent({
  tenantId,
  dueSoonDays,
  userId,
  contractId,
  customerId,
  currencyCode,
  onPaymentRecorded,
}: {
  tenantId: string;
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
    total,
    listQuery,
    visibleRows,
  } = useContractReceivableList({ tenantId, contractId, dueSoonDays });
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
        tenantId,
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
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <DataGrid
        table={table}
        recordCount={total}
        isLoading={listQuery.isLoading}
        emptyMessage={
          listQuery.isError
            ? getApiErrorMessage(listQuery.error)
            : 'Chưa có kỳ phải thu'
        }
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
  userId,
  onChanged,
}: {
  contract: ContractDetail;
  userId: string;
  onChanged: () => Promise<void>;
}) {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [attachmentToDelete, setAttachmentToDelete] = useState<
    ContractDetail['attachments'][number] | null
  >(null);
  const uploadMutation = useMutation({
    mutationFn: (files: File[]) =>
      uploadContractAttachments(contract.tenantId, contract.id, userId, files),
    onSuccess: async () => {
      toast.success('Đã tải tài liệu lên hợp đồng.');
      await onChanged();
    },
    onError: (uploadError) => toast.error(getApiErrorMessage(uploadError)),
  });
  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) =>
      deleteContractAttachment(contract.tenantId, contract.id, attachmentId),
    onSuccess: async () => {
      setAttachmentToDelete(null);
      toast.success('Đã xóa tài liệu khỏi hợp đồng.');
      await onChanged();
    },
    onError: (deleteError) => toast.error(getApiErrorMessage(deleteError)),
  });

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardHeading>
            <CardTitle>Tài liệu đính kèm</CardTitle>
          </CardHeading>
          <CardToolbar className="flex-wrap justify-end">
            <div className="inline-flex items-center rounded-md border border-border bg-background p-0.5">
              <Button
                type="button"
                variant="ghost"
                mode="icon"
                size="md"
                selected={viewMode === 'table'}
                aria-label="Hiển thị dạng bảng"
                aria-pressed={viewMode === 'table'}
                title="Hiển thị dạng bảng"
                onClick={() => setViewMode('table')}
              >
                <List />
              </Button>
              <Button
                type="button"
                variant="ghost"
                mode="icon"
                size="md"
                selected={viewMode === 'card'}
                aria-label="Hiển thị dạng thẻ"
                aria-pressed={viewMode === 'card'}
                title="Hiển thị dạng thẻ"
                onClick={() => setViewMode('card')}
              >
                <Grid2X2 />
              </Button>
            </div>
          </CardToolbar>
        </CardHeader>
        {viewMode === 'table' && contract.attachments.length > 0 ? (
          <CardTable>
            <Table className="min-w-[820px] text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>Tài liệu</TableHead>
                  <TableHead>Dung lượng</TableHead>
                  <TableHead>Ngày tải lên</TableHead>
                  <TableHead>Người upload</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contract.attachments.map((attachment) => (
                  <TableRow key={attachment.id}>
                    <TableCell>
                      <a
                        href={getAttachmentOpenUrl(attachment)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-w-0 items-center gap-3 hover:text-primary"
                      >
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 truncate font-medium">
                          {attachment.fileName}
                        </span>
                      </a>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {formatFileSize(attachment.sizeBytes)}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {formatDate(attachment.createdAt.slice(0, 10))}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {attachment.uploadedByName ?? 'Không xác định'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <a
                          href={getAttachmentOpenUrl(attachment)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-primary hover:underline"
                        >
                          <ExternalLink className="size-4" />
                          Mở file
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          mode="icon"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={deleteMutation.isPending}
                          aria-label={`Xóa tệp ${attachment.fileName}`}
                          title="Xóa file"
                          onClick={() => setAttachmentToDelete(attachment)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardTable>
        ) : null}

        {viewMode === 'card' && contract.attachments.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8">
            {contract.attachments.map((attachment) => {
              const isImage = attachment.mimeType.startsWith('image/');
              const FileIcon = isImage
                ? FileImage
                : attachment.mimeType.includes('spreadsheet') ||
                    attachment.mimeType.includes('excel')
                  ? FileSpreadsheet
                  : FileText;

              return (
                <div
                  key={attachment.id}
                  className="group overflow-hidden rounded-xl border border-border bg-background transition-shadow hover:shadow-sm"
                >
                  <a
                    href={getAttachmentOpenUrl(attachment)}
                    target="_blank"
                    rel="noreferrer"
                    className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted/40">
                      {isImage ? (
                        <img
                          src={attachment.url}
                          alt={attachment.fileName}
                          className="size-full object-cover transition-transform group-hover:scale-[1.02]"
                        />
                      ) : (
                        <FileIcon className="size-16 text-muted-foreground" />
                      )}
                    </div>
                  </a>
                  <div className="space-y-2 p-3">
                    <a
                      href={getAttachmentOpenUrl(attachment)}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-sm font-semibold text-foreground hover:text-primary"
                      title={attachment.fileName}
                    >
                      {attachment.fileName}
                    </a>
                    <div className="flex items-center justify-between gap-2 text-xs text-foreground">
                      <span>{formatFileSize(attachment.sizeBytes)}</span>
                      <span>
                        {formatDate(attachment.createdAt.slice(0, 10))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="min-w-0 truncate text-xs text-foreground"
                        title={attachment.uploadedByName ?? 'Không xác định'}
                      >
                        {attachment.uploadedByName ?? 'Không xác định'}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        mode="icon"
                        size="sm"
                        className="shrink-0 text-destructive hover:text-destructive"
                        disabled={deleteMutation.isPending}
                        aria-label={`Xóa tệp ${attachment.fileName}`}
                        title="Xóa file"
                        onClick={() => setAttachmentToDelete(attachment)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        <CardContent className="space-y-4">
          <FileUploadContent
            onUpload={(files) => uploadMutation.mutateAsync(files)}
            isUploading={uploadMutation.isPending}
          />
          {contract.attachments.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center text-center text-sm text-muted-foreground">
              Chưa có tài liệu. Kéo thả tệp vào khu vực này để bắt đầu.
            </div>
          ) : null}
        </CardContent>
      </Card>
      <ConfirmDialog
        open={attachmentToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setAttachmentToDelete(null);
        }}
        title="Xóa tài liệu?"
        description={`Bạn có chắc muốn xóa tệp "${attachmentToDelete?.fileName ?? ''}" khỏi hợp đồng?`}
        confirmLabel="Xóa tài liệu"
        confirmVariant="destructive"
        onConfirm={() => {
          if (attachmentToDelete) {
            deleteMutation.mutate(attachmentToDelete.id);
          }
        }}
      />
    </>
  );
}
