import { useEffect } from 'react';
import { ROUTES } from '@/constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Copy,
  Plus,
  Save,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { formatCurrencyVND } from '@/lib/format';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTable,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useOrderItemsQuery,
  useSaveOrderItemsMutation,
} from '../api/order.queries';
import {
  orderItemsFormSchema,
  type OrderItemsFormValues,
} from '../form/order-items.schema';
import type { OrderItem } from '../model/order';

const orderId = 'demo';
const orderEditFormId = 'order-edit-form';

function blankItem(): OrderItem {
  return {
    id: crypto.randomUUID(),
    sku: '',
    name: '',
    unit: '',
    warehouse: '',
    lotNumber: '',
    expiryDate: '',
    quantity: 0,
    unitPrice: 0,
    taxRate: 0,
    discount: 0,
    note: '',
  };
}

export function OrderEditPage() {
  const form = useForm<OrderItemsFormValues>({
    resolver: zodResolver(orderItemsFormSchema),
    defaultValues: { items: [] },
  });
  const itemsQuery = useOrderItemsQuery(orderId);
  const saveItemsMutation = useSaveOrderItemsMutation();
  const { fields, append, insert, remove } = useFieldArray({
    control: form.control,
    name: 'items',
    keyName: 'fieldId',
  });
  const watchedItems = form.watch('items');
  const totalAmount = watchedItems.reduce(
    (sum, item) =>
      sum +
      item.quantity * item.unitPrice * (1 + item.taxRate / 100) -
      item.discount,
    0,
  );

  useEffect(() => {
    if (itemsQuery.data) {
      form.reset({ items: itemsQuery.data });
    }
  }, [form, itemsQuery.data]);

  const handleAddRow = () => {
    append(blankItem());
  };

  const handleAddRowBelow = (index: number) => {
    insert(index + 1, blankItem());
  };

  const handleDuplicateRow = (index: number) => {
    const currentRow = form.getValues(`items.${index}`);
    insert(index + 1, { ...currentRow, id: crypto.randomUUID() });
  };

  const handleRemoveRow = (index: number) => {
    remove(index);
  };

  const handleSubmit = (values: OrderItemsFormValues) => {
    saveItemsMutation.mutate({ orderId, items: values.items });
  };

  if (itemsQuery.isError) {
    return (
      <div className="p-6">
        <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <TriangleAlert className="size-8 text-destructive" />
          <div>
            <CardTitle>Không tải được đơn hàng</CardTitle>
            <CardDescription className="mt-1">
              Đã có lỗi khi tải danh sách hàng hóa.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => itemsQuery.refetch()}>
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      data-testid="order-edit-page"
      className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-6"
    >
      <div className="flex shrink-0 flex-col gap-3 border-b border-border pb-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <Button variant="outline" mode="icon" size="sm" asChild>
              <Link
                to={ROUTES.EXAMPLE.ORDERS}
                aria-label="Quay lại danh sách đơn hàng"
              >
                <ArrowLeft />
              </Link>
            </Button>
            <h1 className="truncate text-lg font-semibold leading-none text-foreground">
              Sửa đơn hàng
            </h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Cập nhật danh sách hàng hóa và tổng tiền đơn hàng mẫu
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            form={orderEditFormId}
            type="submit"
            variant="primary"
            loading={saveItemsMutation.isPending}
            loadingText="Đang lưu"
          >
            <Save />
            Lưu
          </Button>
        </div>
      </div>

      <form
        id={orderEditFormId}
        className="min-h-0 flex-1"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <Card className="min-h-0 overflow-hidden">
          <CardHeader className="flex-col items-stretch gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
            <CardHeading>
              <CardTitle>Hàng hóa trong đơn</CardTitle>
              <div className="text-sm text-muted-foreground">
                {fields.length} dòng
              </div>
            </CardHeading>
            <CardToolbar>
              <Button type="button" variant="primary" onClick={handleAddRow}>
                <Plus />
                Thêm dòng
              </Button>
            </CardToolbar>
          </CardHeader>

          <CardTable className="min-h-0 flex-1 overflow-hidden">
            <Table className="min-w-[1760px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">STT</TableHead>
                  <TableHead className="w-36">Mã hàng</TableHead>
                  <TableHead className="min-w-56">Tên hàng hóa</TableHead>
                  <TableHead className="w-28">ĐVT</TableHead>
                  <TableHead className="w-36">Kho</TableHead>
                  <TableHead className="w-40">Số lô</TableHead>
                  <TableHead className="w-40">Hạn dùng</TableHead>
                  <TableHead className="w-32 text-right">Số lượng</TableHead>
                  <TableHead className="w-40 text-right">Đơn giá</TableHead>
                  <TableHead className="w-28 text-right">VAT %</TableHead>
                  <TableHead className="w-36 text-right">Chiết khấu</TableHead>
                  <TableHead className="w-40 text-right">Thành tiền</TableHead>
                  <TableHead className="min-w-48">Ghi chú</TableHead>
                  <TableHead className="sticky right-0 z-20 w-28 text-right shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.45)]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemsQuery.isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={14}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Đang tải hàng hóa...
                    </TableCell>
                  </TableRow>
                ) : fields.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="h-28 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-muted-foreground">
                          Chưa có hàng hóa
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
                  // TODO: reorder rows (useFieldArray move + drag)
                  fields.map((field, index) => {
                    const row = watchedItems[index];
                    const rowTotal =
                      (row?.quantity ?? 0) *
                        (row?.unitPrice ?? 0) *
                        (1 + (row?.taxRate ?? 0) / 100) -
                      (row?.discount ?? 0);
                    const errors = form.formState.errors.items?.[index];

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
                              {errors.name.message}
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
                              {errors.quantity.message}
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
                              {errors.unitPrice.message}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-2 py-2">
                          <Controller
                            control={form.control}
                            name={`items.${index}.taxRate`}
                            render={({ field: inputField }) => (
                              <Input
                                aria-label={`VAT dòng ${index + 1}`}
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
                              {errors.taxRate.message}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-right tabular-nums">
                          {formatCurrencyVND(rowTotal)}
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
                              {errors.discount.message}
                            </div>
                          )}
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
                              onClick={() => handleRemoveRow(index)}
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
            </Table>
          </CardTable>

          <CardFooter className="justify-between gap-4">
            <div className="font-medium tabular-nums">
              Tổng cộng: {formatCurrencyVND(totalAmount)}
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
