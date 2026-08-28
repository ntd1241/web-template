/**
 * Scaffolded by form-builder from `src/project/customers/forms/customer-filter.form.fixture.ts`. Run `npm run gen:form` — do NOT hand-write this file.
 * You own this file now — keep create and edit dialog state separate in the parent. Create forms
 * keep their draft when closed; edit forms reset after the selected entity is assigned on the next
 * open. Never clear the selected entity or reset the form while an edit dialog is closing. To change
 * fields, widths or layout, edit the spec and re-gen to a scratch path, then reconcile your edits.
 * Do not hand-edit this banner or the generated options consts — that's how review detects a
 * bypassed builder.
 */
import { useState, type KeyboardEvent } from 'react';
import { TagSelect } from '@/project/tags/components/tag-select';
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
import { ShortcutTooltip } from '@/components/ui/shortcut-tooltip';
import {
  CustomerBusinessTypeSelect,
  CustomerStatusSelect,
} from '../components/customer-filter-selects';
import {
  customerFilterFormSchema,
  type CustomerFilterFormValues,
} from '../model/customer';

export const customerFilterDefaultValues: CustomerFilterFormValues = {
  customerSearch: '',
  businessTypes: [],
  contactSearch: '',
  tagIds: [],
  statuses: [],
};

// TODO(scaffold): replace with the real entity type used for edit-mode mapping.
type CustomerFilterFormSource = unknown;

export function useCustomerFilterForm(
  options?: Omit<UseFormProps<CustomerFilterFormValues>, 'resolver'>,
) {
  return useForm<CustomerFilterFormValues>({
    resolver: zodResolver(customerFilterFormSchema),
    defaultValues: customerFilterDefaultValues,
    ...options,
  });
}

export function mapCustomerFilterToFormValues(
  entity: CustomerFilterFormSource,
): CustomerFilterFormValues {
  // TODO(scaffold): map entity → form values for edit mode.
  void entity;
  return customerFilterDefaultValues;
}

interface CustomerFilterFormProps {
  form: UseFormReturn<CustomerFilterFormValues>;
  onSubmit: (values: CustomerFilterFormValues) => void;
  id?: string;
}

export function CustomerFilterForm({
  form,
  onSubmit,
  id = 'customerFilter-form',
}: CustomerFilterFormProps) {
  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
          <FormField
            control={form.control}
            name="customerSearch"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>Khách hàng</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Tìm theo tên hoặc mã khách hàng"
                    variant="md"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessTypes"
            render={({ field, fieldState }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>Loại hình đơn vị</FormLabel>
                <FormControl>
                  <CustomerBusinessTypeSelect
                    value={field.value[0]}
                    onChange={(value) => field.onChange(value ? [value] : [])}
                    placeholder="Tất cả"
                    size="md"
                    aria-invalid={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactSearch"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>Liên hệ</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Tìm theo số điện thoại hoặc email"
                    variant="md"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tagIds"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>Nhóm/nhãn</FormLabel>
                <FormControl>
                  <TagSelect
                    value={field.value}
                    onChange={field.onChange}
                    moduleCodes={['customers']}
                    placeholder="Chọn nhãn"
                    searchPlaceholder="Tìm nhãn..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="statuses"
            render={({ field, fieldState }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>Trạng thái</FormLabel>
                <FormControl>
                  <CustomerStatusSelect
                    value={field.value[0]}
                    onChange={(value) => field.onChange(value ? [value] : [])}
                    placeholder="Tất cả"
                    size="md"
                    aria-invalid={!!fieldState.error}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}

interface CustomerFilterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: UseFormReturn<CustomerFilterFormValues>;
  onSubmit: (values: CustomerFilterFormValues) => void;
  isSaving?: boolean;
  title?: string;
}

export function CustomerFilterFormDialog({
  open,
  onOpenChange,
  mode,
  form,
  onSubmit,
  isSaving = false,
  title,
}: CustomerFilterFormDialogProps) {
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
          className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0"
          onKeyDown={handleDialogKeyDown}
        >
          <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
            <DialogTitle>{title ?? 'Bộ lọc khách hàng'}</DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <CustomerFilterForm
              form={form}
              onSubmit={onSubmit}
              id="customerFilter-form"
            />
          </div>

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
                form="customerFilter-form"
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
