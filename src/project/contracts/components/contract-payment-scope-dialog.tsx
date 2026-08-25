import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/lib/errors';
import { loadContractPaymentCandidates } from '../api/contracts.api';
import type {
  ContractPaymentScope,
  ContractPaymentSubmission,
} from '../model/receivable';
import { ContractPaymentAllocationDialog } from './contract-payment-allocation-dialog';

interface ContractPaymentScopeDialogProps {
  open: boolean;
  scope: ContractPaymentScope;
  tenantId: string;
  userId: string;
  contractId: string;
  scopeStart?: string;
  scopeEnd?: string;
  currencyCode: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (submission: ContractPaymentSubmission) => void;
}

function formatMonth(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return `Tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
}

export function ContractPaymentScopeDialog({
  open,
  scope,
  tenantId,
  userId,
  contractId,
  scopeStart,
  scopeEnd,
  currencyCode,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: ContractPaymentScopeDialogProps) {
  const candidatesQuery = useQuery({
    queryKey: [
      'project',
      'contracts',
      'payment-candidates',
      tenantId,
      contractId,
      scope,
      scopeStart,
      scopeEnd,
    ],
    queryFn: () =>
      loadContractPaymentCandidates(
        userId,
        contractId,
        scope,
        scopeStart,
        scopeEnd,
        tenantId,
      ),
    enabled:
      open &&
      Boolean(userId && tenantId && contractId) &&
      (scope === 'contract' || Boolean(scopeStart && scopeEnd)),
    retry: false,
  });
  const items = useMemo(() => {
    if (scope === 'contract') {
      return (candidatesQuery.data?.months ?? []).map((month) => ({
        chargeId: `month:${month.monthStart}`,
        monthStart: month.monthStart,
        name: formatMonth(month.monthStart),
        amount: month.amount,
        paidAmount: month.paidAmount,
        outstandingAmount: month.outstandingAmount,
        currencyCode,
        section: month.isDue ? ('due' as const) : ('future' as const),
      }));
    }

    return (candidatesQuery.data?.items ?? []).map((candidate) => ({
      chargeId: candidate.chargeId,
      name: candidate.feeName,
      amount: candidate.amount,
      paidAmount: candidate.paidAmount,
      outstandingAmount: candidate.outstandingAmount,
      currencyCode: candidate.currencyCode,
      periodStart: candidate.periodStart,
      periodEnd: candidate.periodEnd,
      dueDate: candidate.dueDate,
    }));
  }, [
    candidatesQuery.data?.items,
    candidatesQuery.data?.months,
    currencyCode,
    scope,
  ]);
  const totalAmount = candidatesQuery.data?.totalAmount ?? 0;
  const paidAmount = candidatesQuery.data?.paidAmount ?? 0;
  const title =
    scope === 'contract'
      ? 'Thanh toán hợp đồng'
      : `Thanh toán tháng ${scopeStart ? formatMonth(scopeStart) : ''}`;
  const defaultAmount =
    scope === 'contract'
      ? (candidatesQuery.data?.months ?? []).reduce(
          (sum, month) => sum + month.dueOutstandingAmount,
          0,
        )
      : undefined;
  const dueAmount =
    scope === 'contract'
      ? (candidatesQuery.data?.months ?? []).reduce(
          (sum, month) => sum + month.dueOutstandingAmount,
          0,
        )
      : undefined;

  return (
    <ContractPaymentAllocationDialog
      open={open}
      title={title}
      currencyCode={currencyCode}
      totalAmount={totalAmount}
      paidAmount={paidAmount}
      maxAmount={candidatesQuery.data?.outstandingAmount ?? 0}
      totalLabel={
        scope === 'contract' ? 'Tổng tiền hợp đồng:' : 'Tổng tiền tháng:'
      }
      dueAmount={dueAmount}
      defaultAmount={defaultAmount}
      allowOverpayment={scope === 'contract'}
      allocationMode={scope === 'contract' ? 'month' : 'charge'}
      showFutureOption={scope === 'contract'}
      emptyMessage={
        scope === 'contract'
          ? 'Không có tháng cần thu'
          : 'Không có khoản phí cần thu trong tháng này'
      }
      items={items}
      isLoading={candidatesQuery.isLoading}
      errorMessage={
        candidatesQuery.isError
          ? getApiErrorMessage(candidatesQuery.error)
          : undefined
      }
      isSubmitting={isSubmitting}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
    />
  );
}
