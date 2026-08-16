import { forwardRef, useImperativeHandle } from 'react';
import type { ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import {
  useController,
  useFieldArray,
  useForm,
  type Control,
} from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InputSelect } from '@/components/ui/input-select';
import { DatePickerInput } from '@/components/ui/inputs/date-picker-input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  normalizeContractVersionLineForSubmit,
  type ContractVersionLineValuesForApi,
} from '../api/contracts.api';
import {
  BILLING_TYPE_LABELS,
  BILLING_UNIT_LABELS,
  contractVersionLineSchema,
  DUE_RULE_LABELS,
  type BillingType,
  type BillingUnit,
  type ContractCashflowDirection,
  type DueRule,
} from '../model/contract';

export function createDefaultContractFeeLine(
  startDate: string,
): ContractVersionLineValuesForApi {
  return {
    direction: 'receivable',
    name: '',
    quantity: 1,
    unitPrice: 0,
    billingType: 'recurring',
    billingUnit: 'month',
    billingInterval: 1,
    chargeDate: null,
    dueRule: 'on_period_end',
    dueDays: null,
    startDate,
    endDate: null,
  };
}

type ContractFeeLineFormValue = ContractVersionLineValuesForApi & {
  sortOrder: number;
};

type ContractFeeLinesFormValues = {
  lines: ContractFeeLineFormValue[];
};

const contractFeeLineValidationSchema = z.preprocess(
  (value) =>
    value && typeof value === 'object'
      ? normalizeContractVersionLineForSubmit(
          value as ContractVersionLineValuesForApi,
        )
      : value,
  contractVersionLineSchema,
);

const contractFeeLinesFormSchema = z.object({
  lines: z
    .array(contractFeeLineValidationSchema)
    .min(1, 'Hợp đồng cần ít nhất một khoản phí.'),
});

export interface ContractFeeLinesEditorRef {
  validate: () => Promise<boolean>;
}

interface ContractFeeLinesEditorProps {
  lines: ContractVersionLineValuesForApi[];
  onChange: (lines: ContractVersionLineValuesForApi[]) => void;
  currencyField?: ReactNode;
}

function toApiLines(
  lines: ContractFeeLineFormValue[],
): ContractVersionLineValuesForApi[] {
  return lines.map(({ sortOrder: _sortOrder, ...line }) => line);
}

