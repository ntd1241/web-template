/**
 * Scaffolded by form-builder from `src/examples/material/groups/form/material-group.form.fixture.ts`. Run `npm run gen:form` — do NOT hand-write this file.
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
import { Textarea } from '@/components/ui/textarea';
import type { MaterialGroup } from '../../model/material-group';
import {
  materialGroupFormSchema,
  ROOT_PARENT_VALUE,
  type MaterialGroupFormValues,
} from '../material-group.schema';

export const materialGroupDefaultValues: MaterialGroupFormValues = {
  code: '',
  name: '',
  parentId: ROOT_PARENT_VALUE,
  description: '',
};

type MaterialGroupFormSource = MaterialGroup;

export function useMaterialGroupForm(
  options?: Omit<UseFormProps<MaterialGroupFormValues>, 'resolver'>,
) {
  return useForm<MaterialGroupFormValues>({
    resolver: zodResolver(materialGroupFormSchema),
    defaultValues: materialGroupDefaultValues,
    ...options,
  });
}

export function mapMaterialGroupToFormValues(
  entity: MaterialGroupFormSource,
): MaterialGroupFormValues {
  return {
    code: entity.code,
    name: entity.name,
    parentId: entity.parentId ?? ROOT_PARENT_VALUE,
    description: entity.description ?? '',
  };
}

interface MaterialGroupFormProps {
  form: UseFormReturn<MaterialGroupFormValues>;
  onSubmit: (values: MaterialGroupFormValues) => void;
  id?: string;
  parentIdOptions: { value: string; label: string }[];
}

export function MaterialGroupForm({
  form,
  onSubmit,
  id = 'materialGroup-form',
  parentIdOptions,
}: MaterialGroupFormProps) {
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
                  Mã nhóm<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="vd: NHOM-DT" variant="md" {...field} />
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
                  Tên nhóm<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="vd: Điện thoại" variant="md" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>
                  Nhóm cha<span className="text-destructive"> *</span>
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhóm cha" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {parentIdOptions.map((opt) => (
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
        </div>
      </form>
    </Form>
  );
}

interface MaterialGroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<MaterialGroupFormValues>;
  onSubmit: (values: MaterialGroupFormValues) => void;
  title?: string;
  parentIdOptions: { value: string; label: string }[];
}

export function MaterialGroupFormDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  title,
  parentIdOptions,
}: MaterialGroupFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
          <DialogTitle>{title ?? 'Nhóm vật tư'}</DialogTitle>
          <DialogDescription>Thông tin nhóm vật tư.</DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <MaterialGroupForm
            form={form}
            onSubmit={onSubmit}
            id="materialGroup-form"
            parentIdOptions={parentIdOptions}
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
          <Button type="submit" variant="primary" form="materialGroup-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
