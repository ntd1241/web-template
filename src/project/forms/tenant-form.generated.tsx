/**
 * Scaffolded by form-builder from `src/project/forms/tenant.form.fixture.ts`. Run `npm run gen:form` — do NOT hand-write this file.
 * You own this file now — wire submit + edit reset behavior in the parent. To change fields,
 * widths or layout, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated options consts — that's how review detects a bypassed builder.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { UseFormProps, UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  DEFAULT_CHARGE_GENERATION_LEAD_DAYS,
  DEFAULT_PAYMENT_REMINDER_DAYS,
  tenantSettingsSchema,
  type TenantSettingsValues,
} from '../model/tenant-settings';

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
  paymentReminderDays: DEFAULT_PAYMENT_REMINDER_DAYS,
  chargeGenerationLeadDays: DEFAULT_CHARGE_GENERATION_LEAD_DAYS,
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
        </div>
      </form>
    </Form>
  );
}

interface TenantSettingsFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<TenantSettingsValues>;
  onSubmit: (values: TenantSettingsValues) => void;
  isSaving?: boolean;
  title?: string;
  onLogoUrlFileChange?: (file: File | null) => void;
}

export function TenantSettingsFormDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  isSaving = false,
  title,
  onLogoUrlFileChange,
}: TenantSettingsFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
          <DialogTitle>{title ?? 'Thông tin tổ chức'}</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin nhận diện và liên hệ của tổ chức.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <TenantSettingsForm
            form={form}
            onSubmit={onSubmit}
            id="tenantSettings-form"
            onLogoUrlFileChange={onLogoUrlFileChange}
          />
        </div>

        <Separator />

        <DialogFooter className="shrink-0 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            form="tenantSettings-form"
            loading={isSaving}
            loadingText="Đang lưu..."
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
