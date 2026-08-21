import { Fragment, useEffect, useRef, useState } from 'react';
import { buildPath, ROUTES } from '@/constants/routes';
import type { CustomerSelectOption } from '@/project/customers/components/customer-select';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  ReceiptText,
  Save,
  type LucideIcon,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { useNumberFormat } from '@/providers/number-format-provider';
import { useTenant } from '@/providers/tenant-provider';
import { useUser } from '@/providers/user-provider';
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
import { ShortcutTooltip } from '@/components/ui/shortcut-tooltip';
import {
  Stepper,
  StepperConnector,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EmployeeIdentity } from '../../employees/components/employee-identity';
import {
  createContract,
  loadContractCreationWorkspace,
  loadContractDetail,
  updateContract,
  type ContractVersionLineValuesForApi,
} from '../api/contracts.api';
import type { ContractDetail } from '../api/contracts.api';
import { ContractAttachmentsField } from '../components/contract-attachments-field';
import { ContractCurrencyField } from '../components/contract-currency-field';
import {
  ContractFeeLinesEditor,
  createDefaultContractFeeLine,
  type ContractFeeLinesEditorRef,
} from '../components/contract-fee-lines-editor';
import {
  contractDefaultValues,
  ContractForm,
  mapContractToFormValues,
  useContractForm,
} from '../forms/contract-form.generated';

const STEPS = [
  {
    value: 1,
    label: 'Thông tin chung',
    icon: FileText,
  },
  {
    value: 2,
    label: 'Khoản phí',
    icon: ReceiptText,
  },
  {
    value: 3,
    label: 'Xác nhận',
    icon: Check,
  },
] as const;

