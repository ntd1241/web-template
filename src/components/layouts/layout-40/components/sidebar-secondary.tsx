import {
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  LayoutDashboard,
  MapPinned,
  PackageCheck,
  Settings2,
  UserRound,
  Users,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarHeader } from './sidebar-header';

const menuGroups = [
  {
    title: 'Tổng quan',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/layout-40' },
      { icon: BarChart3, label: 'Thống kê', path: '/layout-40' },
      { icon: PackageCheck, label: 'Tài chính', path: '/layout-40' },
      { icon: Boxes, label: 'Tổng quan kho', path: '/layout-40' },
    ],
  },
  {
    title: 'Quản trị',
    items: [
      { icon: UserRound, label: 'Hồ sơ cá nhân', path: '/layout-40' },
      { icon: Users, label: 'Nhân sự', path: '/layout-40' },
      { icon: ClipboardList, label: 'Yêu cầu nhân sự', path: '/layout-40' },
      { icon: Building2, label: 'Đối tác', path: '/layout-40' },
    ],
  },
  {
    title: 'Vùng sản xuất',
    items: [
      { icon: Settings2, label: 'Thiết lập đồng bộ', path: '/layout-40' },
      { icon: Users, label: 'Thành viên', path: '/layout-40' },
      { icon: MapPinned, label: 'Điểm sản xuất', path: '/layout-40' },
      { icon: ClipboardList, label: 'QR điểm sản xuất', path: '/layout-40' },
    ],
  },
];

export function SidebarSecondary() {
  const { pathname } = useLocation();

  return (
    <div className="flex w-(--sidebar-menu-width) min-w-0 flex-col bg-agribase-surface">
      <SidebarHeader />
      <ScrollArea className="min-h-0 flex-1">
        <nav className="space-y-6 px-3 py-4">
          {menuGroups.map((group) => (
            <section key={group.title}>
              <h2 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-agribase-grey-500">
                {group.title}
              </h2>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.path && item.label === 'Nhân sự';
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      className={cn(
                        'flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-agribase-azure-text transition-colors hover:bg-agribase-surface-alt hover:text-agribase-primary-dark',
                        active && 'bg-[#dff3df] text-[#267a2b] hover:bg-[#dff3df] hover:text-[#267a2b]',
                      )}
                    >
                      <Icon className="size-4.5 shrink-0 opacity-70" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t border-agribase-grey-100 px-4 py-3 text-[11px] font-medium text-agribase-grey-400">
        v0.0.1
      </div>
    </div>
  );
}
