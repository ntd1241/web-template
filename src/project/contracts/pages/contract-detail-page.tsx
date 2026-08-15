import { useState } from 'react';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/auth.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDays,
  FileText,
  Pencil,
  ReceiptText,
  RefreshCw,
  Trash2,
  UserRound,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
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
import { Tag } from '@/components/ui/tag';
import {
  EntityDetailInformationCard,
  EntityDetailProfileCard,
} from '@/components/layouts/entity-detail-layout';
import {
  activateContract,
  deleteContract,
  formatContractAmount,
  loadContractDetail,
  updateContract,
  type ContractDetail,
  type ContractVersionLineValuesForApi,
} from '../api/contracts.api';
import { ContractDetailLayout } from '../components/contract-detail-layout.generated';
import {
  ContractOverviewContent,
  ContractPaymentsContent,
  ContractReceivablesContent,
  ContractVersionsContent,
} from '../components/contract-detail-tab-content';
import {
  ContractFeeLinesEditor,
  createDefaultContractFeeLine,
} from '../components/contract-fee-lines-editor';
import {
  ContractFormDialog,
  mapContractToFormValues,
  useContractForm,
} from '../forms/contract-form.generated';
import { contractVersionLineSchema } from '../model/contract';

function formatDate(value: string | null) {
  if (!value) return 'Không giới hạn';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(`${value}T00:00:00`));
}

function DetailValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-semibold text-foreground">
        {value || 'Chưa cập nhật'}
      </dd>
    </div>
  );
}

function ContractProfileCard({ contract }: { contract: ContractDetail }) {
  const isActive = contract.status === 'active';
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
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <UserRound className="size-4 shrink-0" />
        <span className="truncate">{contract.customer.name}</span>
      </div>
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <CalendarDays className="size-4 shrink-0" />
        <span>
          {formatDate(contract.startDate)} – {formatDate(contract.endDate)}
        </span>
      </div>
      <Tag size="sm" shape="circle" color={isActive ? '#16a34a' : '#64748b'}>
        {isActive
          ? 'Đang hiệu lực'
          : contract.status === 'draft'
            ? 'Bản nháp'
            : contract.status}
      </Tag>
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
      <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
        <DetailValue label="Mã hợp đồng" value={contract.contractCode} />
        <DetailValue label="Khách hàng" value={contract.customer.name} />
        <DetailValue
          label="Còn phải thu"
          value={formatContractAmount(
            contract.receivableSummary?.totalOutstanding ?? 0,
            contract.currencyCode,
          )}
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
          label="Nhắc gia hạn"
          value={
            contract.renewalNoticeDays === null
              ? 'Không áp dụng'
              : `${contract.renewalNoticeDays} ngày trước`
          }
        />
        <DetailValue
          label="Ưu tiên thanh toán"
          value={String(contract.paymentPriority)}
        />
      </dl>
      {contract.note ? (
        <div className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
          {contract.note}
        </div>
      ) : null}
    </EntityDetailInformationCard>
  );
}

function toEditableLines(
  contract: ContractDetail,
): ContractVersionLineValuesForApi[] {
  const latestVersion = contract.versions[0];
  return contract.lines
    .filter((line) => line.contractVersionId === latestVersion?.id)
    .map((line) => ({
      name: line.name,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      billingType: line.billingType,
      billingUnit: line.billingUnit,
      billingInterval: line.billingInterval,
      chargeDate: line.chargeDate,
      dueRule: line.dueRule,
      dueDays: line.dueDays,
      startDate: line.startDate,
      endDate: line.endDate,
    }));
}

export function ContractDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const { id } = useParams<{ id: string }>();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feeLines, setFeeLines] = useState<ContractVersionLineValuesForApi[]>(
    [],
  );
  const form = useContractForm();

  const contractQuery = useQuery({
    queryKey: ['project', 'contracts', 'detail', userId, id],
    queryFn: () => {
      if (!userId || !id) throw new Error('Thiếu thông tin hợp đồng.');
      return loadContractDetail(userId, id);
    },
    enabled: Boolean(userId && id),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['project', 'contracts'] });

  const saveMutation = useMutation({
    mutationFn: (values: Parameters<typeof updateContract>[2]) => {
      if (!userId || !contractQuery.data)
        throw new Error('Thiếu thông tin cập nhật hợp đồng.');
      return updateContract(contractQuery.data.id, userId, values, feeLines);
    },
    onSuccess: async () => {
      toast.success('Đã cập nhật hợp đồng.');
      setEditDialogOpen(false);
      await invalidate();
      await contractQuery.refetch();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

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
    form.reset(mapContractToFormValues(contract));
    setFeeLines(
      toEditableLines(contract).length > 0
        ? toEditableLines(contract)
        : [createDefaultContractFeeLine(contract.startDate)],
    );
    setEditDialogOpen(true);
  }

  function handleSubmit(values: Parameters<typeof updateContract>[2]) {
    for (const [index, line] of feeLines.entries()) {
      const result = contractVersionLineSchema.safeParse({
        ...line,
        sortOrder: index,
      });
      if (!result.success) {
        toast.error(
          result.error.issues[0]?.message ?? 'Khoản phí chưa hợp lệ.',
        );
        return;
      }
    }
    saveMutation.mutate(values);
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
        overviewContent={<ContractOverviewContent contract={contract} />}
        receivablesContent={
          <ContractReceivablesContent
            charges={contract.charges}
            currencyCode={contract.currencyCode}
          />
        }
        versionsContent={<ContractVersionsContent contract={contract} />}
        paymentsContent={
          <ContractPaymentsContent
            payments={contract.payments}
            currencyCode={contract.currencyCode}
          />
        }
      />
      <ContractFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        mode="edit"
        form={form}
        onSubmit={handleSubmit}
        customerIdOptions={[
          {
            value: contract.customerId,
            label: `${contract.customer.name} · ${contract.customer.customerCode}`,
          },
        ]}
        lineEditor={
          <ContractFeeLinesEditor lines={feeLines} onChange={setFeeLines} />
        }
        isSaving={saveMutation.isPending}
        title="Sửa hợp đồng"
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
