import { z } from 'zod';

/** Schema tạo/sửa thông số kỹ thuật. `options` chỉ bắt buộc với kiểu select. */
const specOptionSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Nhập nhãn'),
  value: z.string().min(1, 'Nhập mã giá trị'),
  colorHex: z.string().optional(),
});

export const specDefinitionFormSchema = z
  .object({
    code: z.string().min(1, 'Bắt buộc'),
    name: z.string().min(1, 'Bắt buộc'),
    dataType: z.enum([
      'text',
      'number',
      'single_select',
      'multi_select',
      'dynamic_list',
      'boolean',
      'date',
    ]),
    unit: z.string(),
    description: z.string(),
    isActive: z.boolean(),
    options: z.array(specOptionSchema),
  })
  .superRefine((val, ctx) => {
    const isSelect =
      val.dataType === 'single_select' || val.dataType === 'multi_select';
    if (isSelect && val.options.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'Cần ít nhất 1 lựa chọn',
      });
    }
  });

export type SpecDefinitionFormValues = z.infer<typeof specDefinitionFormSchema>;
