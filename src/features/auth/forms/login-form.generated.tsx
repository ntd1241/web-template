/**
 * Scaffolded by form-builder from `src/features/auth/forms/login.form.fixture.ts`. Run `npm run gen:form` — do NOT hand-write this file.
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
import { loginFormSchema, type LoginFormValues } from './login-form.schema';

export const loginDefaultValues: LoginFormValues = {
  identifier: '',
  password: '',
};

// TODO(scaffold): replace with the real entity type used for edit-mode mapping.
type LoginFormSource = unknown;

export function useLoginForm(
  options?: Omit<UseFormProps<LoginFormValues>, 'resolver'>,
) {
  return useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: loginDefaultValues,
    ...options,
  });
}

export function mapLoginToFormValues(entity: LoginFormSource): LoginFormValues {
  // TODO(scaffold): map entity → form values for edit mode.
  void entity;
  return loginDefaultValues;
}

interface LoginFormProps {
  form: UseFormReturn<LoginFormValues>;
  onSubmit: (values: LoginFormValues) => void;
  id?: string;
}

export function LoginForm({
  form,
  onSubmit,
  id = 'login-form',
}: LoginFormProps) {
  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12">
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>
                  Tài khoản hoặc email
                  <span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="admin hoặc email của bạn"
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
            name="password"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel>
                  Mật khẩu<span className="text-destructive"> *</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Nhập mật khẩu"
                    variant="md"
                    {...field}
                  />
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

interface LoginFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<LoginFormValues>;
  onSubmit: (values: LoginFormValues) => void;
  title?: string;
}

export function LoginFormDialog({
  open,
  onOpenChange,
  form,
  onSubmit,
  title,
}: LoginFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
          <DialogTitle>{title ?? 'Đăng nhập'}</DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <LoginForm form={form} onSubmit={onSubmit} id="login-form" />
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
          <Button type="submit" variant="primary" form="login-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
