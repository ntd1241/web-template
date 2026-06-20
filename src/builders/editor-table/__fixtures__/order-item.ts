import { z } from 'zod';

export interface OrderItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  expiryDate: string;
}

export const orderItemsFormSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sku: z.string(),
      name: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      expiryDate: z.string(),
    }),
  ),
});

export type OrderItemsFormValues = z.infer<typeof orderItemsFormSchema>;
