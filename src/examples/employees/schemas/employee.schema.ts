import { z } from 'zod';
import { EMPLOYEE_ROLES, EMPLOYEE_STATUSES } from '../model/employee';

/** Schema tạo/sửa nhân viên — validate tiếng Việt (docs/01 §8). */
export const employeeFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Họ tên không được để trống')
    .max(100, 'Họ tên tối đa 100 ký tự'),
  username: z
    .string()
    .min(3, 'Tên đăng nhập tối thiểu 3 ký tự')
    .regex(/^[a-z0-9_]+$/, 'Chỉ gồm chữ thường, số và dấu gạch dưới'),
  roles: z.array(z.enum(EMPLOYEE_ROLES)).min(1, 'Chọn ít nhất một vai trò'),
  status: z.enum(EMPLOYEE_STATUSES),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
