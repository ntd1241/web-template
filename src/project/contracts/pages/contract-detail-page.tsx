import { useState, type ReactNode } from 'react';
import { buildPath, ROUTES } from '@/constants/routes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  History,
  Info,
  LayoutDashboard,
  Paperclip,
  Pencil,
  ReceiptText,
  RefreshCw,
  Trash2,
  WalletCards,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import { useTenant } from '@/providers/tenant-provider';
import { useUser } from '@/providers/user-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeading,
  CardTitle,
} from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PageLoading } from '@/components/ui/loading';
import { ShortcutTooltip } from '@/components/ui/shortcut-tooltip';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  EntityDetailInformationItem,
  EntityDetailTabs,
  type EntityDetailTab,
} from '@/components/layouts/entity-detail-layout';
import { CustomerIdentity } from '../../customers/components/customer-identity';
import {
  activateContract,
  deleteContract,
  loadContractPaymentPeriodCount,
  recordContractPayment,
  renewContract,
  type ContractDetail,
  type ContractRenewalInput,
} from '../api/contracts.api';
import { ContractDetailDialog } from '../components/contract-detail-dialog';
import {
  ContractAttachmentsContent,
  ContractOverviewContent,
  ContractPaymentsContent,
  ContractReceivablesContent,
  ContractVersionsContent,
} from '../components/contract-detail-tab-content';
import { ContractPaymentScopeDialog } from '../components/contract-payment-scope-dialog';
import { ContractRenewalDialog } from '../components/contract-renewal-dialog';
import { ContractResponsibleAvatarGroup } from '../components/contract-responsible-avatar-group';
import { ContractResponsibleDialog } from '../components/contract-responsible-dialog';
import { ContractStatusBadge } from '../components/contract-status-badge';
import { useContractDetailQuery } from '../hooks/use-contract-detail-query';
import type { ContractPaymentSubmission } from '../model/receivable';

function formatDate(value: string | null) {
  if (!value) return 'Không giới hạn';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(`${value}T00:00:00`));
}

