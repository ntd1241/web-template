import type { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ShortcutTooltipProps {
  children: ReactNode;
  label: string;
  shortcut: string;
  variant?: 'light' | 'dark' | 'destructive' | 'warning';
}

export function ShortcutKey({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-current/25 px-1.5 py-0.5 font-mono text-[0.6875rem] opacity-80">
      {children}
    </kbd>
  );
}

export function ShortcutTooltip({
  children,
  label,
  shortcut,
  variant,
}: ShortcutTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent variant={variant}>
        <span className="inline-flex items-center gap-2">
          <span>{label}</span>
          <ShortcutKey>{shortcut}</ShortcutKey>
        </span>
      </TooltipContent>
    </Tooltip>
  );
}
