/**
 * Scaffolded by form-builder from `src/examples/material/specs/form/spec-definition.form.fixture.ts`. Run `npm run gen:form` — do NOT hand-write this file.
 * You own this file now — wire submit + edit reset behavior in the parent. To change fields,
 * widths or layout, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated options consts — that's how review detects a bypassed builder.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
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
  isSelectDataType,
  type SpecDefinition,
} from '../../model/spec-definition';
import {
  specDefinitionFormSchema,
  type SpecDefinitionFormValues,
} from '../spec-definition.schema';

const dataTypeOptions = [
  { value: 'text', label: 'Văn bản' },
  { value: 'number', label: 'Số + đơn vị' },
  { value: 'single_select', label: 'Chọn 1' },
  { value: 'multi_select', label: 'Chọn nhiều' },
  { value: 'boolean', label: 'Có / Không' },
  { value: 'date', label: 'Ngày tháng' },
];

export const specDefinitionDefaultValues: SpecDefinitionFormValues = {
  code: '',
  name: '',
  dataType: 'text',
  unit: '',
  description: '',
  isActive: true,
  options: [],
};

type SpecDefinitionFormSource = SpecDefinition;

let optionUid = 0;
function nextOptionId(): string {
  optionUid += 1;
  return `opt-new-${optionUid}`;
}

export function useSpecDefinitionForm(
  options?: Omit<UseFormProps<SpecDefinitionFormValues>, 'resolver'>,
) {
  return useForm<SpecDefinitionFormValues>({
    resolver: zodResolver(specDefinitionFormSchema),
    defaultValues: specDefinitionDefaultValues,
    ...options,
  });
}

export function mapSpecDefinitionToFormValues(
  entity: SpecDefinitionFormSource,
): SpecDefinitionFormValues {
  return {
    code: entity.code,
    name: entity.name,
    dataType: entity.dataType,
    unit: entity.unit ?? '',
    description: entity.description ?? '',
    isActive: entity.isActive,
    options: (entity.options ?? []).map((opt) => ({
      id: opt.id,
      label: opt.label,
      value: opt.value,
      colorHex: opt.colorHex,
    })),
  };
}

interface SpecDefinitionFormProps {
  form: UseFormReturn<SpecDefinitionFormValues>;
  onSubmit: (values: SpecDefinitionFormValues) => void;
  id?: string;
}

export function SpecDefinitionForm({
  form,
  onSubmit,
  id = 'specDefinition-form',
}: SpecDefinitionFormProps) {
  const dataType = form.watch('dataType');
  const showUnit = dataType === 'number';
  const showOptions = isSelectDataType(dataType);
  const optionsField = useFieldArray({
    control: form.control,
    name: 'options',
  });

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
                  Mã thông số<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="vd: TS-MAU" variant="md" {...field} />
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
                  Tên thông số<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="vd: Màu sắc" variant="md" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dataType"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>
                  Kiểu dữ liệu<span className="text-destructive"> *</span>
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn kiểu dữ liệu" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dataTypeOptions.map((opt) => (
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

          {showUnit && (
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel>Đơn vị</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="vd: kg, g, inch"
                      variant="md"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {showOptions && (
            <FormField
              control={form.control}
              name="options"
              render={() => (
                <FormItem className="md:col-span-12">
                  <div className="flex items-center justify-between">
                    <FormLabel>
                      Danh sách lựa chọn
                      <span className="text-destructive"> *</span>
                    </FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        optionsField.append({
                          id: nextOptionId(),
                          label: '',
                          value: '',
                          colorHex: undefined,
                        })
                      }
                    >
                      <Plus className="size-3.5" />
                      Thêm lựa chọn
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {optionsField.fields.length === 0 ? (
                      <p className="rounded-admin-control border border-dashed border-border bg-admin-surface-alt px-3 py-4 text-center text-sm text-muted-foreground">
                        Chưa có lựa chọn nào
                      </p>
                    ) : (
                      optionsField.fields.map((row, index) => (
                        <div key={row.id} className="flex items-start gap-2">
                          <FormField
                            control={form.control}
                            name={`options.${index}.label`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    placeholder="Nhãn (vd: Xanh)"
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
                            name={`options.${index}.value`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    placeholder="Mã (vd: xanh)"
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
                            name={`options.${index}.colorHex`}
                            render={({ field }) => (
                              <FormItem className="w-12 shrink-0">
                                <FormControl>
                                  <Input
                                    type="color"
                                    aria-label="Màu hiển thị"
                                    className="h-9 p-1"
                                    value={field.value ?? '#ffffff'}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-0.5 shrink-0 text-muted-foreground"
                            aria-label="Xóa lựa chọn"
                            onClick={() => optionsField.remove(index)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>Mô tả</FormLabel>
                <FormControl>
                  <Textarea rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="md:col-span-12 flex-row items-center gap-2.5">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal text-foreground">
                  Đang sử dụng
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}

interface SpecDefinitionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<SpecDefinitionFormValues>;
  onSubmit: (values: SpecDefinitionFormValues) => void;
  title?: string;
}

export function SpecDefinitionFormDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  title,
}: SpecDefinitionFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
          <DialogTitle>{title ?? 'Thêm thông số kỹ thuật'}</DialogTitle>
          <DialogDescription>
            Khai báo một thông số dùng chung cho mẫu vật tư.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <SpecDefinitionForm
            form={form}
            onSubmit={onSubmit}
            id="specDefinition-form"
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
          <Button type="submit" variant="primary" form="specDefinition-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
