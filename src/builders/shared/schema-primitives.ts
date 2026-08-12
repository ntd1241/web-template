import { z } from 'zod';

/** Shared validation primitives used by builder specs. */
export const identifierSchema = z
  .string()
  .regex(/^[a-zA-Z_$][\w$]*$/, 'phải là một định danh hợp lệ');

export const optionSchema = z.object({
  value: z.string(),
  label: z.string().min(1),
});

export const optionsSourceSchema = z.enum(['static', 'prop']);

export const tooltipStyleSchema = z.enum([
  'default',
  'line',
  'dashed',
  'compact',
  'emphasis',
]);

export type BuilderOption = z.infer<typeof optionSchema>;
export type TooltipStyle = z.infer<typeof tooltipStyleSchema>;