function ContractHero({
  contract,
  actions,
}: {
  contract: ContractDetail;
  actions: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-accent to-admin-primary-bright text-white">
      <img
        src="/media/app/contract-hero-pattern.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full object-bottom object-cover opacity-35 mix-blend-screen hue-rotate-[140deg] saturate-150"
      />
      <div className="pointer-events-none absolute -end-24 -top-36 size-[28rem] rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 start-1/3 size-[32rem] rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="relative mx-auto flex min-h-[220px] max-w-[1600px] flex-col justify-end gap-8 px-4 pb-20 pt-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15 shadow-lg backdrop-blur-sm sm:size-20">
              <FileText className="size-8 sm:size-10" />
            </div>
            <div className="min-w-0">
              <p className="mb-1 text-sm font-medium text-white/70">
                Chi tiết hợp đồng
              </p>
              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {contract.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/80">
                <span>Mã hợp đồng: {contract.contractCode}</span>
                <ContractStatusBadge status={contract.status} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {actions}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContractSummaryCard({
  contract,
  onManageResponsibles,
  canManageResponsibles,
}: {
  contract: ContractDetail;
  onManageResponsibles: () => void;
  canManageResponsibles: boolean;
}) {
  const activeStartDate =
    contract.activeVersion?.effectiveFrom ?? contract.startDate;
  const activeEndDate = contract.activeVersion?.effectiveTo ?? null;

  return (
    <Card className="relative -mt-10 overflow-visible border-border/70 shadow-lg shadow-slate-900/10 lg:-mt-14">
      <CardContent className="p-5 sm:p-6">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-[1.35fr_1fr_1fr_1fr] xl:gap-0">
          <EntityDetailInformationItem
            label="Khách hàng"
            className="xl:border-e xl:border-border xl:pe-6"
            value={
              <Link
                to={buildPath(ROUTES.PROJECT.CUSTOMER_DETAIL, {
                  id: contract.customer.id,
                })}
                target="_blank"
                rel="noreferrer"
                className="block min-w-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={`Xem chi tiết khách hàng ${contract.customer.name}`}
              >
                <CustomerIdentity customer={contract.customer} />
              </Link>
            }
          />
          <EntityDetailInformationItem
            label="Ngày bắt đầu"
            className="xl:border-e xl:border-border xl:px-6"
            value={formatDate(activeStartDate)}
          />
          <EntityDetailInformationItem
            label="Ngày kết thúc"
            className="xl:border-e xl:border-border xl:px-6"
            value={formatDate(activeEndDate)}
          />
          <EntityDetailInformationItem
            label="Nhân viên phụ trách"
            className="xl:ps-6"
            value={
              <ContractResponsibleAvatarGroup
                employees={contract.responsibleEmployees}
                onClick={
                  canManageResponsibles ? onManageResponsibles : undefined
                }
              />
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ContractHeroActions({
  contract,
  onEdit,
  onDelete,
  onActivate,
  onShowDetails,
  onPay,
  onRenew,
  isActivating,
  isPaying,
}: {
  contract: ContractDetail;
  onEdit: () => void;
  onDelete: () => void;
  onActivate: () => void;
  onShowDetails: () => void;
  onPay: () => void;
  onRenew: () => void;
  isActivating: boolean;
  isPaying: boolean;
}) {
  return (
    <>
      {contract.versions[0]?.status === 'draft' ? (
        <Button
          type="button"
          variant="outline"
          className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          loading={isActivating}
          loadingText="Đang kích hoạt..."
          onClick={onActivate}
        >
          <ReceiptText />
          Kích hoạt
        </Button>
      ) : null}
      <Button
        type="button"
        variant="outline"
        className="border-white/25 bg-white text-primary hover:bg-white/90 hover:text-primary"
        onClick={onShowDetails}
      >
        <Info />
        Xem chi tiết
      </Button>
      <Button
        type="button"
        variant="outline"
        className="border-white/25 bg-white text-primary hover:bg-white/90 hover:text-primary"
        loading={isPaying}
        loadingText="Đang tải..."
        onClick={onPay}
      >
        <WalletCards />
        Thanh toán
      </Button>
      {contract.status === 'active' || contract.status === 'expired' ? (
        <Button
          type="button"
          variant="outline"
          className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          onClick={onRenew}
        >
          <RefreshCw />
          Gia hạn
        </Button>
      ) : null}
      <ShortcutTooltip label="Sửa thông tin" shortcut="Alt + E">
        <Button
          type="button"
          variant="outline"
          className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          onClick={onEdit}
          data-shortcut-action="edit"
        >
          <Pencil />
          Sửa thông tin
        </Button>
      </ShortcutTooltip>
      <Button
        type="button"
        variant="outline"
        mode="icon"
        className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
        aria-label={`Xóa hợp đồng ${contract.name}`}
        onClick={onDelete}
      >
        <Trash2 />
      </Button>
    </>
  );
}

function ContractDetailShell({
  contract,
  heroActions,
  onManageResponsibles,
  canManageResponsibles,
  tabs,
}: {
  contract: ContractDetail;
  heroActions: ReactNode;
  onManageResponsibles: () => void;
  canManageResponsibles: boolean;
  tabs: EntityDetailTab[];
}) {
  return (
    <div className="flex min-h-full flex-col bg-muted/30">
      <ContractHero contract={contract} actions={heroActions} />
      <main className="mx-auto w-full max-w-[1600px] px-4 pb-8 sm:px-6 lg:px-8">
        <ContractSummaryCard
          contract={contract}
          onManageResponsibles={onManageResponsibles}
          canManageResponsibles={canManageResponsibles}
        />
        <div className="mt-6">
          <EntityDetailTabs tabs={tabs} defaultValue="overview" />
        </div>
      </main>
    </div>
  );
}

export function ContractDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId, hasPermission } = useUser();
  const {
    tenantId,
    isPending: isTenantPending,
    isError: isTenantError,
    error: tenantError,
    refetch: refetchTenant,
  } = useTenant();
  const { id } = useParams<{ id: string }>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [responsibleDialogOpen, setResponsibleDialogOpen] = useState(false);
  const [contractPaymentDialogOpen, setContractPaymentDialogOpen] =
    useState(false);
  const [contractRenewalDialogOpen, setContractRenewalDialogOpen] =
    useState(false);
  const canManageResponsibles = hasPermission('contracts:assign');

  const contractQuery = useContractDetailQuery(id);

  const paymentPeriodCountQuery = useQuery({
    queryKey: [
      'project',
      'contracts',
      'payment-period-count',
      userId,
      id,
      tenantId,
    ],
    queryFn: () => {
      if (!userId || !id || !tenantId) {
        throw new Error('Thiếu thông tin hợp đồng.');
      }
      return loadContractPaymentPeriodCount(userId, id, tenantId);
    },
    enabled: Boolean(userId && id && tenantId && contractQuery.data),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['project', 'contracts'] });

  const deleteMutation = useMutation({
    mutationFn: deleteContract,
    onSuccess: async () => {
      toast.success('Đã xóa hợp đồng.');
      await invalidate();
      navigate(ROUTES.PROJECT.CONTRACTS, { replace: true });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const activateMutation = useMutation({
    mutationFn: () => {
      if (!userId || !contractQuery.data)
        throw new Error('Thiếu thông tin kích hoạt hợp đồng.');
      return activateContract(contractQuery.data, userId);
    },
    onSuccess: async () => {
      toast.success('Đã kích hoạt hợp đồng.');
      await invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const contractPaymentMutation = useMutation({
    mutationFn: (submission: ContractPaymentSubmission) => {
      if (!userId || !contractQuery.data) {
        throw new Error('Thiếu thông tin thanh toán hợp đồng.');
      }
      return recordContractPayment(
        userId,
        contractQuery.data.id,
        contractQuery.data.customer.id,
        contractQuery.data.currencyCode,
        {
          scope: 'contract',
          amount: submission.amount,
          allocations: submission.allocations,
          monthAllocations: submission.monthAllocations,
        },
        contractQuery.data.tenantId,
      );
    },
    onSuccess: async () => {
      toast.success('Đã ghi nhận thanh toán hợp đồng.');
      setContractPaymentDialogOpen(false);
      await invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const contractRenewalMutation = useMutation({
    mutationFn: (input: ContractRenewalInput) => {
      if (!contractQuery.data) {
        throw new Error('Thiếu thông tin hợp đồng để gia hạn.');
      }
      return renewContract(
        contractQuery.data.tenantId,
        contractQuery.data.id,
        input,
      );
    },
    onSuccess: async () => {
      toast.success('Đã gia hạn hợp đồng.');
      setContractRenewalDialogOpen(false);
      await invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function openEdit(contract: ContractDetail) {
    navigate(
      `${ROUTES.PROJECT.CONTRACT_CREATE}?edit=${encodeURIComponent(contract.id)}`,
    );
  }

  if (isTenantPending || contractQuery.isPending) {
    return (
      <PageLoading label="Đang tải thông tin hợp đồng..." className="h-full" />
    );
  }

  if (isTenantError || contractQuery.isError || !contractQuery.data) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card className="max-w-lg text-center">
          <CardHeader>
            <CardHeading>
              <CardTitle>Không tải được hợp đồng</CardTitle>
              <CardDescription className="mt-2">
                {getApiErrorMessage(tenantError ?? contractQuery.error)}
              </CardDescription>
            </CardHeading>
          </CardHeader>
          <CardContent className="flex justify-center gap-2 pt-0">
            <Button
              variant="outline"
              onClick={() => navigate(ROUTES.PROJECT.CONTRACTS)}
            >
              Danh sách hợp đồng
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                void refetchTenant();
                void contractQuery.refetch();
              }}
            >
              <RefreshCw />
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const contract = contractQuery.data;
  const paymentPeriodCount = paymentPeriodCountQuery.data ?? 0;

  const tabs: EntityDetailTab[] = [
    {
      value: 'overview',
      label: 'Tổng quan',
      icon: LayoutDashboard,
      content: <ContractOverviewContent contract={contract} />,
    },
    {
      value: 'receivables',
      label: 'Kỳ thanh toán',
      icon: ReceiptText,
      badge:
        paymentPeriodCount > 0 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                size="sm"
                shape="circle"
                variant="destructive"
                aria-label={`${paymentPeriodCount} kỳ thanh toán cần xử lý`}
              >
                {paymentPeriodCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {paymentPeriodCount} kỳ thanh toán cần xử lý
            </TooltipContent>
          </Tooltip>
        ) : undefined,
      content: (
        <ContractReceivablesContent
          tenantId={contract.tenantId}
          dueSoonDays={contract.paymentReminderDays}
          userId={userId ?? ''}
          contractId={contract.id}
          customerId={contract.customer.id}
          currencyCode={contract.currencyCode}
          onPaymentRecorded={async () => {
            await invalidate();
          }}
        />
      ),
    },
    {
      value: 'versions',
      label: 'Phiên bản',
      icon: History,
      content: <ContractVersionsContent contract={contract} />,
    },
    {
      value: 'payments',
      label: 'Lịch sử thanh toán',
      icon: WalletCards,
      content: <ContractPaymentsContent payments={contract.payments} />,
    },
    {
      value: 'attachments',
      label: 'Tài liệu',
      icon: Paperclip,
      content: (
        <ContractAttachmentsContent
          contract={contract}
          userId={userId ?? ''}
          onChanged={async () => {
            await invalidate();
          }}
        />
      ),
    },
  ];

  return (
    <>
      <ContractDetailShell
        contract={contract}
        heroActions={
          <ContractHeroActions
            contract={contract}
            onEdit={() => openEdit(contract)}
            onDelete={() => setDeleteDialogOpen(true)}
            onActivate={() => activateMutation.mutate()}
            onShowDetails={() => setDetailDialogOpen(true)}
            onPay={() => setContractPaymentDialogOpen(true)}
            onRenew={() => setContractRenewalDialogOpen(true)}
            isActivating={activateMutation.isPending}
            isPaying={contractPaymentMutation.isPending}
          />
        }
        onManageResponsibles={() => setResponsibleDialogOpen(true)}
        canManageResponsibles={canManageResponsibles}
        tabs={tabs}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa hợp đồng?"
        description={`Bạn có chắc muốn xóa hợp đồng "${contract.name}"?`}
        confirmLabel="Xóa hợp đồng"
        confirmVariant="destructive"
        onConfirm={() => deleteMutation.mutate(contract.id)}
      />
      <ContractResponsibleDialog
        open={responsibleDialogOpen}
        onOpenChange={setResponsibleDialogOpen}
        tenantId={contract.tenantId}
        contractId={contract.id}
      />
      <ContractDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        contract={contract}
      />
      <ContractPaymentScopeDialog
        open={contractPaymentDialogOpen}
        scope="contract"
        tenantId={contract.tenantId}
        userId={userId ?? ''}
        contractId={contract.id}
        currencyCode={contract.currencyCode}
        isSubmitting={contractPaymentMutation.isPending}
        onOpenChange={(open) => {
          if (!open && !contractPaymentMutation.isPending) {
            setContractPaymentDialogOpen(false);
          }
        }}
        onSubmit={(submission) => contractPaymentMutation.mutate(submission)}
      />
      <ContractRenewalDialog
        open={contractRenewalDialogOpen}
        isSubmitting={contractRenewalMutation.isPending}
        onOpenChange={(open) => {
          if (!contractRenewalMutation.isPending) {
            setContractRenewalDialogOpen(open);
          }
        }}
        contract={contract}
        onConfirm={(input) => contractRenewalMutation.mutate(input)}
      />
    </>
  );
}
