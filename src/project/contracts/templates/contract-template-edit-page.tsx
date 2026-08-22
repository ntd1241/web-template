import { useEffect, useRef, useState } from 'react';
import { buildPath, ROUTES } from '@/constants/routes';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import { useTenant } from '@/providers/tenant-provider';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardHeading,
  CardTitle,
} from '@/components/ui/card';
import { PageLoading } from '@/components/ui/loading';
import {
  createContractTemplate,
  loadContractTemplateDetail,
  updateContractTemplate,
} from '../api/contract-templates.api';
import {
  ContractFeeLinesEditor,
  createDefaultContractFeeLine,
  type ContractFeeLinesEditorRef,
} from '../components/contract-fee-lines-editor';
import type { ContractTemplateLineValues } from '../model/contract-template';
import {
  contractTemplateDefaultValues,
  ContractTemplateForm,
  mapContractTemplateToFormValues,
  useContractTemplateForm,
} from './contract-template-form.generated';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function toEditableLines(
  template: Awaited<ReturnType<typeof loadContractTemplateDetail>>,
): ContractTemplateLineValues[] {
  const latestVersion = template.versions[0];
  return template.lines
    .filter((line) => line.templateVersionId === latestVersion?.id)
    .map(
      ({
        id: _id,
        templateVersionId: _versionId,
        amount: _amount,
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        sortOrder: _sortOrder,
        ...line
      }) => line,
    );
}

export function ContractTemplateEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { userId } = useUser();
  const { tenantId } = useTenant();
  const isEditMode = Boolean(id);
  const form = useContractTemplateForm({
    defaultValues: contractTemplateDefaultValues,
  });
  const feeLinesEditorRef = useRef<ContractFeeLinesEditorRef>(null);
  const [feeLines, setFeeLines] = useState<ContractTemplateLineValues[]>([
    createDefaultContractFeeLine(todayIso()),
  ]);
  const mappedIdRef = useRef<string | null>(null);

  const detailQuery = useQuery({
    queryKey: ['project', 'contract-templates', 'detail', tenantId, id],
    queryFn: () => {
      if (!tenantId || !id)
        throw new Error('Thiếu mẫu hợp đồng cần chỉnh sửa.');
      return loadContractTemplateDetail(tenantId, id);
    },
    enabled: Boolean(tenantId && id),
  });

  useEffect(() => {
    if (!isEditMode) {
      mappedIdRef.current = null;
      form.reset(contractTemplateDefaultValues);
      setFeeLines([createDefaultContractFeeLine(todayIso())]);
      return;
    }
    const detail = detailQuery.data;
    if (!detail || mappedIdRef.current === id) return;
    form.reset(mapContractTemplateToFormValues(detail));
    const lines = toEditableLines(detail);
    setFeeLines(
      lines.length > 0 ? lines : [createDefaultContractFeeLine(todayIso())],
    );
    mappedIdRef.current = id ?? null;
  }, [detailQuery.data, form, id, isEditMode]);

  const saveMutation = useMutation({
    mutationFn: async ({
      values,
      lines,
    }: {
      values: Parameters<typeof createContractTemplate>[2];
      lines: ContractTemplateLineValues[];
    }) => {
      if (!userId || !tenantId)
        throw new Error('Chưa xác định tài khoản hoặc tenant.');
      if (isEditMode && id) {
        return updateContractTemplate(id, userId, values, lines);
      }
      return createContractTemplate(tenantId, userId, values, lines);
    },
    onSuccess: (template) => {
      toast.success(
        isEditMode ? 'Đã cập nhật mẫu hợp đồng.' : 'Đã tạo mẫu hợp đồng.',
      );
      navigate(
        buildPath(ROUTES.PROJECT.CONTRACT_TEMPLATE_DETAIL, {
          id: template.id,
        }),
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (isEditMode && detailQuery.isPending) return <PageLoading />;
  if (isEditMode && detailQuery.isError) {
    return (
      <div className="p-6 text-sm text-destructive">
        {getApiErrorMessage(detailQuery.error)}
      </div>
    );
  }

  async function handleSave() {
    const valid = await form.trigger();
    const linesValid = await feeLinesEditorRef.current?.validate();
    if (!valid || !linesValid) {
      toast.error('Vui lòng kiểm tra lại thông tin mẫu và các khoản phí.');
      return;
    }
    saveMutation.mutate({ values: form.getValues(), lines: feeLines });
  }

  return (
    <div className="flex min-h-full flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            mode="icon"
            aria-label="Quay lại danh sách mẫu hợp đồng"
            onClick={() => navigate(ROUTES.PROJECT.CONTRACT_TEMPLATES)}
          >
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {isEditMode ? 'Chỉnh sửa mẫu hợp đồng' : 'Thêm mẫu hợp đồng'}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.PROJECT.CONTRACT_TEMPLATES)}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            loading={saveMutation.isPending}
            onClick={() => void handleSave()}
          >
            <Save />
            Lưu mẫu
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardHeading>
            <CardTitle>Thông tin mẫu</CardTitle>
          </CardHeading>
        </CardHeader>
        <CardContent className="pt-0">
          <ContractTemplateForm
            form={form}
            onSubmit={() => void handleSave()}
          />
        </CardContent>
      </Card>

      <Card className="min-h-[32rem] overflow-hidden">
        <CardHeader className="pb-3">
          <CardHeading>
            <CardTitle>Các khoản phí mặc định</CardTitle>
          </CardHeading>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 pt-0">
          <ContractFeeLinesEditor
            ref={feeLinesEditorRef}
            lines={feeLines}
            onChange={setFeeLines}
          />
        </CardContent>
      </Card>
    </div>
  );
}
