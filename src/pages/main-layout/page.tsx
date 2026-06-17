import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Employee {
  initials: string;
  name: string;
  username: string;
  roles: Array<'Nhân viên' | 'Chủ sở hữu' | 'Quản lý'>;
  avatar: 'slate' | 'amber' | 'red' | 'green' | 'brown' | 'lime';
}

const employees: Employee[] = [
  {
    initials: 'M',
    name: 'Mẫn Minh',
    username: 'manminhn',
    roles: ['Nhân viên'],
    avatar: 'slate',
  },
  {
    initials: 'T',
    name: 'Thanh Hiếu',
    username: 'thanhhieu',
    roles: ['Nhân viên'],
    avatar: 'amber',
  },
  {
    initials: 'T',
    name: 'Trần Thanh Huy',
    username: 'tranthanhhuy',
    roles: ['Nhân viên'],
    avatar: 'red',
  },
  {
    initials: 'M',
    name: 'Minh Nguyệt Mẫn',
    username: 'minhnguyetman',
    roles: ['Chủ sở hữu', 'Quản lý'],
    avatar: 'green',
  },
  {
    initials: 'Đ',
    name: 'Đỗ Trần Minh Chu',
    username: 'dotranminhchu',
    roles: ['Chủ sở hữu', 'Quản lý'],
    avatar: 'amber',
  },
  {
    initials: 'H',
    name: 'HTX Xanh Cao Nguyên',
    username: 'htxxanhcaonguyen',
    roles: ['Nhân viên'],
    avatar: 'brown',
  },
  {
    initials: 'H',
    name: 'Huỳnh Minh Chỉnh',
    username: 'huynhminhchinh',
    roles: ['Nhân viên'],
    avatar: 'slate',
  },
  {
    initials: 'M',
    name: 'Minh Đức Uy',
    username: 'minhducuy',
    roles: ['Chủ sở hữu', 'Quản lý'],
    avatar: 'brown',
  },
  {
    initials: 'T',
    name: 'Trương Tài',
    username: 'truongtai',
    roles: ['Nhân viên'],
    avatar: 'lime',
  },
];

const avatarClasses: Record<Employee['avatar'], string> = {
  slate: 'from-[#ecf0f1] to-[#90a4ae] border-[#b0bec5] text-[#455a64]',
  amber: 'from-[#fff3e0] to-[#ffb74d] border-[#ffcc80] text-[#f57c00]',
  red: 'from-[#fbe9e7] to-[#ff8a65] border-[#ffab91] text-[#e64a19]',
  green: 'from-[#e8f5e9] to-[#81c784] border-[#a5d6a7] text-[#388e3c]',
  brown: 'from-[#efebe9] to-[#a1887f] border-[#d7ccc8] text-[#5d4037]',
  lime: 'from-[#fbfce7] to-[#dce775] border-[#e6ee9c] text-[#827717]',
};

const roleClasses: Record<Employee['roles'][number], string> = {
  'Nhân viên': 'border-admin-blue-light bg-secondary text-secondary-foreground',
  'Chủ sở hữu': 'border-admin-red-light bg-admin-red-bg text-admin-red-dark',
  'Quản lý': 'border-[#ddd6ff] bg-admin-violet-bg text-admin-violet-dark',
};

function EmployeeCell({ employee }: { employee: Employee }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full border bg-gradient-to-br text-[14px] font-bold shadow-sm',
          avatarClasses[employee.avatar],
        )}
      >
        {employee.initials}
      </div>
      <div className="min-w-0">
        <div className="truncate text-[14px] font-semibold leading-5 text-admin-blue-darkest">
          {employee.name}
        </div>
        <div className="mt-0.5 truncate text-[12px] leading-4 text-admin-blue-muted">
          {employee.username}
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: Employee['roles'][number] }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-medium',
        roleClasses[role],
      )}
    >
      {role}
    </span>
  );
}

function StatusBadge() {
  return (
    <span className="inline-flex items-center justify-center gap-1.5 rounded-md bg-admin-success-bg px-2.5 py-1 text-[12px] font-medium text-admin-success-text">
      <span className="size-1.5 rounded-full bg-admin-success-dot" />
      Hoạt động
    </span>
  );
}

