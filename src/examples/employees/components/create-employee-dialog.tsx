import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import {
  createEmployeeFormSchema,
  EMPLOYEE_DEPARTMENTS,
  type CreateEmployeeFormValues,
} from '../schemas/employee-create.schema';
import { CreateEmployeeFields } from './create-employee-fields';

const defaultValues: CreateEmployeeFormValues = {
  fullName: '',
  username: '',
  email: '',
  phone: '',
  department: EMPLOYEE_DEPARTMENTS[0],
  roles: [],
  status: 'active',
  startDate: new Date(),
  bio: '',
  skills: [],
  sendInvite: true,
  canLoginNow: false,
};

interface CreateEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog "Tạo nhân viên mới" — header + footer cố định, thân cuộn (ScrollArea).
 * Demo đầy đủ các kiểu trường form, submit mô phỏng (mock) bằng setTimeout.
 */
export function CreateEmployeeDialog({
  open,
  onOpenChange,
}: CreateEmployeeDialogProps) {
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(createEmployeeFormSchema),
    defaultValues,
  });

  const handleClose = (next: boolean) => {
    if (isSubmitting) {
      return;
    }
    if (!next) {
      form.reset(defaultValues);
      setAvatar(null);
    }
    onOpenChange(next);
  };

  const handleSubmit = (values: CreateEmployeeFormValues) => {
    setIsSubmitting(true);
    // Mock-first: giả lập gọi API tạo nhân viên.
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`Đã tạo nhân viên "${values.fullName}"`);
      form.reset(defaultValues);
      setAvatar(null);
      onOpenChange(false);
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="flex size-8 items-center justify-center rounded-lg bg-admin-primary-bg text-admin-primary-dark">
              <UserPlus className="size-4" />
            </span>
            Tạo nhân viên mới
          </DialogTitle>
          <DialogDescription>
            Thiết lập tài khoản và thông tin nhân viên để bắt đầu phân quyền
            truy cập hệ thống.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              <CreateEmployeeFields
                avatar={avatar}
                onAvatarChange={setAvatar}
              />
            </div>

            <Separator />

            <DialogFooter className="shrink-0 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                loadingText="Đang lưu"
              >
                <Save />
                Lưu nhân viên
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
