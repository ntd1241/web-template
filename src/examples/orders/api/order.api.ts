import { mockResponse } from '@/mocks/mock-response';
import type { PaginatedResponse } from '@/types/api.types';
import { MOCK_ORDER_ITEMS } from '../data/order-items.mock';
import { MOCK_ORDERS } from '../data/orders.mock';
import type {
  Order,
  OrderItem,
  OrderListParams,
  OrderStatus,
} from '../model/order';

function paginateMock(params: OrderListParams): PaginatedResponse<Order> {
  const start = (params.page - 1) * params.pageSize;
  const items = MOCK_ORDERS.slice(start, start + params.pageSize);

  return {
    items,
    total: MOCK_ORDERS.length,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export const orderApi = {
  getList(params: OrderListParams): Promise<PaginatedResponse<Order>> {
    return mockResponse(paginateMock(params));
  },

  getItems(orderId: string): Promise<OrderItem[]> {
    const items = MOCK_ORDER_ITEMS[orderId] ?? [];
    return mockResponse(items.map((item) => ({ ...item })), 250);
  },

  saveItems(orderId: string, items: OrderItem[]): Promise<OrderItem[]> {
    MOCK_ORDER_ITEMS[orderId] = items.map((item) => ({ ...item }));
    return mockResponse(MOCK_ORDER_ITEMS[orderId], 250);
  },

  setStatus(id: string, status: OrderStatus): Promise<Order> {
    const index = MOCK_ORDERS.findIndex((order) => order.id === id);
    if (index === -1) {
      return Promise.reject(new Error('Không tìm thấy đơn hàng'));
    }

    MOCK_ORDERS[index] = { ...MOCK_ORDERS[index], status };
    return mockResponse(MOCK_ORDERS[index], 250);
  },
};
