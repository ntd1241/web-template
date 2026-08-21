import { forwardRef, useEffect, useImperativeHandle } from 'react';
import type { ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import {
  normalizeContractVersionLineForSubmit,
  type ContractVersionLineValuesForApi,
} from '../api/contracts.api';
import { contractVersionLineSchema } from '../model/contract';
import { ContractFeeLinesEditorTable } from './contract-fee-lines-editor.generated';

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

export type ContractFeeLineFormValue = ContractVersionLineValuesForApi & {
  sortOrder: number;
};

export type ContractFeeLinesFormValues = {
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
  const watchedLines = useWatch({
    control: form.control,
    name: 'lines',
  });
  const defaultStartDate = lines[0]?.startDate ?? '';

  useEffect(() => {
    onChange(toApiLines(watchedLines ?? []));
  }, [onChange, watchedLines]);

  useImperativeHandle(
    ref,
    () => ({
      validate: () => form.trigger(),
    }),
    [form],
  );

  return (
    <Form {...form}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mt-3 flex min-h-0 flex-1 overflow-hidden rounded-lg border border-border">
          <ContractFeeLinesEditorTable
            form={form}
            toolbarContent={currencyField}
            createRow={() => ({
              ...createDefaultContractFeeLine(defaultStartDate),
              sortOrder: form.getValues('lines').length,
            })}
          />
        </div>
      </div>
    </Form>
  );
});
