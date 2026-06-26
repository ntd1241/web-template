import { ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InspectionTable } from '../../model/inspection-table';

interface InspectionTableListProps {
  tables: InspectionTable[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function InspectionTableList({
  tables,
  selectedId,
  onSelect,
}: InspectionTableListProps) {
  if (tables.length === 0) {
    return (
      <div className="rounded-admin-control border border-dashed border-border p-4 text-sm text-muted-foreground">
        Chưa có bảng kiểm định nào.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {tables.map((table) => {
        const isSelected = table.id === selectedId;

        return (
          <li key={table.id}>
            <button
              type="button"
              className={cn(
                'flex w-full items-center gap-2 rounded-admin-control px-3 py-2 text-start text-sm hover:bg-admin-surface-alt',
                isSelected && 'bg-admin-surface-alt',
              )}
              onClick={() => onSelect(table.id)}
            >
              <ClipboardCheck className="size-4 shrink-0 text-admin-blue-dark" />
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block truncate',
                    isSelected
                      ? 'font-medium text-foreground'
                      : 'text-foreground',
                  )}
                >
                  {table.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {table.code}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-admin-surface-alt px-2 py-0.5 text-xs text-muted-foreground">
                {table.criteria.length}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