export function MainLayoutPage() {
  return (
    <div className="flex h-full min-h-0 flex-col p-6">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-admin-card border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex shrink-0 flex-col gap-4 border-b border-border bg-card p-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-[18px] font-bold leading-6 text-zinc-900">
              Danh sách nhân viên
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
              Quản lý tài khoản truy cập hệ thống
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="relative block">
              <span className="sr-only">Tìm kiếm nhân viên</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-neutral-400" />
              <input
                className="h-9 w-64 rounded-admin-control border border-border bg-field px-3 pl-9 text-[13px] text-foreground outline-none transition-[border-color,box-shadow,background] placeholder:text-admin-neutral-400 focus:border-[#1677ff] focus:bg-white focus:shadow-[0_0_0_2px_rgba(22,119,255,0.20)]"
                placeholder="Tìm kiếm theo trường"
                type="search"
              />
            </label>

            <button
              className="flex size-9 items-center justify-center rounded-admin-control border border-border bg-white text-admin-neutral-600 shadow-sm transition-colors hover:bg-field"
              type="button"
              aria-label="Lọc danh sách"
            >
              <Filter className="size-4" />
            </button>

            <button
              className="flex size-9 items-center justify-center rounded-admin-control border border-border bg-white text-admin-neutral-600 shadow-sm transition-colors hover:bg-field"
              type="button"
              aria-label="Làm mới danh sách"
            >
              <RefreshCw className="size-4" />
            </button>

            <button
              className="inline-flex h-9 items-center gap-2 rounded-admin-control bg-[#1677ff] px-4 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-[#0e5cd6]"
              type="button"
            >
              <Plus className="size-4" />
              Cấp tài khoản
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead className="sticky top-0 z-10 border-b border-border bg-muted">
              <tr>
                <th className="w-[36%] px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-secondary-foreground">
                  Nhân viên
                </th>
                <th className="w-[30%] px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-secondary-foreground">
                  Vai trò
                </th>
                <th className="w-[18%] px-6 py-3 text-center text-[12px] font-semibold uppercase tracking-[0.06em] text-secondary-foreground">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-[12px] font-semibold uppercase tracking-[0.06em] text-secondary-foreground">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-neutral-100 bg-white">
              {employees.map((employee) => (
                <tr
                  key={employee.username}
                  className="group transition-colors hover:bg-field focus-within:bg-field"
                >
                  <td className="px-6 py-3.5">
                    <EmployeeCell employee={employee} />
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {employee.roles.map((role) => (
                        <RoleBadge key={role} role={role} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <StatusBadge />
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    {employee.roles.includes('Chủ sở hữu') ? (
                      <span className="text-[12px] text-admin-neutral-400">
                        -
                      </span>
                    ) : (
                      <button
                        className="inline-flex items-center gap-1.5 rounded-lg border border-admin-blue-border bg-secondary px-3 py-1.5 text-[12px] font-medium text-admin-blue-primary opacity-0 transition-[background,opacity] hover:bg-[#e8f3fb] focus:opacity-100 group-hover:opacity-100"
                        type="button"
                      >
                        <ShieldCheck className="size-3.5" />
                        Phân quyền
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="flex shrink-0 items-center justify-between border-t border-border bg-white p-4 text-[13px] text-admin-neutral-600">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex h-8 items-center gap-2 rounded-admin-control border border-border bg-field px-3 text-[13px] font-medium text-admin-neutral-700 hover:bg-white"
              type="button"
            >
              10 dòng
              <ChevronDown className="size-4 text-admin-neutral-400" />
            </button>
            <span>9 kết quả</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              className="flex size-8 items-center justify-center rounded-admin-control bg-muted text-admin-neutral-400 transition-colors hover:bg-admin-neutral-50"
              type="button"
              aria-label="Trang trước"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              className="flex size-8 items-center justify-center rounded-admin-control bg-admin-neutral-600 text-[13px] font-medium text-white shadow-sm"
              type="button"
              aria-label="Trang 1"
            >
              1
            </button>
            <button
              className="flex size-8 items-center justify-center rounded-admin-control bg-muted text-admin-neutral-400 transition-colors hover:bg-admin-neutral-50"
              type="button"
              aria-label="Trang sau"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
