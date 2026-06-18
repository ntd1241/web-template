import { z } from 'zod';
import { vEmail, vPhoneVN, vRequiredEnum, vString } from '@/lib/validation';
import { EMPLOYEE_ROLES, EMPLOYEE_STATUSES } from '../model/employee';

/**
 * Phòng ban — union cố định + nhãn tiếng Việt (docs/01 §3.2).
 * Chỉ phục vụ demo dialog tạo nhân viên.
 */
export const EMPLOYEE_DEPARTMENTS = [
  'ky-thuat',
  'kinh-doanh',
  'nhan-su',
  'ke-toan',
  'van-hanh',
] as const;
export type EmployeeDepartment = (typeof EMPLOYEE_DEPARTMENTS)[number];

export const EMPLOYEE_DEPARTMENT_LABELS: Record<EmployeeDepartment, string> = {
  'ky-thuat': 'Kỹ thuật',
  'kinh-doanh': 'Kinh doanh',
  'nhan-su': 'Nhân sự',
  'ke-toan': 'Kế toán',
  'van-hanh': 'Vận hành',
};

/**
 * Schema cho dialog "Tạo nhân viên mới" — gom đủ kiểu trường để demo:
 * text / email / phone / select / multi-select / date / textarea / tags / checkbox.
 */
export const createEmployeeFormSchema = z.object({
  fullName: vString({ min: 1, max: 100 }),
  username: vString({ min: 3, pattern: /^[a-z0-9_]+$/ }),
  email: vEmail(),
  // Optional: cho phép bỏ trống ('' từ input chưa nhập) hoặc số hợp lệ.
  phone: vPhoneVN({ required: false }).or(z.literal('')),
  department: z.enum(EMPLOYEE_DEPARTMENTS, {
    error: () => 'Vui lòng chọn phòng ban',
  }),
  roles: vRequiredEnum(EMPLOYEE_ROLES),
  status: z.enum(EMPLOYEE_STATUSES),
  startDate: z.date({ error: () => 'Vui lòng chọn ngày vào làm' }),
  bio: vString({ max: 500, required: false }),
  skills: z.array(z.string()).max(10, 'Tối đa 10 kỹ năng'),
  sendInvite: z.boolean(),
  canLoginNow: z.boolean(),
});

export type CreateEmployeeFormValues = z.infer<typeof createEmployeeFormSchema>;
