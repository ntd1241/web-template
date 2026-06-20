import { z } from 'zod';

export const orderItemSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string().min(1, 'Nhập tên hàng hóa'),
  unit: z.string(),
  warehouse: z.string(),
  lotNumber: z.string(),
  expiryDate: z.string(),
  quantity: z.number().gt(0, 'Số lượng phải > 0'),
  unitPrice: z.number().min(0, 'Đơn giá phải >= 0'),
  taxRate: z.number().min(0, 'VAT phải >= 0'),
  discount: z.number().min(0, 'Chiết khấu phải >= 0'),
  note: z.string(),
});

export const orderItemsFormSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Đơn hàng cần ít nhất 1 dòng'),
});

export type OrderItemsFormValues = z.infer<typeof orderItemsFormSchema>;
