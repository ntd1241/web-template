import { z } from 'zod';

/**
 * Self-contained schema for the form-builder golden fixture, so the generated
 * dialog typechecks without depending on `src/examples`.
 */
export const createSupplierFormSchema = z.object({
  code: z.string().min(1, 'Bắt buộc'),
  name: z.string().min(1, 'Bắt buộc'),
  contact: z.string(),
  phone: z.string(),
  debt: z.number(),
  group: z.string().min(1, 'Bắt buộc'),
  region: z.string(),
  tags: z.array(z.string()),
  note: z.string(),
  active: z.boolean(),
});

export type CreateSupplierFormValues = z.infer<typeof createSupplierFormSchema>;
