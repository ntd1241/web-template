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
import { loadActiveCurrencies } from '../../api/currencies.api';
import { EmployeeIdentity } from '../../employees/components/employee-identity';
import { toCurrencyOptions } from '../../model/currency';
import { loadContractTemplateDetail } from '../api/contract-templates.api';
import {
  createContract,
  loadContractCreationWorkspace,
  loadContractDetail,
  updateContract,
  type ContractVersionLineValuesForApi,
} from '../api/contracts.api';
import type { ContractDetail } from '../api/contracts.api';
import { ContractAttachmentsField } from '../components/contract-attachments-field';
import { ContractConfirmationProcessing } from '../components/contract-confirmation-processing';
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
import {
  getContractVersionChangeCheck,
  getContractVersionTermDifferences,
  type ContractChargeChanges,
  type ContractVersionChangeCheck,
} from '../model/contract-version-change';

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
      sourceLineId: line.id,
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
  const { currencyCode: defaultCurrencyCode } = useNumberFormat();
  const editingContractId = searchParams.get('edit');
  const templateId = searchParams.get('templateId');
  const isEditMode = Boolean(editingContractId);
  const isTemplateMode = Boolean(templateId) && !isEditMode;
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
  const [processingState, setProcessingState] = useState<
    'idle' | 'checking-charges' | 'checking-version' | 'complete'
  >('idle');
  const [chargeChanges, setChargeChanges] =
    useState<ContractChargeChanges | null>(null);
  const [versionCheck, setVersionCheck] =
    useState<ContractVersionChangeCheck | null>(null);
  const mappedEditIdRef = useRef<string | null>(null);
  const mappedTemplateIdRef = useRef<string | null>(null);
  const initializedCreateResponsibleRef = useRef(false);
  const versionCheckRunRef = useRef(0);

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
  const currenciesQuery = useQuery({
    queryKey: ['project', 'currencies', 'active'],
    queryFn: loadActiveCurrencies,
  });
  const currencyCodeOptions = toCurrencyOptions(currenciesQuery.data ?? []);

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

  const templateQuery = useQuery({
    queryKey: ['project', 'contract-templates', 'detail', tenantId, templateId],
    queryFn: () => {
      if (!tenantId || !templateId) throw new Error('Thiếu mẫu hợp đồng.');
      return loadContractTemplateDetail(tenantId, templateId);
    },
    enabled: Boolean(tenantId && templateId && isTemplateMode),
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
    if (editingContractId || templateId) return;

    mappedEditIdRef.current = null;
    form.reset({
      ...contractDefaultValues,
      currencyCode: defaultCurrencyCode,
    });
    setSelectedCustomer(undefined);
    setFeeLines([
      createDefaultContractFeeLine(contractDefaultValues.startDate),
    ]);
    setFeeEditorKey('create');
    setAttachmentFiles([]);
    setRemovedAttachmentIds([]);
    setStep(1);
    setMaxStep(1);
  }, [defaultCurrencyCode, editingContractId, form, templateId]);

  useEffect(() => {
    const template = templateQuery.data;
    if (
      !isTemplateMode ||
      !templateId ||
      !template ||
      mappedTemplateIdRef.current === templateId
    ) {
      return;
    }

    const startDate = contractDefaultValues.startDate;
    const endDate = contractDefaultValues.endDate;
    const latestVersion = template.versions[0];
    const templateLines = template.lines
      .filter((line) => line.templateVersionId === latestVersion?.id)
      .map((line) => ({
        direction: line.direction,
        name: line.name,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        billingType: line.billingType,
        billingUnit: line.billingType === 'recurring' ? line.billingUnit : null,
        billingInterval:
          line.billingType === 'recurring' ? line.billingInterval : null,
        chargeDate: line.billingType === 'one_time' ? startDate : null,
        dueRule: line.dueRule,
        dueDays: line.dueDays,
        startDate,
        endDate,
      }));

    form.reset({
      ...contractDefaultValues,
      contractCode: `${template.code}-${startDate.replaceAll('-', '')}`,
      name: template.name,
      currencyCode: template.currencyCode,
      autoRenew: template.autoRenewDefault,
      note: template.note,
      responsibleEmployeeIds: workspaceQuery.data?.defaultResponsibleEmployeeId
        ? [workspaceQuery.data.defaultResponsibleEmployeeId]
        : [],
    });
    setSelectedCustomer(undefined);
    setFeeLines(
      templateLines.length > 0
        ? templateLines
        : [createDefaultContractFeeLine(startDate)],
    );
    setFeeEditorKey(`template:${templateId}:${latestVersion?.id ?? 'empty'}`);
    setAttachmentFiles([]);
    setRemovedAttachmentIds([]);
    setStep(1);
    setMaxStep(1);
    mappedTemplateIdRef.current = templateId;
  }, [
    form,
    isTemplateMode,
    templateId,
    templateQuery.data,
    workspaceQuery.data?.defaultResponsibleEmployeeId,
  ]);

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
      source,
    }: {
      values: Parameters<typeof createContract>[2];
      lines: ContractVersionLineValuesForApi[];
      metadata: Parameters<typeof createContract>[4];
      source?: Parameters<typeof createContract>[5];
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
        source,
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

  function handleCancel() {
    if (isEditMode && editingContractId) {
      navigate(
        buildPath(ROUTES.PROJECT.CONTRACT_DETAIL, {
          id: editingContractId,
        }),
      );
      return;
    }
    if (isTemplateMode) {
      navigate(ROUTES.PROJECT.CONTRACT_TEMPLATES);
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
        beginVersionCheck();
      } else {
        toast.error('Vui lòng kiểm tra lại các khoản phí.');
      }
    }
  }

  function beginVersionCheck() {
    const runId = ++versionCheckRunRef.current;
    setVersionCheck(null);
    setChargeChanges(null);
    setProcessingState('checking-charges');
    setStep(3);
    setMaxStep((current) => Math.max(current, 3));

    window.setTimeout(() => {
      if (runId !== versionCheckRunRef.current) return;

      const latestVersion = editDetailQuery.data?.versions[0];
      const result = getContractVersionChangeCheck({
        latestVersion: latestVersion
          ? {
              ...latestVersion,
              // Compare against the contract's persisted start date. A
              // version's effective date may be normalized to today while
              // the contract start date itself remains unchanged.
              termsSnapshot: {
                ...latestVersion.termsSnapshot,
                startDate: editDetailQuery.data?.startDate,
              },
            }
          : undefined,
        latestLines: (editDetailQuery.data?.lines ?? []).filter(
          (line) => line.contractVersionId === latestVersion?.id,
        ),
        values: form.getValues(),
        lines: feeLines.map(({ sourceLineId, ...line }, sortOrder) => ({
          ...line,
          id: sourceLineId,
          sortOrder,
        })),
      });
      const termDifferences = latestVersion
        ? getContractVersionTermDifferences({
            termsSnapshot: {
              ...latestVersion.termsSnapshot,
              startDate: editDetailQuery.data?.startDate,
            },
            values: form.getValues(),
          })
        : [];
      console.groupCollapsed(`[ContractVersionCheck][UI] run ${runId}`);
      console.log('latest version', JSON.stringify(latestVersion ?? null));
      console.log('term differences', JSON.stringify(termDifferences));
      console.log(
        'latest lines',
        JSON.stringify(
          (editDetailQuery.data?.lines ?? []).filter(
            (line) => line.contractVersionId === latestVersion?.id,
          ),
        ),
      );
      console.log('submitted lines', JSON.stringify(feeLines));
      console.log('result', JSON.stringify(result));
      console.groupEnd();
      setChargeChanges(result.chargeChanges);
      setProcessingState('checking-version');

      window.setTimeout(() => {
        if (runId !== versionCheckRunRef.current) return;
        setVersionCheck(result);
        setProcessingState('complete');
      }, 300);
    }, 450);
  }

  async function handleSave() {
    if (!(await form.trigger())) {
      setStep(1);
      return;
    }

    const areFeeLinesValid = feeLinesEditorRef.current
      ? await feeLinesEditorRef.current.validate()
      : true;
    if (!areFeeLinesValid) {
      toast.error('Vui lòng kiểm tra lại các khoản phí.');
      setStep(2);
      return;
    }

    if (step < 3) {
      beginVersionCheck();
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
      source:
        isTemplateMode && templateQuery.data && templateId
          ? {
              templateId,
              templateVersionId: templateQuery.data.versions[0]?.id ?? '',
            }
          : undefined,
    });
  }

  const isLoadingEditData = isEditMode && editDetailQuery.isPending;
  const isLoadingTemplateData = isTemplateMode && templateQuery.isPending;
  if (
    isTenantPending ||
    workspaceQuery.isPending ||
    isLoadingEditData ||
    isLoadingTemplateData
  ) {
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

  const pageError =
    workspaceQuery.error ?? editDetailQuery.error ?? templateQuery.error;
  if (
    workspaceQuery.isError ||
    editDetailQuery.isError ||
    templateQuery.isError
  ) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card className="max-w-lg text-center">
          <CardHeader>
            <CardHeading>
              <CardTitle>
                Không tải được dữ liệu{' '}
                {isEditMode
                  ? 'hợp đồng'
                  : isTemplateMode
                    ? 'mẫu hợp đồng'
                    : 'tạo hợp đồng'}
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
                  : isTemplateMode
                    ? templateQuery.refetch()
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
            onValueChange={(nextStep) => {
              if (nextStep === 3 && step !== 3) {
                beginVersionCheck();
              } else {
                setStep(nextStep);
              }
            }}
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
                forceMount
                className="flex min-h-0 flex-1 flex-col px-6"
              >
                <div className="flex min-h-0 w-full flex-1 flex-col">
                  <ContractFeeLinesEditor
                    key={feeEditorKey}
                    ref={feeLinesEditorRef}
                    lines={feeLines}
                    onChange={setFeeLines}
                    currencyField={
                      <ContractCurrencyField
                        form={form}
                        options={currencyCodeOptions}
                      />
                    }
                  />
                </div>
              </StepperContent>

              <StepperContent value={3} className="min-h-0 flex-1 px-6">
                <ContractConfirmationProcessing
                  state={processingState}
                  chargeChanges={chargeChanges}
                  result={versionCheck}
                  currencyCode={form.getValues('currencyCode')}
                />
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
              <ShortcutTooltip
                label={step === 3 ? 'Lưu hợp đồng' : 'Xem xác nhận'}
                shortcut="Ctrl/Cmd + S"
              >
                <Button
                  type="button"
                  variant="primary"
                  disabled={
                    saveMutation.isPending ||
                    (step === 3 &&
                      (processingState !== 'complete' || !versionCheck))
                  }
                  loading={saveMutation.isPending}
                  loadingText="Đang lưu..."
                  onClick={() => void handleSave()}
                >
                  {step === 3 ? <Save /> : <ArrowRight />}
                  {step === 3 ? 'Xác nhận & lưu' : 'Xem xác nhận'}
                </Button>
              </ShortcutTooltip>
            </div>
          </div>
        </CardContent>
      </Card>
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
