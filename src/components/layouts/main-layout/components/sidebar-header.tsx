import { Link } from 'react-router-dom';
import { useLayout } from './context';

export function SidebarHeader() {
  const { shell } = useLayout();

  return (
    <Link
      to={shell.homePath}
      className="flex h-(--header-height-mobile) shrink-0 items-center border-b border-border px-4 lg:h-(--header-height)"
    >
      <span className="min-w-0 leading-[0.9]">
        <span className="block bg-gradient-to-r from-red-600 via-rose-500 to-red-800 bg-clip-text font-admin-display text-[1.65rem] font-black uppercase tracking-[0.06em] text-transparent">
          VACOM
        </span>
        <span className="mt-1 block whitespace-nowrap font-admin-display text-[0.72rem] font-bold uppercase tracking-[0.1em] text-black">
          KẾ TOÁN DỊCH VỤ
        </span>
      </span>
    </Link>
  );
}
