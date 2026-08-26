import { ArrowRight, FileCheck2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNumberFormat } from '@/providers/number-format-provider';
import { DatePickerInput } from '@/components/ui/inputs/date-picker-input';
import {
  ProcessingStep,
  type ProcessingStepState,
} from '@/components/ui/processing-step';
import type {
  ContractChargeChangeItem,
  ContractChargeChanges,
  ContractVersionChangeCheck,
} from '../model/contract-version-change';
import { ContractVersionBadge } from './contract-version-badge';

type ProcessingState =
  'idle' | 'checking-charges' | 'checking-version' | 'complete';

interface ContractConfirmationProcessingProps {
  state: ProcessingState;
  chargeChanges: ContractChargeChanges | null;
  result: ContractVersionChangeCheck | null;
  currencyCode: string;
  plannedEffectiveFrom: string | null;
  onPlannedEffectiveFromChange: (value: string | null) => void;
}

const resultCopy = {
  create: {
    title: 'Sẵn sàng tạo phiên bản khởi tạo',
    description: 'Hợp đồng mới sẽ được tạo cùng phiên bản đầu tiên.',
  },
  'keep-current': {
    title: 'Giữ nguyên phiên bản hiện tại',
    description:
      'Các thay đổi chỉ thuộc thông tin ngoài version, hệ thống không tạo version mới.',
  },
  'update-draft': {
    title: 'Cập nhật phiên bản nháp hiện tại',
    description:
      'Hợp đồng đang có version nháp nên hệ thống sẽ cập nhật trên version này.',
  },
  'create-new': {
    title: 'Sẽ tạo phiên bản mới',
    description:
      'Các thay đổi điều khoản sẽ được lưu thành version mới để bảo toàn lịch sử hợp đồng.',
  },
} as const;

