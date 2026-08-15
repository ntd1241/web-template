import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputSelectProps extends HTMLAttributes<HTMLDivElement> {
  input: ReactNode;
  select: ReactNode;
}

export function InputSelect({
  input,
  select,
  className,
  ...props
}: InputSelectProps) {
  return (
    <div
      data-slot="input-select"
      className={cn(
        'flex min-h-8.5 w-full items-stretch overflow-hidden rounded-md border border-input bg-field shadow-xs shadow-black/5 transition-[color,border-color,box-shadow,background-color] duration-200 ease-out has-[:focus-visible]:border-ring has-[:focus-visible]:bg-background has-[:focus-visible]:outline-none has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/30',
        '[&_[data-slot=input]]:h-full [&_[data-slot=input]]:rounded-none [&_[data-slot=input]]:border-0 [&_[data-slot=input]]:bg-transparent [&_[data-slot=input]]:shadow-none [&_[data-slot=input]]:focus-visible:border-transparent [&_[data-slot=input]]:focus-visible:bg-transparent [&_[data-slot=input]]:focus-visible:ring-0',
        '[&_[data-slot=select-trigger]]:h-full [&_[data-slot=select-trigger]]:rounded-none [&_[data-slot=select-trigger]]:border-0 [&_[data-slot=select-trigger]]:bg-transparent [&_[data-slot=select-trigger]]:shadow-none [&_[data-slot=select-trigger]]:hover:bg-accent [&_[data-slot=select-trigger]]:data-[state=open]:bg-accent',
        className,
      )}
      {...props}
    >
      <div className="min-w-0 flex-1">{input}</div>
      <div className="shrink-0 border-s border-input">{select}</div>
    </div>
  );
}
