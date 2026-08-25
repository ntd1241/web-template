import { useEffect, useMemo, useState } from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CircleDollarSign, GripVertical } from 'lucide-react';
import { useNumberFormat } from '@/providers/number-format-provider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { NumericInput } from '@/components/ui/inputs/numeric-input';
import { Label } from '@/components/ui/label';
import {
  calculateContractPaymentAllocations,
  roundCurrencyAmount,
  type ContractPaymentSubmission,
} from '../model/receivable';

export interface ContractPaymentAllocationItem {
  chargeId: string;
  name: string;
  amount: number;
  paidAmount?: number;
  outstandingAmount: number;
  currencyCode: string;
  periodStart?: string;
  periodEnd?: string;
  dueDate?: string;
  monthStart?: string;
  section?: 'due' | 'future';
}

export interface ContractPaymentAllocationDialogProps {
  open: boolean;
  title: string;
  currencyCode: string;
  totalAmount: number;
  paidAmount: number;
  maxAmount: number;
  totalLabel?: string;
  dueAmount?: number;
  defaultAmount?: number;
  allowOverpayment?: boolean;
  allocationMode?: 'charge' | 'month';
  showFutureOption?: boolean;
  emptyMessage?: string;
  items: ContractPaymentAllocationItem[];
  isLoading?: boolean;
  errorMessage?: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (submission: ContractPaymentSubmission) => void;
}

const allocationProgressToneClasses = {
  destructive: {
    container:
      'border-[var(--color-destructive-alpha,var(--color-red-200))] bg-[var(--color-destructive-soft,var(--color-red-50))] text-[var(--color-destructive-accent,var(--color-red-700))]',
    indicator: 'bg-[var(--color-destructive-accent,var(--color-red-500))]',
  },
  warning: {
    container:
      'border-[var(--color-warning-soft,var(--color-yellow-200))] bg-[var(--color-warning-soft,var(--color-yellow-50))] text-[var(--color-warning-accent,var(--color-yellow-700))]',
    indicator: 'bg-[var(--color-warning-accent,var(--color-yellow-500))]',
  },
  success: {
    container:
      'border-[var(--color-success-accent,var(--color-green-500))] bg-[var(--color-success-soft,var(--color-green-50))] text-[var(--color-success-foreground,var(--color-white))]',
    indicator: 'bg-[var(--color-success-accent,var(--color-green-500))]',
  },
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN').format(new Date(`${value}T00:00:00`));
}

function formatItemPeriod(item: ContractPaymentAllocationItem) {
  if (!item.periodStart || !item.periodEnd) return null;
  return `${formatDate(item.periodStart)} – ${formatDate(item.periodEnd)}`;
}

