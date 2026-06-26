/**
 * Scaffolded by form-builder from `src/examples/material/form/material.form.fixture.ts`. Run `npm run gen:form` — do NOT hand-write this file.
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
import {
  materialFormSchema,
  type MaterialFormValues,
} from '../material.schema';
import type { Material } from '../model/material';
import type { MaterialModel } from '../model/material-model';
import type { SpecDefinition } from '../model/spec-definition';
import type { SpecValueSet } from '../model/spec-value-set';
import { DeviceSpecField } from './device-spec-field';

export const materialDefaultValues: MaterialFormValues = {
  name: '',
  code: '',
  groupId: '',
  modelId: '',
  specValues: [],
};

type MaterialFormSource = Material;

export function useMaterialForm(
  options?: Omit<UseFormProps<MaterialFormValues>, 'resolver'>,
) {
  return useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: materialDefaultValues,
    ...options,
  });
}

export function mapMaterialToFormValues(
  entity: MaterialFormSource,
): MaterialFormValues {
  return {
    name: entity.name,
    code: entity.code,
    groupId: '',
    modelId: entity.modelId,
    specValues: entity.specValues,
  };
}

interface MaterialFormProps {
  form: UseFormReturn<MaterialFormValues>;
  onSubmit: (values: MaterialFormValues) => void;
  id?: string;
  groupIdOptions: { value: string; label: string }[];
  modelIdOptions: { value: string; label: string }[];
  selectedModel: MaterialModel | undefined;
  definitions: SpecDefinition[];
  valueSets: SpecValueSet[];
  onGroupChange?: (groupId: string) => void;
  onModelChange?: () => void;
}

export function MaterialForm({
  form,
  onSubmit,
  id = 'material-form',
  groupIdOptions,
  modelIdOptions,
  selectedModel,
  definitions,
  valueSets,
  onGroupChange,
  onModelChange,
}: MaterialFormProps) {
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
                  Tên thiết bị<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="vd: iPhone 17 Pro - NV Kinh doanh"
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
                  Mã thiết bị<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="vd: DD-IP-000301"
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
                <FormLabel>Nhóm</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    onGroupChange?.(value);
                  }}
                >
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
            name="modelId"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>
                  Mẫu<span className="text-destructive"> *</span>
                </FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue('specValues', [], {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    onModelChange?.();
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mẫu vật tư" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {modelIdOptions.map((opt) => (
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

          <div className="md:col-span-12">
            <DeviceSpecField
              form={form}
              model={selectedModel}
              definitions={definitions}
              valueSets={valueSets}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}

interface MaterialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<MaterialFormValues>;
  onSubmit: (values: MaterialFormValues) => void;
  title?: string;
  groupIdOptions: { value: string; label: string }[];
  modelIdOptions: { value: string; label: string }[];
  selectedModel: MaterialModel | undefined;
  definitions: SpecDefinition[];
  valueSets: SpecValueSet[];
  onGroupChange?: (groupId: string) => void;
  onModelChange?: () => void;
}

export function MaterialFormDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  title,
  groupIdOptions,
  modelIdOptions,
  selectedModel,
  definitions,
  valueSets,
  onGroupChange,
  onModelChange,
}: MaterialFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
          <DialogTitle>{title ?? 'Thiết bị'}</DialogTitle>
          <DialogDescription>
            Thông tin cơ bản và thông số kế thừa từ mẫu.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <MaterialForm
            form={form}
            onSubmit={onSubmit}
            id="material-form"
            groupIdOptions={groupIdOptions}
            modelIdOptions={modelIdOptions}
            selectedModel={selectedModel}
            definitions={definitions}
            valueSets={valueSets}
            onGroupChange={onGroupChange}
            onModelChange={onModelChange}
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
          <Button type="submit" variant="primary" form="material-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
