/**
 * Scaffolded by form-builder from `src/project/customers/forms/customer.form.fixture.ts`. Run `npm run gen:form` — do NOT hand-write this file.
 * You own this file now — keep create and edit dialog state separate in the parent. Create forms
 * keep their draft when closed; edit forms reset after the selected entity is assigned on the next
 * open. Never clear the selected entity or reset the form while an edit dialog is closing. To change
 * fields, widths or layout, edit the spec and re-gen to a scratch path, then reconcile your edits.
 * Do not hand-edit this banner or the generated options consts — that's how review detects a
 * bypassed builder.
 */
import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  customerFormSchema,
  type Customer,
  type CustomerFormValues,
} from '../model/customer';

const businessTypeOptions = [
  { value: 'individual', label: 'Cá nhân' },
  { value: 'organization', label: 'Doanh nghiệp' },
];

const statusOptions = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];

export const customerDefaultValues: CustomerFormValues = {
  customerCode: '',
  name: '',
  businessType: 'individual',
  status: 'active',
  phone: '',
  email: '',
  address: '',
  note: '',
};

export function useCustomerForm(
  options?: Omit<UseFormProps<CustomerFormValues>, 'resolver'>,
) {
  return useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customerDefaultValues,
    ...options,
  });
}

export function mapCustomerToFormValues(entity: Customer): CustomerFormValues {
  return {
    customerCode: entity.customerCode,
    name: entity.name,
    businessType: entity.businessType,
    status: entity.status,
    phone: entity.phone,
    email: entity.email,
    address: entity.address,
    note: entity.note,
  };
}

interface CustomerFormProps {
  form: UseFormReturn<CustomerFormValues>;
  onSubmit: (values: CustomerFormValues) => void;
  id?: string;
}

export function CustomerForm({
  form,
  onSubmit,
  id = 'customer-form',
}: CustomerFormProps) {
  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
          <FormField
            control={form.control}
            name="customerCode"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>
                  Mã khách hàng<span className="text-destructive"> *</span>
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
                  Tên khách hàng<span className="text-destructive"> *</span>
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
            name="businessType"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Loại hình đơn vị</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {businessTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Trạng thái</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input type="tel" variant="md" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" variant="md" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>Địa chỉ</FormLabel>
                <FormControl>
                  <Input variant="md" {...field} />
                </FormControl>
                <FormMessage />
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
      </form>
    </Form>
  );
}

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: UseFormReturn<CustomerFormValues>;
  onSubmit: (values: CustomerFormValues) => void;
  isSaving?: boolean;
  title?: string;
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  mode,
  form,
  onSubmit,
  isSaving = false,
  title,
}: CustomerFormDialogProps) {
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
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
        <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
            <DialogTitle>{title ?? 'Thêm khách hàng'}</DialogTitle>
          </DialogHeader>

          <Separator />

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <CustomerForm form={form} onSubmit={onSubmit} id="customer-form" />
          </div>

          <Separator />

          <DialogFooter className="shrink-0 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => requestClose(false)}
              disabled={isSaving}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              form="customer-form"
              loading={isSaving}
              loadingText="Đang lưu..."
            >
              Lưu
            </Button>
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
