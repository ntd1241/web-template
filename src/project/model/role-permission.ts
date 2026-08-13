export const PERMISSION_TAGS = ['Xem', 'Chỉnh sửa', 'Xóa', 'Duyệt'] as const;

export type PermissionTag = (typeof PERMISSION_TAGS)[number];
export type SummaryState = 'all' | 'partial' | 'none' | 'na';

export interface RoleSummary {
  id: string;
  name: string;
  description: string;
  userCount: number;
}

export interface PermissionItem {
  code: string;
  name: string;
  description?: string;
  selected: boolean;
  tags: PermissionTag[];
  sensitive?: boolean;
}

export interface PermissionGroup {
  name: string;
  permissions: PermissionItem[];
}

export interface PermissionModule {
  code: string;
  name: string;
  description: string;
  groups: PermissionGroup[];
}

export const ROLE_SUMMARIES: RoleSummary[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Toàn quyền vận hành hệ thống',
    userCount: 12,
  },
  {
    id: 'manager',
    name: 'Quản lý',
    description: 'Quản lý nghiệp vụ và duyệt thao tác quan trọng',
    userCount: 8,
  },
  {
    id: 'employee',
    name: 'Nhân viên',
    description: 'Thao tác nghiệp vụ hằng ngày',
    userCount: 24,
  },
  {
    id: 'accountant',
    name: 'Kế toán',
    description: 'Theo dõi đơn hàng, báo cáo và công nợ',
    userCount: 5,
  },
];

