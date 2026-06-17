import type { ReactNode } from 'react';
import type {
  CellContext,
  ColumnDef,
  HeaderContext,
} from '@tanstack/react-table';
import { formatDate, formatDateTime, type DateInput } from '@/lib/date';
import { formatCurrencyVND, formatNumber, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { RelativeTime } from '@/components/ui/relative-time';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { StatusBadge, type StatusBadgeConfig } from './status-badge';

type ColumnId = string;

interface BaseColumnOptions<TRow extends object> {
  id: ColumnId;
  header: ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  visibility?: boolean;
  enableSorting?: boolean;
  size?: number;
  minSize?: number;
  maxSize?: number;
  get?: (row: TRow) => unknown;
}

type AccessorColumnOptions<TRow extends object, TValue> = Omit<
  BaseColumnOptions<TRow>,
  'get'
> & {
  get: (row: TRow) => TValue;
};

interface TextColumnOptions<TRow extends object> extends AccessorColumnOptions<
  TRow,
  string | null | undefined
> {
  tooltipOnTruncate?: boolean;
}

interface NumberColumnOptions<
  TRow extends object,
> extends AccessorColumnOptions<TRow, number | null | undefined> {
  options?: Intl.NumberFormatOptions;
}

interface PercentColumnOptions<
  TRow extends object,
> extends AccessorColumnOptions<TRow, number | null | undefined> {
  fractionDigits?: number;
}

interface DateColumnOptions<TRow extends object> extends AccessorColumnOptions<
  TRow,
  DateInput
> {
  mode?: 'date' | 'datetime' | 'relative';
}

interface BadgeColumnOptions<
  TRow extends object,
  TStatus extends string,
> extends AccessorColumnOptions<TRow, TStatus | string | null | undefined> {
  config: StatusBadgeConfig<TStatus>;
}

interface ActionsColumnOptions<TRow extends object> extends Omit<
  BaseColumnOptions<TRow>,
  'id' | 'header' | 'get'
> {
  id?: ColumnId;
  header?: ReactNode;
  cell: (row: TRow) => ReactNode;
}

interface CustomColumnOptions<TRow extends object> extends Omit<
  BaseColumnOptions<TRow>,
  'get'
> {
  cell: (row: TRow, context: CellContext<TRow, unknown>) => ReactNode;
}

function renderHeader<TRow extends object>(
  title: ReactNode,
  visibility = true,
) {
  return function Header(context: HeaderContext<TRow, unknown>) {
    return (
      <DataGridColumnHeader
        column={context.column}
        title={typeof title === 'string' ? title : undefined}
        visibility={visibility}
      />
    );
  };
}

function createMeta<TRow extends object>({
  header,
  headerClassName,
  cellClassName,
}: {
  header: ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}): ColumnDef<TRow>['meta'] {
  return {
    headerTitle: typeof header === 'string' ? header : undefined,
    headerClassName,
    cellClassName,
  };
}

function createAccessorColumn<TRow extends object, TValue>({
  id,
  header,
  get,
  headerClassName,
  cellClassName,
  visibility,
  enableSorting,
  size,
  minSize,
  maxSize,
  cell,
}: AccessorColumnOptions<TRow, TValue> & {
  cell: (value: TValue, context: CellContext<TRow, unknown>) => ReactNode;
}): ColumnDef<TRow> {
  return {
    id,
    accessorFn: get,
    header: renderHeader(header, visibility),
    cell: (context) => cell(get(context.row.original), context),
    enableSorting,
    size,
    minSize,
    maxSize,
    meta: createMeta({ header, headerClassName, cellClassName }),
  };
}

export function createColumnHelpers<TRow extends object>() {
  return {
    text(options: TextColumnOptions<TRow>): ColumnDef<TRow> {
      return createAccessorColumn({
        ...options,
        cellClassName: cn('truncate', options.cellClassName),
        cell: (value) => {
          const label = value ?? '';
          const content = <span className="truncate">{label}</span>;

          if (!options.tooltipOnTruncate || !label) {
            return content;
          }

          return (
            <Tooltip>
              <TooltipTrigger asChild>{content}</TooltipTrigger>
              <TooltipContent variant="light">{label}</TooltipContent>
            </Tooltip>
          );
        },
      });
    },

    number(options: NumberColumnOptions<TRow>): ColumnDef<TRow> {
      return createAccessorColumn({
        ...options,
        cellClassName: cn('text-right tabular-nums', options.cellClassName),
        cell: (value) => formatNumber(value, options.options),
      });
    },

    currency(
      options: AccessorColumnOptions<TRow, number | null | undefined>,
    ): ColumnDef<TRow> {
      return createAccessorColumn({
        ...options,
        cellClassName: cn('text-right tabular-nums', options.cellClassName),
        cell: (value) => formatCurrencyVND(value),
      });
    },

    percent(options: PercentColumnOptions<TRow>): ColumnDef<TRow> {
      return createAccessorColumn({
        ...options,
        cellClassName: cn('text-right tabular-nums', options.cellClassName),
        cell: (value) => formatPercent(value, options.fractionDigits),
      });
    },

    date(options: DateColumnOptions<TRow>): ColumnDef<TRow> {
      return createAccessorColumn({
        ...options,
        cell: (value) => {
          if (options.mode === 'relative') {
            return <RelativeTime value={value} />;
          }

          if (options.mode === 'datetime') {
            return formatDateTime(value);
          }

          return formatDate(value);
        },
      });
    },

    badge<TStatus extends string>(
      options: BadgeColumnOptions<TRow, TStatus>,
    ): ColumnDef<TRow> {
      return createAccessorColumn({
        ...options,
        cell: (value) => <StatusBadge status={value} config={options.config} />,
      });
    },

    index({
      id = 'index',
      header = 'STT',
      headerClassName,
      cellClassName,
      visibility,
      size,
    }: {
      id?: ColumnId;
      header?: ReactNode;
      headerClassName?: string;
      cellClassName?: string;
      visibility?: boolean;
      size?: number;
    } = {}): ColumnDef<TRow> {
      return {
        id,
        header: renderHeader<TRow>(header, visibility),
        cell: ({ row, table }) => {
          const pageIndex = table.getState().pagination?.pageIndex ?? 0;
          const pageSize = table.getState().pagination?.pageSize ?? 0;
          return pageIndex * pageSize + row.index + 1;
        },
        size,
        meta: createMeta({
          header,
          headerClassName,
          cellClassName: cn('text-right tabular-nums', cellClassName),
        }),
      };
    },

    select(): ColumnDef<TRow> {
      return {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Chọn tất cả"
            size="sm"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Chọn dòng"
            size="sm"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 44,
        meta: createMeta({
          header: '',
          headerClassName: 'w-[44px]',
          cellClassName: 'w-[44px]',
        }),
      };
    },

    actions(options: ActionsColumnOptions<TRow>): ColumnDef<TRow> {
      const header = options.header ?? 'Thao tác';

      return {
        id: options.id ?? 'actions',
        header: renderHeader<TRow>(header, options.visibility),
        cell: ({ row }) => options.cell(row.original),
        enableSorting: false,
        enableHiding: false,
        size: options.size,
        minSize: options.minSize,
        maxSize: options.maxSize,
        meta: createMeta({
          header,
          headerClassName: options.headerClassName,
          cellClassName: cn('text-right', options.cellClassName),
        }),
      };
    },

    custom(options: CustomColumnOptions<TRow>): ColumnDef<TRow> {
      return {
        id: options.id,
        header: renderHeader<TRow>(options.header, options.visibility),
        cell: (context) => options.cell(context.row.original, context),
        enableSorting: options.enableSorting,
        size: options.size,
        minSize: options.minSize,
        maxSize: options.maxSize,
        meta: createMeta(options),
      };
    },
  };
}
