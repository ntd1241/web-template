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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ContractVersionLineValuesForApi } from '../api/contracts.api';
import {
  BILLING_TYPE_LABELS,
  BILLING_UNIT_LABELS,
  contractVersionLineSchema,
  DUE_RULE_LABELS,
  type BillingType,
  type BillingUnit,
  type DueRule,
} from '../model/contract';

export function createDefaultContractFeeLine(
  startDate: string,
): ContractVersionLineValuesForApi {
  return {
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

const contractFeeLinesFormSchema = z.object({
  lines: z
    .array(contractVersionLineSchema)
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
                  name={`lines.${index}.name`}
                  render={({ field: inputField }) => (
                    <FormItem variant="compact" className="md:col-span-4">
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
                      <FormItem variant="compact" className="min-w-0">
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
                      <FormItem variant="compact" className="min-w-0">
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

                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="block text-xs font-medium text-muted-foreground">
                      Thành tiền
                    </span>
                    <span className="flex h-8.5 min-w-0 items-center truncate px-2.5 text-sm font-semibold tabular-nums">
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
                    <FormItem variant="compact" className="md:col-span-3">
                      <FormLabel>Loại phí</FormLabel>
                      <Select
                        value={selectField.value}
                        onValueChange={(value: BillingType) => {
                          selectField.onChange(value);
                          form.setValue(
                            `lines.${index}.billingUnit`,
                            value === 'recurring' ? 'month' : null,
                          );
                          form.setValue(
                            `lines.${index}.billingInterval`,
                            value === 'recurring' ? 1 : null,
                          );
                          form.setValue(
                            `lines.${index}.chargeDate`,
                            value === 'one_time' ? line.startDate : null,
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
                            Object.entries(BILLING_TYPE_LABELS) as [
                              BillingType,
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

                {line.billingType === 'recurring' ? (
                  <>
                    <BillingPeriodField
                      control={form.control}
                      index={index}
                      onSync={syncParent}
                    />
                  </>
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
