import { useEffect, useState, type ReactNode } from 'react';
import {
  addDays,
  addMonths,
  addYears,
  format,
  isValid,
  parseISO,
} from 'date-fns';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input, InputGroup } from '@/components/ui/input';
import { DatePickerInput } from '@/components/ui/inputs/date-picker-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  ContractDetail,
  ContractRenewalInput,
  ContractVersionLineValuesForApi,
} from '../api/contracts.api';
import { ContractFeeLinesEditor } from './contract-fee-lines-editor';
import { ContractVersionBadge } from './contract-version-badge';

type DurationUnit = 'day' | 'month' | 'year';

function parseContractDate(value: string | null) {
  if (!value) return null;
  const date = parseISO(value);
  return isValid(date) ? date : null;
}

function toIsoDate(value: Date | null) {
  return value && isValid(value) ? format(value, 'yyyy-MM-dd') : '';
}

function formatDisplayDate(value: string | null) {
  const date = parseContractDate(value);
  if (!value) return 'Không giới hạn';
  return date ? new Intl.DateTimeFormat('vi-VN').format(date) : 'Chưa xác định';
}

function addDuration(value: string, amount: number, unit: DurationUnit) {
  const date = parseContractDate(value);
  if (!date || amount <= 0) return '';

  const nextDate =
    unit === 'day'
      ? addDays(date, amount)
      : unit === 'year'
        ? addYears(date, amount)
        : addMonths(date, amount);

  return toIsoDate(nextDate);
}

function getDefaultStartDate(contract: ContractDetail) {
  const currentEndDate = parseContractDate(contract.endDate);
  return toIsoDate(currentEndDate ? addDays(currentEndDate, 1) : new Date());
}

function getDefaultDuration(contract: ContractDetail) {
  const startDate = parseContractDate(contract.startDate);
  const endDate = parseContractDate(contract.endDate);
  if (!startDate || !endDate) return 12;

  const months =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    endDate.getMonth() -
    startDate.getMonth();
  return Math.max(1, months || 12);
}

function createRenewalLines(
  contract: ContractDetail,
  versionId: string | null,
): ContractVersionLineValuesForApi[] {
  if (!versionId) return [];

  return contract.activeLines
    .filter((line) => line.contractVersionId === versionId)
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

export interface ContractRenewalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: ContractDetail;
  isSubmitting?: boolean;
  onConfirm: (input: ContractRenewalInput) => void | Promise<void>;
}

export function ContractRenewalDialog({
  open,
  onOpenChange,
  contract,
  isSubmitting = false,
  onConfirm,
}: ContractRenewalDialogProps) {
  const currentVersion = contract.activeVersion;
  const [durationValue, setDurationValue] = useState(() =>
    getDefaultDuration(contract),
  );
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('month');
  const [startDate, setStartDate] = useState(() =>
    getDefaultStartDate(contract),
  );
  const [endDate, setEndDate] = useState(() =>
    addDuration(
      getDefaultStartDate(contract),
      getDefaultDuration(contract),
      'month',
    ),
  );
  const [lines, setLines] = useState<ContractVersionLineValuesForApi[]>(() =>
    createRenewalLines(contract, currentVersion?.id ?? null),
  );
  const nextVersionNo =
    Math.max(0, ...contract.versions.map((version) => version.versionNo)) + 1;

  useEffect(() => {
    if (!open) return;

    const defaultDuration = getDefaultDuration(contract);
    const defaultStartDate = getDefaultStartDate(contract);

    setDurationValue(defaultDuration);
    setDurationUnit('month');
    setStartDate(defaultStartDate);
    setEndDate(addDuration(defaultStartDate, defaultDuration, 'month'));
    const nextCurrentVersion = contract.activeVersion;
    setLines(createRenewalLines(contract, nextCurrentVersion?.id ?? null));
  }, [contract, open]);

  function updateDuration(value: number, unit = durationUnit) {
    setDurationValue(value);
    setEndDate(addDuration(startDate, value, unit));
  }

  function updateStartDate(value: string) {
    setStartDate(value);
    setEndDate(addDuration(value, durationValue, durationUnit));
  }

  const canConfirm = Boolean(
    startDate && endDate && endDate >= startDate && lines.length > 0,
  );

  function handleConfirm() {
    if (!canConfirm || isSubmitting) return;
    void onConfirm({ startDate, endDate, lines });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] max-w-5xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 px-6 py-5 text-start">
          <DialogTitle>Gia hạn hợp đồng</DialogTitle>
        </DialogHeader>

        <DialogBody className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
              <InfoField
                label="Version mới"
                value={
                  <ContractVersionBadge
                    versionNo={nextVersionNo}
                    status="draft"
                    label="Gia hạn"
                  />
                }
              />
              <InfoField
                label="Version hiện tại"
                value={
                  currentVersion ? (
                    <ContractVersionBadge
                      versionNo={currentVersion.versionNo}
                      status={currentVersion.status}
                    />
                  ) : (
                    '—'
                  )
                }
              />
              <InfoField
                label="Hiệu lực version hiện tại"
                value={
                  currentVersion
                    ? `${formatDisplayDate(currentVersion.effectiveFrom)} – ${formatDisplayDate(currentVersion.effectiveTo)}`
                    : '—'
                }
              />
            </div>

            <section className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground">
                    Thời gian gia hạn
                  </label>
                  <InputGroup>
                    <Input
                      type="number"
                      min={1}
                      className="rounded-e-none"
                      value={durationValue}
                      aria-label="Thời gian gia hạn"
                      onChange={(event) =>
                        updateDuration(Number(event.target.value))
                      }
                    />
                    <Select
                      value={durationUnit}
                      onValueChange={(value) => {
                        const nextUnit = value as DurationUnit;
                        setDurationUnit(nextUnit);
                        updateDuration(durationValue, nextUnit);
                      }}
                    >
                      <SelectTrigger
                        className="w-28 rounded-s-none border-s-0"
                        aria-label="Đơn vị thời gian gia hạn"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Ngày</SelectItem>
                        <SelectItem value="month">Tháng</SelectItem>
                        <SelectItem value="year">Năm</SelectItem>
                      </SelectContent>
                    </Select>
                  </InputGroup>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground">
                    Ngày bắt đầu
                  </label>
                  <DatePickerInput
                    value={startDate}
                    valueMode="iso-date"
                    onChange={(value) => {
                      if (typeof value === 'string') updateStartDate(value);
                    }}
                    aria-label="Ngày bắt đầu gia hạn"
                    variant="md"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-foreground">
                    Ngày kết thúc
                  </label>
                  <DatePickerInput
                    value={endDate}
                    valueMode="iso-date"
                    onChange={(value) => {
                      if (typeof value === 'string') setEndDate(value);
                    }}
                    aria-label="Ngày kết thúc gia hạn"
                    variant="md"
                  />
                </div>
              </div>
            </section>

            <section className="min-w-0 space-y-4">
              <ContractFeeLinesEditor
                lines={lines}
                onChange={setLines}
                showOneTimeChargeDate={false}
              />
            </section>
          </div>
        </DialogBody>

        <DialogFooter className="shrink-0 flex-row justify-end px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!canConfirm || isSubmitting}
            loading={isSubmitting}
            onClick={handleConfirm}
          >
            <RefreshCw /> Xác nhận gia hạn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 flex min-h-7 items-center text-sm font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}
