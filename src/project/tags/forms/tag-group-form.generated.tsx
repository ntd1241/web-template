/**
 * Scaffolded by form-builder from `src/project/tags/forms/tag-group.form.fixture.ts`. Run `npm run gen:form` — do NOT hand-write this file.
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
import { Separator } from '@/components/ui/separator';
import { ShortcutTooltip } from '@/components/ui/shortcut-tooltip';
import { Textarea } from '@/components/ui/textarea';
import { tagGroupFormSchema, type TagGroupFormValues } from '../model/tag';

export const tagGroupDefaultValues: TagGroupFormValues = {
  name: '',
  code: '',
  description: '',
};

// TODO(scaffold): replace with the real entity type used for edit-mode mapping.
type TagGroupFormSource = unknown;

export function useTagGroupForm(
  options?: Omit<UseFormProps<TagGroupFormValues>, 'resolver'>,
) {
  return useForm<TagGroupFormValues>({
    resolver: zodResolver(tagGroupFormSchema),
    defaultValues: tagGroupDefaultValues,
    ...options,
  });
}

export function mapTagGroupToFormValues(
  entity: TagGroupFormSource,
): TagGroupFormValues {
  // TODO(scaffold): map entity → form values for edit mode.
  void entity;
  return tagGroupDefaultValues;
}

interface TagGroupFormProps {
  form: UseFormReturn<TagGroupFormValues>;
  onSubmit: (values: TagGroupFormValues) => void;
  id?: string;
}

export function TagGroupForm({
  form,
  onSubmit,
  id = 'tagGroup-form',
}: TagGroupFormProps) {
  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>
                  Tên nhóm<span className="text-destructive"> *</span>
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
            name="code"
            render={({ field }) => (
              <FormItem className="md:col-span-6">
                <FormLabel>
                  Mã nhóm<span className="text-destructive"> *</span>
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
        </div>
      </form>
    </Form>
  );
}

interface TagGroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<TagGroupFormValues>;
  onSubmit: (values: TagGroupFormValues) => void;
  isSaving?: boolean;
  title?: string;
}

export function TagGroupFormDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  isSaving = false,
  title,
}: TagGroupFormDialogProps) {
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
          <DialogTitle>{title ?? 'Nhóm nhãn'}</DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <TagGroupForm form={form} onSubmit={onSubmit} id="tagGroup-form" />
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
              form="tagGroup-form"
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
