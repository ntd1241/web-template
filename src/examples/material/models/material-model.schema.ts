import { z } from 'zod';

/** Giá trị thông số (union) — khớp SpecValue ở model. */
const specValueSchema = z.union([
  z.string(),
  z.boolean(),
  z.array(z.string()),
  z.object({ amount: z.number(), unit: z.string().optional() }),
]);

const modelSpecSchema = z.object({
  specDefinitionId: z.string().min(1),
  deviceMode: z.enum(['fixed', 'input', 'select']),
  modelValue: specValueSchema.optional(),
  allowedOptionIds: z.array(z.string()).optional(),
  isRequired: z.boolean(),
});

export const materialModelFormSchema = z.object({
  name: z.string().min(1, 'Bắt buộc'),
  code: z.string().min(1, 'Bắt buộc'),
  origin: z.string(),
  groupId: z.string().min(1, 'Chọn nhóm'),
  description: z.string(),
  isActive: z.boolean(),
  imageUrls: z.array(z.string()),
  specs: z.array(modelSpecSchema),
});

export type MaterialModelFormValues = z.infer<typeof materialModelFormSchema>;
export type ModelSpecFormValue = z.infer<typeof modelSpecSchema>;
