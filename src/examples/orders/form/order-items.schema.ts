import { z } from 'zod';

export const orderItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nhập tên hàng hóa'),
  unit: z.string(),
  quantity: z.number().gt(0, 'Số lượng phải > 0'),
  unitPrice: z.number().min(0, 'Đơn giá phải >= 0'),
  note: z.string(),
});

export const orderItemsFormSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Đơn hàng cần ít nhất 1 dòng'),
});

export type OrderItemsFormValues = z.infer<typeof orderItemsFormSchema>;
