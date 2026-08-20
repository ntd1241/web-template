/**
 * Scaffolded by form-builder from `src/project/forms/tenant.form.fixture.ts`. Run `npm run gen:form` — do NOT hand-write this file.
 * You own this file now — keep create and edit dialog state separate in the parent. Create forms
 * keep their draft when closed; edit forms reset after the selected entity is assigned on the next
 * open. Never clear the selected entity or reset the form while an edit dialog is closing. To change
 * fields, widths or layout, edit the spec and re-gen to a scratch path, then reconcile your edits.
 * Do not hand-edit this banner or the generated options consts — that's how review detects a
 * bypassed builder.
 */
import { useState, type KeyboardEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { UseFormProps, UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShortcutTooltip } from '@/components/ui/shortcut-tooltip';
import { Textarea } from '@/components/ui/textarea';
import {
  tenantSettingsSchema,
  type TenantSettingsValues,
} from '../model/tenant-settings';

const numberLocaleOptions = [
  { value: 'vi-VN', label: 'Việt Nam (1.234,56)' },
  { value: 'en-US', label: 'Quốc tế (1,234.56)' },
];

const compactDisplayOptions = [
  { value: 'long', label: 'Đầy đủ (triệu, tỷ)' },
  { value: 'short', label: 'Viết tắt (Tr, Tỷ)' },
];

export const tenantSettingsDefaultValues: TenantSettingsValues = {
  logoUrl: '',
  name: '',
  legalName: '',
  description: '',
  taxCode: '',
  email: '',
  phone: '',
  address: '',
  website: '',
  paymentReminderDays: 0,
  chargeGenerationLeadDays: 0,
  numberLocale: '',
  currencyCode: '',
  compactDisplay: '',
};

// TODO(scaffold): replace with the real entity type used for edit-mode mapping.
type TenantSettingsFormSource = unknown;

export function useTenantSettingsForm(
  options?: Omit<UseFormProps<TenantSettingsValues>, 'resolver'>,
) {
  return useForm<TenantSettingsValues>({
    resolver: zodResolver(tenantSettingsSchema),
    defaultValues: tenantSettingsDefaultValues,
    ...options,
  });
}

export function mapTenantSettingsToFormValues(
  entity: TenantSettingsFormSource,
): TenantSettingsValues {
  // TODO(scaffold): map entity → form values for edit mode.
  void entity;
  return tenantSettingsDefaultValues;
}

interface TenantSettingsFormProps {
  form: UseFormReturn<TenantSettingsValues>;
  onSubmit: (values: TenantSettingsValues) => void;
  id?: string;
  onLogoUrlFileChange?: (file: File | null) => void;
}

export function TenantSettingsForm({
  form,
  onSubmit,
  id = 'tenantSettings-form',
  onLogoUrlFileChange,
}: TenantSettingsFormProps) {
  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormControl>
                  <ImageUploadField
                    value={field.value}
                    onValueChange={field.onChange}
                    onFileChange={onLogoUrlFileChange}
                    accept="image/png,image/jpeg,image/webp"
                    maxSizeMb={5}
                    label="Logo tổ chức"
                    fallbackText="V"
                  />
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
                  Tên tổ chức<span className="text-destructive"> *</span>
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
            name="legalName"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Tên pháp lý</FormLabel>
                <FormControl>
                  <Input variant="md" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>Mô tả</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxCode"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Mã số thuế</FormLabel>
                <FormControl>
                  <Input variant="md" {...field} />
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
                <FormLabel>Email liên hệ</FormLabel>
                <FormControl>
                  <Input type="email" variant="md" {...field} />
                </FormControl>
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
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>Địa chỉ</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." variant="md" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentReminderDays"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Nhắc hạn thanh toán trước (ngày)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value}
                    variant="md"
                    onBlur={field.onBlur}
                    onChange={(event) =>
                      field.onChange(
                        Number.isNaN(event.target.valueAsNumber)
                          ? 0
                          : event.target.valueAsNumber,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chargeGenerationLeadDays"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Tạo kỳ thanh toán trước (ngày)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value}
                    variant="md"
                    onBlur={field.onBlur}
                    onChange={(event) =>
                      field.onChange(
                        Number.isNaN(event.target.valueAsNumber)
                          ? 0
                          : event.target.valueAsNumber,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numberLocale"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Định dạng số</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {numberLocaleOptions.map((opt) => (
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
            name="currencyCode"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Mã tiền tệ mặc định</FormLabel>
                <FormControl>
                  <Input placeholder="VND" variant="md" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="compactDisplay"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Đơn vị số rút gọn</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {compactDisplayOptions.map((opt) => (
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
        </div>
      </form>
    </Form>
  );
}

interface TenantSettingsFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: UseFormReturn<TenantSettingsValues>;
  onSubmit: (values: TenantSettingsValues) => void;
  isSaving?: boolean;
  title?: string;
  onLogoUrlFileChange?: (file: File | null) => void;
}

export function TenantSettingsFormDialog({
  open,
  onOpenChange,
  mode,
  form,
  onSubmit,
  isSaving = false,
  title,
  onLogoUrlFileChange,
}: TenantSettingsFormDialogProps) {
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
            <DialogTitle>{title ?? 'Thông tin tổ chức'}</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin nhận diện và liên hệ của tổ chức.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <TenantSettingsForm
              form={form}
              onSubmit={onSubmit}
              id="tenantSettings-form"
              onLogoUrlFileChange={onLogoUrlFileChange}
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
                form="tenantSettings-form"
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
