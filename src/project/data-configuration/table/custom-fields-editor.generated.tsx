/**
 * Scaffolded by editor-table-builder from `src/project/data-configuration/table/custom-fields.editor-table.fixture.ts`. Run `npm run gen:editor-table` — do NOT hand-write this file.
 * You own this file now — fill computed cell stubs and wire it into the page/card layout. To change
 * columns or viewport behavior, edit the spec and re-gen to a scratch path, then reconcile your edits.
 */
import type { ReactNode } from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Controller, useFieldArray } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type {
  CustomFieldEditorRow,
  CustomFieldsFormValues,
} from '../forms/custom-fields-editor';
import {
  CUSTOM_FIELD_TYPE_LABELS,
  type CustomFieldType,
} from '../model/custom-field';

const fieldTypeOptions = Object.entries(CUSTOM_FIELD_TYPE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

function CustomFieldsEditorTableSortableRow({
  id,
  disabled = false,
  renderCells,
}: {
  id: string;
  disabled?: boolean;
  renderCells: (sortable: ReturnType<typeof useSortable>) => ReactNode;
}) {
  const sortable = useSortable({ id, disabled });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  return (
    <TableRow
      ref={sortable.setNodeRef}
      style={style}
      data-dragging={sortable.isDragging || undefined}
    >
      {renderCells(sortable)}
    </TableRow>
  );
}

interface CustomFieldsEditorTableProps {
  form: UseFormReturn<CustomFieldsFormValues>;
  createRow: () => CustomFieldEditorRow;
  toolbarContent?: ReactNode;
  toolbarTitle?: ReactNode;
  onManageOptions?: (index: number) => void;
  readOnly?: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  canAdd?: boolean;
  canDelete?: boolean;
}

export function CustomFieldsEditorTable({
  form,
  createRow,
  toolbarContent,
  toolbarTitle,
  onManageOptions,
  readOnly = false,
  canCreate = true,
  canUpdate = true,
  canAdd = true,
  canDelete = true,
}: CustomFieldsEditorTableProps) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'fields',
    keyName: 'fieldId',
  });
  const watchedRows = form.watch('fields') ?? [];

  const handleAddRow = () => {
    if (!canAdd || !canCreate || readOnly) return;
    append(createRow());
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (readOnly || !canUpdate) return;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((field) => field.fieldId === active.id);
    const newIndex = fields.findIndex((field) => field.fieldId === over.id);
    if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;
    move(oldIndex, newIndex);
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 w-full flex-col">
      <div className="flex min-w-0 shrink-0 flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground">
            {toolbarTitle ?? 'Trường bổ sung'}
          </h2>
          <div className="text-xs text-muted-foreground">
            {fields.length} dòng
          </div>
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          {canAdd ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleAddRow}
              disabled={readOnly || !canCreate}
            >
              <Plus />
              Thêm trường
            </Button>
          ) : null}
          {toolbarContent}
        </div>
      </div>
      <ScrollArea
        type="always"
        className="min-w-0 min-h-[360px] min-h-0 flex-1"
        viewportClassName="h-full min-w-0 overflow-y-auto"
      >
        <div className="min-w-[1120px]">
          <table className="w-full caption-bottom text-foreground text-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="sticky top-0 z-20 bg-muted w-12 text-center"></TableHead>
                <TableHead className="sticky top-0 z-20 bg-muted w-48">
                  Mã trường
                </TableHead>
                <TableHead className="sticky top-0 z-20 bg-muted min-w-56">
                  Tên trường
                </TableHead>
                <TableHead className="sticky top-0 z-20 bg-muted w-52">
                  Kiểu dữ liệu
                </TableHead>
                <TableHead className="sticky top-0 z-20 bg-muted w-32">
                  Bắt buộc
                </TableHead>
                <TableHead className="sticky top-0 z-20 bg-muted w-32">
                  Kích hoạt
                </TableHead>
                <TableHead className="sticky top-0 z-20 bg-muted w-48">
                  Danh sách giá trị
                </TableHead>
                <TableHead className="sticky top-0 right-0 z-30 bg-muted w-16 text-right shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.45)]"></TableHead>
              </TableRow>
            </TableHeader>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map((field) => field.fieldId)}
                strategy={verticalListSortingStrategy}
              >
                <TableBody>
                  {fields.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-28 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-muted-foreground">
                            Chưa có dữ liệu
                          </span>
                          {canAdd ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleAddRow}
                              disabled={readOnly || !canCreate}
                            >
                              <Plus />
                              Thêm dòng
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    fields.map((field, index) => {
                      const row = watchedRows[index] as
                        CustomFieldEditorRow | undefined;
                      const errors = form.formState.errors.fields?.[index];
                      const rowReadOnly =
                        readOnly || (row?.id ? !canUpdate : !canCreate);

                      return (
                        <CustomFieldsEditorTableSortableRow
                          key={field.fieldId}
                          id={field.fieldId}
                          disabled={rowReadOnly}
                          renderCells={(sortable) => (
                            <>
                              <TableCell className="w-12 px-2 py-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  mode="icon"
                                  size="sm"
                                  aria-label={`Kéo để sắp xếp dòng ${index + 1}`}
                                  title="Kéo để sắp xếp"
                                  disabled={rowReadOnly}
                                  {...sortable.attributes}
                                  {...sortable.listeners}
                                >
                                  <GripVertical />
                                </Button>
                              </TableCell>
                              <TableCell className="px-2 py-2">
                                <Controller
                                  control={form.control}
                                  name={`fields.${index}.key`}
                                  render={({ field: inputField }) => (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="block w-full">
                                          <Input
                                            {...inputField}
                                            aria-label={`Mã trường dòng ${index + 1}`}
                                            aria-invalid={!!errors?.key}
                                            variant="sm"
                                            disabled={rowReadOnly}
                                          />
                                        </span>
                                      </TooltipTrigger>
                                      {errors?.key?.message && (
                                        <TooltipContent variant="destructive">
                                          {errors.key.message}
                                        </TooltipContent>
                                      )}
                                    </Tooltip>
                                  )}
                                />
                              </TableCell>
                              <TableCell className="px-2 py-2">
                                <Controller
                                  control={form.control}
                                  name={`fields.${index}.label`}
                                  render={({ field: inputField }) => (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="block w-full">
                                          <Input
                                            {...inputField}
                                            aria-label={`Tên trường dòng ${index + 1}`}
                                            aria-invalid={!!errors?.label}
                                            variant="sm"
                                            disabled={rowReadOnly}
                                          />
                                        </span>
                                      </TooltipTrigger>
                                      {errors?.label?.message && (
                                        <TooltipContent variant="destructive">
                                          {errors.label.message}
                                        </TooltipContent>
                                      )}
                                    </Tooltip>
                                  )}
                                />
                              </TableCell>
                              <TableCell className="px-2 py-2 align-top">
                                <Select
                                  value={row?.fieldType ?? 'text'}
                                  onValueChange={(value) =>
                                    form.setValue(
                                      `fields.${index}.fieldType`,
                                      value as CustomFieldType,
                                      {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                      },
                                    )
                                  }
                                >
                                  <SelectTrigger
                                    aria-label={`Kiểu dữ liệu dòng ${index + 1}`}
                                    disabled={rowReadOnly}
                                    size="sm"
                                  >
                                    <SelectValue placeholder="Chọn kiểu dữ liệu" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {fieldTypeOptions.map((option) => (
                                      <SelectItem
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="px-2 py-2 align-top">
                                <Switch
                                  checked={row?.isRequired ?? false}
                                  onCheckedChange={(checked) =>
                                    form.setValue(
                                      `fields.${index}.isRequired`,
                                      checked,
                                      {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                      },
                                    )
                                  }
                                  disabled={rowReadOnly}
                                  aria-label={`Bắt buộc nhập dòng ${index + 1}`}
                                />
                              </TableCell>
                              <TableCell className="px-2 py-2 align-top">
                                <Switch
                                  checked={row?.isActive ?? true}
                                  onCheckedChange={(checked) =>
                                    form.setValue(
                                      `fields.${index}.isActive`,
                                      checked,
                                      {
                                        shouldDirty: true,
                                        shouldValidate: true,
                                      },
                                    )
                                  }
                                  disabled={rowReadOnly}
                                  aria-label={`Kích hoạt trường dòng ${index + 1}`}
                                />
                              </TableCell>
                              <TableCell className="px-2 py-2 align-top">
                                {row?.fieldType === 'select' ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={rowReadOnly || !onManageOptions}
                                    onClick={() => onManageOptions?.(index)}
                                  >
                                    {row.options.length} lựa chọn
                                  </Button>
                                ) : (
                                  <span className="text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="sticky right-0 z-10 bg-card px-3 py-2 shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.35)]">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    aria-label={`Xóa dòng ${index + 1}`}
                                    title="Xóa"
                                    type="button"
                                    variant="destructive"
                                    appearance="ghost"
                                    mode="icon"
                                    size="sm"
                                    disabled={
                                      readOnly ||
                                      (Boolean(row?.id) && !canDelete)
                                    }
                                    onClick={() => remove(index)}
                                  >
                                    <Trash2 />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          )}
                        />
                      );
                    })
                  )}
                </TableBody>
              </SortableContext>
            </DndContext>
          </table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