function PaymentAllocationProgress({
  allocatedAmount,
  outstandingAmount,
  currencyCode,
  formatAmount,
}: {
  allocatedAmount: number;
  outstandingAmount: number;
  currencyCode: string;
  formatAmount: (value: number, currencyCode?: string) => string;
}) {
  const progress =
    outstandingAmount > 0
      ? Math.min(100, Math.max(0, (allocatedAmount / outstandingAmount) * 100))
      : 0;
  const tone =
    allocatedAmount <= 0
      ? 'destructive'
      : progress >= 100
        ? 'success'
        : 'warning';
  const toneClasses = allocationProgressToneClasses[tone];

  return (
    <div
      data-testid="payment-allocation-progress"
      data-payment-tone={tone}
      className={`relative h-8 w-36 overflow-hidden rounded-md border ${toneClasses.container}`}
      aria-label={`Đã phân bổ ${formatAmount(allocatedAmount, currencyCode)} trên ${formatAmount(outstandingAmount, currencyCode)}`}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-y-0 start-0 transition-[width] duration-200 ${toneClasses.indicator}`}
        style={{ width: `${progress}%` }}
      />
      <span className="relative flex h-full items-center justify-center px-2 text-xs font-semibold tabular-nums">
        {formatAmount(allocatedAmount, currencyCode)}
      </span>
    </div>
  );
}

function SortableAllocationRow({
  item,
  allocatedAmount,
  currencyCode,
  formatAmount,
  isDraggable = true,
}: {
  item: ContractPaymentAllocationItem;
  allocatedAmount: number;
  currencyCode: string;
  formatAmount: (value: number, currencyCode?: string) => string;
  isDraggable?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.chargeId, disabled: !isDraggable });
  const period = formatItemPeriod(item);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-md border border-border bg-background px-3 py-2.5 ${isDragging ? 'relative z-10 shadow-lg' : ''}`}
    >
      {isDraggable ? (
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
          aria-label={`Đổi ưu tiên khoản phí ${item.name}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      ) : (
        <CircleDollarSign aria-hidden="true" className="size-5 text-primary" />
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {item.name}
        </p>
        {period ? (
          <p className="truncate text-xs text-muted-foreground">{period}</p>
        ) : null}
      </div>
      <span className="text-right text-sm tabular-nums text-muted-foreground">
        {formatAmount(item.outstandingAmount, currencyCode)}
      </span>
      <PaymentAllocationProgress
        allocatedAmount={allocatedAmount}
        outstandingAmount={item.outstandingAmount}
        currencyCode={currencyCode}
        formatAmount={formatAmount}
      />
    </div>
  );
}

export function ContractPaymentAllocationDialog({
  open,
  title,
  currencyCode,
  totalAmount,
  paidAmount,
  maxAmount,
  totalLabel = 'Tổng tiền kỳ:',
  dueAmount,
  defaultAmount,
  allowOverpayment = false,
  allocationMode = 'charge',
  showFutureOption = false,
  emptyMessage = 'Không có khoản phí cần thu',
  items,
  isLoading = false,
  errorMessage,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: ContractPaymentAllocationDialogProps) {
  const { formatCurrency } = useNumberFormat();
  const [amountValue, setAmountValue] = useState('');
  const [orderedItems, setOrderedItems] = useState<
    ContractPaymentAllocationItem[]
  >([]);
  const [includeFuture, setIncludeFuture] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (!open) return;
    setAmountValue(String(defaultAmount ?? maxAmount));
    setIncludeFuture(false);
    setOrderedItems(
      items.filter(
        (item) => item.outstandingAmount > 0 && item.section !== 'future',
      ),
    );
  }, [items, maxAmount, open]);

  const amount = Number(amountValue);
  const normalizedAmount = Number.isFinite(amount)
    ? roundCurrencyAmount(amount)
    : 0;
  const allocations = useMemo(
    () => calculateContractPaymentAllocations(orderedItems, normalizedAmount),
    [normalizedAmount, orderedItems],
  );
  const allocatedTotal = roundCurrencyAmount(
    allocations.reduce(
      (sum, allocation) => sum + allocation.allocatedAmount,
      0,
    ),
  );
  const isAmountValid =
    normalizedAmount > 0 && (allowOverpayment || normalizedAmount <= maxAmount);
  const isAllocationValid =
    isAmountValid &&
    (allowOverpayment
      ? allocatedTotal <= normalizedAmount
      : allocatedTotal === normalizedAmount);
  const currencySuffix = currencyCode === 'VND' ? ' ₫' : ` ${currencyCode}`;
  const futureItems = items.filter(
    (item) => item.outstandingAmount > 0 && item.section === 'future',
  );
  const visibleItems = orderedItems.filter((item) => {
    if (item.section !== 'future') return true;
    return (
      includeFuture &&
      (allocations.find((allocation) => allocation.chargeId === item.chargeId)
        ?.allocatedAmount ?? 0) > 0
    );
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (
      !over ||
      active.id === over.id ||
      futureItems.some((item) => item.chargeId === active.id) ||
      futureItems.some((item) => item.chargeId === over.id)
    )
      return;
    setOrderedItems((current) => {
      const oldIndex = current.findIndex((item) => item.chargeId === active.id);
      const newIndex = current.findIndex((item) => item.chargeId === over.id);
      return oldIndex < 0 || newIndex < 0
        ? current
        : arrayMove(current, oldIndex, newIndex);
    });
  }

  function handleSubmit() {
    if (!isAllocationValid) return;
    onSubmit({
      amount: normalizedAmount,
      allocations: allocations.filter(
        (allocation) => allocation.allocatedAmount > 0,
      ),
      monthAllocations:
        allocationMode === 'month'
          ? allocations
              .filter((allocation) => allocation.allocatedAmount > 0)
              .map((allocation) => ({
                monthStart:
                  orderedItems.find(
                    (item) => item.chargeId === allocation.chargeId,
                  )?.monthStart ?? allocation.chargeId,
                allocatedAmount: allocation.allocatedAmount,
              }))
          : undefined,
      unappliedAmount: allowOverpayment
        ? roundCurrencyAmount(normalizedAmount - allocatedTotal)
        : 0,
    });
  }

  function handleFutureToggle(checked: boolean) {
    setIncludeFuture(checked);
    setOrderedItems((current) => {
      if (checked) {
        const currentIds = new Set(current.map((item) => item.chargeId));
        return [
          ...current,
          ...futureItems.filter((item) => !currentIds.has(item.chargeId)),
        ];
      }
      return current.filter((item) => item.section !== 'future');
    });
  }

  const dueItems = visibleItems.filter((item) => item.section !== 'future');
  const visibleFutureItems = visibleItems.filter(
    (item) => item.section === 'future',
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <DialogBody className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {dueAmount !== undefined ? (
              <div className="rounded-md border border-primary/25 bg-primary/5 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  Tổng tiền cần thu
                </p>
                <p className="mt-1 font-semibold tabular-nums text-primary">
                  {formatCurrency(dueAmount, currencyCode)}
                </p>
              </div>
            ) : null}
            <div className="rounded-md border border-border px-3 py-2">
              <p className="text-xs text-muted-foreground">{totalLabel}</p>
              <p className="mt-1 font-medium tabular-nums text-foreground">
                {formatCurrency(totalAmount, currencyCode)}
              </p>
            </div>
            <div className="rounded-md border border-border px-3 py-2">
              <p className="text-xs text-muted-foreground">Đã thanh toán:</p>
              <p className="mt-1 font-medium tabular-nums text-foreground">
                {formatCurrency(paidAmount, currencyCode)}
              </p>
            </div>
            <div className="rounded-md border border-border px-3 py-2">
              <p className="text-xs text-muted-foreground">Còn lại:</p>
              <p className="mt-1 font-medium tabular-nums text-primary">
                {formatCurrency(maxAmount, currencyCode)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-payment-amount">Số tiền thanh toán</Label>
            <NumericInput
              id="contract-payment-amount"
              variant="ghost"
              min={0.01}
              max={allowOverpayment ? undefined : maxAmount}
              step={0.01}
              suffix={currencySuffix}
              value={amountValue}
              onValueChange={(value) =>
                setAmountValue(value === undefined ? '' : String(value))
              }
              aria-invalid={amountValue !== '' && !isAmountValid}
              className="h-12 rounded-none border-0 bg-transparent px-0 text-2xl font-semibold text-primary shadow-none focus-visible:border-0 focus-visible:bg-transparent focus-visible:text-primary focus-visible:ring-0 aria-invalid:border-0 aria-invalid:ring-0"
            />
            {amountValue !== '' && !isAmountValid ? (
              <p className="text-xs text-destructive">
                Số tiền phải lớn hơn 0
                {allowOverpayment
                  ? '.'
                  : ' và không vượt quá số tiền còn phải thu.'}
              </p>
            ) : null}
            {allowOverpayment &&
            normalizedAmount > maxAmount &&
            !includeFuture ? (
              <p className="text-xs text-muted-foreground">
                Phần vượt số tiền còn phải thu sẽ được ghi nhận thành số dư hợp
                đồng.
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <h3 className="text-sm font-semibold text-foreground">
                Phân bổ thanh toán
              </h3>
              <div className="grid shrink-0 grid-cols-2 gap-3 text-right text-xs text-muted-foreground">
                <span>Cần thu</span>
                <span>Thanh toán</span>
              </div>
            </div>
            {isLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Đang tải các khoản cần thu...
              </p>
            ) : errorMessage ? (
              <p className="py-8 text-center text-sm text-destructive">
                {errorMessage}
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                {dueItems.length > 0 ? (
                  <SortableContext
                    items={dueItems.map((item) => item.chargeId)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Các tháng cần thu
                      </p>
                      {dueItems.map((item) => (
                        <SortableAllocationRow
                          key={item.chargeId}
                          item={item}
                          allocatedAmount={
                            allocations.find(
                              (allocation) =>
                                allocation.chargeId === item.chargeId,
                            )?.allocatedAmount ?? 0
                          }
                          currencyCode={currencyCode}
                          formatAmount={formatCurrency}
                        />
                      ))}
                    </div>
                  </SortableContext>
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </p>
                )}
                {showFutureOption ? (
                  <div className="mt-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={includeFuture}
                        onCheckedChange={(checked) =>
                          handleFutureToggle(checked === true)
                        }
                        disabled={isLoading || futureItems.length === 0}
                      />
                      <span className="font-medium text-foreground">
                        Thanh toán cho các tháng chưa tới hạn
                      </span>
                    </label>
                  </div>
                ) : null}
                {visibleFutureItems.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {visibleFutureItems.map((item) => (
                      <SortableAllocationRow
                        key={item.chargeId}
                        item={item}
                        allocatedAmount={
                          allocations.find(
                            (allocation) =>
                              allocation.chargeId === item.chargeId,
                          )?.allocatedAmount ?? 0
                        }
                        currencyCode={currencyCode}
                        formatAmount={formatCurrency}
                        isDraggable={false}
                      />
                    ))}
                  </div>
                ) : null}
              </DndContext>
            )}
          </div>
        </DialogBody>

        <DialogFooter className="shrink-0 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            loadingText="Đang ghi nhận..."
            disabled={!isAllocationValid || isLoading || Boolean(errorMessage)}
          >
            Ghi nhận thanh toán
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
