import { FunnelPlus, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { ScrollArea, ScrollBar } from './scroll-area';

export interface SavedViewListItem {
  id: string;
  name: string;
}

export interface SavedViewListProps<
  TView extends SavedViewListItem = SavedViewListItem,
> {
  views: readonly TView[];
  activeViewId: string | null;
  onViewChange: (viewId: string | null) => void;
  onViewSettings?: (view: TView) => void;
  onAdd: () => void;
  canAdd?: boolean;
  allLabel?: string;
  addLabel?: string;
  disabled?: boolean;
  className?: string;
}

/** Shared view chips for list pages. View management actions remain feature-owned. */
export function SavedViewList<TView extends SavedViewListItem>({
  views,
  activeViewId,
  onViewChange,
  onViewSettings,
  onAdd,
  canAdd = true,
  allLabel = 'Tất cả',
  addLabel = 'Thêm view',
  disabled = false,
  className,
}: SavedViewListProps<TView>) {
  return (
    <div
      className={cn('flex min-w-0 max-w-full items-center gap-3', className)}
    >
      {canAdd ? (
        <Button
          type="button"
          variant="outline"
          mode="icon"
          size="md"
          onClick={onAdd}
          disabled={disabled}
          aria-label={addLabel}
          title={addLabel}
          className="shrink-0"
        >
          <FunnelPlus />
        </Button>
      ) : null}
      <ScrollArea
        className="w-0 min-w-0 flex-1"
        viewportClassName="overflow-x-auto"
      >
        <div
          className="flex w-max items-center gap-2"
          role="group"
          aria-label="Chế độ xem"
        >
          <button
            type="button"
            aria-pressed={activeViewId === null}
            disabled={disabled}
            onClick={() => onViewChange(null)}
            className={cn(
              'inline-flex h-8.5 shrink-0 items-center justify-center rounded-full px-3 text-[0.8125rem] font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
              activeViewId === null
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-white text-foreground hover:bg-muted hover:text-foreground dark:bg-card',
            )}
          >
            {allLabel}
          </button>
          {views.map((view) => {
            const isActive = activeViewId === view.id;
            const canEdit = isActive && Boolean(onViewSettings);

            return (
              <div
                key={view.id}
                className={cn(
                  'inline-flex h-8.5 shrink-0 items-center rounded-full',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white text-foreground dark:bg-card',
                )}
              >
                <button
                  type="button"
                  aria-pressed={isActive}
                  disabled={disabled}
                  onClick={() => onViewChange(view.id)}
                  className={cn(
                    'inline-flex h-full min-w-0 items-center justify-center rounded-full px-3 text-[0.8125rem] font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                    canEdit ? 'rounded-e-none pe-2' : '',
                    isActive
                      ? 'hover:bg-primary/90'
                      : 'hover:bg-muted hover:text-foreground',
                  )}
                >
                  <span className="max-w-56 truncate">{view.name}</span>
                </button>
                {canEdit ? (
                  <button
                    type="button"
                    aria-label={`Chỉnh sửa ${view.name}`}
                    title={`Chỉnh sửa ${view.name}`}
                    disabled={disabled}
                    onClick={() => onViewSettings?.(view)}
                    className="inline-flex h-full w-8 items-center justify-center rounded-e-full transition-colors hover:bg-primary/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Settings2 className="size-4" />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
