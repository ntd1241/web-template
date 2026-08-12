import { Blocks } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLayout } from './context';

export function SidebarHeader() {
  const { shell } = useLayout();

  return (
    <Link
      to={shell.homePath}
      className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-4"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-primary">
        <Blocks className="size-5" />
      </span>
      <span className="text-lg font-bold tracking-tight text-foreground">
        {shell.brandName}
      </span>
    </Link>
  );
}
