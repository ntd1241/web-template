import { useState } from 'react';
import { buildPath, ROUTES } from '@/constants/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTable,
  CardTitle,
} from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { recordContractPayment } from '../../contracts/api/contracts.api';
import { ContractDetailDialog } from '../../contracts/components/contract-detail-dialog';
import { ContractPaymentScopeDialog } from '../../contracts/components/contract-payment-scope-dialog';
import { useContractDetailQuery } from '../../contracts/hooks/use-contract-detail-query';
import type { Contract } from '../../contracts/model/contract';
import type { ContractPaymentSubmission } from '../../contracts/model/receivable';
import { useCustomerContractList } from '../hooks/use-customer-contract-list';
import { useContractColumns } from '../table/customer-contract.columns.generated';

export function CustomerContractsTable({ customerId }: { customerId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId } = useUser();
  const [paymentContract, setPaymentContract] = useState<Contract | null>(null);
  const [detailContractId, setDetailContractId] = useState<string | null>(null);
  const {
    contracts,
    total,
    pagination,
    onPaginationChange,
    tenantQuery,
    workspaceQuery,
  } = useCustomerContractList(customerId);
  const detailQuery = useContractDetailQuery(detailContractId ?? undefined);
  const paymentMutation = useMutation({
    mutationFn: ({
      contract,
      submission,
    }: {
      contract: Contract;
      submission: ContractPaymentSubmission;
    }) => {
      if (!userId || !tenantQuery.tenantId) {
        throw new Error('Thiếu thông tin thanh toán hợp đồng.');
      }
      return recordContractPayment(
        userId,
        contract.id,
        contract.customerId,
        contract.currencyCode,
        {
          scope: 'contract',
          amount: submission.amount,
          allocations: submission.allocations,
          monthAllocations: submission.monthAllocations,
        },
        tenantQuery.tenantId,
      );
    },
    onSuccess: async () => {
      toast.success('Đã ghi nhận thanh toán hợp đồng.');
      setPaymentContract(null);
      await queryClient.invalidateQueries({
        queryKey: ['project', 'contracts'],
      });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const columns = useContractColumns({
    onPrimary: setPaymentContract,
    onView: (contract) => setDetailContractId(contract.id),
    onOther: (contract) =>
      navigate(buildPath(ROUTES.PROJECT.CONTRACT_DETAIL, { id: contract.id })),
  });
  const table = useReactTable({
    data: contracts,
    columns,
    getRowId: (row) => row.id,
    state: { pagination },
    onPaginationChange,
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
  });

  const error = tenantQuery.error ?? workspaceQuery.error;
  const isLoading = tenantQuery.isPending || workspaceQuery.isLoading;

  if (tenantQuery.isError || workspaceQuery.isError) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 p-10 text-center">
        <TriangleAlert className="size-7 text-destructive" />
        <div>
          <CardTitle>Không tải được hợp đồng</CardTitle>
          <CardDescription className="mt-1">
            {getApiErrorMessage(error)}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            void tenantQuery.refetch();
            void workspaceQuery.refetch();
          }}
        >
          Thử lại
        </Button>
      </Card>
    );
  }

  return (
    <>
      <DataGrid
        table={table}
        recordCount={total}
        isLoading={isLoading}
        emptyMessage="Khách hàng chưa có hợp đồng"
      >
        <Card className="min-h-0 overflow-hidden">
          <CardHeader>
            <CardHeading>
              <CardTitle>Hợp đồng</CardTitle>
              <CardDescription>{total} hợp đồng</CardDescription>
            </CardHeading>
          </CardHeader>
          <CardTable className="min-h-0">
            <ScrollArea className="h-[420px]">
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardTable>
          <CardFooter className="justify-between">
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>
      {paymentContract ? (
        <ContractPaymentScopeDialog
          open
          scope="contract"
          tenantId={tenantQuery.tenantId ?? ''}
          userId={userId ?? ''}
          contractId={paymentContract.id}
          currencyCode={paymentContract.currencyCode}
          isSubmitting={paymentMutation.isPending}
          onOpenChange={(open) => {
            if (!open && !paymentMutation.isPending) {
              setPaymentContract(null);
            }
          }}
          onSubmit={(submission) =>
            paymentMutation.mutate({ contract: paymentContract, submission })
          }
        />
      ) : null}
      <ContractDetailDialog
        open={Boolean(detailContractId)}
        onOpenChange={(open) => {
          if (!open) setDetailContractId(null);
        }}
        contract={detailQuery.data ?? null}
        isLoading={detailQuery.isPending}
      />
    </>
  );
}
