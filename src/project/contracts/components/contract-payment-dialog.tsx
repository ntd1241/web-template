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
import { GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatContractAmount } from '../api/contracts.api';
import {
  calculateContractPaymentAllocations,
  roundCurrencyAmount,
  type ContractReceivableTableFee,
  type ContractReceivableTableRow,
} from '../model/receivable';

export interface ContractPaymentSubmission {
  amount: number;
  allocations: Array<{
    chargeId: string;
    allocatedAmount: number;
  }>;
}

interface ContractPaymentDialogProps {
  open: boolean;
  row: ContractReceivableTableRow | null;
  currencyCode: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (submission: ContractPaymentSubmission) => void;
}

function formatPeriod(row: ContractReceivableTableRow) {
  const format = (value: string) =>
    new Intl.DateTimeFormat('vi-VN').format(new Date(`${value}T00:00:00`));
  return `${format(row.periodStart)} – ${format(row.periodEnd)}`;
}

function SortableAllocationRow({
  fee,
  allocatedAmount,
  currencyCode,
}: {
  fee: ContractReceivableTableFee;
  allocatedAmount: number;
  currencyCode: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fee.chargeId });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-md border border-border bg-background px-3 py-2.5 ${isDragging ? 'relative z-10 shadow-lg' : ''}`}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
        aria-label={`Đổi ưu tiên khoản phí ${fee.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <span className="min-w-0 truncate text-sm font-medium text-foreground">
        {fee.name}
      </span>
      <span className="text-right text-sm tabular-nums text-muted-foreground">
        {formatContractAmount(fee.outstandingAmount, currencyCode)}
      </span>
      <span className="text-right text-sm font-semibold tabular-nums text-foreground">
        {formatContractAmount(allocatedAmount, currencyCode)}
      </span>
    </div>
  );
}

export function ContractPaymentDialog({
  open,
  row,
  currencyCode,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: ContractPaymentDialogProps) {
  const [amountValue, setAmountValue] = useState('');
  const [orderedFees, setOrderedFees] = useState<ContractReceivableTableFee[]>(
    [],
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (!open || !row) return;
    setAmountValue(String(row.outstandingAmount));
    setOrderedFees(row.fees.filter((fee) => fee.outstandingAmount > 0));
  }, [open, row]);

  const maxAmount = row?.outstandingAmount ?? 0;
  const amount = Number(amountValue);
  const normalizedAmount = Number.isFinite(amount)
    ? roundCurrencyAmount(amount)
    : 0;

  const allocations = useMemo(() => {
    return calculateContractPaymentAllocations(orderedFees, normalizedAmount);
  }, [normalizedAmount, orderedFees]);

  const isAmountValid = normalizedAmount > 0 && normalizedAmount <= maxAmount;
  const isAllocationValid =
    isAmountValid &&
    roundCurrencyAmount(
      allocations.reduce(
        (sum, allocation) => sum + allocation.allocatedAmount,
        0,
      ),
    ) === normalizedAmount;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrderedFees((current) => {
      const oldIndex = current.findIndex((fee) => fee.chargeId === active.id);
      const newIndex = current.findIndex((fee) => fee.chargeId === over.id);
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
    });
  }

  if (!row) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
          <DialogTitle>Thanh toán kỳ {formatPeriod(row)}</DialogTitle>
          <DialogDescription>
            Nhập số tiền thanh toán và sắp xếp thứ tự ưu tiên phân bổ cho các
            khoản phí trong kỳ.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <DialogBody className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="contract-payment-amount">Số tiền thanh toán</Label>
            <Input
              id="contract-payment-amount"
              type="number"
              min="0.01"
              max={maxAmount}
              step="0.01"
              value={amountValue}
              onChange={(event) => setAmountValue(event.target.value)}
              aria-invalid={amountValue !== '' && !isAmountValid}
            />
            <p className="text-xs text-muted-foreground">
              Tối đa:{' '}
              <span className="font-medium text-foreground">
                {formatContractAmount(maxAmount, currencyCode)}
              </span>
            </p>
            {amountValue !== '' && !isAmountValid ? (
              <p className="text-xs text-destructive">
                Số tiền phải lớn hơn 0 và không vượt quá số tiền còn phải thu
                của kỳ.
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Phân bổ thanh toán
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Kéo biểu tượng để thay đổi thứ tự ưu tiên.
                </p>
              </div>
              <div className="grid shrink-0 grid-cols-2 gap-3 text-right text-xs text-muted-foreground">
                <span>Cần thu</span>
                <span>Thanh toán</span>
              </div>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedFees.map((fee) => fee.chargeId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {orderedFees.map((fee) => (
                    <SortableAllocationRow
                      key={fee.chargeId}
                      fee={fee}
                      allocatedAmount={
                        allocations.find(
                          (allocation) => allocation.chargeId === fee.chargeId,
                        )?.allocatedAmount ?? 0
                      }
                      currencyCode={currencyCode}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </DialogBody>

        <Separator />

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
            disabled={!isAllocationValid}
          >
            Ghi nhận thanh toán
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
