/**
 * Scaffolded by form-builder from `src/examples/material/specs/form/spec-definition.form.fixture.ts`. Run `npm run gen:form` — do NOT hand-write this file.
 * You own this file now — wire submit + edit reset behavior in the parent. To change fields,
 * widths or layout, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated options consts — that's how review detects a bypassed builder.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import type { SpecValueSet } from '../../model/spec-value-set';
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
] as const;

export const specDefinitionDefaultValues: SpecDefinitionFormValues = {
  code: '',
  name: '',
  dataType: 'text',
  unit: '',
  description: '',
  defaultValueSetId: '',
  defaultSelectionMode: 'single',
  allowModelSelectionOverride: false,
  allowModelValueSetOverride: false,
  defaultValue: undefined,
};

type SpecDefinitionFormSource = SpecDefinition;

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
    defaultValueSetId: entity.defaultValueSetId ?? '',
    defaultSelectionMode: entity.defaultSelectionMode ?? 'single',
    allowModelSelectionOverride: entity.allowModelSelectionOverride,
    allowModelValueSetOverride: entity.allowModelValueSetOverride,
    defaultValue: cloneSpecValue(entity.defaultValue),
  };
}

interface SpecDefinitionFormProps {
  form: UseFormReturn<SpecDefinitionFormValues>;
  onSubmit: (values: SpecDefinitionFormValues) => void;
  valueSets: SpecValueSet[];
  id?: string;
}

export function SpecDefinitionForm({
  form,
  onSubmit,
  valueSets,
  id = 'specDefinition-form',
}: SpecDefinitionFormProps) {
  const dataType = form.watch('dataType');
  const showUnit = dataType === 'number';
  const showListConfig = dataType === 'list';
  const selectedValueSet = valueSets.find(
    (set) => set.id === form.watch('defaultValueSetId'),
  );
  const selectedOptions = selectedValueSet?.options ?? [];

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

          {showListConfig && (
            <>
              <FormField
                control={form.control}
                name="defaultSelectionMode"
                render={({ field }) => (
                  <FormItem className="md:col-span-6">
                    <FormLabel>Chế độ chọn mặc định</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single">Chọn 1</SelectItem>
                        <SelectItem value="multi">Chọn nhiều</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultValueSetId"
                render={({ field }) => (
                  <FormItem className="md:col-span-6">
                    <FormLabel>Value set mặc định</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn value set" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {valueSets.map((set) => (
                          <SelectItem key={set.id} value={set.id}>
                            {set.name}
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
                name="allowModelSelectionOverride"
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
                      Cho mẫu đổi chọn 1 / nhiều
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowModelValueSetOverride"
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
                      Cho mẫu đổi value set / subset
                    </FormLabel>
                  </FormItem>
                )}
              />
            </>
          )}

          <SpecDefinitionDefaultValueField
            form={form}
            options={selectedOptions}
          />
        </div>
      </form>
    </Form>
  );
}

function SpecDefinitionDefaultValueField({
  form,
  options,
}: {
  form: UseFormReturn<SpecDefinitionFormValues>;
  options: SpecOption[];
}) {
  const dataType = form.watch('dataType');
  const unit = form.watch('unit');
  const selectionMode = form.watch('defaultSelectionMode');

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
              selectionMode={selectionMode}
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
  selectionMode,
  value,
  onChange,
}: {
  dataType: SpecDefinitionFormValues['dataType'];
  unit: string;
  options: SpecOption[];
  selectionMode: SpecDefinitionFormValues['defaultSelectionMode'];
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
      if (selectionMode === 'multi') {
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
  valueSets: SpecValueSet[];
  title?: string;
}

export function SpecDefinitionFormDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  valueSets,
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
            valueSets={valueSets}
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
