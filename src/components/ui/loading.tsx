import type { HTMLAttributes, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
}

function LoadingDots() {
  return (
    <span
      aria-hidden="true"
      className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-2"
    >
      <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-300ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-150ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-primary" />
    </span>
  );
}

function DotCircleIndicator() {
  return (
    <span
      data-slot="dot-circle-indicator"
      aria-hidden="true"
      className="relative size-16 animate-spin [animation-duration:1.2s]"
    >
      {Array.from({ length: 12 }, (_, index) => (
        <span
          key={index}
          className="absolute inset-0"
          style={{ transform: `rotate(${index * 30}deg)` }}
        >
          <span
            className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 rounded-full bg-primary"
            style={{ opacity: 0.2 + ((index + 1) / 12) * 0.8 }}
          />
        </span>
      ))}
    </span>
  );
}

/** Large loading state for a card-sized content area. */
function CardLoading({
  className,
  label = 'Đang tải...',
  ...props
}: LoadingProps) {
  return (
    <div
      data-slot="card-loading"
      role="status"
      aria-live="polite"
      className={cn(
        'flex min-h-80 w-full flex-col items-center justify-center gap-5 px-5 py-12 text-sm text-foreground',
        className,
      )}
      {...props}
    >
      <DotCircleIndicator />
      <span className="font-medium">{label}</span>
    </div>
  );
}

/** Compact loading state for a smaller section or dialog body. */
function SectionLoading({
  className,
  label = 'Đang tải...',
  ...props
}: LoadingProps) {
  return (
    <div
      data-slot="section-loading"
      role="status"
      aria-live="polite"
      className={cn(
        'flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg bg-muted/30 px-5 py-8 text-sm text-muted-foreground',
        className,
      )}
      {...props}
    >
      <LoadingDots />
      <span>{label}</span>
    </div>
  );
}

/** Full-area loading state for a page whose main content is not ready yet. */
function PageLoading({
  className,
  label = 'Đang tải trang...',
  ...props
}: LoadingProps) {
  return (
    <div
      data-slot="page-loading"
      role="status"
      aria-live="polite"
      className={cn(
        'flex min-h-[280px] w-full flex-1 items-center justify-center px-6 py-12',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex size-16 items-center justify-center rounded-full bg-primary/10">
          <span
            aria-hidden="true"
            className="absolute inset-1 rounded-full border-2 border-primary/20"
          />
          <LoaderCircle
            aria-hidden="true"
            className="relative size-7 animate-spin text-primary"
          />
        </div>
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
    </div>
  );
}

export { CardLoading, PageLoading, SectionLoading };
