/**
 * Scaffolded by form-builder from `src/project/employees/forms/employee.form.fixture.ts`. Run `npm run gen:form` — do NOT hand-write this file.
 * You own this file now — wire submit + edit reset behavior in the parent. To change fields,
 * widths or layout, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated options consts — that's how review detects a bypassed builder.
 */
import type { KeyboardEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { DatePickerInput } from '@/components/ui/inputs/date-picker-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ShortcutTooltip } from '@/components/ui/shortcut-tooltip';
import { Textarea } from '@/components/ui/textarea';
import { employeeFormSchema, type EmployeeFormValues } from '../model/employee';

const statusOptions = [
  { value: 'active', label: 'Đang làm việc' },
  { value: 'inactive', label: 'Ngừng làm việc' },
];

export const employeeDefaultValues: EmployeeFormValues = {
  employeeCode: '',
  firstName: '',
  lastName: '',
  jobTitle: '',
  department: '',
  phone: '',
  status: '',
  joinedAt: undefined,
  note: '',
};

// TODO(scaffold): replace with the real entity type used for edit-mode mapping.
type EmployeeFormSource = unknown;

export function useEmployeeForm(
  options?: Omit<UseFormProps<EmployeeFormValues>, 'resolver'>,
) {
  return useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: employeeDefaultValues,
    ...options,
  });
}

export function mapEmployeeToFormValues(
  entity: EmployeeFormSource,
): EmployeeFormValues {
  // TODO(scaffold): map entity → form values for edit mode.
  void entity;
  return employeeDefaultValues;
}

interface EmployeeFormProps {
  form: UseFormReturn<EmployeeFormValues>;
  onSubmit: (values: EmployeeFormValues) => void;
  id?: string;
}

export function EmployeeForm({
  form,
  onSubmit,
  id = 'employee-form',
}: EmployeeFormProps) {
  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
          <FormField
            control={form.control}
            name="employeeCode"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>
                  Mã nhân viên<span className="text-destructive"> *</span>
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
            name="firstName"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>
                  Tên<span className="text-destructive"> *</span>
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
            name="lastName"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Họ và tên đệm</FormLabel>
                <FormControl>
                  <Input variant="md" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Chức vụ</FormLabel>
                <FormControl>
                  <Input variant="md" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Phòng ban</FormLabel>
                <FormControl>
                  <Input variant="md" {...field} />
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
            name="joinedAt"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Ngày vào làm</FormLabel>
                <FormControl>
                  <DatePickerInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    calendarLabel="Chọn ngày vào làm"
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

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<EmployeeFormValues>;
  onSubmit: (values: EmployeeFormValues) => void;
  isSaving?: boolean;
  title?: string;
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  isSaving = false,
  title,
}: EmployeeFormDialogProps) {
  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isSaving || !(event.ctrlKey || event.metaKey)) return;

    const key = event.key.toLowerCase();
    if (key !== 's' && key !== 'enter') return;

    event.preventDefault();
    void form.handleSubmit(onSubmit)();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0"
        onKeyDown={handleDialogKeyDown}
      >
        <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
          <DialogTitle>{title ?? 'Thêm nhân viên'}</DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <EmployeeForm form={form} onSubmit={onSubmit} id="employee-form" />
        </div>

        <Separator />

        <DialogFooter className="shrink-0 px-6 py-4">
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
              form="employee-form"
              loading={isSaving}
              loadingText="Đang lưu..."
            >
              Lưu
            </Button>
          </ShortcutTooltip>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
