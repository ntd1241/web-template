import { z } from 'zod';

const IDENTIFIER = /^[a-zA-Z_$][\w$]*$/;

const identifier = z.string().regex(IDENTIFIER, 'phải là một định danh hợp lệ');

export const tooltipSpecSchema = z.object({
  componentName: identifier,
  specPath: z.string().optional(),
  defaultStyle: z
    .enum(['default', 'line', 'dashed', 'compact', 'emphasis'])
    .default('default'),
  hideLabel: z.boolean().default(false),
  hideIndicator: z.boolean().default(false),
  className: z.string().optional(),
  includeProvider: z.boolean().default(true),
});

export type TooltipSpec = z.input<typeof tooltipSpecSchema>;
export type ResolvedTooltipSpec = z.output<typeof tooltipSpecSchema>;
