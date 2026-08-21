import type { ReactNode } from 'react';
import { Check, Circle, CircleAlert, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProcessingStepState = 'idle' | 'processing' | 'success' | 'error';

interface ProcessingStepProps {
  state: ProcessingStepState;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

const stateClassNames: Record<
  ProcessingStepState,
  { icon: string; title: string }
> = {
  idle: {
    icon: 'text-muted-foreground',
    title: 'text-muted-foreground',
  },
  processing: {
    icon: 'text-primary',
    title: 'text-primary',
  },
  success: {
    icon: 'text-[var(--color-success-accent,var(--color-green-600))]',
    title: 'text-[var(--color-success-accent,var(--color-green-600))]',
  },
  error: {
    icon: 'text-destructive',
    title: 'text-destructive',
  },
};

export function ProcessingStep({
  state,
  title,
  description,
  children,
  className,
}: ProcessingStepProps) {
  const colors = stateClassNames[state];

  return (
    <div className={cn('flex gap-4', className)} data-state={state}>
      <div
        className={cn(
          'relative mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-transparent',
          colors.icon,
        )}
        aria-hidden="true"
      >
        {state === 'processing' ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : state === 'success' ? (
          <Check className="size-4" />
        ) : state === 'error' ? (
          <CircleAlert className="size-4" />
        ) : (
          <Circle className="size-3.5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className={cn('font-medium', colors.title)}>{title}</h3>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
        {children ? <div className="pl-6">{children}</div> : null}
      </div>
    </div>
  );
}
