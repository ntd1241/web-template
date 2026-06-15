/**
 * Domain model cho feature Nhân viên.
 * Quy ước: union type cho trạng thái cố định + Record để map nhãn tiếng Việt (docs/01 §3.2).
 */

export const EMPLOYEE_ROLES = ['nhan-vien', 'quan-ly', 'chu-so-huu'] as const;
export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

export const EMPLOYEE_STATUSES = ['active', 'locked'] as const;
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export type AvatarTone = 'slate' | 'amber' | 'red' | 'green' | 'brown' | 'lime';

export interface Employee {
  id: string;
  name: string;
  username: string;
  roles: EmployeeRole[];
  status: EmployeeStatus;
  avatarTone: AvatarTone;
}

export const EMPLOYEE_ROLE_LABELS: Record<EmployeeRole, string> = {
  'nhan-vien': 'Nhân viên',
  'quan-ly': 'Quản lý',
  'chu-so-huu': 'Chủ sở hữu',
};

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'Hoạt động',
  locked: 'Đã khóa',
};

/** Tham số lọc/phân trang gửi lên API. */
export interface EmployeeListParams {
  keyword?: string;
  page: number;
  pageSize: number;
}
