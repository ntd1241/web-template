import { createQueryKeys } from '@/constants/query-keys';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { toastError } from '@/lib/errors';
import type { OrderListParams, OrderStatus } from '../model/order';
import { orderApi } from './order.api';

export const orderKeys = createQueryKeys<OrderListParams>('orders');

export function useOrderListQuery(params: OrderListParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderApi.getList(params),
    placeholderData: keepPreviousData,
  });
}

export function useSetOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderApi.setStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('Cập nhật trạng thái thành công');
    },
    onError: (error) => {
      toastError(error);
    },
  });
}

export function useSetOrdersStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: OrderStatus }) =>
      Promise.all(ids.map((id) => orderApi.setStatus(id, status))),
    onSuccess: (_data, { ids }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success(`Đã cập nhật ${ids.length} đơn hàng`);
    },
    onError: (error) => {
      toastError(error);
    },
  });
}
