/**
 * Scaffolded by form-builder from `src/project/customers/forms/customer-saved-view.form.fixture.ts`. Run `npm run gen:form` — do NOT hand-write this file.
 * You own this file now — keep create and edit dialog state separate in the parent. Create forms
 * keep their draft when closed; edit forms reset after the selected entity is assigned on the next
 * open. Never clear the selected entity or reset the form while an edit dialog is closing. To change
 * fields, widths or layout, edit the spec and re-gen to a scratch path, then reconcile your edits.
 * Do not hand-edit this banner or the generated options consts — that's how review detects a
 * bypassed builder.
 */
import { type KeyboardEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { UseFormProps, UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
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
  customerSavedViewFormSchema,
  type CustomerSavedViewFormValues,
} from '../model/customer-saved-view';

export const customerSavedViewDefaultValues: CustomerSavedViewFormValues = {
  name: '',
};

// TODO(scaffold): replace with the real entity type used for edit-mode mapping.
type CustomerSavedViewFormSource = unknown;

export function useCustomerSavedViewForm(
  options?: Omit<UseFormProps<CustomerSavedViewFormValues>, 'resolver'>,
) {
  return useForm<CustomerSavedViewFormValues>({
    resolver: zodResolver(customerSavedViewFormSchema),
    defaultValues: customerSavedViewDefaultValues,
    ...options,
  });
}

export function mapCustomerSavedViewToFormValues(
  entity: CustomerSavedViewFormSource,
): CustomerSavedViewFormValues {
  // TODO(scaffold): map entity → form values for edit mode.
  void entity;
  return customerSavedViewDefaultValues;
}

interface CustomerSavedViewFormProps {
  form: UseFormReturn<CustomerSavedViewFormValues>;
  onSubmit: (values: CustomerSavedViewFormValues) => void;
  id?: string;
}

export function CustomerSavedViewForm({
  form,
  onSubmit,
  id = 'customerSavedView-form',
}: CustomerSavedViewFormProps) {
  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>
                  Tên chế độ xem<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ví dụ: Khách hàng tiềm năng"
                    variant="md"
                    {...field}
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

interface CustomerSavedViewFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: UseFormReturn<CustomerSavedViewFormValues>;
  onSubmit: (values: CustomerSavedViewFormValues) => void;
  isSaving?: boolean;
  title?: string;
  onDelete?: () => void;
}

export function CustomerSavedViewFormDialog({
  open,
  onOpenChange,
  mode,
  form,
  onSubmit,
  isSaving = false,
  title,
  onDelete,
}: CustomerSavedViewFormDialogProps) {
  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isSaving || !(event.ctrlKey || event.metaKey)) return;

    const key = event.key.toLowerCase();
    if (key !== 's' && key !== 'enter') return;

    event.preventDefault();
    void form.handleSubmit(onSubmit)();
  };
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0"
          onKeyDown={handleDialogKeyDown}
        >
          <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
            <DialogTitle>{title ?? 'Tạo chế độ xem'}</DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <CustomerSavedViewForm
              form={form}
              onSubmit={onSubmit}
              id="customerSavedView-form"
            />
          </div>

          <DialogFooter className="shrink-0 px-6 py-4">
            {mode === 'edit' && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                className="me-auto text-destructive hover:text-destructive"
                onClick={onDelete}
                disabled={isSaving}
              >
                <Trash2 />
                Xóa
              </Button>
            ) : null}
            <ShortcutTooltip label="Hủy" shortcut="Esc">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Hủy
              </Button>
            </ShortcutTooltip>
            <ShortcutTooltip label="Lưu" shortcut="Ctrl/Cmd + S">
              <Button
                type="submit"
                variant="primary"
                form="customerSavedView-form"
                loading={isSaving}
                loadingText="Đang lưu..."
              >
                Lưu
              </Button>
            </ShortcutTooltip>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