export const INITIAL_PERMISSION_MODULES: PermissionModule[] = [
  {
    code: 'employees',
    name: 'Nhân viên',
    description: 'Quản lý hồ sơ nhân sự, tài khoản và thông tin nội bộ',
    groups: [
      {
        name: 'Tài khoản',
        permissions: [
          {
            code: 'employees:account:view',
            name: 'Xem danh sách tài khoản',
            selected: true,
            tags: ['Xem'],
          },
          {
            code: 'employees:account:edit',
            name: 'Tạo / chỉnh sửa tài khoản',
            selected: true,
            tags: ['Chỉnh sửa'],
          },
          {
            code: 'employees:account:lock',
            name: 'Khóa / mở khóa tài khoản',
            selected: true,
            tags: ['Chỉnh sửa'],
            sensitive: true,
          },
          {
            code: 'employees:account:reset-password',
            name: 'Đặt lại mật khẩu',
            selected: false,
            tags: ['Chỉnh sửa'],
            sensitive: true,
          },
          {
            code: 'employees:account:delete',
            name: 'Xóa tài khoản',
            selected: false,
            tags: ['Xóa'],
            sensitive: true,
          },
        ],
      },
      {
        name: 'Hồ sơ nhân viên',
        permissions: [
          {
            code: 'employees:profile:view',
            name: 'Xem hồ sơ nhân viên',
            selected: true,
            tags: ['Xem'],
          },
          {
            code: 'employees:compensation:view',
            name: 'Xem lương / phụ cấp',
            selected: false,
            tags: ['Xem'],
            sensitive: true,
          },
          {
            code: 'employees:profile:edit',
            name: 'Chỉnh sửa phòng ban / chức vụ',
            selected: true,
            tags: ['Chỉnh sửa'],
          },
        ],
      },
    ],
  },
  {
    code: 'orders',
    name: 'Đơn hàng',
    description: 'Bán hàng, trạng thái giao hàng, hoàn tiền và chiết khấu',
    groups: [
      {
        name: 'Vận hành đơn',
        permissions: [
          {
            code: 'orders:view',
            name: 'Xem đơn hàng',
            selected: true,
            tags: ['Xem'],
          },
          {
            code: 'orders:edit',
            name: 'Tạo / chỉnh sửa đơn hàng',
            selected: true,
            tags: ['Chỉnh sửa'],
          },
          {
            code: 'orders:approve',
            name: 'Duyệt đơn hàng',
            selected: true,
            tags: ['Duyệt'],
          },
          {
            code: 'orders:cancel',
            name: 'Hủy đơn hàng',
            selected: true,
            tags: ['Xóa', 'Duyệt'],
            sensitive: true,
          },
          {
            code: 'orders:refund',
            name: 'Hoàn tiền',
            selected: false,
            tags: ['Duyệt'],
            sensitive: true,
          },
          {
            code: 'orders:shipping-status',
            name: 'Đổi trạng thái giao hàng',
            selected: true,
            tags: ['Chỉnh sửa'],
          },
        ],
      },
      {
        name: 'Giá & chiết khấu',
        permissions: [
          {
            code: 'orders:discount:override',
            name: 'Áp dụng chiết khấu vượt hạn mức',
            selected: false,
            tags: ['Duyệt'],
          },
          {
            code: 'orders:price:edit-after-confirm',
            name: 'Sửa giá sau khi xác nhận',
            selected: false,
            tags: ['Chỉnh sửa'],
            sensitive: true,
          },
        ],
      },
    ],
  },
  {
    code: 'warehouse',
    name: 'Kho',
    description: 'Nhập xuất, kiểm kê, điều chỉnh tồn và chốt phiếu kho',
    groups: [
      {
        name: 'Phiếu kho',
        permissions: [
          {
            code: 'warehouse:stock:view',
            name: 'Xem tồn kho',
            selected: true,
            tags: ['Xem'],
          },
          {
            code: 'warehouse:import:edit',
            name: 'Tạo phiếu nhập kho',
            selected: true,
            tags: ['Chỉnh sửa'],
          },
          {
            code: 'warehouse:export:edit',
            name: 'Tạo phiếu xuất kho',
            selected: true,
            tags: ['Chỉnh sửa'],
          },
          {
            code: 'warehouse:voucher:approve',
            name: 'Duyệt phiếu kho',
            selected: false,
            tags: ['Duyệt'],
          },
        ],
      },
      {
        name: 'Kiểm kê',
        permissions: [
          {
            code: 'warehouse:inventory:adjust',
            name: 'Điều chỉnh tồn kho',
            selected: false,
            tags: ['Chỉnh sửa'],
            sensitive: true,
          },
          {
            code: 'warehouse:inventory:close',
            name: 'Chốt kiểm kê',
            selected: false,
            tags: ['Duyệt'],
            sensitive: true,
          },
        ],
      },
    ],
  },
  {
    code: 'reports',
    name: 'Báo cáo',
    description: 'Xem và xuất file theo đúng phạm vi dữ liệu được cấp',
    groups: [
      {
        name: 'Loại báo cáo',
        permissions: [
          {
            code: 'reports:revenue:view',
            name: 'Xem / xuất báo cáo doanh thu',
            selected: true,
            tags: ['Xem'],
          },
          {
            code: 'reports:inventory:view',
            name: 'Xem / xuất báo cáo tồn kho',
            selected: true,
            tags: ['Xem'],
          },
          {
            code: 'reports:debt:view',
            name: 'Xem / xuất báo cáo công nợ',
            selected: false,
            tags: ['Xem'],
            sensitive: true,
          },
        ],
      },
      {
        name: 'Dữ liệu nhạy cảm',
        permissions: [
          {
            code: 'reports:gross-profit:view',
            name: 'Xem / xuất lợi nhuận gộp',
            selected: false,
            tags: ['Xem'],
            sensitive: true,
          },
          {
            code: 'reports:raw-data:view',
            name: 'Xem / xuất dữ liệu thô',
            selected: false,
            tags: ['Xem'],
            sensitive: true,
          },
        ],
      },
    ],
  },
  {
    code: 'system',
    name: 'Hệ thống',
    description: 'Cài đặt hệ thống, vai trò, phân quyền và nhật ký bảo mật',
    groups: [
      {
        name: 'Vai trò & phân quyền',
        permissions: [
          {
            code: 'system:roles:view',
            name: 'Xem vai trò',
            selected: true,
            tags: ['Xem'],
          },
          {
            code: 'system:roles:edit',
            name: 'Tạo / chỉnh sửa vai trò',
            selected: true,
            tags: ['Chỉnh sửa'],
            sensitive: true,
          },
          {
            code: 'system:roles:permissions-edit',
            name: 'Chỉnh sửa quyền của vai trò',
            selected: false,
            tags: ['Chỉnh sửa', 'Duyệt'],
            sensitive: true,
          },
          {
            code: 'system:roles:delete',
            name: 'Xóa vai trò',
            selected: false,
            tags: ['Xóa'],
            sensitive: true,
          },
          {
            code: 'system:roles:copy',
            name: 'Sao chép vai trò',
            selected: true,
            tags: ['Chỉnh sửa'],
          },
        ],
      },
      {
        name: 'Cài đặt hệ thống',
        permissions: [
          {
            code: 'system:settings:view',
            name: 'Xem cài đặt hệ thống',
            selected: true,
            tags: ['Xem'],
          },
          {
            code: 'system:settings:edit',
            name: 'Chỉnh sửa cài đặt hệ thống',
            selected: false,
            tags: ['Chỉnh sửa'],
            sensitive: true,
          },
          {
            code: 'system:security-config:edit',
            name: 'Quản lý cấu hình bảo mật',
            selected: false,
            tags: ['Chỉnh sửa', 'Duyệt'],
            sensitive: true,
          },
          {
            code: 'system:audit-log:view',
            name: 'Xem nhật ký hệ thống',
            selected: true,
            tags: ['Xem'],
          },
        ],
      },
    ],
  },
];

export function clonePermissionModules(): PermissionModule[] {
  return structuredClone(INITIAL_PERMISSION_MODULES);
}

export function getModulePermissions(module: PermissionModule) {
  return module.groups.flatMap((group) => group.permissions);
}

export function getTagSummary(
  module: PermissionModule,
  tag: PermissionTag,
): SummaryState {
  const taggedPermissions = getModulePermissions(module).filter((permission) =>
    permission.tags.includes(tag),
  );

  if (taggedPermissions.length === 0) {
    return 'na';
  }

  const selectedCount = taggedPermissions.filter(
    (permission) => permission.selected,
  ).length;

  if (selectedCount === taggedPermissions.length) {
    return 'all';
  }

  if (selectedCount > 0) {
    return 'partial';
  }

  return 'none';
}

export function countPermissions(module: PermissionModule) {
  const permissions = getModulePermissions(module);
  const selected = permissions.filter((permission) => permission.selected);
  const sensitive = permissions.filter((permission) => permission.sensitive);

  return {
    selected: selected.length,
    total: permissions.length,
    sensitiveSelected: selected.filter((permission) => permission.sensitive)
      .length,
    sensitiveTotal: sensitive.length,
  };
}
