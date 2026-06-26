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
  defaultSelectionMode: z.enum(['single', 'multi']).optional(),
  defaultValue: specValueSchema.optional(),
  description: z.string().optional(),
});

const optionSourceSchema = z.union([
  z.object({ mode: z.literal('inherit') }),
  z.object({
    mode: z.literal('subset'),
    optionIds: z.array(z.string()),
  }),
]);

const modelSpecSchema = z.object({
  id: z.string().min(1),
  source: z.enum(['catalog', 'custom']),
  specDefinitionId: z.string().optional(),
  customDefinition: customSpecDefinitionSchema.optional(),
  labelOverride: z.string().optional(),
  partKey: z.string().optional(),
  selectionModeOverride: z.enum(['single', 'multi']).optional(),
  valueSetIdOverride: z.string().optional(),
  optionSource: optionSourceSchema.optional(),
  materialValueMode: z.enum(['locked', 'editable']),
  defaultValue: specValueSchema.optional(),
  isRequired: z.boolean(),
});

export const materialModelFormSchema = z
  .object({
    name: z.string().min(1, 'Bắt buộc'),
    code: z.string().min(1, 'Bắt buộc'),
    origin: z.string(),
    groupId: z.string().min(1, 'Chọn nhóm'),
    description: z.string(),
    isSafetyManaged: z.boolean(),
    inspectionTableId: z.string().optional(),
    imageUrls: z.array(z.string()),
    specs: z.array(modelSpecSchema),
  })
  .superRefine((values, ctx) => {
    if (values.isSafetyManaged && !values.inspectionTableId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['inspectionTableId'],
        message: 'Chọn bảng kiểm định',
      });
    }

    const counts = new Map<string, number>();
    for (const spec of values.specs) {
      if (spec.source === 'catalog' && spec.specDefinitionId) {
        counts.set(
          spec.specDefinitionId,
          (counts.get(spec.specDefinitionId) ?? 0) + 1,
        );
      }
    }

    values.specs.forEach((spec, index) => {
      if (
        spec.source === 'catalog' &&
        spec.specDefinitionId &&
        (counts.get(spec.specDefinitionId) ?? 0) > 1 &&
        !spec.partKey?.trim()
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['specs', index, 'partKey'],
          message: 'Nhập khóa bộ phận cho thông số bị lặp',
        });
      }
    });

    const duplicatePartKeys = new Set<string>();
    const seenPartKeys = new Map<string, number>();
    values.specs.forEach((spec) => {
      if (!spec.specDefinitionId || !spec.partKey?.trim()) return;
      const key = `${spec.specDefinitionId}:${spec.partKey.trim().toLowerCase()}`;
      const count = seenPartKeys.get(key) ?? 0;
      seenPartKeys.set(key, count + 1);
      if (count > 0) duplicatePartKeys.add(key);
    });

    values.specs.forEach((spec, index) => {
      if (!spec.specDefinitionId || !spec.partKey?.trim()) return;
      const key = `${spec.specDefinitionId}:${spec.partKey.trim().toLowerCase()}`;
      if (duplicatePartKeys.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['specs', index, 'partKey'],
          message: 'Khóa bộ phận phải duy nhất trong cùng thông số',
        });
      }
    });
  });

export type MaterialModelFormValues = z.infer<typeof materialModelFormSchema>;
export type ModelSpecFormValue = z.infer<typeof modelSpecSchema>;
