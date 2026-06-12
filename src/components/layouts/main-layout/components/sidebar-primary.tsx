import {
  BarChart3,
  CircleHelp,
  Home,
  Leaf,
  Settings,
  Sprout,
  Users,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const railItems = [
  { icon: Home, label: 'Tổng quan', path: '/' },
  { icon: Users, label: 'Nhân sự', path: '/' },
  { icon: Sprout, label: 'Vùng sản xuất', path: '/' },
  { icon: BarChart3, label: 'Báo cáo', path: '/' },
  { icon: Settings, label: 'Cài đặt', path: '/' },
];

export function SidebarPrimary() {
  const { pathname } = useLocation();

  return (
    <div className="flex w-(--sidebar-collapsed-width) shrink-0 flex-col items-center bg-agribase-grey-900 py-4 text-white">
      <Link
        to="/"
        className="mb-6 flex size-8 items-center justify-center rounded-lg bg-white text-agribase-primary shadow-sm"
        aria-label="AgriBase"
      >
        <Leaf className="size-5" />
      </Link>

      <nav className="flex flex-1 flex-col items-center gap-2">
        {railItems.map((item) => {
          const active = pathname === item.path && item.label === 'Nhân sự';
          const Icon = item.icon;

          return (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Link
                  to={item.path}
                  aria-label={item.label}
                  className={cn(
                    'flex size-10 items-center justify-center rounded-lg text-white/55 transition-colors hover:bg-white/10 hover:text-white',
                    active &&
                      'bg-agribase-primary text-white shadow-sm hover:bg-agribase-primary',
                  )}
                >
                  <Icon className="size-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="flex size-10 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Trợ giúp"
            type="button"
          >
            <CircleHelp className="size-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">Trợ giúp</TooltipContent>
      </Tooltip>
    </div>
  );
}
