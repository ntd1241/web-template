import { z } from 'zod';

/** Giá trị thông số (union) — khớp SpecValue ở model. */
const specValueSchema = z.union([
  z.string(),
  z.boolean(),
  z.array(z.string()),
  z.object({ amount: z.number(), unit: z.string().optional() }),
]);

const specOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1, 'Nhập nhãn'),
  value: z.string().min(1, 'Nhập mã giá trị'),
  colorHex: z.string().optional(),
});

const customSpecDefinitionSchema = z.object({
  code: z.string().min(1, 'Nhập mã thông số'),
  name: z.string().min(1, 'Nhập tên thông số'),
  dataType: z.enum(['text', 'number', 'list', 'boolean', 'date']),
  unit: z.string().optional(),
  options: z.array(specOptionSchema).optional(),
  allowMultiple: z.boolean(),
  allowDynamicValues: z.boolean(),
  defaultValue: specValueSchema.optional(),
  description: z.string().optional(),
});

const modelSpecSchema = z.object({
  id: z.string().min(1),
  source: z.enum(['catalog', 'custom']),
  specDefinitionId: z.string().optional(),
  customDefinition: customSpecDefinitionSchema.optional(),
  materialValueMode: z.enum(['locked', 'editable']),
  defaultValue: specValueSchema.optional(),
  allowedOptions: z.array(specOptionSchema).optional(),
  isRequired: z.boolean(),
});

export const materialModelFormSchema = z.object({
  name: z.string().min(1, 'Bắt buộc'),
  code: z.string().min(1, 'Bắt buộc'),
  origin: z.string(),
  groupId: z.string().min(1, 'Chọn nhóm'),
  description: z.string(),
  imageUrls: z.array(z.string()),
  specs: z.array(modelSpecSchema),
});

export type MaterialModelFormValues = z.infer<typeof materialModelFormSchema>;
export type ModelSpecFormValue = z.infer<typeof modelSpecSchema>;
