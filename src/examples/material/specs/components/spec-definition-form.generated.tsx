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
import { Checkbox } from '@/components/ui/checkbox';
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
import { MultiSelect } from '@/components/ui/multi-select/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type {
  SpecDefinition,
  SpecOption,
  SpecValue,
} from '../../model/spec-definition';
import {
  specDefinitionFormSchema,
  type SpecDefinitionFormValues,
} from '../spec-definition.schema';

const dataTypeOptions = [
  { value: 'text', label: 'Văn bản' },
  { value: 'number', label: 'Số + đơn vị' },
  { value: 'list', label: 'Danh sách' },
  { value: 'boolean', label: 'Có / Không' },
  { value: 'date', label: 'Ngày tháng' },
];

export const specDefinitionDefaultValues: SpecDefinitionFormValues = {
  code: '',
  name: '',
  dataType: 'text',
  unit: '',
  description: '',
  allowMultiple: false,
  allowDynamicValues: false,
  options: [],
  defaultValue: undefined,
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
    allowMultiple: entity.allowMultiple,
    allowDynamicValues: entity.allowDynamicValues,
    defaultValue: cloneSpecValue(entity.defaultValue),
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
  const showOptions = dataType === 'list';
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
            <>
              <FormField
                control={form.control}
                name="allowMultiple"
                render={({ field }) => (
                  <FormItem className="md:col-span-6 flex-row items-center gap-2.5">
                    <FormControl>
                      <Checkbox
                        size="sm"
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                    </FormControl>
                    <FormLabel className="font-normal text-foreground">
                      Cho chọn nhiều
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowDynamicValues"
                render={({ field }) => (
                  <FormItem className="md:col-span-6 flex-row items-center gap-2.5">
                    <FormControl>
                      <Checkbox
                        size="sm"
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                    </FormControl>
                    <FormLabel className="font-normal text-foreground">
                      Cho phép giá trị động
                    </FormLabel>
                  </FormItem>
                )}
              />
            </>
          )}

          {showOptions && (
            <FormField
              control={form.control}
              name="options"
              render={() => (
                <FormItem className="md:col-span-12">
                  <div className="flex items-center justify-between">
                    <FormLabel>Danh sách lựa chọn</FormLabel>
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
                            name={`options.${index}.value`}
                            render={({ field }) => (
                              <FormItem className="flex-1/3">
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
                            name={`options.${index}.label`}
                            render={({ field }) => (
                              <FormItem className="flex-2/3">
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

          <SpecDefinitionDefaultValueField form={form} />
        </div>
      </form>
    </Form>
  );
}

function SpecDefinitionDefaultValueField({
  form,
}: {
  form: UseFormReturn<SpecDefinitionFormValues>;
}) {
  const dataType = form.watch('dataType');
  const unit = form.watch('unit');
  const options = form.watch('options');
  const allowMultiple = form.watch('allowMultiple');

  return (
    <FormField
      control={form.control}
      name="defaultValue"
      render={({ field }) => (
        <FormItem className="md:col-span-12">
          <FormLabel>Giá trị mặc định</FormLabel>
          <FormControl>
            <DefaultValueControl
              dataType={dataType}
              unit={unit}
              options={options}
              allowMultiple={allowMultiple}
              value={field.value}
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function DefaultValueControl({
  dataType,
  unit,
  options,
  allowMultiple,
  value,
  onChange,
}: {
  dataType: SpecDefinitionFormValues['dataType'];
  unit: string;
  options: SpecOption[];
  allowMultiple: boolean;
  value: SpecValue | undefined;
  onChange: (value: SpecValue | undefined) => void;
}) {
  switch (dataType) {
    case 'number': {
      const amount =
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        typeof value.amount === 'number'
          ? value.amount
          : undefined;
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            variant="md"
            value={Number.isFinite(amount) ? String(amount) : ''}
            onChange={(event) => {
              const next = event.target.value;
              onChange(
                next
                  ? { amount: Number(next), unit: unit.trim() || undefined }
                  : undefined,
              );
            }}
          />
          {unit.trim() && (
            <span className="text-sm text-muted-foreground">{unit}</span>
          )}
        </div>
      );
    }
    case 'boolean':
      return (
        <label className="flex h-9 items-center gap-2 text-sm text-foreground">
          <Checkbox
            size="sm"
            checked={value === true}
            onCheckedChange={(checked) => onChange(checked === true)}
          />
          {value === true ? 'Có' : 'Không'}
        </label>
      );
    case 'date':
      return (
        <Input
          type="date"
          variant="md"
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value || undefined)}
        />
      );
    case 'list':
      if (allowMultiple) {
        return (
          <MultiSelect
            value={Array.isArray(value) ? value : []}
            options={options.map((option) => ({
              value: option.id,
              label: option.label || option.value,
              searchableText: `${option.label} ${option.value}`,
            }))}
            placeholder="Chọn giá trị mặc định"
            searchPlaceholder="Tìm lựa chọn..."
            emptyMessage="Chưa có lựa chọn"
            maxChips={3}
            onChange={onChange}
          />
        );
      }
      return (
        <Select
          value={typeof value === 'string' ? value : '__none__'}
          onValueChange={(next) =>
            onChange(next === '__none__' ? undefined : next)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn giá trị mặc định" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Không mặc định</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label || option.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    default:
      return (
        <Input
          variant="md"
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value || undefined)}
        />
      );
  }
}

function cloneSpecValue(value: SpecValue | undefined): SpecValue | undefined {
  if (Array.isArray(value)) return [...value];
  if (typeof value === 'object' && value !== null) return { ...value };
  return value;
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
