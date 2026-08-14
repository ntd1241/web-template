import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const DEFAULT_TAG_COLOR = '#64748b';

const tagVariants = cva(
  'inline-flex items-center justify-center border font-medium leading-none focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      size: {
        lg: 'h-7 min-w-7 gap-1.5 rounded-md px-[0.5rem] text-xs',
        md: 'h-6 min-w-6 gap-1.5 rounded-md px-[0.45rem] text-xs',
        sm: 'h-5 min-w-5 gap-1 rounded-sm px-[0.325rem] text-[0.6875rem]',
        xs: 'h-4 min-w-4 gap-1 rounded-sm px-[0.25rem] text-[0.625rem]',
      },
      shape: {
        default: '',
        circle: 'rounded-full',
      },
    },
    defaultVariants: {
      size: 'md',
      shape: 'default',
    },
  },
);

function normalizeTagColor(color?: string | null) {
  return /^#[0-9a-f]{6}$/i.test(color ?? '') ? color! : DEFAULT_TAG_COLOR;
}

function toRgba(hex: string, alpha: number) {
  const value = hex.slice(1);
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export interface TagProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {
  color?: string | null;
}

function Tag({ className, color, size, shape, style, ...props }: TagProps) {
  const tagColor = normalizeTagColor(color);

  return (
    <span
      data-slot="tag"
      className={cn(tagVariants({ size, shape }), className)}
      style={{
        ...style,
        color: tagColor,
        borderColor: toRgba(tagColor, 0.45),
        backgroundColor: toRgba(tagColor, 0.1),
      }}
      {...props}
    />
  );
}

export { Tag, tagVariants };
