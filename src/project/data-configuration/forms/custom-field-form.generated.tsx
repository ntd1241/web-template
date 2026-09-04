/**
 * Scaffolded by form-builder from `src/project/data-configuration/forms/custom-field.form.fixture.ts`. Run `npm run gen:form` — do NOT hand-write this file.
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
import { OptionSelect } from '@/components/ui/option-select';
import type { SelectOption } from '@/components/ui/option-select';
import { ShortcutTooltip } from '@/components/ui/shortcut-tooltip';
import { Switch } from '@/components/ui/switch';
import {
  customFieldFormSchema,
  type CustomFieldFormValues,
} from '../model/custom-field';

const fieldTypeOptions = [
  { value: 'text', label: 'Chữ' },
  { value: 'number', label: 'Số' },
  { value: 'select', label: 'Danh sách lựa chọn' },
];

export const customFieldDefaultValues: CustomFieldFormValues = {
  key: '',
  label: '',
  isRequired: false,
  isActive: false,
  fieldType: '',
};

// TODO(scaffold): replace with the real entity type used for edit-mode mapping.
type CustomFieldFormSource = unknown;

export function useCustomFieldForm(
  options?: Omit<UseFormProps<CustomFieldFormValues>, 'resolver'>,
) {
  return useForm<CustomFieldFormValues>({
    resolver: zodResolver(customFieldFormSchema),
    defaultValues: customFieldDefaultValues,
    ...options,
  });
}

export function mapCustomFieldToFormValues(
  entity: CustomFieldFormSource,
): CustomFieldFormValues {
  // TODO(scaffold): map entity → form values for edit mode.
  void entity;
  return customFieldDefaultValues;
}

interface CustomFieldFormProps {
  form: UseFormReturn<CustomFieldFormValues>;
  onSubmit: (values: CustomFieldFormValues) => void;
  id?: string;
}

export function CustomFieldForm({
  form,
  onSubmit,
  id = 'customField-form',
}: CustomFieldFormProps) {
  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
          <FormField
            control={form.control}
            name="key"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>
                  Mã trường<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ví dụ: education"
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
            name="label"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>
                  Tên trường<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: Học vấn" variant="md" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isRequired"
            render={({ field }) => (
              <FormItem className="md:col-span-6 flex-row items-center gap-2.5">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal text-foreground">
                  Bắt buộc nhập
                </FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="md:col-span-6 flex-row items-center gap-2.5">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal text-foreground">
                  Kích hoạt trường
                </FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fieldType"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>
                  Kiểu dữ liệu<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <OptionSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={fieldTypeOptions}
                    searchable={false}
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

interface CustomFieldFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: UseFormReturn<CustomFieldFormValues>;
  onSubmit: (values: CustomFieldFormValues) => void;
  isSaving?: boolean;
  title?: string;
}

export function CustomFieldFormDialog({
  open,
  onOpenChange,
  mode,
  form,
  onSubmit,
  isSaving = false,
  title,
}: CustomFieldFormDialogProps) {
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
            <DialogTitle>{title ?? 'Trường bổ sung'}</DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <CustomFieldForm
              form={form}
              onSubmit={onSubmit}
              id="customField-form"
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
                form="customField-form"
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
