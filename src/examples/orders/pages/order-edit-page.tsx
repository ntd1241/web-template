import { useEffect } from 'react';
import { ROUTES } from '@/constants/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, TriangleAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardTable,
  CardTitle,
} from '@/components/ui/card';
import {
  useOrderItemsQuery,
  useSaveOrderItemsMutation,
} from '../api/order.queries';
import {
  orderItemsFormSchema,
  type OrderItemsFormValues,
} from '../form/order-items.schema';
import type { OrderItem } from '../model/order';
import { OrderItemsEditorTable } from '../table/order-items-editor-table.generated';

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

  useEffect(() => {
    if (itemsQuery.data) {
      form.reset({ items: itemsQuery.data });
    }
  }, [form, itemsQuery.data]);

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
          <CardTable className="min-h-0 flex-1 overflow-hidden">
            {itemsQuery.isLoading ? (
              <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
                Đang tải hàng hóa...
              </div>
            ) : (
              <OrderItemsEditorTable form={form} createRow={blankItem} />
            )}
          </CardTable>
        </Card>
      </form>
    </div>
  );
}
