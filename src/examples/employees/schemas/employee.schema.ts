import { z } from 'zod';
import { vRequiredEnum, vString } from '@/lib/validation';
import { EMPLOYEE_ROLES, EMPLOYEE_STATUSES } from '../model/employee';

/** Schema tạo/sửa nhân viên — validate tiếng Việt (docs/01 §8). */
export const employeeFormSchema = z.object({
  name: vString({ min: 1, max: 100 }),
  username: vString({ min: 3, pattern: /^[a-z0-9_]+$/ }),
  roles: vRequiredEnum(EMPLOYEE_ROLES),
  status: z.enum(EMPLOYEE_STATUSES),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;
