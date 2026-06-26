/**
 * Scaffolded by form-builder from `src/examples/material/inspection/form/inspection-table.form.fixture.ts`. Run `npm run gen:form` — do NOT hand-write this file.
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { InspectionTable } from '../../model/inspection-table';
import {
  inspectionTableFormSchema,
  type InspectionTableFormValues,
} from '../inspection-table.schema';

export const inspectionTableDefaultValues: InspectionTableFormValues = {
  code: '',
  name: '',
  description: '',
};

type InspectionTableFormSource = InspectionTable;

export function useInspectionTableForm(
  options?: Omit<UseFormProps<InspectionTableFormValues>, 'resolver'>,
) {
  return useForm<InspectionTableFormValues>({
    resolver: zodResolver(inspectionTableFormSchema),
    defaultValues: inspectionTableDefaultValues,
    ...options,
  });
}

export function mapInspectionTableToFormValues(
  entity: InspectionTableFormSource,
): InspectionTableFormValues {
  return {
    code: entity.code,
    name: entity.name,
    description: entity.description ?? '',
  };
}

interface InspectionTableFormProps {
  form: UseFormReturn<InspectionTableFormValues>;
  onSubmit: (values: InspectionTableFormValues) => void;
  id?: string;
}

export function InspectionTableForm({
  form,
  onSubmit,
  id = 'inspectionTable-form',
}: InspectionTableFormProps) {
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
                  Mã bảng<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="vd: KD-PALANG" variant="md" {...field} />
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
                  Tên bảng<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="vd: Tiêu chuẩn kiểm định palăng"
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

interface InspectionTableFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<InspectionTableFormValues>;
  onSubmit: (values: InspectionTableFormValues) => void;
  title?: string;
}

export function InspectionTableFormDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  title,
}: InspectionTableFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
          <DialogTitle>{title ?? 'Bảng kiểm định'}</DialogTitle>
          <DialogDescription>
            Thông tin cơ bản của bảng kiểm định.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <InspectionTableForm
            form={form}
            onSubmit={onSubmit}
            id="inspectionTable-form"
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
          <Button type="submit" variant="primary" form="inspectionTable-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
