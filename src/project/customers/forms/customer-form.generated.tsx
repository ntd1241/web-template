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
import { CountrySelect } from '@/components/ui/country-select';
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
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { Input } from '@/components/ui/input';
import { VietnamRegionSelect } from '@/components/ui/region-select';
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

const countryCodeOptions = [
  { value: 'VN', label: 'Việt Nam' },
  { value: 'US', label: 'Hoa Kỳ' },
  { value: 'JP', label: 'Nhật Bản' },
  { value: 'KR', label: 'Hàn Quốc' },
  { value: 'CN', label: 'Trung Quốc' },
  { value: 'SG', label: 'Singapore' },
  { value: 'TH', label: 'Thái Lan' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'AU', label: 'Úc' },
  { value: 'GB', label: 'Vương quốc Anh' },
  { value: 'DE', label: 'Đức' },
  { value: 'FR', label: 'Pháp' },
  { value: 'CA', label: 'Canada' },
  { value: 'IN', label: 'Ấn Độ' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'PH', label: 'Philippines' },
  { value: 'TW', label: 'Đài Loan' },
  { value: 'HK', label: 'Hồng Kông' },
  { value: 'AE', label: 'Các Tiểu vương quốc Ả Rập Thống nhất' },
  { value: 'IT', label: 'Ý' },
  { value: 'ES', label: 'Tây Ban Nha' },
  { value: 'RU', label: 'Nga' },
  { value: 'BR', label: 'Brazil' },
  { value: 'CH', label: 'Thụy Sĩ' },
  { value: 'SE', label: 'Thụy Điển' },
  { value: 'NZ', label: 'New Zealand' },
];

const statusOptions = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
];

export const customerDefaultValues: CustomerFormValues = {
  customerCode: '',
  name: '',
  businessType: 'individual',
  businessRegistrationCode: '',
  imageUrl: '',
  countryCode: 'VN',
  regionCode: '',
  regionName: '',
  status: 'active',
  phone: '',
  email: '',
  addressDetail: '',
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
    businessRegistrationCode: entity.businessRegistrationCode,
    imageUrl: entity.imageUrl ?? '',
    countryCode: entity.countryCode,
    regionCode: entity.regionCode ?? '',
    regionName: entity.regionName,
    status: entity.status,
    phone: entity.phone,
    email: entity.email,
    addressDetail: entity.addressDetail,
    note: entity.note,
  };
}

interface CustomerFormProps {
  form: UseFormReturn<CustomerFormValues>;
  onSubmit: (values: CustomerFormValues) => void;
  id?: string;
  mode: 'create' | 'edit';
  regionCodeOptions: { value: string; label: string }[];
  onImageUrlFileChange?: (file: File | null) => void;
}

export function CustomerForm({
  form,
  onSubmit,
  id = 'customer-form',
  mode,
  regionCodeOptions,
  onImageUrlFileChange,
}: CustomerFormProps) {
  const countryCode = form.watch('countryCode');
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
            name="businessRegistrationCode"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Mã số thuế / QHNS / ĐKKD</FormLabel>
                <FormControl>
                  <Input variant="md" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormControl>
                  <ImageUploadField
                    value={field.value}
                    onValueChange={field.onChange}
                    onFileChange={onImageUrlFileChange}
                    accept="image/png,image/jpeg,image/webp"
                    maxSizeMb={5}
                    label="Ảnh khách hàng"
                    fallbackText="K"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="countryCode"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Quốc gia</FormLabel>
                <FormControl>
                  <CountrySelect
                    value={field.value}
                    options={countryCodeOptions}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('regionCode', '');
                      form.setValue('regionName', '');
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="regionCode"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Tỉnh/Thành phố</FormLabel>
                <FormControl>
                  <VietnamRegionSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    options={regionCodeOptions}
                    disabled={countryCode !== 'VN'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="regionName"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Tỉnh/Bang/Khu vực</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập khu vực hành chính"
                    variant="md"
                    disabled={countryCode === 'VN'}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {mode === 'edit' && (
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
          )}

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
            name="addressDetail"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>Địa chỉ chi tiết</FormLabel>
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
  regionCodeOptions: { value: string; label: string }[];
  onImageUrlFileChange?: (file: File | null) => void;
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  mode,
  form,
  onSubmit,
  isSaving = false,
  title,
  regionCodeOptions,
  onImageUrlFileChange,
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
            <CustomerForm
              form={form}
              onSubmit={onSubmit}
              id="customer-form"
              mode={mode}
              regionCodeOptions={regionCodeOptions}
              onImageUrlFileChange={onImageUrlFileChange}
            />
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
