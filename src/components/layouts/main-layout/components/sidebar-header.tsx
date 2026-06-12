import { Blocks } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SidebarHeader() {
  return (
    <Link
      to="/"
      className="flex h-16 shrink-0 items-center gap-2.5 border-b border-admin-neutral-100 px-4"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-admin-primary-bg text-admin-primary">
        <Blocks className="size-5" />
      </span>
      <span className="text-[17px] font-bold tracking-tight text-admin-neutral-800">
        Admin Template
      </span>
    </Link>
  );
}
