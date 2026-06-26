/**
 * Scaffolded by form-builder from `src/examples/material/models/form/material-model.form.fixture.ts`. Run `npm run gen:form` — do NOT hand-write this file.
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
import type { MaterialModel } from '../../model/material-model';
import {
  materialModelFormSchema,
  type MaterialModelFormValues,
} from '../material-model.schema';

export const materialModelDefaultValues: MaterialModelFormValues = {
  name: '',
  code: '',
  groupId: '',
  origin: '',
  description: '',
  isSafetyManaged: false,
  inspectionTableId: '',
  imageUrls: [],
  specs: [],
};

type MaterialModelFormSource = MaterialModel;

export function useMaterialModelForm(
  options?: Omit<UseFormProps<MaterialModelFormValues>, 'resolver'>,
) {
  return useForm<MaterialModelFormValues>({
    resolver: zodResolver(materialModelFormSchema),
    defaultValues: materialModelDefaultValues,
    ...options,
  });
}

export function mapMaterialModelToFormValues(
  entity: MaterialModelFormSource,
): MaterialModelFormValues {
  return {
    name: entity.name,
    code: entity.code,
    groupId: entity.groupId,
    origin: entity.origin ?? '',
    description: entity.description ?? '',
    isSafetyManaged: entity.isSafetyManaged ?? false,
    inspectionTableId: entity.inspectionTableId ?? '',
    imageUrls: entity.imageUrls,
    specs: entity.specs
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((spec) => ({
        id: spec.id,
        source: spec.source,
        specDefinitionId: spec.specDefinitionId,
        customDefinition: spec.customDefinition,
        labelOverride: spec.labelOverride,
        partKey: spec.partKey,
        selectionModeOverride: spec.selectionModeOverride,
        valueSetIdOverride: spec.valueSetIdOverride,
        optionSource: spec.optionSource,
        materialValueMode: spec.materialValueMode,
        defaultValue: spec.defaultValue,
        isRequired: spec.isRequired,
      })),
  };
}

interface MaterialModelFormProps {
  form: UseFormReturn<MaterialModelFormValues>;
  onSubmit: (values: MaterialModelFormValues) => void;
  id?: string;
  groupIdOptions: { value: string; label: string }[];
  inspectionTableIdOptions: { value: string; label: string }[];
}

export function MaterialModelForm({
  form,
  onSubmit,
  id = 'materialModel-form',
  groupIdOptions,
  inspectionTableIdOptions,
}: MaterialModelFormProps) {
  const isSafetyManaged = form.watch('isSafetyManaged');

  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>
                  Tên mẫu<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="vd: iPhone 17 Pro"
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
            name="code"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>
                  Mã mẫu<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="vd: MAU-IP17PRO"
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
            name="groupId"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>
                  Nhóm vật tư<span className="text-destructive"> *</span>
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhóm" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {groupIdOptions.map((opt) => (
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
            name="origin"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>Xuất xứ</FormLabel>
                <FormControl>
                  <Input placeholder="vd: Trung Quốc" variant="md" {...field} />
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
            name="isSafetyManaged"
            render={({ field }) => (
              <FormItem className="md:col-span-12 flex-row items-center gap-2.5">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal text-foreground">
                  Quản lý an toàn
                </FormLabel>
              </FormItem>
            )}
          />

          {isSafetyManaged && (
            <div className="md:col-span-12 flex flex-col gap-3">
              <FormField
                control={form.control}
                name="inspectionTableId"
                render={({ field }) => (
                  <FormItem className="max-w-xl">
                    <FormLabel>Bảng kiểm định</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn bảng kiểm định" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {inspectionTableIdOptions.map((opt) => (
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
          )}
        </div>
      </form>
    </Form>
  );
}

interface MaterialModelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<MaterialModelFormValues>;
  onSubmit: (values: MaterialModelFormValues) => void;
  title?: string;
  groupIdOptions: { value: string; label: string }[];
  inspectionTableIdOptions: { value: string; label: string }[];
}

export function MaterialModelFormDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  title,
  groupIdOptions,
  inspectionTableIdOptions,
}: MaterialModelFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
          <DialogTitle>{title ?? 'Mẫu vật tư'}</DialogTitle>
          <DialogDescription>Thông tin cơ bản của mẫu.</DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <MaterialModelForm
            form={form}
            onSubmit={onSubmit}
            id="materialModel-form"
            groupIdOptions={groupIdOptions}
            inspectionTableIdOptions={inspectionTableIdOptions}
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
          <Button type="submit" variant="primary" form="materialModel-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
