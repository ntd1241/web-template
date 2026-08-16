/**
 * Scaffolded by form-builder from `src/project/contracts/forms/contract.form.fixture.ts`. Run `npm run gen:form` — do NOT hand-write this file.
 * You own this file now — keep create and edit dialog state separate in the parent. Create forms
 * keep their draft when closed; edit forms reset after the selected entity is assigned on the next
 * open. Never clear the selected entity or reset the form while an edit dialog is closing. To change
 * fields, widths or layout, edit the spec and re-gen to a scratch path, then reconcile your edits.
 * Do not hand-edit this banner or the generated options consts — that's how review detects a
 * bypassed builder.
 */
import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { CustomerSelect } from '@/project/customers/components/customer-select';
import type { CustomerSelectOption } from '@/project/customers/components/customer-select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { UseFormProps, UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DatePickerInput } from '@/components/ui/inputs/date-picker-input';
import { Separator } from '@/components/ui/separator';
import { ShortcutTooltip } from '@/components/ui/shortcut-tooltip';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  contractFormSchema,
  type Contract,
  type ContractFormValues,
} from '../model/contract';

export const contractDefaultValues: ContractFormValues = {
  customerId: '',
  contractCode: '',
  name: '',
  currencyCode: 'VND',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: null,
  autoRenew: false,
  note: '',
};

export function useContractForm(
  options?: Omit<UseFormProps<ContractFormValues>, 'resolver'>,
) {
  return useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: contractDefaultValues,
    ...options,
  });
}

export function mapContractToFormValues(entity: Contract): ContractFormValues {
  return {
    customerId: entity.customerId,
    contractCode: entity.contractCode,
    name: entity.name,
    currencyCode: entity.currencyCode,
    startDate: entity.startDate,
    endDate: entity.endDate,
    autoRenew: entity.autoRenew,
    note: entity.note,
  };
}

interface ContractFormProps {
  form: UseFormReturn<ContractFormValues>;
  onSubmit: (values: ContractFormValues) => void;
  id?: string;
  lineEditor?: ReactNode;
  selectedCustomer?: CustomerSelectOption;
  onCustomerSelect?: (customer: CustomerSelectOption | undefined) => void;
}

export function ContractForm({
  form,
  onSubmit,
  id = 'contract-form',
  lineEditor,
  selectedCustomer,
  onCustomerSelect,
}: ContractFormProps) {
  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>
                  Khách hàng<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <CustomerSelect
                    value={field.value}
                    selectedCustomer={selectedCustomer}
                    onChange={field.onChange}
                    onSelect={onCustomerSelect}
                    placeholder="Chọn khách hàng"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contractCode"
            render={({ field }) => (
              <FormItem className="md:col-span-6 md:col-start-1">
                <FormLabel>
                  Mã hợp đồng<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input variant="md" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>
                  Tên hợp đồng<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input variant="md" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>
                  Ngày bắt đầu<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <DatePickerInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    calendarLabel="Chọn ngày bắt đầu"
                    valueMode="date"
                    variant="md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Ngày kết thúc</FormLabel>
                <FormControl>
                  <DatePickerInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    calendarLabel="Chọn ngày kết thúc"
                    valueMode="date"
                    variant="md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="autoRenew"
            render={({ field }) => (
              <FormItem className="md:col-span-6 flex-row items-center gap-2.5">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal text-foreground">
                  Tự động gia hạn
                </FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>Ghi chú</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {lineEditor ? <div className="mt-6">{lineEditor}</div> : null}
      </form>
    </Form>
  );
}

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: UseFormReturn<ContractFormValues>;
  onSubmit: (values: ContractFormValues) => void;
  isSaving?: boolean;
  title?: string;
  lineEditor?: ReactNode;
  selectedCustomer?: CustomerSelectOption;
  onCustomerSelect?: (customer: CustomerSelectOption | undefined) => void;
}

export function ContractFormDialog({
  open,
  onOpenChange,
  mode,
  form,
  onSubmit,
  isSaving = false,
  title,
  lineEditor,
  selectedCustomer,
  onCustomerSelect,
}: ContractFormDialogProps) {
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isSaving || !(event.ctrlKey || event.metaKey)) return;

    const key = event.key.toLowerCase();
    if (key !== 's' && key !== 'enter') return;

    event.preventDefault();
    void form.handleSubmit(onSubmit)();
  };
  const requestClose = (nextOpen: boolean) => {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }

    if (mode === 'edit') {
      setConfirmCloseOpen(true);
      return;
    }

    onOpenChange(false);
  };

  const confirmClose = () => {
    setConfirmCloseOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={requestClose}>
        <DialogContent
          className="flex max-h-[90dvh] max-w-4xl flex-col gap-0 overflow-hidden p-0"
          onKeyDown={handleDialogKeyDown}
        >
          <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
            <DialogTitle>{title ?? 'Thêm hợp đồng'}</DialogTitle>
          </DialogHeader>

          <Separator />

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <ContractForm
              form={form}
              onSubmit={onSubmit}
              id="contract-form"
              lineEditor={lineEditor}
              selectedCustomer={selectedCustomer}
              onCustomerSelect={onCustomerSelect}
            />
          </div>

          <Separator />

          <DialogFooter className="shrink-0 px-6 py-4">
            <ShortcutTooltip label="Hủy" shortcut="Esc">
              <Button
                type="button"
                variant="outline"
                onClick={() => requestClose(false)}
                disabled={isSaving}
              >
                Hủy
              </Button>
            </ShortcutTooltip>
            <ShortcutTooltip label="Lưu" shortcut="Ctrl/Cmd + S">
              <Button
                type="submit"
                variant="primary"
                form="contract-form"
                loading={isSaving}
                loadingText="Đang lưu..."
              >
                Lưu
              </Button>
            </ShortcutTooltip>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmCloseOpen}
        onOpenChange={setConfirmCloseOpen}
        title="Đóng chỉnh sửa?"
        description="Bạn có thay đổi chưa lưu. Nếu đóng, các thay đổi hiện tại sẽ bị mất."
        confirmLabel="Đóng"
        confirmVariant="destructive"
        onConfirm={confirmClose}
      />
    </>
  );
}
