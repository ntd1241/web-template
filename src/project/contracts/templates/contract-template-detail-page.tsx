import { buildPath, ROUTES } from '@/constants/routes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle2,
  Pencil,
  Plus,
  ReceiptText,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import { useNumberFormat } from '@/providers/number-format-provider';
import { useTenant } from '@/providers/tenant-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeading,
  CardTitle,
} from '@/components/ui/card';
import { PageLoading } from '@/components/ui/loading';
import {
  loadContractTemplateDetail,
  publishContractTemplateVersion,
} from '../api/contract-templates.api';
import type {
  ContractTemplateDetail,
  ContractTemplateVersionLine,
} from '../model/contract-template';
import { ContractTemplateStatusBadge } from './contract-template-status-badge';

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(value));
}

function TemplateFeeRow({
  line,
  currencyCode,
}: {
  line: ContractTemplateVersionLine;
  currencyCode: string;
}) {
  const { formatCurrency } = useNumberFormat();
  const billing =
    line.billingType === 'one_time'
      ? `Một lần · ${formatDate(line.chargeDate)}`
      : `Mỗi ${line.billingInterval ?? 1} ${line.billingUnit === 'month' ? 'tháng' : line.billingUnit === 'quarter' ? 'quý' : 'năm'}`;

  return (
    <div className="grid gap-3 border-b border-border px-4 py-3 last:border-b-0 md:grid-cols-[minmax(0,1.6fr)_0.8fr_1fr_1fr] md:items-center">
      <div className="min-w-0">
        <div className="truncate font-medium text-foreground">{line.name}</div>
        <div className="text-xs text-muted-foreground">{billing}</div>
      </div>
      <div className="text-sm text-muted-foreground">
        {line.direction === 'receivable' ? 'Khoản thu' : 'Khoản chi'}
      </div>
      <div className="text-sm text-muted-foreground">
        {line.quantity} × {formatCurrency(line.unitPrice, currencyCode)}
      </div>
      <div className="font-semibold text-primary">
        {formatCurrency(line.amount, currencyCode)}
      </div>
    </div>
  );
}

export function ContractTemplateDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();
  const detailQuery = useQuery({
    queryKey: ['project', 'contract-templates', 'detail', tenantId, id],
    queryFn: () => {
      if (!tenantId || !id) throw new Error('Thiếu mẫu hợp đồng.');
      return loadContractTemplateDetail(tenantId, id);
    },
    enabled: Boolean(tenantId && id),
  });
  const publishMutation = useMutation({
    mutationFn: ({
      template,
      versionId,
    }: {
      template: ContractTemplateDetail;
      versionId: string;
    }) => {
      if (!tenantId) throw new Error('Chưa xác định tenant đang hoạt động.');
      return publishContractTemplateVersion(tenantId, template.id, versionId);
    },
    onSuccess: async () => {
      toast.success('Đã phát hành phiên bản mẫu.');
      await queryClient.invalidateQueries({
        queryKey: ['project', 'contract-templates'],
      });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (detailQuery.isPending) return <PageLoading />;
  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="p-6 text-sm text-destructive">
        {getApiErrorMessage(detailQuery.error)}
      </div>
    );
  }
  const template = detailQuery.data;
  const latestVersion = template.versions[0];
  const latestLines = template.lines.filter(
    (line) => line.templateVersionId === latestVersion?.id,
  );

  return (
    <div className="flex min-h-full flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            mode="icon"
            aria-label="Quay lại danh sách mẫu hợp đồng"
            onClick={() => navigate(ROUTES.PROJECT.CONTRACT_TEMPLATES)}
          >
            <ArrowLeft />
          </Button>
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {template.code}
              </span>
              <ContractTemplateStatusBadge status={template.status} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {template.name}
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              {template.description || 'Chưa có mô tả cho mẫu dịch vụ này.'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                buildPath(ROUTES.PROJECT.CONTRACT_TEMPLATE_EDIT, {
                  id: template.id,
                }),
              )
            }
          >
            <Pencil />
            Chỉnh sửa mẫu
          </Button>
          {template.status === 'published' ? (
            <Button
              variant="primary"
              onClick={() =>
                navigate(
                  `${ROUTES.PROJECT.CONTRACT_CREATE}?templateId=${encodeURIComponent(template.id)}`,
                )
              }
            >
              <Plus />
              Tạo hợp đồng từ mẫu
            </Button>
          ) : null}
          {latestVersion?.status === 'draft' &&
          template.status !== 'archived' ? (
            <Button
              variant="primary"
              loading={publishMutation.isPending}
              onClick={() => {
                if (latestVersion) {
                  publishMutation.mutate({
                    template,
                    versionId: latestVersion.id,
                  });
                }
              }}
            >
              <CheckCircle2 />
              Phát hành phiên bản
            </Button>
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardHeading>
            <CardTitle>Thông tin mẫu</CardTitle>
          </CardHeading>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-sm text-muted-foreground">
              Phiên bản hiện tại
            </div>
            <div className="mt-1 font-semibold">
              {latestVersion ? `v${latestVersion.versionNo}` : 'Chưa có'}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Đơn vị tiền tệ</div>
            <div className="mt-1 font-semibold">{template.currencyCode}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">
              Tự động gia hạn mặc định
            </div>
            <div className="mt-1 font-semibold">
              {template.autoRenewDefault ? 'Có' : 'Không'}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">
              Cập nhật gần nhất
            </div>
            <div className="mt-1 font-semibold">
              {formatDate(template.updatedAt)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardHeading>
            <CardTitle className="flex items-center gap-2">
              <ReceiptText className="size-5 text-primary" />
              Khoản phí phiên bản hiện tại
            </CardTitle>
            <CardDescription>
              {latestLines.length} khoản phí mặc định
            </CardDescription>
          </CardHeading>
        </CardHeader>
        <CardContent className="p-0">
          {latestLines.length > 0 ? (
            <div>
              {latestLines.map((line) => (
                <TemplateFeeRow
                  key={line.id}
                  line={line}
                  currencyCode={template.currencyCode}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Chưa có khoản phí trong phiên bản này.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardHeading>
            <CardTitle>Lịch sử phiên bản</CardTitle>
            <CardDescription>
              Mỗi lần chỉnh sửa sau khi phát hành sẽ tạo phiên bản mẫu mới.
            </CardDescription>
          </CardHeading>
        </CardHeader>
        <CardContent className="space-y-3">
          {template.versions.map((version) => (
            <div
              key={version.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
            >
              <div>
                <div className="font-medium">v{version.versionNo}</div>
                <div className="text-xs text-muted-foreground">
                  Tạo ngày {formatDate(version.createdAt)}
                </div>
              </div>
              <ContractTemplateStatusBadge
                status={
                  version.status === 'published'
                    ? 'published'
                    : version.status === 'superseded'
                      ? 'archived'
                      : 'draft'
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
