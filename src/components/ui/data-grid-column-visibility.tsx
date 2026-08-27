import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Column, Table } from '@tanstack/react-table';
import { Columns3Cog, GripVertical, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type DataGridColumnVisibilityMode = 'popover' | 'drawer';

interface DataGridColumnVisibilityProps<TData> {
  table: Table<TData>;
  trigger?: ReactNode;
  mode?: DataGridColumnVisibilityMode;
}

function getColumnLabel<TData>(column: Column<TData, unknown>): string {
  return column.columnDef.meta?.headerTitle || column.id;
}

function getReorderableColumns<TData>(table: Table<TData>) {
  return table.getAllLeafColumns().filter((column) => column.getCanHide());
}

function getOrderedColumns<TData>(
  columns: Column<TData, unknown>[],
  configuredOrder: string[],
) {
  const columnsById = new Map(columns.map((column) => [column.id, column]));
  const orderedColumns = configuredOrder
    .map((columnId) => columnsById.get(columnId))
    .filter((column): column is Column<TData, unknown> => Boolean(column));
  const orderedIds = new Set(orderedColumns.map((column) => column.id));

  return [
    ...orderedColumns,
    ...columns.filter((column) => !orderedIds.has(column.id)),
  ];
}

function SortableColumnItem<TData>({
  column,
  onVisibilityChange,
}: {
  column: Column<TData, unknown>;
  onVisibilityChange: (visible: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });
  const label = getColumnLabel(column);
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5',
        isDragging && 'relative z-10 shadow-md ring-1 ring-primary/20',
      )}
      data-column-id={column.id}
    >
      <Button
        type="button"
        variant="ghost"
        mode="icon"
        size="sm"
        className="size-7 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing"
        aria-label={`Sắp xếp cột ${label}`}
        title={`Sắp xếp cột ${label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" aria-hidden="true" />
      </Button>
      <Checkbox
        checked={column.getIsVisible()}
        onCheckedChange={(value) => onVisibilityChange(value === true)}
        aria-label={`Hiển thị cột ${label}`}
        size="sm"
      />
      <span className="min-w-0 truncate text-sm text-foreground">{label}</span>
    </div>
  );
}

function DataGridColumnVisibility<TData>({
  table,
  trigger,
  mode = 'popover',
}: DataGridColumnVisibilityProps<TData>) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor),
  );
  const columns = useMemo(() => getReorderableColumns(table), [table]);
  const columnOrder = table.getState().columnOrder;
  const orderedColumns = useMemo(
    () => getOrderedColumns(columns, columnOrder),
    [columnOrder, columns],
  );

  const defaultTrigger = (
    <Button
      variant="outline"
      mode="icon"
      aria-label="Hiển thị cột"
      title="Hiển thị cột"
    >
      <Columns3Cog />
    </Button>
  );

  if (mode === 'drawer') {
    const handleDragEnd = ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return;

      const oldIndex = orderedColumns.findIndex(
        (column) => column.id === active.id,
      );
      const newIndex = orderedColumns.findIndex(
        (column) => column.id === over.id,
      );
      if (oldIndex === -1 || newIndex === -1) return;

      const nextOrder = orderedColumns.map((column) => column.id);
      const [movedColumn] = nextOrder.splice(oldIndex, 1);
      nextOrder.splice(newIndex, 0, movedColumn);
      table.setColumnOrder(nextOrder);
    };

    return (
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
        <DrawerTrigger asChild>{trigger ?? defaultTrigger}</DrawerTrigger>
        <DrawerContent className="inset-y-0 right-0 bottom-auto left-auto mt-0 h-full w-[min(100vw,24rem)] rounded-none border-l [&>div:first-child]:hidden">
          <DrawerHeader className="border-b border-border px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <DrawerTitle>Hiển thị và sắp xếp cột</DrawerTitle>
                <DrawerDescription>
                  Chọn cột cần hiển thị và kéo để thay đổi thứ tự.
                </DrawerDescription>
              </div>
              <DrawerClose
                aria-label="Đóng"
                className="absolute end-5 top-5 cursor-pointer rounded-sm opacity-60 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden disabled:pointer-events-none"
              >
                <X className="size-4" />
                <span className="sr-only">Đóng</span>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <DndContext
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
              sensors={sensors}
            >
              <SortableContext
                items={orderedColumns.map((column) => column.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {orderedColumns.map((column) => (
                    <SortableColumnItem
                      key={column.id}
                      column={column}
                      onVisibilityChange={(visible) =>
                        column.toggleVisibility(visible)
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuLabel className="font-medium">
          Hiển thị cột
        </DropdownMenuLabel>
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
          >
            {getColumnLabel(column)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { DataGridColumnVisibility, type DataGridColumnVisibilityMode };
