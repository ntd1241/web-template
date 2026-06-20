/**
 * Scaffolded by form-builder from `src/builders/form/__fixtures__/supplier.form.fixture.ts`. Run `npm run gen:form` — do NOT hand-write this file.
 * You own this file now — wire submit + edit reset behavior in the parent. To change fields,
 * widths or layout, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated options consts — that's how review detects a bypassed builder.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { UseFormProps, UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import type { ComboboxOption } from '@/components/ui/combobox';
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
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import type { MultiSelectOption } from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  createSupplierFormSchema,
  type CreateSupplierFormValues,
} from './supplier-form.schema';

const groupOptions = [
  { value: 'vat-tu', label: 'Vật tư' },
  { value: 'dich-vu', label: 'Dịch vụ' },
];

const tagsOptions: MultiSelectOption[] = [
  { value: 'uu-tien', label: 'Ưu tiên', searchableText: 'Ưu tiên' },
  { value: 'noi-dia', label: 'Nội địa', searchableText: 'Nội địa' },
];

export const supplierDefaultValues: CreateSupplierFormValues = {
  code: '',
  name: '',
  contact: '',
  phone: '',
  debt: 0,
  group: '',
  region: '',
  tags: [],
  note: '',
  active: false,
};

// TODO(scaffold): replace with the real entity type used for edit-mode mapping.
type SupplierFormSource = unknown;

export function useSupplierForm(
  options?: Omit<UseFormProps<CreateSupplierFormValues>, 'resolver'>,
) {
  return useForm<CreateSupplierFormValues>({
    resolver: zodResolver(createSupplierFormSchema),
    defaultValues: supplierDefaultValues,
    ...options,
  });
}

export function mapSupplierToFormValues(
  entity: SupplierFormSource,
): CreateSupplierFormValues {
  // TODO(scaffold): map entity → form values for edit mode.
  void entity;
  return supplierDefaultValues;
}

interface SupplierFormProps {
  form: UseFormReturn<CreateSupplierFormValues>;
  onSubmit: (values: CreateSupplierFormValues) => void;
  id?: string;
  regionOptions: ComboboxOption[];
}

export function SupplierForm({
  form,
  onSubmit,
  id = 'supplier-form',
  regionOptions,
}: SupplierFormProps) {
  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>
                  Mã NCC<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="vd: NCC-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-8">
                <FormLabel>
                  Tên nhà cung cấp<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Người liên hệ</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                  <Input type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="debt"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Công nợ đầu kỳ</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="group"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>
                  Nhóm<span className="text-destructive"> *</span>
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhóm" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {groupOptions.map((opt) => (
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
            name="region"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Khu vực</FormLabel>
                <FormControl>
                  <Combobox
                    value={field.value}
                    onChange={field.onChange}
                    options={regionOptions}
                    placeholder="Chọn khu vực"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>Thẻ</FormLabel>
                <FormControl>
                  <MultiSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={tagsOptions}
                    placeholder="Chọn thẻ"
                    searchPlaceholder="Tìm thẻ..."
                    emptyMessage="Không có thẻ phù hợp"
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

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="md:col-span-12 flex-row items-center gap-2.5">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal text-foreground">
                  Kích hoạt ngay
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}

interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CreateSupplierFormValues>;
  onSubmit: (values: CreateSupplierFormValues) => void;
  title?: string;
  regionOptions: ComboboxOption[];
}

export function SupplierFormDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  title,
  regionOptions,
}: SupplierFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
          <DialogTitle>{title ?? 'Thêm nhà cung cấp'}</DialogTitle>
          <DialogDescription>
            Khai báo thông tin nhà cung cấp mới.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <SupplierForm
            form={form}
            onSubmit={onSubmit}
            id="supplier-form"
            regionOptions={regionOptions}
          />
        </div>

        <Separator />

        <DialogFooter className="shrink-0 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button type="submit" variant="primary" form="supplier-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
