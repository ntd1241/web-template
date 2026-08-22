import type { ReactNode } from 'react';
import { buildPath, ROUTES } from '@/constants/routes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  History,
  ListChecks,
  Pencil,
  Plus,
  ReceiptText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import { useNumberFormat } from '@/providers/number-format-provider';
import { useTenant } from '@/providers/tenant-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardHeading,
  CardTitle,
} from '@/components/ui/card';
import { PageLoading } from '@/components/ui/loading';
import { PageBackButton } from '@/components/ui/page-back-button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  index,
  currencyCode,
}: {
  line: ContractTemplateVersionLine;
  index: number;
  currencyCode: string;
}) {
  const { formatCurrency } = useNumberFormat();
  const billing =
    line.billingType === 'one_time'
      ? 'Một lần'
      : `Mỗi ${line.billingInterval ?? 1} ${line.billingUnit === 'month' ? 'tháng' : line.billingUnit === 'quarter' ? 'quý' : 'năm'}`;

  return (
    <TableRow>
      <TableCell className="w-12 tabular-nums text-muted-foreground">
        {index + 1}
      </TableCell>
      <TableCell className="min-w-56">
        <div className="truncate font-medium text-foreground">{line.name}</div>
      </TableCell>
      <TableCell className="w-36">
        <Badge
          size="sm"
          appearance="light"
          variant={line.direction === 'receivable' ? 'success' : 'destructive'}
        >
          {line.direction === 'receivable' ? 'Khoản thu' : 'Khoản chi'}
        </Badge>
      </TableCell>
      <TableCell className="w-36 whitespace-nowrap text-muted-foreground">
        {billing}
      </TableCell>
      <TableCell className="w-44 whitespace-nowrap text-muted-foreground">
        {line.quantity} × {formatCurrency(line.unitPrice, currencyCode)}
      </TableCell>
      <TableCell className="w-44 whitespace-nowrap text-right font-semibold text-primary">
        {formatCurrency(line.amount, currencyCode)}
      </TableCell>
    </TableRow>
  );
}

function TemplateInfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="grid gap-2 px-5 py-3.5 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 text-primary" />
        {label}
      </div>
      <div className="min-w-0 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function TemplateProfileCard({
  template,
  latestVersion,
  latestLines,
}: {
  template: ContractTemplateDetail;
  latestVersion: ContractTemplateDetail['versions'][number] | undefined;
  latestLines: ContractTemplateVersionLine[];
}) {
  return (
    <Card className="h-fit lg:sticky lg:top-6">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-24 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner">
            <FileText className="size-12" />
          </div>
          <Badge
            variant="primary"
            appearance="light"
            shape="circle"
            size="lg"
            className="mt-5"
          >
            Mẫu hợp đồng
          </Badge>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-foreground">
            {template.name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{template.code}</p>
          <div className="mt-3">
            <ContractTemplateStatusBadge status={template.status} size="lg" />
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <p className="text-sm leading-6 text-muted-foreground">
            {template.description || 'Chưa có mô tả cho mẫu dịch vụ này.'}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 divide-x rounded-lg border border-border bg-muted/20 py-3">
          <div className="px-2 text-center">
            <div className="text-lg font-semibold text-foreground">
              {latestVersion ? `v${latestVersion.versionNo}` : '—'}
            </div>
            <div className="mt-0.5 text-[0.6875rem] text-muted-foreground">
              Phiên bản
            </div>
          </div>
          <div className="px-2 text-center">
            <div className="text-lg font-semibold text-foreground">
              {latestLines.length}
            </div>
            <div className="mt-0.5 text-[0.6875rem] text-muted-foreground">
              Khoản phí
            </div>
          </div>
          <div className="px-2 text-center">
            <div className="text-lg font-semibold text-foreground">
              {template.contractCount}
            </div>
            <div className="mt-0.5 text-[0.6875rem] text-muted-foreground">
              Hợp đồng
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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

  const editTemplate = () =>
    navigate(
      buildPath(ROUTES.PROJECT.CONTRACT_TEMPLATE_EDIT, {
        id: template.id,
      }),
      {
        state: {
          returnTo: buildPath(ROUTES.PROJECT.CONTRACT_TEMPLATE_DETAIL, {
            id: template.id,
          }),
        },
      },
    );

  return (
    <div className="flex min-h-full flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageBackButton
          label="Quay lại danh sách mẫu hợp đồng"
          onClick={() => navigate(ROUTES.PROJECT.CONTRACT_TEMPLATES)}
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="md" onClick={editTemplate}>
            <Pencil />
            Chỉnh sửa mẫu
          </Button>
          {template.status === 'published' ? (
            <Button
              variant="primary"
              size="md"
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

      <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <TemplateProfileCard
          template={template}
          latestVersion={latestVersion}
          latestLines={latestLines}
        />

        <div className="min-w-0 space-y-6">
          <Card sectionBorders="default">
            <CardHeader>
              <CardHeading>
                <CardTitle>Thông tin mẫu</CardTitle>
              </CardHeading>
              <Button variant="outline" size="sm" onClick={editTemplate}>
                <Pencil />
                Chỉnh sửa
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <TemplateInfoRow
                  icon={FileText}
                  label="Tên mẫu"
                  value={template.name}
                />
                <TemplateInfoRow
                  icon={ListChecks}
                  label="Mã mẫu"
                  value={template.code}
                />
                <TemplateInfoRow
                  icon={CircleDollarSign}
                  label="Đơn vị tiền tệ"
                  value={template.currencyCode}
                />
                <TemplateInfoRow
                  icon={History}
                  label="Phiên bản hiện tại"
                  value={
                    latestVersion ? `v${latestVersion.versionNo}` : 'Chưa có'
                  }
                />
                <TemplateInfoRow
                  icon={CalendarClock}
                  label="Tự động gia hạn mặc định"
                  value={template.autoRenewDefault ? 'Có' : 'Không'}
                />
                <TemplateInfoRow
                  icon={CalendarClock}
                  label="Cập nhật lần cuối"
                  value={formatDate(template.updatedAt)}
                />
                <TemplateInfoRow
                  icon={FileText}
                  label="Ghi chú"
                  value={template.note || 'Chưa có ghi chú cho người dùng mẫu.'}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden" sectionBorders="default">
            <CardHeader>
              <CardHeading>
                <CardTitle className="flex items-center gap-2">
                  <ReceiptText className="size-5 text-primary" />
                  Khoản phí mặc định
                </CardTitle>
              </CardHeading>
              <Button variant="outline" size="sm" onClick={editTemplate}>
                <Pencil />
                Chỉnh sửa
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {latestLines.length > 0 ? (
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">STT</TableHead>
                      <TableHead className="min-w-56">Tên khoản phí</TableHead>
                      <TableHead className="w-36">Loại phí</TableHead>
                      <TableHead className="w-36">Chu kỳ</TableHead>
                      <TableHead className="w-44">Cách tính</TableHead>
                      <TableHead className="w-44 text-right">
                        Giá trị mặc định
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestLines.map((line, index) => (
                      <TemplateFeeRow
                        key={line.id}
                        line={line}
                        index={index}
                        currencyCode={template.currencyCode}
                      />
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Chưa có khoản phí trong phiên bản này.
                </div>
              )}
            </CardContent>
          </Card>

          <Card sectionBorders="default">
            <CardHeader>
              <CardHeading>
                <CardTitle className="flex items-center gap-2">
                  <History className="size-5 text-primary" />
                  Lịch sử phiên bản
                </CardTitle>
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
      </div>
    </div>
  );
}
