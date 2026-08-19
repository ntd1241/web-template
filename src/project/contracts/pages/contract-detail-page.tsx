import { useState, type ReactNode } from 'react';
import { buildPath, ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/auth.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CircleCheck,
  FileText,
  Pencil,
  ReceiptText,
  RefreshCw,
  Trash2,
  TriangleAlert,
  WalletCards,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import { useNumberFormat } from '@/providers/number-format-provider';
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
import { StatCard } from '@/components/ui/stat-card';
import { Tag } from '@/components/ui/tag';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  EntityDetailInformationCard,
  EntityDetailInformationGrid,
  EntityDetailProfileCard,
} from '@/components/layouts/entity-detail-layout';
import { CustomerIdentity } from '../../customers/components/customer-identity';
import { EmployeeIdentity } from '../../employees/components/employee-identity';
import {
  activateContract,
  deleteContract,
  loadContractDetail,
  loadContractPaymentPeriodCount,
  type ContractDetail,
} from '../api/contracts.api';
import { ContractDetailLayout } from '../components/contract-detail-layout.generated';
import {
  ContractAttachmentsContent,
  ContractOverviewContent,
  ContractPaymentsContent,
  ContractReceivablesContent,
  ContractVersionsContent,
} from '../components/contract-detail-tab-content';
import { ContractStatusBadge } from '../components/contract-status-badge';
import { getContractReceivableStats } from '../model/receivable';

function formatDate(value: string | null) {
  if (!value) return 'Không giới hạn';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(`${value}T00:00:00`));
}

function DetailValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm font-semibold text-foreground">
        {value || 'Chưa cập nhật'}
      </dd>
    </div>
  );
}

function ContractProfileCard({ contract }: { contract: ContractDetail }) {
  return (
    <EntityDetailProfileCard
      avatar={
        <div className="flex size-24 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FileText className="size-10" />
        </div>
      }
      title={contract.name}
      subtitle={contract.contractCode}
    >
      <div className="space-y-1.5">
        <div className="text-sm text-muted-foreground">Khách hàng</div>
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
      </div>
    </EntityDetailProfileCard>
  );
}

function ContractInformationCard({
  contract,
  onEdit,
  onDelete,
  onActivate,
  isActivating,
}: {
  contract: ContractDetail;
  onEdit: () => void;
  onDelete: () => void;
  onActivate: () => void;
  isActivating: boolean;
}) {
  const { formatCurrency } = useNumberFormat();
  const stats = getContractReceivableStats(contract.charges);

  return (
    <EntityDetailInformationCard
      actions={
        <>
          {contract.versions[0]?.status === 'draft' ? (
            <Button
              type="button"
              variant="ghost"
              loading={isActivating}
              loadingText="Đang kích hoạt..."
              onClick={onActivate}
            >
              <ReceiptText />
              Kích hoạt
            </Button>
          ) : null}
          <ShortcutTooltip label="Sửa thông tin" shortcut="Alt + E">
            <Button
              type="button"
              variant="ghost"
              onClick={onEdit}
              data-shortcut-action="edit"
            >
              <Pencil />
              Sửa thông tin
            </Button>
          </ShortcutTooltip>
          <Button
            type="button"
            variant="ghost"
            mode="icon"
            className="text-destructive hover:text-destructive"
            aria-label={`Xóa hợp đồng ${contract.name}`}
            onClick={onDelete}
          >
            <Trash2 />
          </Button>
        </>
      }
    >
      <EntityDetailInformationGrid>
        <DetailValue
          label="Trạng thái"
          value={<ContractStatusBadge status={contract.status} />}
        />
        <DetailValue
          label="Ngày bắt đầu"
          value={formatDate(contract.startDate)}
        />
        <DetailValue
          label="Ngày kết thúc"
          value={formatDate(contract.endDate)}
        />
        <DetailValue
          label="Tự động gia hạn"
          value={contract.autoRenew ? 'Có' : 'Không'}
        />
        <DetailValue
          label="Người tạo hợp đồng"
          value={
            contract.createdByEmployee ? (
              <EmployeeIdentity employee={contract.createdByEmployee} />
            ) : undefined
          }
        />
        <DetailValue
          label="Nhân viên phụ trách"
          value={
            contract.responsibleEmployees.length > 0 ? (
              <div className="space-y-2">
                {contract.responsibleEmployees.map((employee) => (
                  <EmployeeIdentity key={employee.id} employee={employee} />
                ))}
              </div>
            ) : undefined
          }
        />
        <DetailValue
          label="Nhãn"
          value={
            contract.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {contract.tags.map((tag) => (
                  <Tag key={tag.id} color={tag.color}>
                    {tag.name}
                  </Tag>
                ))}
              </div>
            ) : undefined
          }
        />
      </EntityDetailInformationGrid>
      {contract.note ? (
        <div className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
          {contract.note}
        </div>
      ) : null}
      <div className="mt-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={FileText}
            iconTone="info"
            label="Tổng đã lập"
            value={formatCurrency(stats.totalBilled, contract.currencyCode)}
          />
          <StatCard
            icon={CircleCheck}
            iconTone="success"
            label="Đã thanh toán"
            value={formatCurrency(stats.totalPaid, contract.currencyCode)}
          />
          <StatCard
            icon={WalletCards}
            iconTone="warning"
            label="Còn phải thu"
            value={formatCurrency(
              stats.totalOutstanding,
              contract.currencyCode,
            )}
            emphasis
          />
          <StatCard
            icon={TriangleAlert}
            iconTone="danger"
            label="Quá hạn"
            value={formatCurrency(
              stats.overdueOutstanding,
              contract.currencyCode,
            )}
          />
        </div>
      </div>
    </EntityDetailInformationCard>
  );
}

