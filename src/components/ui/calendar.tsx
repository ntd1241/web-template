'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

function Calendar({
  captionLayout = 'dropdown',
  className,
  classNames,
  components,
  endMonth,
  formatters,
  showOutsideDays = true,
  startMonth,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const currentYear = new Date().getFullYear();

  return (
    <DayPicker
      captionLayout={captionLayout}
      endMonth={endMonth ?? new Date(currentYear + 5, 11)}
      formatters={{
        ...formatters,
        formatMonthDropdown: (month) =>
          String(month.getMonth() + 1).padStart(2, '0'),
      }}
      showOutsideDays={showOutsideDays}
      startMonth={startMonth ?? new Date(1970, 0)}
      className={cn('p-3', className)}
      classNames={{
        months: 'relative flex flex-col sm:flex-row gap-4',
        month: 'w-full',
        month_caption:
          'relative mx-10 mb-1 flex h-8 items-center justify-center z-20',
        caption_label: 'sr-only',
        dropdowns: 'flex items-center justify-center gap-1.5',
        dropdown_root: 'relative inline-flex items-center',
        dropdown:
          'h-8 w-16 cursor-pointer appearance-none rounded-md border border-transparent bg-transparent px-2.5 text-center text-sm font-semibold text-foreground outline-none transition-colors hover:bg-accent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30',
        nav: 'absolute top-0 flex w-full justify-between z-10',
        button_previous: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-8 text-muted-foreground/80 hover:text-foreground p-0',
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost' }),
          'size-8 text-muted-foreground/80 hover:text-foreground p-0',
        ),
        weekday: 'size-8 p-0 text-xs font-medium text-muted-foreground/80',
        day_button:
          'cursor-pointer relative flex size-8 items-center justify-center whitespace-nowrap rounded-md p-0 text-foreground transition-200 group-[[data-selected]:not(.range-middle)]:[transition-property:color,background-color,border-radius,box-shadow] group-[[data-selected]:not(.range-middle)]:duration-150 group-data-disabled:pointer-events-none focus-visible:z-10 hover:not-in-data-selected:bg-accent group-data-selected:bg-primary hover:not-in-data-selected:text-foreground group-data-selected:text-primary-foreground group-data-disabled:text-foreground/30 group-data-disabled:line-through group-data-outside:text-foreground/30 group-data-selected:group-data-outside:text-primary-foreground outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] group-[.range-start:not(.range-end)]:rounded-e-none group-[.range-end:not(.range-start)]:rounded-s-none group-[.range-middle]:rounded-none group-[.range-middle]:group-data-selected:bg-accent group-[.range-middle]:group-data-selected:text-foreground',
        day: 'group size-8 px-0 py-px text-sm',
        range_start: 'range-start',
        range_end: 'range-end',
        range_middle: 'range-middle',
        today:
          '*:after:pointer-events-none *:after:absolute *:after:bottom-1 *:after:start-1/2 *:after:z-10 *:after:size-[3px] *:after:-translate-x-1/2 rtl:*:after:translate-x-1/2 *:after:rounded-full *:after:bg-primary [&[data-selected]:not(.range-middle)>*]:after:bg-background [&[data-disabled]>*]:after:bg-foreground/30 *:after:transition-colors',
        outside:
          'text-muted-foreground data-selected:bg-accent/50 data-selected:text-muted-foreground',
        hidden: 'invisible',
        week_number: 'size-8 p-0 text-xs font-medium text-muted-foreground/80',
        ...classNames,
      }}
      components={{
        ...components,
        DropdownNav: ({ className, children, ...dropdownNavProps }) => {
          const dropdowns = React.Children.toArray(children);

          return (
            <div className={className} {...dropdownNavProps}>
              {dropdowns.map((child, index) => (
                <React.Fragment key={index}>
                  {child}
                  {index === 0 && (
                    <span
                      aria-hidden="true"
                      className="text-xs text-muted-foreground/60"
                      data-slot="calendar-caption-separator"
                    >
                      /
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          );
        },
        Chevron: (props) => {
          if (props.orientation === 'left') {
            return <ChevronLeft className="h-4 w-4 rtl:rotate-180" />;
          } else {
            return <ChevronRight className="h-4 w-4 rtl:rotate-180" />;
          }
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
