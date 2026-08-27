import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './badge';

export interface StatusStatItem<TFilter extends string = string> {
  key: string;
  label: ReactNode;
  filterValue: TFilter | null;
  className?: string;
}

export interface StatusStatsProps<TFilter extends string = string> {
  items: readonly StatusStatItem<TFilter>[];
  counts?: Partial<Record<string, number>>;
  activeFilters?: readonly TFilter[];
  isLoading?: boolean;
  onFilterChange: (filter: TFilter | null) => void;
  className?: string;
  ariaLabel?: string;
}

export function StatusStats<TFilter extends string = string>({
  items,
  counts,
  activeFilters = [],
  isLoading = false,
  onFilterChange,
  className,
  ariaLabel = 'Bộ lọc trạng thái',
}: StatusStatsProps<TFilter>) {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-2.5', className)}
      aria-label={ariaLabel}
    >
      {items.map((item, index) => {
        const isActive =
          item.filterValue === null
            ? activeFilters.length === 0
            : activeFilters.length === 1 &&
              activeFilters[0] === item.filterValue;

        return (
          <div key={item.key} className="flex items-center gap-2.5">
            {index > 0 ? <span className="h-5 w-px bg-border" /> : null}
            <Badge asChild variant="secondary" size="lg">
              <button
                type="button"
                className={cn(
                  'gap-2 rounded-lg border-transparent px-3 transition-shadow hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring',
                  item.className,
                )}
                aria-label={`Lọc: ${typeof item.label === 'string' ? item.label : item.key}`}
                aria-pressed={isActive}
                onClick={() => onFilterChange(item.filterValue)}
              >
                <span>{item.label}</span>
                <span className="font-bold tabular-nums">
                  {isLoading ? '—' : (counts?.[item.key] ?? '—')}
                </span>
              </button>
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