export function ContractConfirmationProcessing({
  state,
  chargeChanges,
  result,
  currencyCode,
  plannedEffectiveFrom,
  onPlannedEffectiveFromChange,
}: ContractConfirmationProcessingProps) {
  const { formatCurrency } = useNumberFormat();
  const resultText = result ? resultCopy[result.action] : null;
  const chargeStepState: ProcessingStepState =
    state === 'checking-charges'
      ? 'processing'
      : state === 'checking-version' || state === 'complete'
        ? 'success'
        : 'idle';
  const versionStepState: ProcessingStepState =
    state === 'checking-version'
      ? 'processing'
      : state === 'complete'
        ? 'success'
        : 'idle';

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-8 overflow-hidden lg:grid-cols-[minmax(260px,0.82fr)_minmax(0,1.18fr)] lg:grid-rows-1 lg:items-center lg:gap-16">
      <div className="flex items-center justify-center px-6 lg:px-10">
        <div className="relative flex size-44 items-center justify-center">
          <div className="absolute size-36 rotate-[-8deg] rounded-3xl border border-primary/10 bg-primary/10" />
          <div className="absolute size-36 translate-x-3 translate-y-2 rotate-[7deg] rounded-3xl border border-border bg-background/80 shadow-sm" />
          <div className="relative flex size-28 items-center justify-center rounded-3xl bg-background shadow-lg ring-1 ring-primary/10">
            <FileCheck2 className="size-12 text-primary" strokeWidth={1.6} />
          </div>
        </div>
      </div>

      <div className="h-full min-h-0 overflow-y-auto px-6 sm:px-10 lg:px-0 lg:pr-12">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Tiến trình xác nhận
        </p>
        <div className="mt-6 space-y-8">
          <ProcessingStep
            state={chargeStepState}
            title="Kiểm tra khoản thu"
            description="Đối chiếu các khoản thu giữa dữ liệu hiện tại và phiên bản đang áp dụng."
          >
            {chargeChanges ? (
              <div className="mt-5 space-y-4">
                <ChangeGroup
                  label="Thêm mới"
                  items={chargeChanges.added}
                  tone="success"
                  formatCurrency={formatCurrency}
                  currencyCode={currencyCode}
                />
                <ChangeGroup
                  label="Bị xóa"
                  items={chargeChanges.removed}
                  tone="destructive"
                  formatCurrency={formatCurrency}
                  currencyCode={currencyCode}
                />
                <ChangeGroup
                  label="Bị thay đổi"
                  items={chargeChanges.changed}
                  tone="warning"
                  formatCurrency={formatCurrency}
                  currencyCode={currencyCode}
                />
                <ChangeGroup
                  label="Giữ nguyên"
                  items={chargeChanges.unchanged}
                  tone="muted"
                  formatCurrency={formatCurrency}
                  currencyCode={currencyCode}
                />
                {Object.values(chargeChanges).every(
                  (items) => items.length === 0,
                ) ? (
                  <p className="text-sm text-muted-foreground">
                    Không có khoản thu để đối chiếu.
                  </p>
                ) : null}
              </div>
            ) : null}
          </ProcessingStep>

          <ProcessingStep
            state={versionStepState}
            title="Kiểm tra phiên bản hợp đồng"
            description="Xác định thay đổi có cần tạo version mới hay tiếp tục dùng version hiện tại."
          >
            {resultText && state === 'complete' ? (
              <div className="mt-5 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {resultText.title}
                  </p>
                  {result.previousVersionNo !== undefined &&
                  result.nextVersionNo !== undefined ? (
                    <VersionTransition
                      previousVersionNo={result.previousVersionNo}
                      nextVersionNo={result.nextVersionNo}
                      isNewVersion={result.action === 'create-new'}
                      isDraft={result.action === 'update-draft'}
                    />
                  ) : null}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {resultText.description}
                </p>
                {result.action === 'keep-current' ? (
                  <p className="mt-5 max-w-md rounded-lg border border-border/70 bg-muted/30 p-4 text-xs leading-5 text-muted-foreground">
                    Không có thay đổi điều khoản cần tạo phiên bản mới. Ngày áp
                    dụng chỉ dùng khi thao tác này tạo hoặc cập nhật bản nháp.
                  </p>
                ) : (
                  <div className="mt-5 max-w-md space-y-2 rounded-lg border border-border/70 bg-muted/30 p-4">
                    <p className="text-sm font-medium text-foreground">
                      Ngày dự kiến áp dụng
                    </p>
                    <DatePickerInput
                      value={plannedEffectiveFrom}
                      valueMode="iso-date"
                      onChange={(value) =>
                        onPlannedEffectiveFromChange(
                          typeof value === 'string' ? value : null,
                        )
                      }
                      calendarLabel="Chọn ngày dự kiến áp dụng"
                      variant="md"
                    />
                    <p className="text-xs leading-5 text-muted-foreground">
                      Để trống để lưu bản nháp. Nếu chọn hôm nay, hệ thống sẽ áp
                      dụng phiên bản mới ngay khi bạn xác nhận lưu.
                    </p>
                    {plannedEffectiveFrom ===
                    new Date().toISOString().slice(0, 10) ? (
                      <p className="text-xs font-medium text-primary">
                        Phiên bản sẽ được áp dụng ngay sau khi lưu.
                      </p>
                    ) : null}
                  </div>
                )}
                {result.changedAreas.length ? (
                  <div className="flex flex-wrap gap-2">
                    {result.changedAreas.map((area) => (
                      <span
                        key={area}
                        className="text-xs font-medium text-warning-foreground"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </ProcessingStep>
        </div>
      </div>
    </div>
  );
}

function VersionTransition({
  previousVersionNo,
  nextVersionNo,
  isNewVersion,
  isDraft,
}: {
  previousVersionNo: number;
  nextVersionNo: number;
  isNewVersion: boolean;
  isDraft: boolean;
}) {
  const previousStatus = isDraft ? 'draft' : 'effective';
  const nextStatus = isNewVersion ? 'draft' : previousStatus;

  return (
    <div className="flex items-center gap-2">
      <ContractVersionBadge
        size="xl"
        versionNo={previousVersionNo}
        status={previousStatus}
      />
      <ArrowRight className="size-4 text-muted-foreground" />
      <ContractVersionBadge
        size="xl"
        versionNo={nextVersionNo}
        status={nextStatus}
      />
    </div>
  );
}

function ChangeGroup({
  label,
  items,
  tone,
  formatCurrency,
  currencyCode,
}: {
  label: string;
  items: ContractChargeChangeItem[];
  tone: 'success' | 'destructive' | 'warning' | 'muted';
  formatCurrency: (amount: number, currencyCode?: string) => string;
  currencyCode: string;
}) {
  if (items.length === 0) return null;

  const toneClass = {
    success: 'bg-success-foreground',
    destructive: 'bg-destructive',
    warning: 'bg-warning',
    muted: 'bg-muted-foreground',
  }[tone];

  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className={cn('size-1.5 rounded-full', toneClass)} />
        {label} ({items.length})
      </div>
      <div className="mt-2 space-y-1.5">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex min-w-0 items-center justify-between gap-4 text-sm"
          >
            <span className="min-w-0 truncate text-foreground">
              {item.name}
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {item.previousAmount !== undefined &&
              item.currentAmount !== undefined &&
              item.previousAmount !== item.currentAmount
                ? `${formatCurrency(item.previousAmount, currencyCode)} → ${formatCurrency(item.currentAmount, currencyCode)}`
                : formatCurrency(
                    item.currentAmount ?? item.previousAmount ?? 0,
                    currencyCode,
                  )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
