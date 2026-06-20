import { z } from 'zod';

export interface LeanRow {
  id: string;
  name: string;
  quantity: number;
}

export const leanRowsFormSchema = z.object({
  rows: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      quantity: z.number(),
    }),
  ),
});

export type LeanRowsFormValues = z.infer<typeof leanRowsFormSchema>;
