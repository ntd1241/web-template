import { z } from 'zod';

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
  defaultValueSetId: z.string(),
  defaultSelectionMode: z.enum(['single', 'multi']),
  allowModelSelectionOverride: z.boolean(),
  allowModelValueSetOverride: z.boolean(),
  defaultValue: specValueSchema.optional(),
});

export type SpecDefinitionFormValues = z.infer<typeof specDefinitionFormSchema>;