export function ContractDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const { id } = useParams<{ id: string }>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const contractQuery = useQuery({
    queryKey: ['project', 'contracts', 'detail', userId, id],
    queryFn: () => {
      if (!userId || !id) throw new Error('Thiếu thông tin hợp đồng.');
      return loadContractDetail(userId, id);
    },
    enabled: Boolean(userId && id),
  });

  const paymentPeriodCountQuery = useQuery({
    queryKey: ['project', 'contracts', 'payment-period-count', userId, id],
    queryFn: () => {
      if (!userId || !id) throw new Error('Thiếu thông tin hợp đồng.');
      return loadContractPaymentPeriodCount(userId, id);
    },
    enabled: Boolean(userId && id),
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
      await contractQuery.refetch();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function openEdit(contract: ContractDetail) {
    navigate(
      `${ROUTES.PROJECT.CONTRACT_CREATE}?edit=${encodeURIComponent(contract.id)}`,
    );
  }

  if (contractQuery.isPending) {
    return (
      <PageLoading label="Đang tải thông tin hợp đồng..." className="h-full" />
    );
  }

  if (contractQuery.isError || !contractQuery.data) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card className="max-w-lg text-center">
          <CardHeader>
            <CardHeading>
              <CardTitle>Không tải được hợp đồng</CardTitle>
              <CardDescription className="mt-2">
                {getApiErrorMessage(contractQuery.error)}
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
            <Button variant="primary" onClick={() => contractQuery.refetch()}>
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

  return (
    <>
      <ContractDetailLayout
        profile={<ContractProfileCard contract={contract} />}
        information={
          <ContractInformationCard
            contract={contract}
            onEdit={() => openEdit(contract)}
            onDelete={() => setDeleteDialogOpen(true)}
            onActivate={() => activateMutation.mutate()}
            isActivating={activateMutation.isPending}
          />
        }
        receivablesBadge={
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
          ) : undefined
        }
        overviewContent={<ContractOverviewContent contract={contract} />}
        receivablesContent={
          <ContractReceivablesContent
            tenantId={contract.tenantId}
            dueSoonDays={contract.paymentReminderDays}
            userId={userId ?? ''}
            contractId={contract.id}
            customerId={contract.customer.id}
            currencyCode={contract.currencyCode}
            onPaymentRecorded={async () => {
              await Promise.all([
                contractQuery.refetch(),
                paymentPeriodCountQuery.refetch(),
                invalidate(),
              ]);
            }}
          />
        }
        versionsContent={<ContractVersionsContent contract={contract} />}
        paymentsContent={
          <ContractPaymentsContent payments={contract.payments} />
        }
        attachmentsContent={<ContractAttachmentsContent contract={contract} />}
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
    </>
  );
}
