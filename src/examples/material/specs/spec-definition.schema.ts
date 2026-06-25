import { z } from 'zod';

/** Schema tạo/sửa thông số kỹ thuật. */
const specOptionSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Nhập nhãn'),
  value: z.string().min(1, 'Nhập mã giá trị'),
  colorHex: z.string().optional(),
});

const specValueSchema = z.union([
  z.string(),
  z.boolean(),
  z.array(z.string()),
  z.object({ amount: z.number(), unit: z.string().optional() }),
]);

export const specDefinitionFormSchema = z.object({
  code: z.string().min(1, 'Bắt buộc'),
  name: z.string().min(1, 'Bắt buộc'),
  dataType: z.enum(['text', 'number', 'list', 'boolean', 'date']),
  unit: z.string(),
  description: z.string(),
  allowMultiple: z.boolean(),
  allowDynamicValues: z.boolean(),
  allowModelOverride: z.boolean(),
  options: z.array(specOptionSchema),
  defaultValue: specValueSchema.optional(),
});

export type SpecDefinitionFormValues = z.infer<typeof specDefinitionFormSchema>;
