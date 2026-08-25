import type {
  ContractPaymentSubmission,
  ContractReceivableTableRow,
} from '../model/receivable';
import {
  ContractPaymentAllocationDialog,
  type ContractPaymentAllocationDialogProps,
} from './contract-payment-allocation-dialog';

export type { ContractPaymentSubmission } from '../model/receivable';

interface ContractPaymentDialogProps extends Omit<
  ContractPaymentAllocationDialogProps,
  | 'title'
  | 'totalAmount'
  | 'paidAmount'
  | 'maxAmount'
  | 'items'
  | 'isLoading'
  | 'errorMessage'
> {
  row: ContractReceivableTableRow | null;
}

function formatPeriod(row: ContractReceivableTableRow) {
  const format = (value: string) =>
    new Intl.DateTimeFormat('vi-VN').format(new Date(`${value}T00:00:00`));
  return `${format(row.periodStart)} – ${format(row.periodEnd)}`;
}

export function ContractPaymentDialog({
  open,
  row,
  currencyCode,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: ContractPaymentDialogProps) {
  if (!row) return null;

  return (
    <ContractPaymentAllocationDialog
      open={open}
      title={`Thanh toán kỳ ${formatPeriod(row)}`}
      currencyCode={currencyCode}
      totalAmount={row.amount}
      paidAmount={row.paidAmount}
      maxAmount={row.outstandingAmount}
      items={row.fees
        .filter((fee) => fee.outstandingAmount > 0 && !fee.isProjected)
        .map((fee) => ({
          chargeId: fee.chargeId,
          name: fee.name,
          amount: fee.amount,
          outstandingAmount: fee.outstandingAmount,
          currencyCode: fee.currencyCode,
        }))}
      isSubmitting={isSubmitting}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
    />
  );
}
