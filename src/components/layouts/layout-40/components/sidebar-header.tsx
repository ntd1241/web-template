import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SidebarHeader() {
  return (
    <Link to="/layout-40" className="flex h-16 shrink-0 items-center gap-2.5 border-b border-agribase-grey-100 px-4">
      <span className="flex size-8 items-center justify-center rounded-lg bg-agribase-primary-bg text-agribase-primary">
        <Leaf className="size-5" />
      </span>
      <span className="text-[17px] font-bold tracking-tight text-agribase-grey-800">AgriBase</span>
    </Link>
  );
}
