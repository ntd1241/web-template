import { z } from 'zod';
import type { SpecValue } from './model/spec-definition';

const specValueSchema = z.custom<SpecValue>();

const materialSpecValueSchema = z.object({
  specDefinitionId: z.string().min(1),
  value: specValueSchema,
});

export const materialFormSchema = z.object({
  name: z.string().min(1, 'Bắt buộc'),
  code: z.string().min(1, 'Bắt buộc'),
  modelId: z.string().min(1, 'Chọn mẫu'),
  specValues: z.array(materialSpecValueSchema),
});

export type MaterialFormValues = z.infer<typeof materialFormSchema>;
