/**
 * Scaffolded by editor-table-builder from `src/examples/orders/table/order-item.editor-table.fixture.ts`. Run `npm run gen:editor-table` — do NOT hand-write this file.
 * You own this file now — fill computed cell stubs and wire it into the page/card layout. To change
 * columns or viewport behavior, edit the spec and re-gen to a scratch path, then reconcile your edits.
 */
import { Copy, Plus, Trash2 } from 'lucide-react';
import { Controller, useFieldArray } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { formatCurrencyVND } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { OrderItemsFormValues } from '../form/order-items.schema';
import type { OrderItem } from '../model/order';

interface OrderItemsEditorTableProps {
  form: UseFormReturn<OrderItemsFormValues>;
  createRow: () => OrderItem;
}

export function OrderItemsEditorTable({
  form,
  createRow,
}: OrderItemsEditorTableProps) {
  const { fields, append, insert, remove } = useFieldArray({
    control: form.control,
    name: 'items',
    keyName: 'fieldId',
  });
  const watchedRows = form.watch('items') ?? [];

  const handleAddRow = () => {
    append(createRow());
  };

  const handleAddRowBelow = (index: number) => {
    insert(index + 1, createRow());
  };

  const handleDuplicateRow = (index: number) => {
    const currentRow = form.getValues(`items.${index}`);
    insert(index + 1, { ...currentRow, id: crypto.randomUUID() });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-foreground">
            Hàng hóa trong đơn
          </h2>
          <div className="text-xs text-muted-foreground">
            {fields.length} dòng
          </div>
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleAddRow}
        >
          <Plus />
          Thêm dòng
        </Button>
      </div>
      <ScrollArea className="h-[clamp(480px,62dvh,760px)]">
        <table className="min-w-[1880px] w-full caption-bottom text-foreground text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="sticky top-0 z-20 bg-muted w-14">
                STT
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-muted w-36">
                Mã hàng
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-muted min-w-56">
                Tên hàng hóa
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-muted w-28">
                ĐVT
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-muted w-36">
                Kho
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-muted w-40">
                Số lô
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-muted w-40">
                Hạn dùng
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-muted w-32">
                Số lượng
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-muted w-40">
                Đơn giá
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-muted w-28">
                VAT %
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-muted w-36">
                Chiết khấu
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-muted min-w-48">
                Ghi chú
              </TableHead>
              <TableHead className="sticky top-0 z-20 bg-muted w-40">
                Thành tiền
              </TableHead>
              <TableHead className="sticky top-0 right-0 z-30 bg-muted w-28 text-right shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.45)]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length === 0 ? (
              <TableRow>
                <TableCell colSpan={14} className="h-28 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-muted-foreground">
                      Chưa có dữ liệu
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddRow}
                    >
                      <Plus />
                      Thêm dòng
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              fields.map((field, index) => {
                const row = watchedRows[index] as OrderItem | undefined;
                const errors = form.formState.errors.items?.[index];
                const lineTotal =
                  (row?.quantity ?? 0) *
                    (row?.unitPrice ?? 0) *
                    (1 + (row?.taxRate ?? 0) / 100) -
                  (row?.discount ?? 0);

                return (
                  <TableRow key={field.fieldId}>
                    <TableCell className="px-4 py-2 text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="px-2 py-2">
                      <Controller
                        control={form.control}
                        name={`items.${index}.sku`}
                        render={({ field: inputField }) => (
                          <Input
                            {...inputField}
                            aria-label={`Mã hàng dòng ${index + 1}`}
                            aria-invalid={!!errors?.sku}
                            variant="sm"
                          />
                        )}
                      />
                      {errors?.sku && (
                        <div className="mt-1 text-xs text-destructive">
                          {errors?.sku?.message}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-2 py-2">
                      <Controller
                        control={form.control}
                        name={`items.${index}.name`}
                        render={({ field: inputField }) => (
                          <Input
                            {...inputField}
                            aria-label={`Tên hàng hóa dòng ${index + 1}`}
                            aria-invalid={!!errors?.name}
                            variant="sm"
                          />
                        )}
                      />
                      {errors?.name && (
                        <div className="mt-1 text-xs text-destructive">
                          {errors?.name?.message}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-2 py-2">
                      <Controller
                        control={form.control}
                        name={`items.${index}.unit`}
                        render={({ field: inputField }) => (
                          <Input
                            {...inputField}
                            aria-label={`ĐVT dòng ${index + 1}`}
                            aria-invalid={!!errors?.unit}
                            variant="sm"
                          />
                        )}
                      />
                      {errors?.unit && (
                        <div className="mt-1 text-xs text-destructive">
                          {errors?.unit?.message}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-2 py-2">
                      <Controller
                        control={form.control}
                        name={`items.${index}.warehouse`}
                        render={({ field: inputField }) => (
                          <Input
                            {...inputField}
                            aria-label={`Kho dòng ${index + 1}`}
                            aria-invalid={!!errors?.warehouse}
                            variant="sm"
                          />
                        )}
                      />
                      {errors?.warehouse && (
                        <div className="mt-1 text-xs text-destructive">
                          {errors?.warehouse?.message}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-2 py-2">
                      <Controller
                        control={form.control}
                        name={`items.${index}.lotNumber`}
                        render={({ field: inputField }) => (
                          <Input
                            {...inputField}
                            aria-label={`Số lô dòng ${index + 1}`}
                            aria-invalid={!!errors?.lotNumber}
                            variant="sm"
                          />
                        )}
                      />
                      {errors?.lotNumber && (
                        <div className="mt-1 text-xs text-destructive">
                          {errors?.lotNumber?.message}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-2 py-2">
                      <Controller
                        control={form.control}
                        name={`items.${index}.expiryDate`}
                        render={({ field: inputField }) => (
                          <Input
                            {...inputField}
                            aria-label={`Hạn dùng dòng ${index + 1}`}
                            aria-invalid={!!errors?.expiryDate}
                            type="date"
                            variant="sm"
                          />
                        )}
                      />
                      {errors?.expiryDate && (
                        <div className="mt-1 text-xs text-destructive">
                          {errors?.expiryDate?.message}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-2 py-2">
                      <Controller
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field: inputField }) => (
                          <Input
                            aria-label={`Số lượng dòng ${index + 1}`}
                            aria-invalid={!!errors?.quantity}
                            className="text-right tabular-nums"
                            min={0}
                            type="number"
                            value={inputField.value}
                            variant="sm"
                            onBlur={inputField.onBlur}
                            onChange={(event) =>
                              inputField.onChange(
                                Number.isNaN(event.target.valueAsNumber)
                                  ? 0
                                  : event.target.valueAsNumber,
                              )
                            }
                          />
                        )}
                      />
                      {errors?.quantity && (
                        <div className="mt-1 text-right text-xs text-destructive">
                          {errors?.quantity?.message}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-2 py-2">
                      <Controller
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field: inputField }) => (
                          <Input
                            aria-label={`Đơn giá dòng ${index + 1}`}
                            aria-invalid={!!errors?.unitPrice}
                            className="text-right tabular-nums"
                            min={0}
                            type="number"
                            value={inputField.value}
                            variant="sm"
                            onBlur={inputField.onBlur}
                            onChange={(event) =>
                              inputField.onChange(
                                Number.isNaN(event.target.valueAsNumber)
                                  ? 0
                                  : event.target.valueAsNumber,
                              )
                            }
                          />
                        )}
                      />
                      {errors?.unitPrice && (
                        <div className="mt-1 text-right text-xs text-destructive">
                          {errors?.unitPrice?.message}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-2 py-2">
                      <Controller
                        control={form.control}
                        name={`items.${index}.taxRate`}
                        render={({ field: inputField }) => (
                          <Input
                            aria-label={`VAT % dòng ${index + 1}`}
                            aria-invalid={!!errors?.taxRate}
                            className="text-right tabular-nums"
                            min={0}
                            type="number"
                            value={inputField.value}
                            variant="sm"
                            onBlur={inputField.onBlur}
                            onChange={(event) =>
                              inputField.onChange(
                                Number.isNaN(event.target.valueAsNumber)
                                  ? 0
                                  : event.target.valueAsNumber,
                              )
                            }
                          />
                        )}
                      />
                      {errors?.taxRate && (
                        <div className="mt-1 text-right text-xs text-destructive">
                          {errors?.taxRate?.message}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-2 py-2">
                      <Controller
                        control={form.control}
                        name={`items.${index}.discount`}
                        render={({ field: inputField }) => (
                          <Input
                            aria-label={`Chiết khấu dòng ${index + 1}`}
                            aria-invalid={!!errors?.discount}
                            className="text-right tabular-nums"
                            min={0}
                            type="number"
                            value={inputField.value}
                            variant="sm"
                            onBlur={inputField.onBlur}
                            onChange={(event) =>
                              inputField.onChange(
                                Number.isNaN(event.target.valueAsNumber)
                                  ? 0
                                  : event.target.valueAsNumber,
                              )
                            }
                          />
                        )}
                      />
                      {errors?.discount && (
                        <div className="mt-1 text-right text-xs text-destructive">
                          {errors?.discount?.message}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-2 py-2">
                      <Controller
                        control={form.control}
                        name={`items.${index}.note`}
                        render={({ field: inputField }) => (
                          <Input
                            {...inputField}
                            aria-label={`Ghi chú dòng ${index + 1}`}
                            aria-invalid={!!errors?.note}
                            variant="sm"
                          />
                        )}
                      />
                      {errors?.note && (
                        <div className="mt-1 text-xs text-destructive">
                          {errors?.note?.message}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-2 text-right tabular-nums">
                      {formatCurrencyVND(lineTotal)}
                    </TableCell>
                    <TableCell className="sticky right-0 z-10 bg-card px-3 py-2 shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.35)]">
                      <div className="flex justify-end gap-1">
                        <Button
                          aria-label={`Nhân đôi dòng ${index + 1}`}
                          title="Nhân đôi"
                          type="button"
                          variant="ghost"
                          mode="icon"
                          size="sm"
                          onClick={() => handleDuplicateRow(index)}
                        >
                          <Copy />
                        </Button>
                        <Button
                          aria-label={`Thêm dòng dưới dòng ${index + 1}`}
                          title="Thêm dòng dưới"
                          type="button"
                          variant="ghost"
                          mode="icon"
                          size="sm"
                          onClick={() => handleAddRowBelow(index)}
                        >
                          <Plus />
                        </Button>
                        <Button
                          aria-label={`Xóa dòng ${index + 1}`}
                          title="Xóa"
                          type="button"
                          variant="destructive"
                          appearance="ghost"
                          mode="icon"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
