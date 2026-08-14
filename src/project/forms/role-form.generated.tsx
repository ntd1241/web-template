/**
 * Scaffolded by form-builder from `src/project/forms/role.form.fixture.ts`. Run `npm run gen:form` — do NOT hand-write this file.
 * You own this file now — wire submit + edit reset behavior in the parent. To change fields,
 * widths or layout, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated options consts — that's how review detects a bypassed builder.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { UseFormProps, UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { ColorSelect } from '@/components/ui/color-select';
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
import { Textarea } from '@/components/ui/textarea';
import {
  ROLE_COLOR_LABELS,
  ROLE_COLOR_SWATCH_CLASSES,
  ROLE_COLOR_TEXT_CLASSES,
  ROLE_COLORS,
  roleFormSchema,
  type RoleColor,
  type RoleFormValues,
} from '../model/role-permission';

export const roleDefaultValues: RoleFormValues = {
  code: '',
  name: '',
  color: 'blue',
  description: '',
};

// TODO(scaffold): replace with the real entity type used for edit-mode mapping.
type RoleFormSource = unknown;

export function useRoleForm(
  options?: Omit<UseFormProps<RoleFormValues>, 'resolver'>,
) {
  return useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: roleDefaultValues,
    ...options,
  });
}

export function mapRoleToFormValues(entity: RoleFormSource): RoleFormValues {
  // TODO(scaffold): map entity → form values for edit mode.
  void entity;
  return roleDefaultValues;
}

interface RoleFormProps {
  form: UseFormReturn<RoleFormValues>;
  onSubmit: (values: RoleFormValues) => void;
  id?: string;
  isCreating?: boolean;
}

export function RoleForm({
  form,
  onSubmit,
  id = 'role-form',
  isCreating = true,
}: RoleFormProps) {
  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
          {isCreating && (
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="md:col-span-12">
                  <FormLabel>
                    Mã vai trò<span className="text-destructive"> *</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ví dụ: warehouse_manager"
                      variant="md"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>
                  Tên vai trò<span className="text-destructive"> *</span>
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
              <FormItem className="md:col-span-12">
                <FormLabel>
                  Màu vai trò<span className="text-destructive"> *</span>
                </FormLabel>
                <ColorSelect<RoleColor>
                  value={field.value}
                  options={ROLE_COLORS.map((color) => ({
                    value: color,
                    label: ROLE_COLOR_LABELS[color],
                    swatchClassName: ROLE_COLOR_SWATCH_CLASSES[color],
                    textClassName: ROLE_COLOR_TEXT_CLASSES[color],
                  }))}
                  onValueChange={field.onChange}
                />
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

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<RoleFormValues>;
  onSubmit: (values: RoleFormValues) => void;
  title?: string;
  isCreating?: boolean;
  isSaving?: boolean;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  title,
  isCreating = true,
  isSaving = false,
}: RoleFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
          <DialogTitle>{title ?? 'Vai trò'}</DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <RoleForm
            form={form}
            onSubmit={onSubmit}
            id="role-form"
            isCreating={isCreating}
          />
        </div>

        <Separator />

        <DialogFooter className="shrink-0 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            form="role-form"
            loading={isSaving}
            loadingText="Đang lưu..."
          >
            Lưu thông tin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
