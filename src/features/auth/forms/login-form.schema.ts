import { z } from 'zod';

export const loginFormSchema = z.object({
  identifier: z.string().trim().min(1, 'Vui lòng nhập tài khoản.'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