function BillingPeriodField({
  control,
  index,
  onSync,
}: {
  control: Control<ContractFeeLinesFormValues>;
  index: number;
  onSync: () => void;
}) {
  const interval = useController({
    control,
    name: `lines.${index}.billingInterval`,
  });
  const unit = useController({
    control,
    name: `lines.${index}.billingUnit`,
  });
  const inputId = `billing-interval-${index}`;
  const errorMessage =
    interval.fieldState.error?.message ?? unit.fieldState.error?.message;

  return (
    <div className="flex flex-col gap-1 md:col-span-4">
      <label
        htmlFor={inputId}
        className="text-xs font-medium text-muted-foreground"
      >
        Mỗi
      </label>
      <InputSelect
        input={
          <Input
            id={inputId}
            type="number"
            min={1}
            variant="md"
            value={interval.field.value ?? ''}
            onBlur={interval.field.onBlur}
            onChange={(event) => {
              interval.field.onChange(
                event.target.value === '' ? null : Number(event.target.value),
              );
              onSync();
            }}
            ref={interval.field.ref}
            aria-invalid={Boolean(interval.fieldState.error)}
          />
        }
        select={
          <Select
            value={unit.field.value ?? 'month'}
            onValueChange={(value: BillingUnit) => {
              unit.field.onChange(value);
              onSync();
            }}
          >
            <SelectTrigger
              size="sm"
              aria-label="Chu kỳ"
              aria-invalid={Boolean(unit.fieldState.error)}
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
        }
      />
      {errorMessage ? (
        <p className="text-xs font-normal text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  );
}

function hasInactiveBillingPeriod(line: ContractVersionLineValuesForApi) {
  return (
    line.billingType === 'one_time' &&
    (line.billingUnit !== null || line.billingInterval !== null)
  );
}

export const ContractFeeLinesEditor = forwardRef<
  ContractFeeLinesEditorRef,
  ContractFeeLinesEditorProps
>(function ContractFeeLinesEditor({ lines, onChange, currencyField }, ref) {
  const form = useForm<ContractFeeLinesFormValues>({
    resolver: zodResolver(contractFeeLinesFormSchema),
    mode: 'onChange',
    defaultValues: {
      lines: lines.map((line, index) => ({ ...line, sortOrder: index })),
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lines',
  });
  const watchedLines = form.watch('lines');

  useImperativeHandle(
    ref,
    () => ({
      validate: () => form.trigger(),
    }),
    [form],
  );

  function syncParent() {
    onChange(toApiLines(form.getValues('lines')));
  }

  function appendLine() {
    const currentLines = form.getValues('lines');
    const nextLine = {
      ...createDefaultContractFeeLine(currentLines[0]?.startDate ?? ''),
      sortOrder: fields.length,
    };
    append(nextLine);
    onChange(toApiLines([...currentLines, nextLine]));
  }

  function removeLine(index: number) {
    const nextLines = form
      .getValues('lines')
      .filter((_, lineIndex) => lineIndex !== index)
      .map((line, lineIndex) => ({ ...line, sortOrder: lineIndex }));
    remove(index);
    onChange(toApiLines(nextLines));
  }

  return (
    <Form {...form}>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <h3 className="text-sm font-semibold text-foreground">Các khoản phí</h3>
        {currencyField ? (
          <div className="w-full max-w-48">{currencyField}</div>
        ) : null}
      </div>

      <section className="mt-3 space-y-3">
        <div className="space-y-3">
          {fields.map((field, index) => {
            const line = watchedLines[index] ?? field;
            const amount = line.quantity * line.unitPrice;

            return (
              <div
                key={field.id}
                className="relative grid gap-3 rounded-lg border border-border bg-background p-3 pe-12 md:grid-cols-12"
              >
                <FormField
                  control={form.control}
                  name={`lines.${index}.direction`}
                  render={({ field: directionField }) => (
                    <FormItem className="md:col-span-12">
                      <FormControl>
                        <ToggleGroup
                          type="single"
                          value={directionField.value}
                          onValueChange={(value) => {
                            if (!value) return;
                            directionField.onChange(
                              value as ContractCashflowDirection,
                            );
                            syncParent();
                          }}
                          variant="outline"
                          size="md"
                          aria-label="Loại dòng tiền"
                          className="w-fit"
                        >
                          <ToggleGroupItem
                            value="receivable"
                            aria-label="Khoản thu"
                            className="data-[state=off]:opacity-50 data-[state=on]:border-emerald-200 data-[state=on]:bg-emerald-50 data-[state=on]:text-emerald-700 dark:data-[state=on]:border-emerald-900 dark:data-[state=on]:bg-emerald-950 dark:data-[state=on]:text-emerald-300"
                          >
                            Thu
                          </ToggleGroupItem>
                          <ToggleGroupItem
                            value="payable"
                            aria-label="Khoản chi"
                            className="data-[state=off]:opacity-50 data-[state=on]:border-rose-200 data-[state=on]:bg-rose-50 data-[state=on]:text-rose-700 dark:data-[state=on]:border-rose-900 dark:data-[state=on]:bg-rose-950 dark:data-[state=on]:text-rose-300"
                          >
                            Chi
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`lines.${index}.name`}
                  render={({ field: inputField }) => (
                    <FormItem className="md:col-span-4">
                      <FormLabel>
                        Tên khoản phí
                        <span className="text-destructive"> *</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          variant="ghost"
                          placeholder="Ví dụ: Phí dịch vụ"
                          {...inputField}
                          onChange={(event) => {
                            inputField.onChange(event);
                            syncParent();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid min-w-0 grid-cols-[4rem_auto_minmax(0,1fr)_auto_minmax(0,1.15fr)] items-end gap-1 md:col-span-8">
                  <FormField
                    control={form.control}
                    name={`lines.${index}.quantity`}
                    render={({ field: inputField }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Số lượng</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="any"
                            variant="ghost"
                            value={inputField.value}
                            onChange={(event) => {
                              inputField.onChange(
                                event.target.value === ''
                                  ? 0
                                  : Number(event.target.value),
                              );
                              syncParent();
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <span className="shrink-0 pb-2 text-sm text-muted-foreground">
                    ×
                  </span>

                  <FormField
                    control={form.control}
                    name={`lines.${index}.unitPrice`}
                    render={({ field: inputField }) => (
                      <FormItem className="min-w-0">
                        <FormLabel>Đơn giá</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="any"
                            variant="ghost"
                            value={inputField.value}
                            onChange={(event) => {
                              inputField.onChange(
                                event.target.value === ''
                                  ? 0
                                  : Number(event.target.value),
                              );
                              syncParent();
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <span className="shrink-0 pb-2 text-sm text-muted-foreground">
                    =
                  </span>

                  <div className="flex min-w-0 flex-col gap-2.5">
                    <span className="block font-medium text-foreground">
                      Thành tiền
                    </span>
                    <span
                      className={cn(
                        'flex h-8.5 min-w-0 items-center truncate px-2.5 text-sm font-semibold tabular-nums',
                        line.direction === 'receivable'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400',
                      )}
                    >
                      {new Intl.NumberFormat('vi-VN').format(amount)} VND
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  className="absolute end-2 top-2 text-destructive hover:text-destructive"
                  aria-label={`Xóa khoản phí ${index + 1}`}
                  disabled={fields.length === 1}
                  onClick={() => removeLine(index)}
                >
                  <Trash2 className="size-4" />
                </Button>

                <FormField
                  control={form.control}
                  name={`lines.${index}.billingType`}
                  render={({ field: selectField }) => (
                    <FormItem variant="compact" className="md:col-span-4">
                      <FormLabel>Tần suất phát sinh</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={selectField.value}
                          onValueChange={(value: BillingType) => {
                            selectField.onChange(value);
                            form.setValue(
                              `lines.${index}.chargeDate`,
                              value === 'one_time'
                                ? (line.chargeDate ?? line.startDate)
                                : null,
                            );
                            syncParent();
                          }}
                          orientation="horizontal"
                          aria-label="Tần suất phát sinh"
                          className="flex h-8.5 items-center gap-4"
                        >
                          {(
                            Object.entries(BILLING_TYPE_LABELS) as [
                              BillingType,
                              string,
                            ][]
                          ).map(([value, label]) => (
                            <label
                              key={value}
                              className="flex cursor-pointer items-center gap-2 text-sm"
                            >
                              <RadioGroupItem value={value} size="sm" />
                              <span>{label}</span>
                            </label>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      {hasInactiveBillingPeriod(line) ? (
                        <p className="-mt-0.5 text-xs font-normal text-destructive">
                          Phí một lần không có chu kỳ lặp.
                        </p>
                      ) : (
                        <FormMessage />
                      )}
                    </FormItem>
                  )}
                />

                {line.billingType === 'recurring' ? (
                  <BillingPeriodField
                    control={form.control}
                    index={index}
                    onSync={syncParent}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name={`lines.${index}.chargeDate`}
                    render={({ field: dateField }) => (
                      <FormItem variant="compact" className="md:col-span-4">
                        <FormLabel>
                          Ngày phát sinh
                          <span className="text-destructive"> *</span>
                        </FormLabel>
                        <FormControl>
                          <DatePickerInput
                            value={dateField.value ?? line.startDate}
                            onChange={(value) => {
                              dateField.onChange(value ?? null);
                              syncParent();
                            }}
                            onBlur={dateField.onBlur}
                            calendarLabel="Chọn ngày phát sinh"
                            valueMode="iso-date"
                            variant="md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid gap-3 md:col-span-12 md:grid-cols-12">
                  <FormField
                    control={form.control}
                    name={`lines.${index}.dueRule`}
                    render={({ field: selectField }) => (
                      <FormItem variant="compact" className="md:col-span-4">
                        <FormLabel>Hạn thanh toán</FormLabel>
                        <Select
                          value={selectField.value}
                          onValueChange={(value: DueRule) => {
                            selectField.onChange(value);
                            form.setValue(
                              `lines.${index}.dueDays`,
                              value === 'after_days' ? 0 : null,
                            );
                            syncParent();
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(
                              Object.entries(DUE_RULE_LABELS) as [
                                DueRule,
                                string,
                              ][]
                            ).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {line.dueRule === 'after_days' ? (
                    <FormField
                      control={form.control}
                      name={`lines.${index}.dueDays`}
                      render={({ field: inputField }) => (
                        <FormItem variant="compact" className="md:col-span-2">
                          <FormLabel>Số ngày</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              variant="md"
                              value={inputField.value ?? ''}
                              onChange={(event) => {
                                inputField.onChange(
                                  event.target.value === ''
                                    ? null
                                    : Number(event.target.value),
                                );
                                syncParent();
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <Button type="button" variant="outline" size="sm" onClick={appendLine}>
          <Plus />
          Thêm khoản phí
        </Button>

        {watchedLines.length === 0 ? (
          <p className="text-xs text-destructive">
            Hợp đồng cần ít nhất một khoản phí.
          </p>
        ) : null}
      </section>
    </Form>
  );
});
