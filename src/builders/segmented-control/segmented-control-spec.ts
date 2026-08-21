import { z } from 'zod';
import {
  identifierSchema,
  optionSchema,
  optionsSourceSchema,
} from '../shared/schema-primitives';

const segmentedOptionSchema = optionSchema.extend({
  value: z.string().min(1, 'giá trị option không được để trống'),
});

export const segmentedControlSpecSchema = z
  .object({
    componentName: identifierSchema,
    specPath: z.string().optional(),
    ariaLabel: z.string().min(1),
    optionsSource: optionsSourceSchema.default('static'),
    options: z.array(segmentedOptionSchema).min(1).optional(),
    size: z.enum(['sm', 'md', 'lg']).default('md'),
    variant: z.enum(['default', 'outline']).default('outline'),
    allowEmpty: z.boolean().default(false),
    itemClassName: z.string().optional(),
  })
  .superRefine((spec, ctx) => {
    if (spec.optionsSource === 'static' && !spec.options) {
      ctx.addIssue({
        code: 'custom',
        message: 'options bắt buộc khi optionsSource là static',
        path: ['options'],
      });
    }

    if (spec.optionsSource === 'prop' && spec.options) {
      ctx.addIssue({
        code: 'custom',
        message: 'không truyền options tĩnh khi optionsSource là prop',
        path: ['options'],
      });
    }

    const values = new Set<string>();
    spec.options?.forEach((option, index) => {
      if (values.has(option.value)) {
        ctx.addIssue({
          code: 'custom',
          message: 'option value bị trùng: ' + option.value,
          path: ['options', index, 'value'],
        });
      }
      values.add(option.value);
    });
  });

export type SegmentedControlOption = z.infer<typeof segmentedOptionSchema>;
export type SegmentedControlSpec = z.input<typeof segmentedControlSpecSchema>;
export type ResolvedSegmentedControlSpec = z.output<
  typeof segmentedControlSpecSchema
>;
