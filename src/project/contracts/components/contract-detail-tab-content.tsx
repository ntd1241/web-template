import { FileText, ReceiptText, WalletCards } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeading,
  CardTable,
  CardTitle,
} from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';
import { formatContractAmount } from '../api/contracts.api';
import type { ContractDetail } from '../api/contracts.api';
import {
  BILLING_TYPE_LABELS,
  BILLING_UNIT_LABELS,
  CONTRACT_VERSION_STATUS_LABELS,
  type ContractVersionLine,
} from '../model/contract';
import {
  CONTRACT_CHARGE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  type ContractChargeBalance,
  type CustomerPayment,
} from '../model/receivable';

function formatDate(value: string | null | undefined) {
  if (!value) return 'Chưa cập nhật';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(`${value}T00:00:00`));
}

function StatusTag({ status }: { status: string }) {
  const success = ['paid', 'effective'].includes(status);
  const warning = ['partially_paid', 'overdue'].includes(status);
  return (
    <Tag
      size="sm"
      shape="circle"
      color={success ? '#16a34a' : warning ? '#d97706' : '#64748b'}
    >
      {CONTRACT_CHARGE_STATUS_LABELS[
        status as keyof typeof CONTRACT_CHARGE_STATUS_LABELS
      ] ??
        CONTRACT_VERSION_STATUS_LABELS[
          status as keyof typeof CONTRACT_VERSION_STATUS_LABELS
        ] ??
        status}
    </Tag>
  );
}

function EmptyTab({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="font-medium text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
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
    <div className="grid gap-5 xl:grid-cols-2">
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
      <Card>
        <CardHeader>
          <CardHeading>
            <CardTitle>Tóm tắt công nợ khách hàng</CardTitle>
            <CardDescription>
              Tổng hợp trên tất cả hợp đồng cùng loại tiền.
            </CardDescription>
          </CardHeading>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <SummaryValue
            label="Tổng đã lập"
            value={formatContractAmount(
              contract.receivableSummary?.totalBilled ?? 0,
              contract.currencyCode,
            )}
          />
          <SummaryValue
            label="Đã thanh toán"
            value={formatContractAmount(
              contract.receivableSummary?.totalPaid ?? 0,
              contract.currencyCode,
            )}
          />
          <SummaryValue
            label="Còn phải thu"
            value={formatContractAmount(
              contract.receivableSummary?.totalOutstanding ?? 0,
              contract.currencyCode,
            )}
            emphasis
          />
          <SummaryValue
            label="Quá hạn"
            value={formatContractAmount(
              contract.receivableSummary?.overdueOutstanding ?? 0,
              contract.currencyCode,
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryValue({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={
          emphasis
            ? 'mt-1 text-base font-bold text-primary'
            : 'mt-1 text-base font-semibold'
        }
      >
        {value}
      </p>
    </div>
  );
}

export function ContractReceivablesContent({
  charges,
  currencyCode,
}: {
  charges: ContractChargeBalance[];
  currencyCode: string;
}) {
  if (charges.length === 0) {
    return (
      <EmptyTab
        icon={ReceiptText}
        title="Chưa có kỳ phải thu"
        description="Các kỳ thanh toán sẽ xuất hiện sau khi phiên bản hợp đồng được kích hoạt."
      />
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardHeading>
          <CardTitle>Kỳ thanh toán</CardTitle>
          <CardDescription>
            Mỗi khoản phí định kỳ được sinh thành một kỳ phải thu độc lập.
          </CardDescription>
        </CardHeading>
      </CardHeader>
      <CardTable>
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-3 font-medium">Kỳ</th>
              <th className="px-5 py-3 font-medium">Hạn thanh toán</th>
              <th className="px-5 py-3 text-right font-medium">Số tiền</th>
              <th className="px-5 py-3 text-right font-medium">Còn lại</th>
              <th className="px-5 py-3 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {charges.map((charge) => (
              <tr
                key={charge.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-5 py-3 text-foreground">
                  {formatDate(charge.periodStart)} –{' '}
                  {formatDate(charge.periodEnd)}
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {formatDate(charge.dueDate)}
                </td>
                <td className="px-5 py-3 text-right tabular-nums">
                  {formatContractAmount(charge.amount, currencyCode)}
                </td>
                <td className="px-5 py-3 text-right font-semibold tabular-nums">
                  {formatContractAmount(charge.outstandingAmount, currencyCode)}
                </td>
                <td className="px-5 py-3">
                  <StatusTag status={charge.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardTable>
    </Card>
  );
}

export function ContractVersionsContent({
  contract,
}: {
  contract: ContractDetail;
}) {
  if (contract.versions.length === 0) {
    return (
      <EmptyTab
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
                  <StatusTag status={version.status} />
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
      <EmptyTab
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
