/**
 * Scaffolded by form-builder from `src/project/tags/forms/tag.form.fixture.ts`. Run `npm run gen:form` — do NOT hand-write this file.
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
import { tagFormSchema, type TagFormValues } from '../model/tag';

export const tagDefaultValues: TagFormValues = {
  groupId: '',
  name: '',
  description: '',
  code: '',
  color: '',
};

// TODO(scaffold): replace with the real entity type used for edit-mode mapping.
type TagFormSource = unknown;

export function useTagForm(
  options?: Omit<UseFormProps<TagFormValues>, 'resolver'>,
) {
  return useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: tagDefaultValues,
    ...options,
  });
}

export function mapTagToFormValues(entity: TagFormSource): TagFormValues {
  // TODO(scaffold): map entity → form values for edit mode.
  void entity;
  return tagDefaultValues;
}

interface TagFormProps {
  form: UseFormReturn<TagFormValues>;
  onSubmit: (values: TagFormValues) => void;
  id?: string;
  groupIdOptions: { value: string; label: string }[];
}

export function TagForm({
  form,
  onSubmit,
  id = 'tag-form',
  groupIdOptions,
}: TagFormProps) {
  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
          <FormField
            control={form.control}
            name="groupId"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>
                  Nhóm nhãn<span className="text-destructive"> *</span>
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhóm nhãn" />
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
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-8">
                <FormLabel>
                  Tên nhãn<span className="text-destructive"> *</span>
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
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>Mô tả</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
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
                  Mã nhãn<span className="text-destructive"> *</span>
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
            name="color"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>
                  Màu<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="#2563eb" variant="md" {...field} />
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

interface TagFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<TagFormValues>;
  onSubmit: (values: TagFormValues) => void;
  title?: string;
  groupIdOptions: { value: string; label: string }[];
}

export function TagFormDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  title,
  groupIdOptions,
}: TagFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
          <DialogTitle>{title ?? 'Nhãn'}</DialogTitle>
          <DialogDescription>
            Tạo nhãn để gắn cho nhiều loại đối tượng.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <TagForm
            form={form}
            onSubmit={onSubmit}
            id="tag-form"
            groupIdOptions={groupIdOptions}
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
          <Button type="submit" variant="primary" form="tag-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