function toEditableLines(
  contract: ContractDetail,
): ContractVersionLineValuesForApi[] {
  const latestVersion = contract.versions[0];
  return contract.lines
    .filter((line) => line.contractVersionId === latestVersion?.id)
    .map((line) => ({
      direction: line.direction,
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

export function ContractCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userId } = useUser();
  const { tenantId, isPending: isTenantPending } = useTenant();
  const { formatCurrency } = useNumberFormat();
  const editingContractId = searchParams.get('edit');
  const isEditMode = Boolean(editingContractId);
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerSelectOption>();
  const feeLinesEditorRef = useRef<ContractFeeLinesEditorRef>(null);
  const form = useContractForm();
  const [feeLines, setFeeLines] = useState<ContractVersionLineValuesForApi[]>([
    createDefaultContractFeeLine(contractDefaultValues.startDate),
  ]);
  const [feeEditorKey, setFeeEditorKey] = useState('create');
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>(
    [],
  );
  const mappedEditIdRef = useRef<string | null>(null);
  const initializedCreateResponsibleRef = useRef(false);

  const workspaceQuery = useQuery({
    queryKey: [
      'project',
      'contracts',
      'create-options',
      userId,
      tenantId,
      isEditMode,
    ],
    queryFn: () => {
      if (!userId || !tenantId) {
        throw new Error('Chưa xác định tổ chức hiện tại.');
      }
      return loadContractCreationWorkspace(userId, isEditMode, tenantId);
    },
    enabled: Boolean(userId && tenantId),
  });

  const editDetailQuery = useQuery({
    queryKey: [
      'project',
      'contracts',
      'detail',
      userId,
      tenantId,
      editingContractId,
    ],
    queryFn: () => {
      if (!userId || !tenantId || !editingContractId) {
        throw new Error('Thiếu thông tin hợp đồng cần chỉnh sửa.');
      }
      return loadContractDetail(userId, editingContractId, tenantId);
    },
    enabled: Boolean(userId && tenantId && editingContractId),
  });

  useEffect(() => {
    const detail = editDetailQuery.data;
    if (
      !detail ||
      !editingContractId ||
      mappedEditIdRef.current === editingContractId
    ) {
      return;
    }

    form.reset({
      ...mapContractToFormValues(detail),
      responsibleEmployeeIds: detail.responsibleEmployees.map(
        (employee) => employee.id,
      ),
      tagIds: detail.tags.map((tag) => tag.id),
    });
    setSelectedCustomer({
      id: detail.customer.id,
      customerCode: detail.customer.customerCode,
      name: detail.customer.name,
      imageUrl: detail.customer.imageUrl,
    });
    const nextLines = toEditableLines(detail);
    setFeeLines(
      nextLines.length > 0
        ? nextLines
        : [createDefaultContractFeeLine(detail.startDate)],
    );
    setFeeEditorKey(
      `${editingContractId}:${detail.versions[0]?.id ?? 'no-version'}`,
    );
    setAttachmentFiles([]);
    setRemovedAttachmentIds([]);
    initializedCreateResponsibleRef.current = false;
    setStep(1);
    setMaxStep(1);
    mappedEditIdRef.current = editingContractId;
  }, [editDetailQuery.data, editingContractId, form]);

  useEffect(() => {
    if (editingContractId) return;

    mappedEditIdRef.current = null;
    form.reset(contractDefaultValues);
    setSelectedCustomer(undefined);
    setFeeLines([
      createDefaultContractFeeLine(contractDefaultValues.startDate),
    ]);
    setFeeEditorKey('create');
    setAttachmentFiles([]);
    setRemovedAttachmentIds([]);
    setStep(1);
    setMaxStep(1);
  }, [editingContractId, form]);

  useEffect(() => {
    if (
      isEditMode ||
      initializedCreateResponsibleRef.current ||
      !workspaceQuery.data
    ) {
      return;
    }

    initializedCreateResponsibleRef.current = true;
    const employeeId = workspaceQuery.data.defaultResponsibleEmployeeId;
    if (employeeId) {
      form.setValue('responsibleEmployeeIds', [employeeId], {
        shouldDirty: false,
      });
    }
  }, [form, isEditMode, workspaceQuery.data]);

  const responsibleEmployeeIdsOptions =
    workspaceQuery.data?.employees.map((employee) => ({
      value: employee.id,
      label: <EmployeeIdentity employee={employee} />,
      searchableText: `${employee.displayName} ${employee.employeeCode}`,
      data: employee,
    })) ?? [];
  const saveMutation = useMutation({
    mutationFn: async ({
      values,
      lines,
      metadata,
    }: {
      values: Parameters<typeof createContract>[2];
      lines: ContractVersionLineValuesForApi[];
      metadata: Parameters<typeof createContract>[4];
    }) => {
      if (!userId || !workspaceQuery.data?.tenantId) {
        throw new Error('Chưa xác định tài khoản hoặc tenant.');
      }
      if (isEditMode && editingContractId) {
        return updateContract(
          editingContractId,
          userId,
          values,
          lines,
          metadata,
        );
      }
      return createContract(
        workspaceQuery.data.tenantId,
        userId,
        values,
        lines,
        metadata,
      );
    },
    onSuccess: (contract) => {
      toast.success(
        isEditMode ? 'Đã cập nhật hợp đồng.' : 'Đã tạo hợp đồng nháp.',
      );
      navigate(buildPath(ROUTES.PROJECT.CONTRACT_DETAIL, { id: contract.id }));
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const values = form.watch();
  const customerLabel = selectedCustomer
    ? `${selectedCustomer.name} · ${selectedCustomer.customerCode}`
    : values.customerId
      ? 'Đã chọn khách hàng'
      : 'Chưa chọn';
  const totalAmount = feeLines.reduce(
    (total, line) => total + line.quantity * line.unitPrice,
    0,
  );

  function handleCancel() {
    if (isEditMode && editingContractId) {
      navigate(
        buildPath(ROUTES.PROJECT.CONTRACT_DETAIL, {
          id: editingContractId,
        }),
      );
      return;
    }
    navigate(ROUTES.PROJECT.CONTRACTS);
  }

  async function handleNext() {
    if (step === 1) {
      if (await form.trigger()) {
        setStep(2);
        setMaxStep((current) => Math.max(current, 2));
      }
      return;
    }
    if (step === 2) {
      const isValid = await feeLinesEditorRef.current?.validate();
      if (isValid) {
        setStep(3);
        setMaxStep((current) => Math.max(current, 3));
      } else {
        toast.error('Vui lòng kiểm tra lại các khoản phí.');
      }
    }
  }

  async function handleSave() {
    if (!(await form.trigger())) {
      setStep(1);
      return;
    }
    const areFeeLinesValid = await feeLinesEditorRef.current?.validate();
    if (!areFeeLinesValid) {
      toast.error('Vui lòng kiểm tra lại các khoản phí.');
      setStep(2);
      return;
    }
    const values = form.getValues();
    saveMutation.mutate({
      values,
      lines: feeLines,
      metadata: {
        responsibleEmployeeIds: values.responsibleEmployeeIds,
        tagIds: values.tagIds,
        attachmentIdsToKeep: (editDetailQuery.data?.attachments ?? [])
          .filter((attachment) => !removedAttachmentIds.includes(attachment.id))
          .map((attachment) => attachment.id),
        attachments: attachmentFiles,
      },
    });
  }

  const isLoadingEditData = isEditMode && editDetailQuery.isPending;
  if (isTenantPending || workspaceQuery.isPending || isLoadingEditData) {
    return (
      <PageLoading
        label={
          isEditMode
            ? 'Đang tải dữ liệu hợp đồng...'
            : 'Đang tải dữ liệu tạo hợp đồng...'
        }
        className="h-full"
      />
    );
  }

  const pageError = workspaceQuery.error ?? editDetailQuery.error;
  if (workspaceQuery.isError || editDetailQuery.isError) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card className="max-w-lg text-center">
          <CardHeader>
            <CardHeading>
              <CardTitle>
                Không tải được dữ liệu{' '}
                {isEditMode ? 'hợp đồng' : 'tạo hợp đồng'}
              </CardTitle>
              <CardDescription className="mt-2">
                {getApiErrorMessage(pageError)}
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
                void (isEditMode
                  ? editDetailQuery.refetch()
                  : workspaceQuery.refetch());
              }}
            >
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col p-6">
      <Card className="min-h-0 flex-1 overflow-hidden">
        <CardContent className="flex min-h-0 flex-1 flex-col gap-0 p-0">
          <Stepper
            value={step}
            onValueChange={(nextStep) => setStep(nextStep)}
            variant="success"
            className="flex min-h-0 flex-1 flex-col"
          >
            <StepperNav className="shrink-0 px-8 pb-6 pt-6 sm:px-10">
              {STEPS.map((item, index) => {
                const Icon = item.icon;
                const isLocked = item.value > maxStep;
                return (
                  <Fragment key={item.value}>
                    <div
                      className={cn(
                        'flex min-w-0 items-center',
                        index < STEPS.length - 1 ? 'flex-1' : 'shrink-0',
                      )}
                    >
                      <StepperItem
                        step={item.value}
                        completed={item.value < step}
                        disabled={isLocked}
                        fill={false}
                        className="min-w-0 justify-start"
                      >
                        {isLocked ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="min-w-0">
                                <StepTriggerContent
                                  icon={Icon}
                                  label={item.label}
                                />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Hoàn thành bước trước để mở bước này
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <StepTriggerContent icon={Icon} label={item.label} />
                        )}
                      </StepperItem>
                      {index < STEPS.length - 1 ? (
                        <StepperConnector
                          aria-hidden="true"
                          completed={item.value < step}
                        />
                      ) : null}
                    </div>
                  </Fragment>
                );
              })}
            </StepperNav>

            <StepperPanel className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <StepperContent value={1} className="px-6 pb-6">
                <div className="mx-auto max-w-5xl">
                  <ContractForm
                    form={form}
                    onSubmit={() => undefined}
                    selectedCustomer={selectedCustomer}
                    onCustomerSelect={setSelectedCustomer}
                    responsibleEmployeeIdsOptions={
                      responsibleEmployeeIdsOptions
                    }
                  />
                  <div className="mt-6 space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Người tạo hợp đồng
                    </p>
                    {(
                      isEditMode
                        ? editDetailQuery.data?.createdByEmployee
                        : workspaceQuery.data?.employees.find(
                            (employee) => employee.userId === userId,
                          )
                    ) ? (
                      <EmployeeIdentity
                        employee={
                          (isEditMode
                            ? editDetailQuery.data?.createdByEmployee
                            : workspaceQuery.data?.employees.find(
                                (employee) => employee.userId === userId,
                              ))!
                        }
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Chưa xác định
                      </p>
                    )}
                  </div>
                  <ContractAttachmentsField
                    className="mt-6"
                    files={attachmentFiles}
                    onChange={setAttachmentFiles}
                    existingAttachments={
                      isEditMode
                        ? (editDetailQuery.data?.attachments ?? []).filter(
                            (attachment) =>
                              !removedAttachmentIds.includes(attachment.id),
                          )
                        : []
                    }
                    onRemoveExisting={(attachmentId) =>
                      setRemovedAttachmentIds((current) =>
                        current.includes(attachmentId)
                          ? current
                          : [...current, attachmentId],
                      )
                    }
                    disabled={saveMutation.isPending}
                  />
                </div>
              </StepperContent>

              <StepperContent
                value={2}
                className="flex min-h-0 flex-1 flex-col px-6 pb-6"
              >
                <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
                  <ContractFeeLinesEditor
                    key={feeEditorKey}
                    ref={feeLinesEditorRef}
                    lines={feeLines}
                    onChange={setFeeLines}
                    currencyField={<ContractCurrencyField form={form} />}
                  />
                </div>
              </StepperContent>

              <StepperContent value={3} className="px-6 pb-6">
                <div className="mx-auto max-w-5xl space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ReviewValue label="Khách hàng" value={customerLabel} />
                    <ReviewValue
                      label="Mã hợp đồng"
                      value={values.contractCode}
                    />
                    <ReviewValue label="Tên hợp đồng" value={values.name} />
                    <ReviewValue
                      label="Thời hạn"
                      value={`${values.startDate || '—'} → ${values.endDate || 'Không giới hạn'}`}
                    />
                    <ReviewValue
                      label="Tự động gia hạn"
                      value={values.autoRenew ? 'Có' : 'Không'}
                    />
                    <ReviewValue
                      label="Tổng khoản phí"
                      value={formatCurrency(totalAmount, values.currencyCode)}
                    />
                  </div>
                  <Card className="bg-muted/30 shadow-none">
                    <CardHeader className="border-0 pb-3">
                      <CardHeading>
                        <CardTitle className="text-sm">
                          Danh sách khoản phí
                        </CardTitle>
                      </CardHeading>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      {feeLines.map((line, index) => (
                        <div
                          key={`${index}-${line.name}`}
                          className="flex items-center justify-between gap-3 rounded-lg bg-background px-4 py-3 text-sm"
                        >
                          <span className="truncate">
                            {line.name || `Khoản phí ${index + 1}`}
                          </span>
                          <span className="shrink-0 font-semibold tabular-nums">
                            {formatCurrency(
                              line.quantity * line.unitPrice,
                              values.currencyCode,
                            )}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </StepperContent>
            </StepperPanel>
          </Stepper>

          <div className="flex shrink-0 items-center justify-between px-6 pb-6 pt-5">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Hủy
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={step === 1}
                onClick={() => setStep((current) => Math.max(1, current - 1))}
              >
                <ArrowLeft />
                Bước trước
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={step === STEPS.length}
                onClick={() => void handleNext()}
              >
                Bước tiếp theo
                <ArrowRight />
              </Button>
              <div aria-hidden="true" className="mx-1 h-6 w-px bg-border" />
              <ShortcutTooltip label="Lưu hợp đồng" shortcut="Ctrl/Cmd + S">
                <Button
                  type="button"
                  variant="primary"
                  loading={saveMutation.isPending}
                  loadingText="Đang lưu..."
                  onClick={() => void handleSave()}
                >
                  <Save />
                  Lưu
                </Button>
              </ShortcutTooltip>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">
        {value || 'Chưa cập nhật'}
      </p>
    </div>
  );
}

function StepTriggerContent({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <StepperTrigger className="min-w-0 px-1 text-left">
      <StepperIndicator className="data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground">
        <Icon className="size-3.5" />
      </StepperIndicator>
      <span className="hidden min-w-0 sm:flex">
        <StepperTitle className="truncate data-[state=inactive]:text-muted-foreground">
          {label}
        </StepperTitle>
      </span>
    </StepperTrigger>
  );
}
