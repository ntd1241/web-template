/**
 * Scaffolded by editor-table-builder from `src/project/contracts/table/contract-fee-lines.editor-table.fixture.ts`. Run `npm run gen:editor-table` — do NOT hand-write this file.
 * You own this file now — fill computed cell stubs and wire it into the page/card layout. To change
 * columns or viewport behavior, edit the spec and re-gen to a scratch path, then reconcile your edits.
 */
import type { ReactNode } from 'react';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { Controller, useController, useFieldArray } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { useNumberFormat } from '@/providers/number-format-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePickerInput } from '@/components/ui/inputs/date-picker-input';
import { NumericInput } from '@/components/ui/inputs/numeric-input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  BILLING_TYPE_LABELS,
  BILLING_UNIT_LABELS,
  DUE_RULE_LABELS,
  type BillingType,
  type BillingUnit,
  type DueRule,
} from '../model/contract';
import type {
  ContractFeeLineFormValue,
  ContractFeeLinesFormValues,
} from './contract-fee-lines-editor';

function ContractFeeDirectionCell({
  form,
  index,
  error,
}: {
  form: UseFormReturn<ContractFeeLinesFormValues>;
  index: number;
  error?: string;
}) {
  const field = useController({
    control: form.control,
    name: `lines.${index}.direction`,
  });

  return (
    <div className="space-y-1">
      <ToggleGroup
        type="single"
        value={field.field.value}
        onValueChange={(value) => {
          if (value) field.field.onChange(value);
        }}
        variant="outline"
        size="sm"
        aria-label={`Loại dòng tiền dòng ${index + 1}`}
        className="w-fit"
      >
        <ToggleGroupItem
          value="receivable"
          aria-label="Khoản thu"
          className="px-2.5 text-xs data-[state=off]:opacity-50 data-[state=on]:border-emerald-200 data-[state=on]:bg-emerald-50 data-[state=on]:text-emerald-700 dark:data-[state=on]:border-emerald-900 dark:data-[state=on]:bg-emerald-950 dark:data-[state=on]:text-emerald-300"
        >
          Thu
        </ToggleGroupItem>
        <ToggleGroupItem
          value="payable"
          aria-label="Khoản chi"
          className="px-2.5 text-xs data-[state=off]:opacity-50 data-[state=on]:border-rose-200 data-[state=on]:bg-rose-50 data-[state=on]:text-rose-700 dark:data-[state=on]:border-rose-900 dark:data-[state=on]:bg-rose-950 dark:data-[state=on]:text-rose-300"
        >
          Chi
        </ToggleGroupItem>
      </ToggleGroup>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function ContractFeeNumberCell({
  form,
  index,
  name,
  label,
  min,
  error,
}: {
  form: UseFormReturn<ContractFeeLinesFormValues>;
  index: number;
  name: 'quantity' | 'unitPrice';
  label: string;
  min: number;
  error?: string;
}) {
  const field = useController({
    control: form.control,
    name: `lines.${index}.${name}`,
  });

  return (
    <div className="space-y-1">
      <NumericInput
        min={min}
        variant="sm"
        value={field.field.value}
        onBlur={field.field.onBlur}
        onValueChange={(value) => field.field.onChange(value ?? 0)}
        aria-label={`${label} dòng ${index + 1}`}
        aria-invalid={Boolean(error)}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function ContractFeeBillingCell({
  form,
  index,
  error,
}: {
  form: UseFormReturn<ContractFeeLinesFormValues>;
  index: number;
  error?: string;
}) {
  const billingType = useController({
    control: form.control,
    name: `lines.${index}.billingType`,
  });
  const billingInterval = useController({
    control: form.control,
    name: `lines.${index}.billingInterval`,
  });
  const billingUnit = useController({
    control: form.control,
    name: `lines.${index}.billingUnit`,
  });
  const chargeDate = useController({
    control: form.control,
    name: `lines.${index}.chargeDate`,
  });
  const line = form.getValues(`lines.${index}`);
  return (
    <div className="space-y-1">
      <div className="flex min-w-0 items-center gap-1.5">
        <Select
          value={billingType.field.value}
          onValueChange={(value: BillingType) => {
            billingType.field.onChange(value);
            chargeDate.field.onChange(
              value === 'one_time'
                ? (chargeDate.field.value ?? line.startDate)
                : null,
            );
          }}
        >
          <SelectTrigger
            size="sm"
            className="w-[5.75rem] shrink-0"
            aria-label={`Tần suất phát sinh dòng ${index + 1}`}
            aria-invalid={Boolean(error)}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(
              Object.entries(BILLING_TYPE_LABELS) as [BillingType, string][]
            ).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {billingType.field.value === 'recurring' ? (
          <>
            <span className="shrink-0 text-xs text-muted-foreground">Mỗi</span>
            <NumericInput
              min={1}
              variant="sm"
              className="w-14"
              value={billingInterval.field.value ?? ''}
              onBlur={billingInterval.field.onBlur}
              onValueChange={(value) =>
                billingInterval.field.onChange(value ?? null)
              }
              aria-label={`Khoảng lặp dòng ${index + 1}`}
              aria-invalid={Boolean(error)}
            />
            <Select
              value={billingUnit.field.value ?? 'month'}
              onValueChange={(value: BillingUnit) =>
                billingUnit.field.onChange(value)
              }
            >
              <SelectTrigger
                size="sm"
                className="min-w-20"
                aria-label={`Đơn vị lặp dòng ${index + 1}`}
                aria-invalid={Boolean(error)}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.entries(BILLING_UNIT_LABELS) as [BillingUnit, string][]
                ).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        ) : (
          <DatePickerInput
            value={chargeDate.field.value ?? line.startDate}
            onChange={chargeDate.field.onChange}
            onBlur={chargeDate.field.onBlur}
            calendarLabel={`Chọn ngày phát sinh dòng ${index + 1}`}
            valueMode="iso-date"
            variant="sm"
            aria-label={`Ngày phát sinh dòng ${index + 1}`}
            aria-invalid={Boolean(error)}
          />
        )}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function ContractFeeDueCell({
  form,
  index,
  error,
}: {
  form: UseFormReturn<ContractFeeLinesFormValues>;
  index: number;
  error?: string;
}) {
  const dueRule = useController({
    control: form.control,
    name: `lines.${index}.dueRule`,
  });
  const dueDays = useController({
    control: form.control,
    name: `lines.${index}.dueDays`,
  });
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Select
          value={dueRule.field.value}
          onValueChange={(value: DueRule) => {
            dueRule.field.onChange(value);
            dueDays.field.onChange(value === 'after_days' ? 0 : null);
          }}
        >
          <SelectTrigger
            size="sm"
            className="min-w-28"
            aria-label={`Hạn thanh toán dòng ${index + 1}`}
            aria-invalid={Boolean(error)}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(DUE_RULE_LABELS) as [DueRule, string][]).map(
              ([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
        {dueRule.field.value === 'after_days' ? (
          <>
            <NumericInput
              min={0}
              variant="sm"
              className="w-16"
              value={dueDays.field.value ?? ''}
              onBlur={dueDays.field.onBlur}
              onValueChange={(value) => dueDays.field.onChange(value ?? null)}
              aria-label={`Số ngày đến hạn dòng ${index + 1}`}
              aria-invalid={Boolean(error)}
            />
            <span className="shrink-0 text-xs text-muted-foreground">ngày</span>
          </>
        ) : null}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

interface ContractFeeLinesEditorTableProps {
  form: UseFormReturn<ContractFeeLinesFormValues>;
  createRow: () => ContractFeeLineFormValue;
  toolbarContent?: ReactNode;
}

export function ContractFeeLinesEditorTable({
  form,
  createRow,
  toolbarContent,
}: ContractFeeLinesEditorTableProps) {
  const { formatCurrency } = useNumberFormat();
  const { fields, append, insert, remove } = useFieldArray({
    control: form.control,
    name: 'lines',
    keyName: 'fieldId',
  });
  const watchedRows = form.watch('lines') ?? [];

  const handleAddRow = () => {
    append(createRow());
  };

  const handleAddRowBelow = (index: number) => {
    insert(index + 1, createRow());
  };

  const handleDuplicateRow = (index: number) => {
    const currentRow = form.getValues(`lines.${index}`);
    insert(index + 1, { ...currentRow, id: crypto.randomUUID() });
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 w-full flex-col">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground">
            Các khoản phí
          </h2>
          <div className="text-xs text-muted-foreground">
            {fields.length} dòng
          </div>
        </div>
        <div className="flex items-center gap-2">
          {toolbarContent}
          <Button type="button" variant="primary" onClick={handleAddRow}>
            <Plus />
            Thêm khoản phí
          </Button>
        </div>
      </div>
      <ScrollArea
        type="always"
        className="min-h-[360px] min-h-0 flex-1"
        viewportClassName="h-full overflow-y-auto"
      >
        <table className="min-w-[1320px] w-full caption-bottom text-foreground text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="sticky top-0 z-20 bg-muted w-14">
                STT
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-muted w-28">
                Loại
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-muted min-w-56">
                Tên khoản phí
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-muted w-28">
                Số lượng
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-muted w-40">
                Đơn giá
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-muted w-40">
                Thành tiền
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-muted w-64">
                Phát sinh / Chu kỳ
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-muted w-52">
                Hạn thanh toán
              </TableHead>
              <TableHead className="sticky top-0 right-0 z-30 bg-muted w-28 text-right shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.45)]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-28 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-muted-foreground">
                      Chưa có dữ liệu
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddRow}
                    >
                      <Plus />
                      Thêm dòng
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              fields.map((field, index) => {
                const row = watchedRows[index] as
                  | ContractFeeLineFormValue
                  | undefined;
                const errors = form.formState.errors.lines?.[index];
                void row;

                return (
                  <TableRow key={field.fieldId}>
                    <TableCell className="px-4 py-2 text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="px-2 py-2 align-top">
                      <ContractFeeDirectionCell
                        form={form}
                        index={index}
                        error={errors?.direction?.message}
                      />
                    </TableCell>
                    <TableCell className="px-2 py-2">
                      <Controller
                        control={form.control}
                        name={`lines.${index}.name`}
                        render={({ field: inputField }) => (
                          <Input
                            {...inputField}
                            aria-label={`Tên khoản phí dòng ${index + 1}`}
                            aria-invalid={!!errors?.name}
                            variant="sm"
                          />
                        )}
                      />
                      {errors?.name && (
                        <div className="mt-1 text-xs text-destructive">
                          {errors?.name?.message}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-2 py-2 align-top">
                      <ContractFeeNumberCell
                        form={form}
                        index={index}
                        name="quantity"
                        label="Số lượng"
                        min={0}
                        error={errors?.quantity?.message}
                      />
                    </TableCell>
                    <TableCell className="px-2 py-2 align-top">
                      <ContractFeeNumberCell
                        form={form}
                        index={index}
                        name="unitPrice"
                        label="Đơn giá"
                        min={0}
                        error={errors?.unitPrice?.message}
                      />
                    </TableCell>
                    <TableCell className="px-2 py-2 align-top">
                      <span
                        className={cn(
                          'block pt-2 text-right text-sm font-semibold tabular-nums',
                          row?.direction === 'receivable'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400',
                        )}
                      >
                        {formatCurrency(
                          (row?.quantity ?? 0) * (row?.unitPrice ?? 0),
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="px-2 py-2 align-top">
                      <ContractFeeBillingCell
                        form={form}
                        index={index}
                        error={
                          errors?.billingType?.message ??
                          errors?.billingInterval?.message ??
                          errors?.billingUnit?.message ??
                          errors?.chargeDate?.message
                        }
                      />
                    </TableCell>
                    <TableCell className="px-2 py-2 align-top">
                      <ContractFeeDueCell
                        form={form}
                        index={index}
                        error={
                          errors?.dueRule?.message ?? errors?.dueDays?.message
                        }
                      />
                    </TableCell>
                    <TableCell className="sticky right-0 z-10 bg-card px-3 py-2 shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.35)]">
                      <div className="flex justify-end gap-1">
                        <Button
                          aria-label={`Nhân đôi dòng ${index + 1}`}
                          title="Nhân đôi"
                          type="button"
                          variant="ghost"
                          mode="icon"
                          size="sm"
                          onClick={() => handleDuplicateRow(index)}
                        >
                          <Copy />
                        </Button>
                        <Button
                          aria-label={`Thêm dòng dưới dòng ${index + 1}`}
                          title="Thêm dòng dưới"
                          type="button"
                          variant="ghost"
                          mode="icon"
                          size="sm"
                          onClick={() => handleAddRowBelow(index)}
                        >
                          <Plus />
                        </Button>
                        <Button
                          aria-label={`Xóa dòng ${index + 1}`}
                          title="Xóa"
                          type="button"
                          variant="destructive"
                          appearance="ghost"
                          mode="icon"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
