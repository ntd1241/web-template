import { Fragment, useRef, useState } from 'react';
import { buildPath, ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/auth.store';
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
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
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
import {
  createContract,
  loadContractWorkspace,
  type ContractVersionLineValuesForApi,
} from '../api/contracts.api';
import {
  ContractFeeLinesEditor,
  createDefaultContractFeeLine,
  type ContractFeeLinesEditorRef,
} from '../components/contract-fee-lines-editor';
import {
  contractDefaultValues,
  ContractForm,
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

function formatAmount(amount: number) {
  return `${new Intl.NumberFormat('vi-VN').format(amount)} VND`;
}

export function ContractCreatePage() {
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.user?.id);
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const feeLinesEditorRef = useRef<ContractFeeLinesEditorRef>(null);
  const form = useContractForm();
  const [feeLines, setFeeLines] = useState<ContractVersionLineValuesForApi[]>([
    createDefaultContractFeeLine(contractDefaultValues.startDate),
  ]);

  const workspaceQuery = useQuery({
    queryKey: ['project', 'contracts', 'create-options', userId],
    queryFn: () => {
      if (!userId) throw new Error('Chưa xác định tài khoản đăng nhập.');
      return loadContractWorkspace(userId);
    },
    enabled: Boolean(userId),
  });

  const saveMutation = useMutation({
    mutationFn: async ({
      values,
      lines,
    }: {
      values: Parameters<typeof createContract>[2];
      lines: ContractVersionLineValuesForApi[];
    }) => {
      if (!userId || !workspaceQuery.data?.tenantId) {
        throw new Error('Chưa xác định tài khoản hoặc tenant.');
      }
      return createContract(
        workspaceQuery.data.tenantId,
        userId,
        values,
        lines,
      );
    },
    onSuccess: (contract) => {
      toast.success('Đã tạo hợp đồng nháp.');
      navigate(buildPath(ROUTES.PROJECT.CONTRACT_DETAIL, { id: contract.id }));
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const values = form.watch();
  const customerLabel = workspaceQuery.data?.customerOptions.find(
    (option) => option.value === values.customerId,
  )?.label;
  const totalAmount = feeLines.reduce(
    (total, line) => total + line.quantity * line.unitPrice,
    0,
  );

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
    saveMutation.mutate({ values: form.getValues(), lines: feeLines });
  }

  if (workspaceQuery.isPending) {
    return (
      <PageLoading
        label="Đang tải dữ liệu tạo hợp đồng..."
        className="h-full"
      />
    );
  }

  if (workspaceQuery.isError) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card className="max-w-lg text-center">
          <CardHeader>
            <CardHeading>
              <CardTitle>Không tải được dữ liệu tạo hợp đồng</CardTitle>
              <CardDescription className="mt-2">
                {getApiErrorMessage(workspaceQuery.error)}
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
            <Button variant="primary" onClick={() => workspaceQuery.refetch()}>
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

            <StepperPanel className="min-h-0 flex-1 overflow-y-auto">
              <StepperContent value={1} className="px-6 pb-6">
                <div className="mx-auto max-w-5xl">
                  <ContractForm
                    form={form}
                    onSubmit={() => undefined}
                    customerIdOptions={workspaceQuery.data.customerOptions}
                  />
                </div>
              </StepperContent>

              <StepperContent value={2} className="px-6 pb-6">
                <div className="mx-auto max-w-6xl">
                  <ContractFeeLinesEditor
                    ref={feeLinesEditorRef}
                    lines={feeLines}
                    onChange={setFeeLines}
                  />
                </div>
              </StepperContent>

              <StepperContent value={3} className="px-6 pb-6">
                <div className="mx-auto max-w-5xl space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ReviewValue
                      label="Khách hàng"
                      value={customerLabel ?? 'Chưa chọn'}
                    />
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
                      value={formatAmount(totalAmount)}
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
                            {formatAmount(line.quantity * line.unitPrice)}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.PROJECT.CONTRACTS)}
            >
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
