import { type KeyboardEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import {
  useForm,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import { z } from 'zod';
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
import { ShortcutTooltip } from '@/components/ui/shortcut-tooltip';

const savedViewFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Tên chế độ xem không được để trống.')
    .max(80, 'Tên chế độ xem không được vượt quá 80 ký tự.'),
});

type SavedViewFormValues = z.infer<typeof savedViewFormSchema>;

const defaultValues: SavedViewFormValues = { name: '' };

function useSavedViewForm(
  options?: Omit<UseFormProps<SavedViewFormValues>, 'resolver'>,
) {
  return useForm<SavedViewFormValues>({
    resolver: zodResolver(savedViewFormSchema),
    defaultValues,
    ...options,
  });
}

interface SavedViewFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  form: UseFormReturn<SavedViewFormValues>;
  onSubmit: (values: SavedViewFormValues) => void;
  isSaving?: boolean;
  title?: string;
  onDelete?: () => void;
}

function SavedViewFormDialog({
  open,
  onOpenChange,
  mode,
  form,
  onSubmit,
  isSaving = false,
  title,
  onDelete,
}: SavedViewFormDialogProps) {
  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isSaving || !(event.ctrlKey || event.metaKey)) return;
    if (!['s', 'enter'].includes(event.key.toLowerCase())) return;
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
          <DialogTitle>{title ?? 'Tạo chế độ xem'}</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <Form {...form}>
            <form
              id="saved-view-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-12">
                    <FormLabel>
                      Tên chế độ xem<span className="text-destructive"> *</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ví dụ: Khách hàng tiềm năng"
                        variant="md"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter className="shrink-0 px-6 py-4">
          {mode === 'edit' && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              className="me-auto text-destructive hover:text-destructive"
              onClick={onDelete}
              disabled={isSaving}
            >
              <Trash2 />
              Xóa
            </Button>
          ) : null}
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
              form="saved-view-form"
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

export {
  SavedViewFormDialog,
  savedViewFormSchema,
  useSavedViewForm,
  type SavedViewFormDialogProps,
  type SavedViewFormValues,
};
